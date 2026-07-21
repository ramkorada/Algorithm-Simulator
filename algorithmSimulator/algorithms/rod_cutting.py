"""
Rod Cutting Dynamic Programming Algorithm Implementation.

Computes maximum obtainable revenue for cutting a rod of length N
given piece prices using Dynamic Programming.
"""


def dp_rod_cutting(length: int, prices: list) -> dict:
    """
    Solve the Rod Cutting problem using Dynamic Programming.

    Args:
        length: Total rod length (integer > 0).
        prices: List of dicts, each with 'length' (int) and 'price' (number).

    Returns:
        Dict with max_revenue, dp_table, reconstruction_steps, optimal_cuts,
        execution_trace, cuts_count, average_piece_length, dp_states_computed.
    """
    # Build price map: length -> price
    price_map = {}
    for p in prices:
        price_map[int(p["length"])] = float(p["price"])

    n = int(length)
    dp = [0.0] * (n + 1)
    first_cut = [0] * (n + 1)

    execution_trace = []
    dp_table = []
    dp_states = 0

    # Build DP table length by length
    for i in range(1, n + 1):
        max_val = -1.0
        best_cut = 0

        # Check all possible first cuts j (from 1 to i)
        for j in range(1, i + 1):
            dp_states += 1
            cost = price_map.get(j, 0.0) + dp[i - j]
            if cost > max_val:
                max_val = cost
                best_cut = j

        dp[i] = round(max_val, 4)
        first_cut[i] = best_cut

        execution_trace.append({
            "sub_length": i,
            "best_revenue": dp[i],
            "first_cut": best_cut,
            "reason": f"Length {i}: Best first cut = {best_cut} with revenue = {dp[i]}",
        })

        dp_table.append({
            "length": i,
            "max_revenue": dp[i],
            "first_cut": best_cut,
        })

    # Reconstruction of optimal cuts
    reconstruction_steps = []
    optimal_cuts = []
    rem = n
    step_idx = 1

    while rem > 0:
        c = first_cut[rem]
        piece_price = price_map.get(c, 0.0)
        new_rem = rem - c

        reconstruction_steps.append({
            "step": step_idx,
            "remaining_before": rem,
            "cut_length": c,
            "piece_price": piece_price,
            "remaining_after": new_rem,
            "reason": f"Remaining {rem}: Cut piece of length {c} (Revenue: {piece_price}) -> Remaining {new_rem}",
        })

        optimal_cuts.append({
            "cut_index": step_idx,
            "length": c,
            "price": piece_price,
            "remaining_length": new_rem,
        })

        rem = new_rem
        step_idx += 1

    reconstruction_steps.append({
        "step": step_idx,
        "remaining_before": 0,
        "cut_length": 0,
        "piece_price": 0.0,
        "remaining_after": 0,
        "reason": "Remaining 0: Solution Complete.",
    })

    cuts_count = len(optimal_cuts)
    total_piece_len = sum(c["length"] for c in optimal_cuts)
    avg_piece_len = round(total_piece_len / cuts_count, 2) if cuts_count > 0 else 0.0

    return {
        "max_revenue": dp[n],
        "dp_table": dp_table,
        "reconstruction_steps": reconstruction_steps,
        "optimal_cuts": optimal_cuts,
        "execution_trace": execution_trace,
        "cuts_count": cuts_count,
        "average_piece_length": avg_piece_len,
        "dp_states_computed": dp_states,
        "rod_length": n,
    }
