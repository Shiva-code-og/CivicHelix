// ==============================================================================
// GET /api/government/dashboard/analytics
// Geospatial heatmap feed, SLA compliance metrics, and Triple-Helix velocity stats
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromHeaders(req.headers);
    if (!session || !hasPermission(session.role, 'VIEW_ANALYTICS' as any) && !hasPermission(session.role, 'VIEW_GOVT_HEATMAP')) {
      return NextResponse.json(
        { error: 'Forbidden: Unauthorized access to government dashboard analytics.' },
        { status: 403 }
      );
    }

    // Mock rich civic heatmap data points across municipal sectors
    const heatmapFeed = [
      {
        id: 'pt-001',
        latitude: 28.6139,
        longitude: 77.2090,
        intensity: 0.95,
        category: 'WATER_SANITATION',
        title: 'Cluster: Drinking Water Contamination',
        reportsCount: 14,
        priorityScore: 92.5,
        slaRemainingHours: 12,
      },
      {
        id: 'pt-002',
        latitude: 28.6250,
        longitude: 77.2200,
        intensity: 0.72,
        category: 'INFRASTRUCTURE_ROADS',
        title: 'Major Arterial Road Cave-in',
        reportsCount: 8,
        priorityScore: 78.0,
        slaRemainingHours: 34,
      },
      {
        id: 'pt-003',
        latitude: 28.5800,
        longitude: 77.1800,
        intensity: 0.88,
        category: 'ENVIRONMENT_WASTE',
        title: 'Illegal Chemical Waste Dumping',
        reportsCount: 19,
        priorityScore: 89.2,
        slaRemainingHours: 18,
      },
      {
        id: 'pt-004',
        latitude: 28.6500,
        longitude: 77.1500,
        intensity: 0.45,
        category: 'ENERGY_POWER',
        title: 'Low Voltage Fluctuations in Industrial Hub',
        reportsCount: 3,
        priorityScore: 54.0,
        slaRemainingHours: 120,
      },
    ];

    const analyticsOverview = {
      totalProblemsReported: 1420,
      verifiedProblems: 1180,
      activeUniversityAdoptions: 284,
      industrySponsorshipFundedINR: 14500000, // 1.45 Cr CSR
      resolvedAndDeployedCount: 612,
      slaComplianceRatePercent: 91.8,
      averageResolutionDays: 19.4,
      categoryDistribution: {
        WATER_SANITATION: 380,
        INFRASTRUCTURE_ROADS: 420,
        ENVIRONMENT_WASTE: 290,
        ENERGY_POWER: 150,
        HEALTHCARE: 110,
        AGRICULTURE: 70,
      },
      criticalSlaAlerts: [
        {
          problemId: 'pt-001',
          title: 'Drinking Water Contamination - Sector 4',
          slaThresholdHours: 48,
          elapsedHours: 36,
          status: 'WARNING_NEAR_BREACH',
          assignedUniversity: 'IIT Delhi Civil Dept',
        },
      ],
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      analytics: analyticsOverview,
      heatmap: heatmapFeed,
    });
  } catch (error) {
    console.error('Error loading government analytics:', error);
    return NextResponse.json(
      { error: 'Failed to load government analytics dashboard.' },
      { status: 500 }
    );
  }
}
