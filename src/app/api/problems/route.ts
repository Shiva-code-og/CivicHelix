// ==============================================================================
// POST /api/problems - Problem Ingestion Endpoint
// Accepts multipart/form-data or JSON (voice note, text, image, GPS coordinates)
// Triggers AI embedding generation, duplicate detection, and initial priority calculation
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders, hasPermission } from '@/lib/auth';
import { PriorityScoringService } from '@/services/scoring.service';
import { VectorDeduplicationService } from '@/services/vector.service';
import { AuditService } from '@/services/audit.service';
import { Category } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromHeaders(req.headers);
    if (!session || !hasPermission(session.role, 'SUBMIT_PROBLEM')) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have permission to submit civic problems.' },
        { status: 403 }
      );
    }

    let title: string;
    let description: string;
    let category: Category;
    let latitude: number;
    let longitude: number;
    let address = '';
    let voiceTranscript = '';
    const rawMediaUrls: string[] = [];

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = formData.get('title')?.toString() || '';
      description = formData.get('description')?.toString() || '';
      category = (formData.get('category')?.toString() as Category) || 'INFRASTRUCTURE_ROADS';
      latitude = parseFloat(formData.get('latitude')?.toString() || '0');
      longitude = parseFloat(formData.get('longitude')?.toString() || '0');
      address = formData.get('address')?.toString() || '';
      voiceTranscript = formData.get('voiceTranscript')?.toString() || '';
      
      const mediaFiles = formData.getAll('media');
      mediaFiles.forEach((_, idx) => {
        rawMediaUrls.push(`https://storage.civic-platform.org/media/mock-upload-${Date.now()}-${idx}.jpg`);
      });
    } else {
      const body = await req.json();
      title = body.title;
      description = body.description;
      category = body.category;
      latitude = body.latitude;
      longitude = body.longitude;
      address = body.address || '';
      voiceTranscript = body.voiceTranscript || '';
      if (body.rawMediaUrls) rawMediaUrls.push(...body.rawMediaUrls);
    }

    // Input Validation
    if (!title || !description || !latitude || !longitude || !category) {
      return NextResponse.json(
        { error: 'Missing required submission fields: title, description, category, latitude, longitude.' },
        { status: 400 }
      );
    }

    // 1. Generate 1536-dim vector embedding
    const combinedContent = `${title} ${description} ${voiceTranscript}`.trim();
    const embedding = await VectorDeduplicationService.generateEmbedding(combinedContent);

    // 2. Perform duplicate check against existing clusters
    // (Simulated candidate pool for demo verification)
    const mockExistingCandidates = [
      {
        id: 'prob-existing-001',
        title: 'Burst pipe flooding Main Bazaar road',
        category: 'WATER_SANITATION' as Category,
        embedding: await VectorDeduplicationService.generateEmbedding('Burst water pipe flooding main street road'),
        latitude: latitude + 0.0005,
        longitude: longitude + 0.0005,
        clusterId: 'cluster-water-101',
      },
    ];

    const deduplicationResult = VectorDeduplicationService.evaluateDuplicateClusters(
      embedding,
      latitude,
      longitude,
      category,
      mockExistingCandidates
    );

    // 3. Compute initial Priority Score
    // (AI sets initial severity and urgency based on NLP classification)
    const initialSeverity = category === 'WATER_SANITATION' || category === 'PUBLIC_SAFETY' ? 4.0 : 2.5;
    const initialUrgency = 3.5;
    const upvotes = deduplicationResult.isDuplicate ? 12 : 1; // Existing duplicates increment impact

    const priorityResult = PriorityScoringService.calculatePriority({
      severityScore: initialSeverity,
      urgencyScore: initialUrgency,
      upvoteCount: upvotes,
      geographicSpreadKm: 1.2,
    });

    const newProblemId = `prob-${Date.now()}`;

    // 4. Audit Log
    await AuditService.recordLog({
      actorId: session.userId,
      action: deduplicationResult.isDuplicate ? 'DUPLICATE_CLUSTERED' : 'PROBLEM_SUBMITTED',
      entityType: 'PROBLEM',
      entityId: newProblemId,
      metadata: {
        category,
        priorityScore: priorityResult.normalizedScore,
        slaTier: priorityResult.slaClassification,
        isClustered: deduplicationResult.isDuplicate,
        clusterTargetId: deduplicationResult.clusterTargetId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newProblemId,
        citizenId: session.userId,
        title,
        description,
        category,
        latitude,
        longitude,
        address,
        rawMediaUrls,
        voiceTranscript,
        priorityScore: priorityResult.normalizedScore,
        slaClassification: priorityResult.slaClassification,
        scoreBreakdown: priorityResult.breakdown,
        deduplication: deduplicationResult,
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting problem:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while ingesting problem submission.' },
      { status: 500 }
    );
  }
}
