from datetime import datetime
from typing import List, Tuple
from .schemas import (
    DonationInput,
    RecipientInput,
    MatchWeights,
    MatchResult,
    ScoreBreakdown,
    MatchResponse
)
from .scoring import (
    calculate_haversine_distance,
    calculate_proximity_score,
    calculate_compatibility_score,
    calculate_capacity_score,
    calculate_availability_score,
    compute_weighted_match_score
)

def run_matching_pipeline(
    donation: DonationInput,
    recipients: List[RecipientInput],
    weights: MatchWeights
) -> MatchResponse:
    # ---------------------------------------------------------
    # FIRST STAGE: MANDATORY ELIGIBILITY FILTERS & SAFETY GATES
    # ---------------------------------------------------------
    
    # 1. Food safety mandatory gate
    safety = donation.foodSafetyDeclaration
    if not (safety.isSafeForConsumption and safety.preparedUnderHygieneStandards and safety.temperatureMaintained):
        return MatchResponse(
            success=False,
            totalEvaluated=len(recipients),
            eligibleCount=0,
            matches=[],
            exclusionReason="Donation excluded: Mandatory food safety criteria was not met. Food safety cannot be overridden by scoring."
        )

    # 2. Expiration check
    try:
        deadline_dt = datetime.fromisoformat(donation.collectionDeadline.replace("Z", "+00:00"))
        # Strip timezone for naive comparison if needed
        now = datetime.utcnow()
        if deadline_dt.tzinfo is not None:
            now = datetime.now(deadline_dt.tzinfo)
        if deadline_dt <= now:
            return MatchResponse(
                success=False,
                totalEvaluated=len(recipients),
                eligibleCount=0,
                matches=[],
                exclusionReason="Donation excluded: Collection deadline has already expired."
            )
    except Exception:
        pass  # If ISO parse fails, continue with evaluation

    d_lng, d_lat = donation.location

    matched_results: List[MatchResult] = []

    for recipient in recipients:
        # Filter 1: Must be verified organization
        if not recipient.isVerified:
            continue

        # Filter 2: Capacity sufficiency
        remaining_capacity = max(0.0, recipient.maxCapacity - recipient.currentCapacityUsed)
        if remaining_capacity < donation.quantity:
            continue

        # Filter 3: Geographic feasibility
        r_lng, r_lat = recipient.location
        distance_km = calculate_haversine_distance(d_lat, d_lng, r_lat, r_lng)
        service_radius = max(1.0, recipient.serviceAreaKm)
        if distance_km > service_radius:
            continue

        # Filter 4: Dietary compatibility exclusion
        if donation.dietaryType == "non_vegetarian" and "non_vegetarian" not in recipient.dietaryAccepted:
            continue

        # ---------------------------------------------------------
        # SECOND STAGE: EXPLAINABLE WEIGHTED SCORING
        # ---------------------------------------------------------
        proximity_score = calculate_proximity_score(distance_km, service_radius)
        compatibility_score = calculate_compatibility_score(
            donation.dietaryType,
            donation.storageConditions,
            recipient.dietaryAccepted,
            recipient.storageFacilities
        )
        capacity_score = calculate_capacity_score(
            donation.quantity,
            recipient.maxCapacity,
            recipient.currentCapacityUsed
        )
        availability_score = calculate_availability_score()

        final_match_score = compute_weighted_match_score(
            proximity_score,
            compatibility_score,
            capacity_score,
            availability_score,
            weights
        )

        constraints = []
        if distance_km > (service_radius * 0.75):
            constraints.append(f"Near boundary of service area ({distance_km} km of {service_radius} km limit)")
        if remaining_capacity < (donation.quantity * 1.5):
            constraints.append("High capacity utilization at recipient facility")

        explanation = (
            f"Verified {recipient.type.replace('_', ' ')} located {distance_km} km away. "
            f"Sufficient capacity ({round(remaining_capacity, 1)} available, {donation.quantity} required). "
            f"Match Score: {final_match_score}%."
        )

        matched_results.append(
            MatchResult(
                recipientId=recipient.id,
                recipientName=recipient.name,
                matchScore=final_match_score,
                scoreBreakdown=ScoreBreakdown(
                    proximityScore=proximity_score,
                    compatibilityScore=compatibility_score,
                    capacityScore=capacity_score,
                    availabilityScore=availability_score
                ),
                geographicDistanceKm=distance_km,
                roadDistanceKm=None,
                roadDurationMin=None,
                eligibilityExplanation=explanation,
                constraints=constraints
            )
        )

    # Rank eligible organizations descending by matchScore
    matched_results.sort(key=lambda x: x.matchScore, reverse=True)

    return MatchResponse(
        success=True,
        totalEvaluated=len(recipients),
        eligibleCount=len(matched_results),
        matches=matched_results
    )
