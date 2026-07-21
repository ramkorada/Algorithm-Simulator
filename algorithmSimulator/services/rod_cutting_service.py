"""
Service layer for Rod Cutting analysis.

Orchestrates validation, algorithm execution, benchmarking,
and response formatting.
"""

import logging

from algorithms.rod_cutting import dp_rod_cutting
from utils.validators import validate_rod_cutting_request
from utils.complexity import get_complexity
from utils.timer import benchmark
from utils.constants import ERROR_UNEXPECTED

logger = logging.getLogger(__name__)


def run_analysis(data: dict) -> tuple:
    """
    Main orchestration function for Rod Cutting.

    Args:
        data: Parsed JSON payload from the request.

    Returns:
        Tuple of (response_dictionary, http_status_code).
    """
    is_valid, error_msg = validate_rod_cutting_request(data)
    if not is_valid:
        return {"error": "Validation failed.", "message": error_msg}, 422

    try:
        length = int(data["length"])
        prices = data["prices"]

        result, exec_time_ms = benchmark(dp_rod_cutting, length, prices)

        complexity = get_complexity("rod_cutting")

        response = {
            "algorithm": "dynamic_programming",
            "rod_length": result["rod_length"],
            "prices_provided": prices,
            "max_revenue": result["max_revenue"],
            "dp_table": result["dp_table"],
            "reconstruction_steps": result["reconstruction_steps"],
            "optimal_cuts": result["optimal_cuts"],
            "execution_trace": result["execution_trace"],
            "cuts_count": result["cuts_count"],
            "average_piece_length": result["average_piece_length"],
            "dp_states_computed": result["dp_states_computed"],
            "execution_time_ms": exec_time_ms,
            "complexity": complexity,
        }

        logger.info(
            "Rod Cutting complete -- length: %d, max_revenue: %s, cuts: %d, time: %s ms",
            length,
            result["max_revenue"],
            result["cuts_count"],
            exec_time_ms,
        )

        return response, 200

    except Exception as exc:
        logger.exception("Error in Rod Cutting analysis: %s", exc)
        return {"error": "Analysis failed.", "message": ERROR_UNEXPECTED}, 500
