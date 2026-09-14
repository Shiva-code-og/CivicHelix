// ==============================================================================
// Smart Routing Matrix Service
// Matches civic problems to Universities (by dept, location, capacity)
// and Industry Sponsors (by CSR fit and funding alignment)
// ==============================================================================

import { Category, IndustryMatchResult, SmartRoutingResponse, UniversityMatchResult } from '../types';
import { VectorDeduplicationService } from './vector.service';

interface InstitutionCandidate {
  id: string;
  name: string;
  type: 'UNIVERSITY' | 'INDUSTRY_PARTNER' | 'GOVT_BODY';
  latitude: number;
  longitude: number;
  departments: string[];
  csrFocusAreas: Category[];
  workloadCapacity: number;
  activeProjectCount: number;
}

export class SmartRoutingService {
  // Mapping civic categories to relevant university academic departments
  private static readonly CATEGORY_TO_DEPARTMENTS: Record<Category, string[]> = {
    WATER_SANITATION: ['CIVIL', 'ENVIRONMENTAL', 'CHEMICAL', 'BIOTECH'],
    HEALTHCARE: ['BIOMEDICAL', 'BIOTECH', 'CSE_HEALTH_AI', 'PUBLIC_HEALTH'],
    AGRICULTURE: ['AGRICULTURAL_ENG', 'BIOTECH', 'IOT_SENSORS', 'RURAL_DEV'],
    INFRASTRUCTURE_ROADS: ['CIVIL', 'TRANSPORTATION_ENG', 'STRUCTURAL', 'SURVEYING'],
    ENVIRONMENT_WASTE: ['ENVIRONMENTAL', 'CHEMICAL', 'MATERIAL_SCIENCE'],
    ENERGY_POWER: ['ELECTRICAL', 'RENEWABLE_ENERGY', 'MECHANICAL'],
    PUBLIC_SAFETY: ['CSE_CYBERSECURITY', 'CIVIL_SAFETY', 'DATA_ANALYTICS'],
    EDUCATION: ['CSE_EDTECH', 'SOCIAL_INNOVATION', 'COMMUNICATION'],
  };

  /**
   * Matches a verified civic problem with best-fit Universities and CSR Sponsors
   */
  public static routeProblem(
    problemId: string,
    category: Category,
    latitude: number,
    longitude: number,
    institutions: InstitutionCandidate[]
  ): SmartRoutingResponse {
    const recommendedUniversities: UniversityMatchResult[] = [];
    const recommendedSponsors: IndustryMatchResult[] = [];

    const targetDepartments = this.CATEGORY_TO_DEPARTMENTS[category] || [];

    for (const inst of institutions) {
      if (inst.type === 'UNIVERSITY') {
        // 1. Department affinity check
        const matchingDept = inst.departments.find((d) =>
          targetDepartments.some((td) => td.toUpperCase() === d.toUpperCase())
        );

        if (!matchingDept) continue;

        // 2. Workload capacity check
        const availableCapacity = Math.max(0, inst.workloadCapacity - inst.activeProjectCount);
        const capacityRatio = inst.workloadCapacity > 0 ? availableCapacity / inst.workloadCapacity : 0;
        if (capacityRatio <= 0) continue; // University is at 100% capacity

        // 3. Proximity score (Universities closer to the civic issue get higher routing priority)
        const distanceMeters = VectorDeduplicationService.calculateHaversineDistance(
          latitude,
          longitude,
          inst.latitude,
          inst.longitude
        );
        const distanceKm = Number((distanceMeters / 1000).toFixed(1));

        // Proximity score drops over 100km radius: max 40 points
        const proximityScore = Math.max(0, 40 * (1 - Math.min(distanceKm, 100) / 100));

        // Department affinity: 35 points
        const departmentScore = 35;

        // Capacity score: 25 points
        const capacityScore = 25 * capacityRatio;

        const totalAffinity = Number((proximityScore + departmentScore + capacityScore).toFixed(1));

        recommendedUniversities.push({
          universityId: inst.id,
          name: inst.name,
          departments: inst.departments,
          distanceKm,
          workloadCapacity: inst.workloadCapacity,
          activeProjectCount: inst.activeProjectCount,
          affinityScore: totalAffinity,
          matchingDepartment: matchingDept,
        });
      } else if (inst.type === 'INDUSTRY_PARTNER') {
        // Industry CSR matching
        const isDirectMatch = inst.csrFocusAreas.includes(category);
        let matchScore = isDirectMatch ? 85 : 40;

        // Proximity bonus for regional CSR impact
        const distanceMeters = VectorDeduplicationService.calculateHaversineDistance(
          latitude,
          longitude,
          inst.latitude,
          inst.longitude
        );
        const distanceKm = distanceMeters / 1000;
        if (distanceKm < 50) {
          matchScore += 15;
        }

        if (isDirectMatch || matchScore >= 60) {
          recommendedSponsors.push({
            industryId: inst.id,
            name: inst.name,
            csrFocusAreas: inst.csrFocusAreas,
            matchScore: Math.min(100, matchScore),
            isDirectCsrMatch: isDirectMatch,
          });
        }
      }
    }

    // Sort by affinity descending
    recommendedUniversities.sort((a, b) => b.affinityScore - a.affinityScore);
    recommendedSponsors.sort((a, b) => b.matchScore - a.matchScore);

    return {
      problemId,
      recommendedUniversities: recommendedUniversities.slice(0, 5),
      recommendedSponsors: recommendedSponsors.slice(0, 5),
    };
  }
}
