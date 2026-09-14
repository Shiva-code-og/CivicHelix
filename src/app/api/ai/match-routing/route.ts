// ==============================================================================
// POST /api/ai/match-routing
// Smart Routing Matrix: Matches problems to Universities & Industry CSR Sponsors
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { SmartRoutingService } from '@/services/routing.service';
import { Category } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { problemId, category, latitude, longitude } = await req.json();

    if (!category || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Required fields: category, latitude, longitude.' },
        { status: 400 }
      );
    }

    // Mock institutions pool (In production, fetched via Prisma: prisma.institution.findMany())
    const mockInstitutions = [
      {
        id: 'univ-iit-delhi',
        name: 'IIT Delhi - Dept of Civil & Environmental Engineering',
        type: 'UNIVERSITY' as const,
        latitude: 28.5450,
        longitude: 77.1926,
        departments: ['CIVIL', 'ENVIRONMENTAL', 'CSE_AI', 'MECHANICAL'],
        csrFocusAreas: [],
        workloadCapacity: 8,
        activeProjectCount: 3,
      },
      {
        id: 'univ-dtu',
        name: 'Delhi Technological University (DTU)',
        type: 'UNIVERSITY' as const,
        latitude: 28.7501,
        longitude: 77.1177,
        departments: ['CIVIL', 'ELECTRICAL', 'ENVIRONMENTAL', 'BIOTECH'],
        csrFocusAreas: [],
        workloadCapacity: 6,
        activeProjectCount: 2,
      },
      {
        id: 'univ-aiims',
        name: 'AIIMS Innovation Centre',
        type: 'UNIVERSITY' as const,
        latitude: 28.5672,
        longitude: 77.2100,
        departments: ['BIOMEDICAL', 'PUBLIC_HEALTH', 'CSE_HEALTH_AI'],
        csrFocusAreas: [],
        workloadCapacity: 5,
        activeProjectCount: 4,
      },
      {
        id: 'ind-tata-csr',
        name: 'Tata Sustainability & Civic Innovation CSR Trust',
        type: 'INDUSTRY_PARTNER' as const,
        latitude: 28.6289,
        longitude: 77.2065,
        departments: [],
        csrFocusAreas: ['WATER_SANITATION' as Category, 'ENVIRONMENT_WASTE' as Category, 'EDUCATION' as Category],
        workloadCapacity: 20,
        activeProjectCount: 7,
      },
      {
        id: 'ind-lnt-infra',
        name: 'L&T Civic Engineering Foundations',
        type: 'INDUSTRY_PARTNER' as const,
        latitude: 28.5355,
        longitude: 77.3910,
        departments: [],
        csrFocusAreas: ['INFRASTRUCTURE_ROADS' as Category, 'ENERGY_POWER' as Category],
        workloadCapacity: 15,
        activeProjectCount: 5,
      },
    ];

    const routingResponse = SmartRoutingService.routeProblem(
      problemId || 'prob-sim-001',
      category as Category,
      parseFloat(latitude),
      parseFloat(longitude),
      mockInstitutions
    );

    return NextResponse.json({
      success: true,
      data: routingResponse,
    });
  } catch (error) {
    console.error('Error in match routing:', error);
    return NextResponse.json(
      { error: 'Failed to compute smart routing recommendations.' },
      { status: 500 }
    );
  }
}
