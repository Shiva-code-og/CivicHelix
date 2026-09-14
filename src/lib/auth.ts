// ==============================================================================
// Authentication & RBAC (Role-Based Access Control) Guards
// ==============================================================================

import { Role } from '../types';

export type CivicPermission =
  | 'SUBMIT_PROBLEM'
  | 'UPVOTE_PROBLEM'
  | 'VIEW_DUPLICATES'
  | 'ADOPT_PROJECT'
  | 'UPDATE_MILESTONE'
  | 'SUBMIT_MILESTONE_PROOF'
  | 'SPONSOR_PROJECT'
  | 'APPROVE_PROTOTYPE'
  | 'VIEW_GOVT_HEATMAP'
  | 'AUDIT_SLA_LOGS';

export const ROLE_PERMISSIONS: Record<Role, CivicPermission[]> = {
  CITIZEN: [
    'SUBMIT_PROBLEM',
    'UPVOTE_PROBLEM',
    'VIEW_DUPLICATES',
  ],
  STUDENT: [
    'SUBMIT_PROBLEM',
    'UPVOTE_PROBLEM',
    'VIEW_DUPLICATES',
    'UPDATE_MILESTONE',
    'SUBMIT_MILESTONE_PROOF',
  ],
  FACULTY: [
    'SUBMIT_PROBLEM',
    'UPVOTE_PROBLEM',
    'VIEW_DUPLICATES',
    'ADOPT_PROJECT',
    'UPDATE_MILESTONE',
    'SUBMIT_MILESTONE_PROOF',
    'VIEW_GOVT_HEATMAP',
  ],
  INDUSTRY: [
    'UPVOTE_PROBLEM',
    'SPONSOR_PROJECT',
    'VIEW_GOVT_HEATMAP',
  ],
  GOVT_ADMIN: [
    'SUBMIT_PROBLEM',
    'UPVOTE_PROBLEM',
    'VIEW_DUPLICATES',
    'APPROVE_PROTOTYPE',
    'VIEW_GOVT_HEATMAP',
    'AUDIT_SLA_LOGS',
  ],
};

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: Role;
  institutionId?: string | null;
  department?: string | null;
}

/**
 * Validates if the given user role possesses the required permission.
 */
export function hasPermission(role: Role, permission: CivicPermission): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

/**
 * Extracts and verifies mock or production JWT user session from headers.
 */
export function getSessionFromHeaders(headers: Headers): UserSession | null {
  // Support simulated header-based authentication for dev/demo testing
  const authHeader = headers.get('authorization');
  const roleHeader = headers.get('x-user-role') as Role | null;
  const userIdHeader = headers.get('x-user-id');
  const userEmailHeader = headers.get('x-user-email');

  if (roleHeader && userIdHeader) {
    return {
      userId: userIdHeader,
      email: userEmailHeader || 'user@civic-platform.org',
      name: 'Simulated User',
      role: roleHeader,
    };
  }

  // Fallback demo citizen session if no headers provided in development
  if (process.env.NODE_ENV !== 'production') {
    return {
      userId: 'dev-citizen-001',
      email: 'citizen@civic-platform.org',
      name: 'Demo Citizen',
      role: 'CITIZEN',
    };
  }

  return null;
}
