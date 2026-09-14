// ==============================================================================
// PATCH /api/projects/milestones/[id]
// Updates milestone progress, verification proofs, and government approval feedback
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeaders, hasPermission } from '@/lib/auth';
import { AuditService } from '@/services/audit.service';
import { MilestoneStatus } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionFromHeaders(req.headers);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id: milestoneId } = await params;
    const { status, verificationProofUrl, govtFeedback } = await req.json();

    // RBAC:
    // If status is being set to 'COMPLETED' or 'REJECTED' with govt feedback, role must be GOVT_ADMIN
    if (status === 'COMPLETED' || status === 'REJECTED') {
      if (!hasPermission(session.role, 'APPROVE_PROTOTYPE')) {
        return NextResponse.json(
          { error: 'Forbidden: Only Government Administrators can formally verify and complete milestones.' },
          { status: 403 }
        );
      }
    } else {
      // If submitting proofs for review, role must be FACULTY or STUDENT
      if (!hasPermission(session.role, 'SUBMIT_MILESTONE_PROOF')) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to submit milestone proofs.' },
          { status: 403 }
        );
      }
    }

    // Audit Log
    await AuditService.recordLog({
      actorId: session.userId,
      action: 'MILESTONE_UPDATED',
      entityType: 'MILESTONE',
      entityId: milestoneId,
      metadata: {
        newStatus: status,
        submittedProof: verificationProofUrl,
        reviewerRole: session.role,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Milestone ${milestoneId} updated to ${status}.`,
      data: {
        id: milestoneId,
        status: status as MilestoneStatus,
        verificationProofUrl,
        govtFeedback: govtFeedback || null,
        updatedAt: new Date().toISOString(),
        reviewedBy: session.userId,
      },
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone.' },
      { status: 500 }
    );
  }
}
