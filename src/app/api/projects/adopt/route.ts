// ==============================================================================
// POST /api/projects/adopt
// University Faculty / Department adopts a civic problem as a Capstone / Research Project
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders, hasPermission } from '@/lib/auth';
import { AuditService } from '@/services/audit.service';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromHeaders(req.headers);
    if (!session || !hasPermission(session.role, 'ADOPT_PROJECT')) {
      return NextResponse.json(
        { error: 'Forbidden: Only verified Faculty leads can officially adopt civic challenges.' },
        { status: 403 }
      );
    }

    const {
      problemId,
      universityId,
      title,
      abstract,
      studentMemberIds,
      estimatedCompletionMonths,
    } = await req.json();

    if (!problemId || !universityId || !title) {
      return NextResponse.json(
        { error: 'Missing required parameters: problemId, universityId, title.' },
        { status: 400 }
      );
    }

    const projectId = `proj-${Date.now()}`;

    // Standardized Capstone Milestones
    const milestones = [
      {
        id: `ms-${Date.now()}-1`,
        title: 'Phase 1: Field Assessment, Root Cause & Feasibility Report',
        targetDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'PENDING',
      },
      {
        id: `ms-${Date.now()}-2`,
        title: 'Phase 2: Working Hardware/Software Prototype Developed',
        targetDate: new Date(Date.now() + 75 * 86400000).toISOString(),
        status: 'PENDING',
      },
      {
        id: `ms-${Date.now()}-3`,
        title: 'Phase 3: Municipal Pilot Testing & Government SLA Verification',
        targetDate: new Date(Date.now() + 120 * 86400000).toISOString(),
        status: 'PENDING',
      },
    ];

    // Audit Log
    await AuditService.recordLog({
      actorId: session.userId,
      action: 'CHALLENGE_ADOPTED',
      entityType: 'PROJECT',
      entityId: projectId,
      metadata: {
        problemId,
        universityId,
        facultyLeadId: session.userId,
        studentTeamSize: studentMemberIds?.length || 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Civic challenge adopted successfully. Triple-helix project initialized.',
        data: {
          id: projectId,
          problemId,
          universityId,
          leadFacultyId: session.userId,
          title,
          abstract,
          status: 'ACTIVE',
          studentMembers: studentMemberIds || [],
          milestones,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adopting civic challenge:', error);
    return NextResponse.json(
      { error: 'Failed to adopt challenge.' },
      { status: 500 }
    );
  }
}
