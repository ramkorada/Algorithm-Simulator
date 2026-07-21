"""
Algorithm complexity definitions.

Centralizes the theoretical time and space complexities for
the algorithms used in the application.
"""

COMPLEXITY = {
    "greedy": {
        "time": "O(n log n + amount / min_coin)",
        "space": "O(k)",
        "time_note": (
            "Sorting the coin list is O(n log n). "
            "In the worst case (only the smallest coin available), "
            "the while-loop runs amount / min_coin times."
        ),
        "space_note": (
            "Only the output list of k selected coins is stored. "
            "No auxiliary table required."
        ),
    },
    "dynamic_programming": {
        "time": "O(amount × n)",
        "space": "O(amount)",
        "time_note": (
            "For each sub-amount from 1 to target (amount iterations), "
            "we check every coin denomination (n iterations)."
        ),
        "space_note": (
            "The dp[] and coin_used[] arrays each have (amount + 1) entries."
        ),
    },
    "zero_one_knapsack": {
        "time": "O(N × W)",
        "space": "O(N × W)",
        "time_note": (
            "The DP table has N items (rows) and W capacity (columns). "
            "We compute each cell exactly once."
        ),
        "space_note": (
            "A 2D array of size (N+1) × (W+1) is maintained to store "
            "intermediate max values for reconstruction."
        ),
    },
    "fractional_knapsack": {
        "time": "O(n log n)",
        "space": "O(n)",
        "time_note": (
            "Sorting n items by value/weight ratio is O(n log n). "
            "The single greedy pass that follows is O(n), so sorting dominates."
        ),
        "space_note": (
            "Only the output list of selected items and the ratio-sorted "
            "copy of the input are stored — O(n) total."
        ),
    },
    "activity_selection": {
        "time": "O(n log n)",
        "space": "O(n)",
        "time_note": (
            "Sorting n activities by finish time is O(n log n). "
            "The greedy selection pass iterates through the sorted list in O(n) time, so sorting dominates."
        ),
        "space_note": (
            "Storing the sorted, selected, and skipped activity lists requires O(n) space."
        ),
    },
    "rod_cutting": {
        "time": "O(n²)",
        "space": "O(n)",
        "time_note": (
            "For each rod sub-length i from 1 to n, we evaluate every possible first cut j (from 1 to i). "
            "Summing 1 + 2 + ... + n yields O(n²) time complexity."
        ),
        "space_note": (
            "The DP table dp[] and first_cut[] array each store (n + 1) entries — O(n) total auxiliary space."
        ),
    },
}

def get_complexity(algorithm_name: str) -> dict:


    """Retrieve complexity details for a specific algorithm."""
    return COMPLEXITY.get(algorithm_name, {})
