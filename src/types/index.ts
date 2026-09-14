// ==============================================================================
// Domain Types & DTOs: Civic Problem-Solving & Triple-Helix Platform
// ==============================================================================

export type Role = 'CITIZEN' | 'STUDENT' | 'FACULTY' | 'INDUSTRY' | 'GOVT_ADMIN';

export type InstitutionType = 'UNIVERSITY' | 'INDUSTRY_PARTNER' | 'GOVT_BODY';

export type Category =
  | 'WATER_SANITATION'
  | 'HEALTHCARE'
  | 'AGRICULTURE'
  | 'INFRASTRUCTURE_ROADS'
  | 'ENVIRONMENT_WASTE'
  | 'ENERGY_POWER'
  | 'PUBLIC_SAFETY'
  | 'EDUCATION';

export type ProblemStatus =
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'ADOPTED'
  | 'IN_PROGRESS'
  | 'PROTOTYPE_REVIEW'
  | 'DEPLOYMENT_STAGING'
  | 'RESOLVED'
  | 'REJECTED';

export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'PROTOTYPE_READY'
  | 'GOVT_REVIEW'
  | 'PILOT_DEPLOYED'
  | 'COMPLETED'
  | 'TERMINATED';

export type MilestoneStatus = 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'REJECTED';

// Priority Scoring Parameters & Input
export interface PriorityScoringParams {
  severityScore: number;       // 1.0 - 5.0 (AI NLP assessed)
  upvoteCount: number;         // Total citizen upvotes + clustered duplicate reports
  urgencyScore: number;        // 1.0 - 5.0 (escalation risk/hazard)
  geographicSpreadKm: number;  // Radius of impact (0.1 to 20 km)
}

export interface PriorityScoreResult {
  rawScore: number;
  normalizedScore: number;     // Clamped to 0.0 - 100.0
  breakdown: {
    severityContribution: number;
    impactContribution: number;
    urgencyContribution: number;
    geographicContribution: number;
  };
  slaClassification: 'CRITICAL_48H' | 'ELEVATED_7D' | 'STANDARD_14D';
}

// Vector Search & Clustering
export interface VectorMatchCandidate {
  problemId: string;
  title: string;
  category: Category;
  similarityScore: number;     // 0.0 to 1.0 (Cosine similarity)
  distanceMeters: number;      // Geospatial distance
  latitude: number;
  longitude: number;
  clusterId?: string | null;
}

export interface DeduplicationCheckResult {
  isDuplicate: boolean;
  matchType: 'EXACT_CLUSTER' | 'POTENTIAL_MERGE' | 'DISTINCT';
  highestSimilarity: number;
  clusterTargetId: string | null;
  matchedProblems: VectorMatchCandidate[];
}

// Smart Routing Match Types
export interface UniversityMatchResult {
  universityId: string;
  name: string;
  departments: string[];
  distanceKm: number;
  workloadCapacity: number;
  activeProjectCount: number;
  affinityScore: number;       // 0.0 - 100.0
  matchingDepartment: string;
}

export interface IndustryMatchResult {
  industryId: string;
  name: string;
  csrFocusAreas: Category[];
  matchScore: number;          // 0.0 - 100.0
  isDirectCsrMatch: boolean;
}

export interface SmartRoutingResponse {
  problemId: string;
  recommendedUniversities: UniversityMatchResult[];
  recommendedSponsors: IndustryMatchResult[];
}

// API DTOs
export interface SubmitProblemInput {
  citizenId: string;
  title: string;
  description: string;
  category: Category;
  latitude: number;
  longitude: number;
  address?: string;
  rawMediaUrls?: string[];
  voiceTranscript?: string;
}

export interface AdoptChallengeInput {
  problemId: string;
  universityId: string;
  leadFacultyId: string;
  title: string;
  abstract?: string;
  studentMemberIds: string[];
}

export interface UpdateMilestoneInput {
  milestoneId: string;
  status: MilestoneStatus;
  verificationProofUrl?: string;
  govtFeedback?: string;
}
