"""
Fractional Knapsack Algorithm Implementation.

Pure algorithmic logic for solving the Fractional Knapsack problem
using the Greedy algorithm (sort by value/weight ratio, take greedily).

Unlike 0/1 Knapsack, items can be divided � this means Greedy is
provably optimal. The module returns rich structured data so the
frontend can animate each step of the selection process.

This module has no Flask imports and no side effects.
"""


def greedy_fractional_knapsack(capacity: float, items: list) -> dict:
    """
    Solve the Fractional Knapsack problem using the Greedy algorithm.

    Strategy:
        1. Compute value/weight ratio for each item.
        2. Sort items by ratio descending (highest density first).
        3. Greedily take each item -- fully if it fits, or just the
           remaining fraction if capacity runs out.

    Args:
        capacity: Maximum weight the knapsack can hold (positive number).
        items:    List of dicts, each with 'name' (str), 'weight' (number),
                  and 'value' (number).

    Returns:
        A dictionary with:
            maximum_value          (float): Total value collected.
            selected_items         (list):  Items (or fractions) taken.
            weight_used            (float): Total weight consumed.
            remaining_capacity     (float): Unused capacity.
            utilization_percentage (float): Capacity used as a percentage.
            ratio_sorted_items     (list):  Items sorted by ratio (for viz).
            selection_steps        (list):  Structured step-by-step trace.
            items_fully_taken      (int):   Count of items taken 100%.
            items_partially_taken  (int):   Count of items taken fractionally.
            items_skipped          (int):   Count of items not taken.
    """
    # Attach ratio and sort descending by ratio
    enriched = []
    for item in items:
        w = float(item["weight"])
        v = float(item["value"])
        ratio = round(v / w, 4) if w > 0 else 0.0
        enriched.append({
            "name":   item["name"],
            "weight": w,
            "value":  v,
            "ratio":  ratio,
        })

    ratio_sorted = sorted(enriched, key=lambda x: x["ratio"], reverse=True)

    # Greedy selection pass
    remaining       = float(capacity)
    total_value     = 0.0
    selected        = []
    steps           = []
    fully_taken     = 0
    partially_taken = 0
    skipped         = 0

    for item in ratio_sorted:
        if remaining <= 0:
            steps.append({
                "action":             "skip",
                "item_name":          item["name"],
                "weight":             item["weight"],
                "value":              item["value"],
                "ratio":              item["ratio"],
                "fraction_taken":     0.0,
                "contributed_value":  0.0,
                "capacity_before":    round(remaining, 4),
                "capacity_after":     round(remaining, 4),
                "total_value_so_far": round(total_value, 4),
                "reason":             "Knapsack is full.",
            })
            skipped += 1
            continue

        if item["weight"] <= remaining:
            fraction        = 1.0
            contributed     = item["value"]
            cap_after       = remaining - item["weight"]
            action          = "full"
            fully_taken    += 1
        else:
            fraction        = remaining / item["weight"]
            contributed     = fraction * item["value"]
            cap_after       = 0.0
            action          = "partial"
            partially_taken += 1

        fraction    = round(fraction, 4)
        contributed = round(contributed, 4)
        cap_after   = round(cap_after, 4)
        cap_before  = round(remaining, 4)
        total_value += contributed
        remaining    = cap_after

        selected.append({
            "item_name":         item["name"],
            "weight":            item["weight"],
            "value":             item["value"],
            "ratio":             item["ratio"],
            "fraction_taken":    fraction,
            "contributed_value": contributed,
        })

        steps.append({
            "action":             action,
            "item_name":          item["name"],
            "weight":             item["weight"],
            "value":              item["value"],
            "ratio":              item["ratio"],
            "fraction_taken":     fraction,
            "contributed_value":  contributed,
            "capacity_before":    cap_before,
            "capacity_after":     cap_after,
            "total_value_so_far": round(total_value, 4),
            "reason": (
                "Fits completely -- taken in full."
                if action == "full"
                else f"Only {round(fraction * 100, 2)}% fits -- partial fraction taken."
            ),
        })

    total_value     = round(total_value, 4)
    weight_used     = round(float(capacity) - remaining, 4)
    utilization_pct = (
        round((weight_used / float(capacity)) * 100, 2) if capacity > 0 else 0.0
    )

    return {
        "maximum_value":          total_value,
        "selected_items":         selected,
        "weight_used":            weight_used,
        "remaining_capacity":     round(remaining, 4),
        "utilization_percentage": utilization_pct,
        "ratio_sorted_items":     ratio_sorted,
        "selection_steps":        steps,
        "items_fully_taken":      fully_taken,
        "items_partially_taken":  partially_taken,
        "items_skipped":          skipped,
    }
