"""
Activity Selection Algorithm Implementation.

Pure greedy algorithm: sort by finish time, select earliest-finishing
compatible activity at each step. Provably optimal by exchange argument.
"""


def greedy_activity_selection(activities: list) -> dict:
    """
    Solve the Activity Selection problem using the Greedy algorithm.

    Each activity is a dict with:
        id     (str)  - label, e.g. "A1"
        start  (int/float) - start time
        finish (int/float) - finish time

    Returns:
        Dict with selected, skipped, sorted_by_finish, trace, total_activities,
        selected_count, skipped_count, compatibility_checks.
    """
    if not activities:
        return {
            "selected": [],
            "skipped": [],
            "sorted_by_finish": [],
            "trace": [],
            "total_activities": 0,
            "selected_count": 0,
            "skipped_count": 0,
            "compatibility_checks": 0,
        }

    # Ensure id field is set
    formatted_activities = []
    for idx, act in enumerate(activities):
        formatted_activities.append({
            "id": act.get("id") or f"A{idx + 1}",
            "start": float(act["start"]),
            "finish": float(act["finish"]),
            "duration": round(float(act["finish"]) - float(act["start"]), 4),
        })

    # Sort by finish time (primary), then start time (secondary)
    sorted_acts = sorted(formatted_activities, key=lambda a: (a["finish"], a["start"]))

    selected = []
    skipped = []
    trace = []
    compat_checks = 0
    last_finish = -1.0

    for act in sorted_acts:
        if not selected:
            # First activity in sorted order is always selected
            selected.append(act)
            last_finish = act["finish"]
            trace.append({
                "action": "selected",
                "activity": act,
                "reason": "Earliest finish time -- selected first.",
                "last_finish_before": -1.0,
                "last_finish_after": act["finish"],
            })
        else:
            compat_checks += 1
            if act["start"] >= last_finish:
                selected.append(act)
                trace.append({
                    "action": "selected",
                    "activity": act,
                    "reason": f"Start time ({act['start']}) >= last finish ({last_finish}). No overlap.",
                    "last_finish_before": last_finish,
                    "last_finish_after": act["finish"],
                })
                last_finish = act["finish"]
            else:
                skipped.append(act)
                trace.append({
                    "action": "skipped",
                    "activity": act,
                    "reason": f"Start time ({act['start']}) < last finish ({last_finish}). Overlaps previously selected activity.",
                    "last_finish_before": last_finish,
                    "last_finish_after": last_finish,
                })

    return {
        "selected": selected,
        "skipped": skipped,
        "sorted_by_finish": sorted_acts,
        "trace": trace,
        "total_activities": len(formatted_activities),
        "selected_count": len(selected),
        "skipped_count": len(skipped),
        "compatibility_checks": compat_checks,
    }
