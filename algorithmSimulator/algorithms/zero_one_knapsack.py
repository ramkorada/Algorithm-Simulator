"""
0/1 Knapsack Algorithm Implementation.

Pure algorithmic logic for solving the 0/1 Knapsack problem
using Dynamic Programming (bottom-up).

This module has no Flask imports and no side effects.
"""

def dp_zero_one_knapsack(capacity: int, items: list[dict]) -> dict:
    """
    Solve the 0/1 Knapsack problem using Dynamic Programming.

    Strategy: Build a 2D table dp[i][w] where dp[i][w] is the maximum value
    that can be attained with weight less than or equal to w using items up to i.

    Args:
        capacity: Maximum weight the knapsack can hold.
        items: List of dictionaries, each with 'id', 'weight', and 'value'.

    Returns:
        A dictionary with:
            max_value (int): The maximum value achievable.
            items (list): The sequence of items selected in the optimal solution.
            table (list[list]): The full DP table for visualization.
            reconstruction_steps (list): Human-readable trace of reconstruction.
    """
    n = len(items)
    # Initialize DP table with 0s
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    # Fill DP table
    for i in range(1, n + 1):
        item = items[i - 1]
        w = item["weight"]
        v = item["value"]
        
        for c in range(1, capacity + 1):
            if w <= c:
                dp[i][c] = max(dp[i - 1][c], dp[i - 1][c - w] + v)
            else:
                dp[i][c] = dp[i - 1][c]

    # Reconstruct solution by backtracking through the DP table
    selected_items = []
    reconstruction_steps = []
    current_capacity = capacity

    for i in range(n, 0, -1):
        item = items[i - 1]
        item_id = item.get("id", f"Item {i}")
        
        # If value comes from the top (dp[i-1][c]), the item is not included
        if dp[i][current_capacity] != dp[i - 1][current_capacity]:
            selected_items.append(item)
            reconstruction_steps.append(
                f"Selected {item_id} (weight: {item['weight']}, value: {item['value']}). Remaining capacity: {current_capacity - item['weight']}."
            )
            current_capacity -= item["weight"]
        else:
            reconstruction_steps.append(
                f"Excluded {item_id} (weight: {item['weight']}, value: {item['value']}). Not optimal or doesn't fit."
            )

    reconstruction_steps.append("Reconstruction complete.")
    
    return {
        "max_value": dp[n][capacity],
        "items": selected_items,
        "table": dp,
        "reconstruction_steps": reconstruction_steps
    }
