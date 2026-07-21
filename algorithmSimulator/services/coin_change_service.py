"""
Analysis Service.

Orchestrates algorithm execution for the Coin Change problem:
  1. Validates the request.
  2. Runs both Greedy and DP algorithms.
  3. Computes a comparison (optimal? gap? faster algorithm?).
  4. Generates a human-readable explanation.
  5. Returns a single structured dictionary for the API layer.
"""

import logging
from algorithms.coin_change import greedy_coin_change, dp_coin_change
from utils.timer import benchmark
from utils.validators import validate_coin_change_request
from utils.complexity import get_complexity
from utils.constants import ERROR_NO_SOLUTION

logger = logging.getLogger(__name__)


def validate_request(data: dict) -> tuple[bool, str]:
    """Validate the incoming request payload."""
    return validate_coin_change_request(data)


def execute_algorithms(coins: list, amount: int) -> tuple[dict, dict]:
    """Run both Greedy and DP algorithms and measure execution time."""
    greedy_result, greedy_time_ms = benchmark(greedy_coin_change, coins, amount)
    dp_result, dp_time_ms = benchmark(dp_coin_change, coins, amount)

    greedy_result["execution_time_ms"] = greedy_time_ms
    dp_result["execution_time_ms"] = dp_time_ms
    return greedy_result, dp_result


def compare_algorithms(greedy_result: dict, dp_result: dict) -> dict:
    """Compare the results of Greedy and DP algorithms."""
    greedy_solvable = greedy_result["solvable"]
    dp_solvable = dp_result["solvable"]

    greedy_count = len(greedy_result["coins"]) if greedy_solvable else None
    dp_count = len(dp_result["coins"]) if dp_solvable else None

    greedy_is_optimal = (
        greedy_solvable and dp_solvable and greedy_count == dp_count
    )

    coin_difference = (
        (greedy_count - dp_count) if (greedy_solvable and dp_solvable) else None
    )

    faster_algorithm = (
        "greedy"
        if greedy_result["execution_time_ms"] <= dp_result["execution_time_ms"]
        else "dynamic_programming"
    )

    return {
        "greedy_is_optimal": greedy_is_optimal,
        "coin_difference": coin_difference,
        "faster_algorithm": faster_algorithm,
        "greedy_count": greedy_count,
        "dp_count": dp_count,
        "greedy_solvable": greedy_solvable,
        "dp_solvable": dp_solvable,
    }


def generate_insights(comparison: dict, coins: list, amount: int) -> str:
    """Produce an explanation based on the comparison results."""
    if not comparison["dp_solvable"]:
        return (
            f"Amount {amount} cannot be formed with denominations "
            f"{sorted(coins)}. No solution exists for either algorithm."
        )

    if not comparison["greedy_solvable"]:
        return (
            f"Greedy failed to reach {amount} with denominations "
            f"{sorted(coins, reverse=True)}. When the locally largest coin "
            "leaves a remainder that no other coin can fill, Greedy gets "
            "stuck. Dynamic Programming avoids this by exploring all "
            "sub-amounts and is guaranteed to find a solution."
        )

    if comparison["greedy_is_optimal"]:
        return (
            f"Greedy found the optimal solution ({comparison['dp_count']} coin(s)). "
            "This coin set is 'canonical' — for canonical sets, the greedy "
            "choice (largest coin first) always leads to the global optimum. "
            "Standard currency denominations (1, 5, 10, 25) are a well-known "
            "example of a canonical coin system."
        )

    return (
        f"Greedy used {comparison['greedy_count']} coin(s), but the true minimum is "
        f"{comparison['dp_count']} coin(s) — a gap of {comparison['coin_difference']} coin(s). "
        f"This coin set {sorted(coins, reverse=True)} is non-canonical. "
        "Greedy's locally optimal choice (largest coin first) blocked access "
        "to a better global solution. Dynamic Programming avoids this trap "
        "by computing the minimum for every intermediate sub-amount."
    )


def build_response(greedy_result: dict, dp_result: dict, comparison: dict, explanation: str) -> dict:
    """Assemble the final structured response dictionary."""
    return {
        "greedy": {
            "coins": greedy_result["coins"],
            "count": comparison["greedy_count"],
            "solvable": comparison["greedy_solvable"],
            "execution_time_ms": greedy_result["execution_time_ms"],
            "steps": greedy_result["steps"],
        },
        "dynamic_programming": {
            "coins": dp_result["coins"],
            "count": comparison["dp_count"],
            "solvable": comparison["dp_solvable"],
            "execution_time_ms": dp_result["execution_time_ms"],
            "steps": dp_result["steps"],
        },
        "comparison": {
            "greedy_is_optimal": comparison["greedy_is_optimal"],
            "coin_difference": comparison["coin_difference"],
            "faster_algorithm": comparison["faster_algorithm"],
            "explanation": explanation,
        },
        "complexity": {
            "greedy": get_complexity("greedy"),
            "dynamic_programming": get_complexity("dynamic_programming"),
        },
    }


def run_analysis(data: dict) -> tuple[dict, int]:
    """
    Coordinate the execution of the coin change analysis.

    Returns:
        Tuple of (response_dict, http_status_code)
    """
    is_valid, error_msg = validate_request(data)
    if not is_valid:
        return {"error": "Validation failed.", "message": error_msg}, 400

    amount: int = data["amount"]
    coins: list = list(set(data["coins"]))  # deduplicate

    logger.info("Starting analysis — amount: %d, coins: %s", amount, coins)

    greedy_res, dp_res = execute_algorithms(coins, amount)
    comparison = compare_algorithms(greedy_res, dp_res)
    explanation = generate_insights(comparison, coins, amount)

    response = build_response(greedy_res, dp_res, comparison, explanation)

    logger.info(
        "Analysis complete — Greedy: %s coins (%s ms), DP: %s coins (%s ms)",
        comparison["greedy_count"], greedy_res["execution_time_ms"],
        comparison["dp_count"], dp_res["execution_time_ms"],
    )

    if not comparison["dp_solvable"]:
        return {
            "error": ERROR_NO_SOLUTION,
            "message": f"Amount {amount} cannot be formed with the given denominations: {sorted(coins)}.",
            "result": response,
        }, 422

    return response, 200
