// ==============================================================================
// GET /api/problems/cluster/[id]
// Fetches clustered citizen reports for aggregated duplicate analysis
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clusterId } = await params;

    // Simulated cluster response for demonstration & testing
    const clusterData = {
      clusterId,
      primaryProblem: {
        id: 'prob-water-001',
        title: 'Severe pipeline leak causing drinking water contamination in Sector 4',
        category: 'WATER_SANITATION',
        status: 'VERIFIED',
        priorityScore: 88.4,
        totalReportsCount: 6,
        firstReportedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'Sector 4, Rohini, New Delhi',
        },
      },
      relatedReports: [
        {
          id: 'report-101',
          citizenName: 'Aarav Sharma',
          description: 'Water has turned yellow and smells muddy near Sector 4 community park.',
          reportedAt: new Date(Date.now() - 86400000).toISOString(),
          similarityScore: 0.92,
        },
        {
          id: 'report-102',
          citizenName: 'Pooja Verma',
          description: 'Gutter sewage mixing with water supply lines since yesterday morning.',
          reportedAt: new Date(Date.now() - 43200000).toISOString(),
          similarityScore: 0.89,
        },
        {
          id: 'report-103',
          citizenName: 'Karan Patel',
          description: 'Dirty contaminated drinking tap water pipeline leak on Road No 2.',
          reportedAt: new Date(Date.now() - 14400000).toISOString(),
          similarityScore: 0.94,
        },
      ],
      impactStats: {
        estimatedHouseholdsAffected: 450,
        averageResponseTimeHoursRemaining: 18.5,
        status: 'CRITICAL_48H',
      },
    };

    return NextResponse.json({
      success: true,
      data: clusterData,
    });
  } catch (error) {
    console.error('Error fetching cluster details:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cluster reports.' },
      { status: 500 }
    );
  }
}
