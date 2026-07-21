"""
Service layer for 0/1 Knapsack analysis.

Orchestrates validation, algorithm execution, benchmarking,
and response formatting.
"""

import logging

from algorithms.zero_one_knapsack import dp_zero_one_knapsack
from utils.validators import validate_zero_one_knapsack_request
from utils.complexity import get_complexity
from utils.timer import benchmark
from utils.constants import ERROR_UNEXPECTED

logger = logging.getLogger(__name__)


def run_analysis(data: dict) -> tuple[dict, int]:
    """
    Main orchestration function for 0/1 Knapsack.
    
    Args:
        data: Parsed JSON payload from the request.
        
    Returns:
        Tuple of (response_dictionary, http_status_code).
    """
    is_valid, error_msg = validate_zero_one_knapsack_request(data)
    if not is_valid:
        return {"error": "Validation failed.", "message": error_msg}, 422

    try:
        capacity = data["capacity"]
        items = data["items"]

        # Add IDs to items if missing, for frontend tracking
        for idx, item in enumerate(items):
            if "id" not in item:
                item["id"] = f"Item {idx + 1}"

        dp_result, dp_time_ms = benchmark(dp_zero_one_knapsack, capacity, items)
        
        complexity = get_complexity("zero_one_knapsack")
        
        response = {
            "algorithm": "dynamic_programming",
            "capacity": capacity,
            "items_provided": items,
            "max_value": dp_result["max_value"],
            "selected_items": dp_result["items"],
            "dp_table": dp_result["table"],
            "reconstruction_steps": dp_result["reconstruction_steps"],
            "execution_time_ms": dp_time_ms,
            "complexity": complexity
        }
        
        return response, 200

    except Exception as exc:
        logger.exception("Error in 0/1 Knapsack analysis: %s", exc)
        return {"error": "Analysis failed.", "message": ERROR_UNEXPECTED}, 500
