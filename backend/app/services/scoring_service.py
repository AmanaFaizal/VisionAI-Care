"""
Adaptive vision-test scoring.

This is a deliberately simple, transparent, RULE-BASED scorer — not a
trained ML classifier. It converts a staircase of optotype-size
responses into an approximate Snellen acuity and a plain-language
heuristic flag. It is meant to help a doctor triage/prioritize review,
never to diagnose.

Size index convention: 1 = largest optotype (worst acuity line) .. 10 = smallest (best acuity line).
"""
from typing import List, Optional, Dict

SIZE_TO_SNELLEN: Dict[int, str] = {
    1: "20/200",
    2: "20/160",
    3: "20/125",
    4: "20/100",
    5: "20/80",
    6: "20/63",
    7: "20/50",
    8: "20/40",
    9: "20/25",
    10: "20/20",
}

# Below this Snellen-equivalent size index, we heuristically suggest a referral.
REFERRAL_THRESHOLD_INDEX = 7  # worse than ~20/50


def score_result(responses: List[bool], line_sizes: List[int]) -> dict:
    if not responses or not line_sizes or len(responses) != len(line_sizes):
        return {
            "acuity_score": None,
            "smallest_line_read": None,
            "correct_responses": 0,
            "total_responses": 0,
            "preliminary_flag": "Insufficient data to score this eye.",
        }

    correct = sum(1 for r in responses if r)
    total = len(responses)

    # Determine the smallest (best) size index for which the patient answered
    # correctly at least twice (or once if it's the only attempt at that size),
    # walking from the smallest size shown downward for a stable threshold.
    per_size_correct: Dict[int, List[bool]] = {}
    for r, size in zip(responses, line_sizes):
        per_size_correct.setdefault(size, []).append(r)

    best_reliable_size = None
    for size in sorted(per_size_correct.keys(), reverse=True):
        attempts = per_size_correct[size]
        correct_at_size = sum(1 for a in attempts if a)
        if correct_at_size / len(attempts) >= 0.5:
            best_reliable_size = size
            break

    if best_reliable_size is None:
        best_reliable_size = min(line_sizes)

    acuity = SIZE_TO_SNELLEN.get(best_reliable_size, f"index {best_reliable_size}")

    flag = None
    if best_reliable_size <= REFERRAL_THRESHOLD_INDEX:
        flag = (
            f"Preliminary heuristic: acuity resolved at approximately {acuity}, "
            "below the comfortable-vision threshold used by this screener. "
            "Recommend a comprehensive eye exam to rule out refractive error. "
            "This is NOT a diagnosis."
        )

    return {
        "acuity_score": acuity,
        "smallest_line_read": best_reliable_size,
        "correct_responses": correct,
        "total_responses": total,
        "preliminary_flag": flag,
    }


def next_optotype_size(current_size: int, was_correct: bool, min_size: int = 1, max_size: int = 10) -> int:
    """Simple staircase: correct -> harder (smaller optotype); wrong -> easier (larger)."""
    step = 1 if was_correct else -1
    return max(min_size, min(max_size, current_size + step))
