// ==============================================================================
// GET /api/problems/duplicates
// Semantic similarity check against existing problem embeddings
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { VectorDeduplicationService } from '@/services/vector.service';
import { Category } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text') || '';
    const category = (searchParams.get('category') as Category) || 'WATER_SANITATION';
    const lat = parseFloat(searchParams.get('latitude') || '28.6139');
    const lon = parseFloat(searchParams.get('longitude') || '77.2090');

    if (!text) {
      return NextResponse.json(
        { error: 'Query parameter "text" is required for semantic duplicate check.' },
        { status: 400 }
      );
    }

    const queryEmbedding = await VectorDeduplicationService.generateEmbedding(text);

    // Mock active corpus for immediate responsive verification
    const mockCorpus = [
      {
        id: 'prob-water-001',
        title: 'Severe pipeline leak causing drinking water contamination in Sector 4',
        category: 'WATER_SANITATION' as Category,
        embedding: await VectorDeduplicationService.generateEmbedding('pipeline leak water contamination sector 4'),
        latitude: lat + 0.002,
        longitude: lon + 0.001,
        clusterId: 'cluster-delhi-001',
      },
      {
        id: 'prob-infra-002',
        title: 'Deep sinkhole opening near school crossroad',
        category: 'INFRASTRUCTURE_ROADS' as Category,
        embedding: await VectorDeduplicationService.generateEmbedding('Deep sinkhole opening near school crossroad dangerous traffic'),
        latitude: lat + 0.01,
        longitude: lon + 0.01,
        clusterId: null,
      },
    ];

    const deduplicationResult = VectorDeduplicationService.evaluateDuplicateClusters(
      queryEmbedding,
      lat,
      lon,
      category,
      mockCorpus
    );

    return NextResponse.json({
      success: true,
      query: { text, category, latitude: lat, longitude: lon },
      deduplication: deduplicationResult,
    });
  } catch (error) {
    console.error('Error checking duplicate embeddings:', error);
    return NextResponse.json(
      { error: 'Failed to perform semantic duplicate check.' },
      { status: 500 }
    );
  }
}
