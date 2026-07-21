"""
Service layer for Fractional Knapsack analysis.

Orchestrates validation, algorithm execution, benchmarking,
and response formatting.
"""

import logging

from algorithms.fractional_knapsack import greedy_fractional_knapsack
from utils.validators import validate_fractional_knapsack_request
from utils.complexity import get_complexity
from utils.timer import benchmark
from utils.constants import ERROR_UNEXPECTED

logger = logging.getLogger(__name__)


def run_analysis(data: dict) -> tuple:
    """
    Main orchestration function for Fractional Knapsack.

    Args:
        data: Parsed JSON payload from the request.

    Returns:
        Tuple of (response_dictionary, http_status_code).
    """
    is_valid, error_msg = validate_fractional_knapsack_request(data)
    if not is_valid:
        return {"error": "Validation failed.", "message": error_msg}, 422

    try:
        capacity = float(data["capacity"])
        items    = data["items"]

        result, exec_time_ms = benchmark(greedy_fractional_knapsack, capacity, items)

        complexity = get_complexity("fractional_knapsack")

        response = {
            "algorithm":              "greedy",
            "capacity":               capacity,
            "items_provided":         items,
            "maximum_value":          result["maximum_value"],
            "selected_items":         result["selected_items"],
            "weight_used":            result["weight_used"],
            "remaining_capacity":     result["remaining_capacity"],
            "utilization_percentage": result["utilization_percentage"],
            "ratio_sorted_items":     result["ratio_sorted_items"],
            "selection_steps":        result["selection_steps"],
            "items_fully_taken":      result["items_fully_taken"],
            "items_partially_taken":  result["items_partially_taken"],
            "items_skipped":          result["items_skipped"],
            "execution_time_ms":      exec_time_ms,
            "complexity":             complexity,
        }

        logger.info(
            "Fractional Knapsack complete -- capacity: %s, items: %d, "
            "max_value: %s, time: %s ms",
            capacity,
            len(items),
            result["maximum_value"],
            exec_time_ms,
        )

        return response, 200

    except Exception as exc:
        logger.exception("Error in Fractional Knapsack analysis: %s", exc)
        return {"error": "Analysis failed.", "message": ERROR_UNEXPECTED}, 500
