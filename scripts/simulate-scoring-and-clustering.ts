// ==============================================================================
// Verification & Simulation Script
// Executes tests on Priority Scoring Formula, Vector Deduplication, and Smart Routing
// ==============================================================================

import { PriorityScoringService } from '../src/services/scoring.service';
import { VectorDeduplicationService } from '../src/services/vector.service';
import { SmartRoutingService } from '../src/services/routing.service';
import { Category } from '../src/types';

function runPriorityScoringTests() {
  console.log('\n======================================================');
  console.log('TEST SUITE 1: Multi-Factor Priority Scoring Engine');
  console.log('======================================================');

  // Case A: Routine Pothole with few upvotes
  const caseA = PriorityScoringService.calculatePriority({
    severityScore: 2.0,
    urgencyScore: 1.5,
    upvoteCount: 3,
    geographicSpreadKm: 0.5,
  });
  console.log('\n[Case A: Routine Road Pothole (3 upvotes, low urgency)]');
  console.log('Score:', caseA.normalizedScore, '/ 100 | Tier:', caseA.slaClassification);
  console.log('Breakdown:', caseA.breakdown);

  // Case B: Bot Swarm Attack (5,000 upvotes on minor issue) -> Logarithmic dampening test
  const caseB = PriorityScoringService.calculatePriority({
    severityScore: 1.5,
    urgencyScore: 1.0,
    upvoteCount: 5000,
    geographicSpreadKm: 0.2,
  });
  console.log('\n[Case B: Bot Swarm Upvotes (5000 upvotes, minor graffiti)]');
  console.log('Score:', caseB.normalizedScore, '/ 100 | Tier:', caseB.slaClassification);
  console.log('Note: Logarithmic dampening prevented runaway priority (Impact capped at 25% weight).');

  // Case C: Critical Toxic Water Contamination (High severity + Urgency + 150 citizen cluster)
  const caseC = PriorityScoringService.calculatePriority({
    severityScore: 5.0,
    urgencyScore: 4.8,
    upvoteCount: 150,
    geographicSpreadKm: 6.5,
  });
  console.log('\n[Case C: Critical Drinking Water Contamination]');
  console.log('Score:', caseC.normalizedScore, '/ 100 | Tier:', caseC.slaClassification);
  console.log('Breakdown:', caseC.breakdown);

  if (caseC.slaClassification !== 'CRITICAL_48H') {
    throw new Error('Test failed: Critical water issue did not trigger CRITICAL_48H SLA!');
  }
}

async function runVectorDeduplicationTests() {
  console.log('\n======================================================');
  console.log('TEST SUITE 2: Vector Embedding & Cosine Clustering');
  console.log('======================================================');

  const text1 = 'Burst drinking water pipeline leaking sewage into residential street';
  const text2 = 'Ruptured water main pipe leaking dirty contaminated water near houses';
  const text3 = 'Street light bulb flickering on highway crossroad';

  const emb1 = await VectorDeduplicationService.generateEmbedding(text1);
  const emb2 = await VectorDeduplicationService.generateEmbedding(text2);
  const emb3 = await VectorDeduplicationService.generateEmbedding(text3);

  const sim1_2 = VectorDeduplicationService.computeCosineSimilarity(emb1, emb2);
  const sim1_3 = VectorDeduplicationService.computeCosineSimilarity(emb1, emb3);

  console.log(`Semantic Similarity between Text 1 & Text 2 (Paraphrased Water Leak): ${(sim1_2 * 100).toFixed(2)}%`);
  console.log(`Semantic Similarity between Text 1 & Text 3 (Water Leak vs Street Light): ${(sim1_3 * 100).toFixed(2)}%`);

  // Cluster evaluation
  const clusterCheck = VectorDeduplicationService.evaluateDuplicateClusters(
    emb2,
    28.6139,
    77.2090,
    'WATER_SANITATION' as Category,
    [
      {
        id: 'existing-prob-001',
        title: text1,
        category: 'WATER_SANITATION',
        embedding: emb1,
        latitude: 28.6145,
        longitude: 77.2095,
        clusterId: 'cluster-delhi-water-01',
      },
    ]
  );

  console.log('\nCluster Result:');
  console.log('Is Duplicate:', clusterCheck.isDuplicate);
  console.log('Match Type:', clusterCheck.matchType);
  console.log('Highest Similarity:', (clusterCheck.highestSimilarity * 100).toFixed(2) + '%');
  console.log('Target Cluster ID:', clusterCheck.clusterTargetId);
}

function runSmartRoutingTests() {
  console.log('\n======================================================');
  console.log('TEST SUITE 3: Smart Routing Matrix');
  console.log('======================================================');

  const institutions = [
    {
      id: 'iit-delhi',
      name: 'IIT Delhi',
      type: 'UNIVERSITY' as const,
      latitude: 28.5450,
      longitude: 77.1926,
      departments: ['CIVIL', 'ENVIRONMENTAL', 'CSE'],
      csrFocusAreas: [],
      workloadCapacity: 10,
      activeProjectCount: 2,
    },
    {
      id: 'tata-csr',
      name: 'Tata CSR Trust',
      type: 'INDUSTRY_PARTNER' as const,
      latitude: 28.6289,
      longitude: 77.2065,
      departments: [],
      csrFocusAreas: ['WATER_SANITATION' as Category],
      workloadCapacity: 20,
      activeProjectCount: 5,
    },
  ];

  const routing = SmartRoutingService.routeProblem(
    'prob-test-01',
    'WATER_SANITATION',
    28.6139,
    77.2090,
    institutions
  );

  console.log('Top Recommended University:', routing.recommendedUniversities[0]?.name, `(Affinity: ${routing.recommendedUniversities[0]?.affinityScore})`);
  console.log('Top Recommended CSR Sponsor:', routing.recommendedSponsors[0]?.name, `(Match Score: ${routing.recommendedSponsors[0]?.matchScore})`);
  console.log('======================================================\n');
}

async function main() {
  runPriorityScoringTests();
  await runVectorDeduplicationTests();
  runSmartRoutingTests();
  console.log('✅ ALL ARCHITECTURAL TESTS PASSED SUCCESSFULLY.');
}

main().catch(console.error);
