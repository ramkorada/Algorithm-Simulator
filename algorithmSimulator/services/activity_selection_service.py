"""
Service layer for Activity Selection analysis.

Orchestrates validation, algorithm execution, benchmarking,
and response formatting.
"""

import logging

from algorithms.activity_selection import greedy_activity_selection
from utils.validators import validate_activity_selection_request
from utils.complexity import get_complexity
from utils.timer import benchmark
from utils.constants import ERROR_UNEXPECTED

logger = logging.getLogger(__name__)


def run_analysis(data: dict) -> tuple:
    """
    Main orchestration function for Activity Selection.

    Args:
        data: Parsed JSON payload from the request.

    Returns:
        Tuple of (response_dictionary, http_status_code).
    """
    is_valid, error_msg = validate_activity_selection_request(data)
    if not is_valid:
        return {"error": "Validation failed.", "message": error_msg}, 422

    try:
        activities = data["activities"]

        result, exec_time_ms = benchmark(greedy_activity_selection, activities)

        complexity = get_complexity("activity_selection")

        response = {
            "algorithm": "greedy",
            "activities_provided": activities,
            "sorted_activities": result["sorted_by_finish"],
            "selected_activities": result["selected"],
            "skipped_activities": result["skipped"],
            "execution_trace": result["trace"],
            "total_activities": result["total_activities"],
            "selected_count": result["selected_count"],
            "skipped_count": result["skipped_count"],
            "compatibility_checks": result["compatibility_checks"],
            "execution_time_ms": exec_time_ms,
            "complexity": complexity,
        }

        logger.info(
            "Activity Selection complete -- total: %d, selected: %d, skipped: %d, time: %s ms",
            result["total_activities"],
            result["selected_count"],
            result["skipped_count"],
            exec_time_ms,
        )

        return response, 200

    except Exception as exc:
        logger.exception("Error in Activity Selection analysis: %s", exc)
        return {"error": "Analysis failed.", "message": ERROR_UNEXPECTED}, 500
