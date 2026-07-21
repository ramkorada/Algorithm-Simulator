"""
Coin Change Algorithm Implementations.

Pure algorithmic logic for:
  - Greedy coin change (local optimum at each step)
  - Dynamic Programming coin change (guaranteed global optimum)

This module has no Flask imports and no side effects.
It can be imported and tested independently of the web application.

Designed to be extensible: additional algorithms (Activity Selection,
Knapsack, Rod Cutting) can be added as separate modules in this package.
"""


def greedy_coin_change(coins: list, amount: int) -> dict:
    """
    Solve the Coin Change problem using the Greedy algorithm.

    Strategy: At each step, pick the largest coin that fits the remaining
    amount. Simple and fast, but NOT guaranteed to find the minimum
    number of coins for all coin sets.

    Args:
        coins:  List of available coin denominations (positive integers).
        amount: Target amount to make change for (positive integer).

    Returns:
        A dictionary with:
            solvable (bool):  Whether a solution was found.
            coins    (list):  The sequence of coins selected.
            steps    (list):  Human-readable trace of each decision.
    """
    sorted_coins = sorted(coins, reverse=True)
    selected = []
    steps = []
    remaining = amount

    for coin in sorted_coins:
        while remaining >= coin:
            selected.append(coin)
            remaining -= coin
            steps.append(
                f"Selected coin {coin} — remaining amount: {remaining}"
            )

    if remaining != 0:
        # Greedy got stuck; no valid solution found
        steps.append(
            f"Stuck at remainder {remaining} — no coin fits. Greedy failed."
        )
        return {"solvable": False, "coins": [], "steps": steps}

    return {"solvable": True, "coins": selected, "steps": steps}


def dp_coin_change(coins: list, amount: int) -> dict:
    """
    Solve the Coin Change problem using Dynamic Programming (bottom-up).

    Strategy: Build a table dp[] where dp[i] is the minimum number of
    coins needed to make amount i. Fill the table from 0 to amount,
    then backtrack to reconstruct the chosen coins.

    Guaranteed to return the globally optimal (minimum coin) solution.

    Args:
        coins:  List of available coin denominations (positive integers).
        amount: Target amount to make change for (positive integer).

    Returns:
        A dictionary with:
            solvable (bool):  Whether a solution exists.
            coins    (list):  The sequence of coins in the optimal solution.
            steps    (list):  Human-readable trace of the reconstruction path.
    """
    INF = float("inf")
    dp = [INF] * (amount + 1)
    coin_used = [0] * (amount + 1)
    dp[0] = 0

    # Fill the DP table bottom-up
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] + 1 < dp[i]:
                dp[i] = dp[i - coin] + 1
                coin_used[i] = coin

    if dp[amount] == INF:
        return {
            "solvable": False,
            "coins": [],
            "steps": [
                f"Amount {amount} is unreachable with the given denominations."
            ],
        }

    # Reconstruct the solution by backtracking through coin_used[]
    selected = []
    steps = []
    current = amount

    while current > 0:
        coin = coin_used[current]
        selected.append(coin)
        steps.append(
            f"At amount {current}: used coin {coin} → backtrack to {current - coin}"
        )
        current -= coin

    steps.append("Reached 0 — reconstruction complete.")

    return {"solvable": True, "coins": selected, "steps": steps}
