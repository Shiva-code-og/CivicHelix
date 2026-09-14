// ==============================================================================
// Priority Scoring Service
// Formula: Priority = f(Severity, Citizen Impact / Upvotes, Urgency, Geographic Spread)
// ==============================================================================

import { PriorityScoringParams, PriorityScoreResult } from '../types';

export class PriorityScoringService {
  // Configurable weights (Must sum to 1.0)
  private static readonly WEIGHT_SEVERITY = parseFloat(process.env.SEVERITY_WEIGHT || '0.40');
  private static readonly WEIGHT_IMPACT = parseFloat(process.env.IMPACT_WEIGHT || '0.25');
  private static readonly WEIGHT_URGENCY = parseFloat(process.env.URGENCY_WEIGHT || '0.20');
  private static readonly WEIGHT_GEOGRAPHIC = parseFloat(process.env.GEOGRAPHIC_WEIGHT || '0.15');

  // Normalization caps
  private static readonly MAX_SCALE = 5.0;
  private static readonly LOG_IMPACT_CAP = Math.log10(1001); // 1000 citizen upvotes/cluster size = 100% impact
  private static readonly MAX_GEOGRAPHIC_KM = 10.0; // 10km radius saturation cap

  /**
   * Calculates the multi-factor civic priority score for a reported problem.
   * 
   * Mathematical Model:
   * 1. Severity (1.0 to 5.0) -> Evaluated via NLP based on toxicity, public health threat, or physical danger.
   * 2. Citizen Impact -> Sub-linear logarithmic scaling log10(U + 1) / log10(1001) * 5.0
   *    (Prevents coordinated bot vote swarms from artificially monopolizing the triage queue).
   * 3. Urgency (1.0 to 5.0) -> Rate of deterioration (e.g. active burst water main vs routine potholes).
   * 4. Geographic Spread -> min(RadiusKm, 10.0) / 10.0 * 5.0 (Area impacted).
   * 
   * Normalized Composite = (w_sev * S + w_imp * U_norm + w_urg * Urg + w_geo * G_norm) / 5.0 * 100
   */
  public static calculatePriority(params: PriorityScoringParams): PriorityScoreResult {
    // 1. Clamp inputs to safe boundaries
    const severity = Math.max(1.0, Math.min(this.MAX_SCALE, params.severityScore || 1.0));
    const urgency = Math.max(1.0, Math.min(this.MAX_SCALE, params.urgencyScore || 1.0));
    const rawUpvotes = Math.max(0, params.upvoteCount || 0);
    const rawRadiusKm = Math.max(0.1, params.geographicSpreadKm || 0.5);

    // 2. Compute normalized sub-scores on a 0.0 - 5.0 scale
    // Citizen impact with logarithmic dampening:
    const logImpact = Math.log10(rawUpvotes + 1);
    const normalizedImpactScore = Math.min(this.MAX_SCALE, (logImpact / this.LOG_IMPACT_CAP) * this.MAX_SCALE);

    // Geographic spread saturation:
    const normalizedGeoScore = (Math.min(rawRadiusKm, this.MAX_GEOGRAPHIC_KM) / this.MAX_GEOGRAPHIC_KM) * this.MAX_SCALE;

    // 3. Compute weighted contributions
    const severityContrib = this.WEIGHT_SEVERITY * severity;
    const impactContrib = this.WEIGHT_IMPACT * normalizedImpactScore;
    const urgencyContrib = this.WEIGHT_URGENCY * urgency;
    const geoContrib = this.WEIGHT_GEOGRAPHIC * normalizedGeoScore;

    const rawCompositeScore = severityContrib + impactContrib + urgencyContrib + geoContrib;
    
    // 4. Normalize to 0 - 100 index
    const normalizedScore = Number(((rawCompositeScore / this.MAX_SCALE) * 100).toFixed(2));

    // 5. Determine Government SLA Action Tier
    let slaClassification: PriorityScoreResult['slaClassification'];
    if (normalizedScore >= 75.0) {
      slaClassification = 'CRITICAL_48H';
    } else if (normalizedScore >= 45.0) {
      slaClassification = 'ELEVATED_7D';
    } else {
      slaClassification = 'STANDARD_14D';
    }

    return {
      rawScore: Number(rawCompositeScore.toFixed(3)),
      normalizedScore,
      breakdown: {
        severityContribution: Number(((severityContrib / this.MAX_SCALE) * 100).toFixed(2)),
        impactContribution: Number(((impactContrib / this.MAX_SCALE) * 100).toFixed(2)),
        urgencyContribution: Number(((urgencyContrib / this.MAX_SCALE) * 100).toFixed(2)),
        geographicContribution: Number(((geoContrib / this.MAX_SCALE) * 100).toFixed(2)),
      },
      slaClassification,
    };
  }
}
