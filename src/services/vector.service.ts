// ==============================================================================
// Vector Embedding & Cosine Similarity Deduplication Clustering Service
// Uses pgvector cosine operator (<=>) with geospatial Haversine boundaries
// ==============================================================================

import { Category, DeduplicationCheckResult, VectorMatchCandidate } from '../types';

export class VectorDeduplicationService {
  private static readonly SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_DUPLICATE_THRESHOLD || '0.85');
  private static readonly MAX_RADIUS_KM = parseFloat(process.env.MAX_GEOGRAPHIC_CLUSTER_RADIUS_KM || '5.0');

  /**
   * Generates a 1536-dimensional vector embedding for civic problem text.
   * Connects to OpenAI embeddings API or uses a deterministic fallback in offline dev mode.
   */
  public static async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey !== 'sk-proj-your-openai-api-key') {
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
            input: text.replace(/\n/g, ' '),
            dimensions: 1536,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].embedding;
      } catch (err) {
        console.warn('Embedding API unavailable, falling back to local deterministic embedding generator:', err);
      }
    }

    // Fallback: Deterministic vector pseudo-embedding for testing/local offline setups
    return this.generateDeterministicMockEmbedding(text, 1536);
  }

  /**
   * Computes the Cosine Similarity between two N-dimensional vector arrays in memory.
   * Sim = (A . B) / (||A|| * ||B||)
   */
  public static computeCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error(`Vector dimension mismatch: ${vecA.length} vs ${vecB.length}`);
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Calculates the Great-Circle distance between two GPS points using the Haversine formula (in meters).
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Evaluates if a new incoming problem submission semantically and geospatially clusters
   * with existing reported problems.
   */
  public static evaluateDuplicateClusters(
    newEmbedding: number[],
    newLat: number,
    newLon: number,
    newCategory: Category,
    existingCandidates: Array<{
      id: string;
      title: string;
      category: Category;
      embedding: number[];
      latitude: number;
      longitude: number;
      clusterId?: string | null;
    }>
  ): DeduplicationCheckResult {
    const matches: VectorMatchCandidate[] = [];

    for (const candidate of existingCandidates) {
      // Step 1: Category filter (Problems must belong to the same civic category)
      if (candidate.category !== newCategory) continue;

      // Step 2: Geospatial proximity filter
      const distanceMeters = this.calculateHaversineDistance(
        newLat,
        newLon,
        candidate.latitude,
        candidate.longitude
      );

      const distanceKm = distanceMeters / 1000;
      if (distanceKm > this.MAX_RADIUS_KM) continue;

      // Step 3: Cosine Similarity check
      const similarity = this.computeCosineSimilarity(newEmbedding, candidate.embedding);

      if (similarity >= 0.70) {
        // Collect candidate
        matches.push({
          problemId: candidate.id,
          title: candidate.title,
          category: candidate.category,
          similarityScore: Number(similarity.toFixed(4)),
          distanceMeters: Math.round(distanceMeters),
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          clusterId: candidate.clusterId,
        });
      }
    }

    // Sort by highest similarity descending
    matches.sort((a, b) => b.similarityScore - a.similarityScore);

    const bestMatch = matches[0];
    if (!bestMatch || bestMatch.similarityScore < this.SIMILARITY_THRESHOLD) {
      return {
        isDuplicate: false,
        matchType: matches.length > 0 ? 'POTENTIAL_MERGE' : 'DISTINCT',
        highestSimilarity: bestMatch ? bestMatch.similarityScore : 0,
        clusterTargetId: null,
        matchedProblems: matches,
      };
    }

    return {
      isDuplicate: true,
      matchType: 'EXACT_CLUSTER',
      highestSimilarity: bestMatch.similarityScore,
      clusterTargetId: bestMatch.clusterId || bestMatch.problemId,
      matchedProblems: matches,
    };
  }

  /**
   * Generates the SQL query fragment for PostgreSQL + pgvector nearest neighbor search.
   * In raw PostgreSQL, the `<=>` operator denotes Cosine Distance:
   * Similarity = 1 - (embedding <=> target_vector)
   */
  public static getPgVectorQuerySql(): string {
    return `
      SELECT 
        id, 
        title, 
        category,
        latitude, 
        longitude, 
        cluster_id,
        (1 - (embedding <=> $1::vector)) AS similarity_score
      FROM problems
      WHERE category = $2
        AND embedding IS NOT NULL
        AND (1 - (embedding <=> $1::vector)) >= $3
      ORDER BY similarity_score DESC
      LIMIT 10;
    `;
  }

  /**
   * Deterministic local embedding fallback using hash seeded normalized vectors
   */
  private static generateDeterministicMockEmbedding(text: string, dimensions: number): number[] {
    const vector = new Array(dimensions).fill(0);
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < dimensions; i++) {
      const pseudoRandom = Math.sin(hash + i) * 10000;
      vector[i] = pseudoRandom - Math.floor(pseudoRandom);
    }

    // Normalize to unit vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map((v) => v / norm);
  }
}
