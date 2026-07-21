"""
Input validation functions.

These pure functions validate incoming data and ensure it meets
the requirements defined in the constants module.
"""

from utils.constants import (
    MAX_AMOUNT,
    MAX_COINS,
    ERROR_INVALID_JSON,
    ERROR_MISSING_AMOUNT,
    ERROR_AMOUNT_NOT_INT,
    ERROR_AMOUNT_ZERO_NEG,
    ERROR_AMOUNT_EXCEEDS_MAX,
    ERROR_MISSING_COINS,
    ERROR_COINS_NOT_LIST,
    ERROR_COINS_EXCEEDS_MAX,
    ERROR_COINS_NOT_POS_INT,
    ERROR_COINS_DUPLICATES,
)


def validate_amount(amount) -> tuple[bool, str]:
    """Validate the target amount."""
    if amount is None:
        return False, ERROR_MISSING_AMOUNT
    if not isinstance(amount, int) or isinstance(amount, bool):
        return False, ERROR_AMOUNT_NOT_INT
    if amount <= 0:
        return False, ERROR_AMOUNT_ZERO_NEG
    if amount > MAX_AMOUNT:
        return False, ERROR_AMOUNT_EXCEEDS_MAX
    return True, ""


def validate_coin_list(coins) -> tuple[bool, str]:
    """Validate the list of coin denominations."""
    if coins is None:
        return False, ERROR_MISSING_COINS
    if not isinstance(coins, list) or len(coins) == 0:
        return False, ERROR_COINS_NOT_LIST
    if len(coins) > MAX_COINS:
        return False, ERROR_COINS_EXCEEDS_MAX
    if not all(
        isinstance(c, int) and not isinstance(c, bool) and c > 0
        for c in coins
    ):
        return False, ERROR_COINS_NOT_POS_INT
    if len(set(coins)) != len(coins):
        return False, ERROR_COINS_DUPLICATES
    return True, ""


def validate_coin_change_request(data: dict) -> tuple[bool, str]:
    """
    Validate the entire request payload for coin change analysis.

    Returns:
        Tuple of (is_valid, error_message).
    """
    if not isinstance(data, dict):
        return False, ERROR_INVALID_JSON

    amount_valid, amount_err = validate_amount(data.get("amount"))
    if not amount_valid:
        return False, amount_err

    coins_valid, coins_err = validate_coin_list(data.get("coins"))
    if not coins_valid:
        return False, coins_err

    return True, ""


def validate_zero_one_knapsack_request(data: dict) -> tuple[bool, str]:
    """
    Validate the entire request payload for 0/1 Knapsack analysis.

    Returns:
        Tuple of (is_valid, error_message).
    """
    from utils.constants import (
        MAX_KNAPSACK_CAPACITY,
        MAX_KNAPSACK_ITEMS,
        ERROR_MISSING_CAPACITY,
        ERROR_CAPACITY_NOT_INT,
        ERROR_CAPACITY_ZERO_NEG,
        ERROR_CAPACITY_EXCEEDS_MAX,
        ERROR_MISSING_ITEMS,
        ERROR_ITEMS_NOT_LIST,
        ERROR_ITEMS_EXCEEDS_MAX,
        ERROR_ITEM_NOT_DICT,
        ERROR_ITEM_MISSING_KEYS,
        ERROR_ITEM_WEIGHT_INVALID,
        ERROR_ITEM_VALUE_INVALID,
    )

    if not isinstance(data, dict):
        return False, ERROR_INVALID_JSON

    capacity = data.get("capacity")
    if capacity is None:
        return False, ERROR_MISSING_CAPACITY
    if not isinstance(capacity, int) or isinstance(capacity, bool):
        return False, ERROR_CAPACITY_NOT_INT
    if capacity <= 0:
        return False, ERROR_CAPACITY_ZERO_NEG
    if capacity > MAX_KNAPSACK_CAPACITY:
        return False, ERROR_CAPACITY_EXCEEDS_MAX

    items = data.get("items")
    if items is None:
        return False, ERROR_MISSING_ITEMS
    if not isinstance(items, list) or len(items) == 0:
        return False, ERROR_ITEMS_NOT_LIST
    if len(items) > MAX_KNAPSACK_ITEMS:
        return False, ERROR_ITEMS_EXCEEDS_MAX

    for item in items:
        if not isinstance(item, dict):
            return False, ERROR_ITEM_NOT_DICT
        if "weight" not in item or "value" not in item:
            return False, ERROR_ITEM_MISSING_KEYS
        w, v = item["weight"], item["value"]
        if not isinstance(w, int) or isinstance(w, bool) or w <= 0:
            return False, ERROR_ITEM_WEIGHT_INVALID
        if not isinstance(v, int) or isinstance(v, bool) or v <= 0:
            return False, ERROR_ITEM_VALUE_INVALID

    return True, ""


def validate_fractional_knapsack_request(data: dict) -> tuple[bool, str]:
    """
    Validate the entire request payload for Fractional Knapsack analysis.

    Items must have 'name' (non-empty string), 'weight' (positive number),
    and 'value' (positive number). Floats are allowed since items can be
    taken fractionally.

    Returns:
        Tuple of (is_valid, error_message).
    """
    from utils.constants import (
        MAX_KNAPSACK_CAPACITY,
        MAX_FRACTIONAL_ITEMS,
        ERROR_MISSING_CAPACITY,
        ERROR_CAPACITY_NOT_INT,
        ERROR_CAPACITY_ZERO_NEG,
        ERROR_CAPACITY_EXCEEDS_MAX,
        ERROR_MISSING_ITEMS,
        ERROR_ITEMS_NOT_LIST,
        ERROR_FRAC_ITEMS_EXCEEDS_MAX,
        ERROR_ITEM_NOT_DICT,
        ERROR_ITEM_NAME_INVALID,
        ERROR_FRAC_ITEM_WEIGHT_INVALID,
        ERROR_FRAC_ITEM_VALUE_INVALID,
    )

    if not isinstance(data, dict):
        return False, ERROR_INVALID_JSON

    capacity = data.get("capacity")
    if capacity is None:
        return False, ERROR_MISSING_CAPACITY
    if not isinstance(capacity, (int, float)) or isinstance(capacity, bool):
        return False, ERROR_CAPACITY_NOT_INT
    if capacity <= 0:
        return False, ERROR_CAPACITY_ZERO_NEG
    if capacity > MAX_KNAPSACK_CAPACITY:
        return False, ERROR_CAPACITY_EXCEEDS_MAX

    items = data.get("items")
    if items is None:
        return False, ERROR_MISSING_ITEMS
    if not isinstance(items, list) or len(items) == 0:
        return False, ERROR_ITEMS_NOT_LIST
    if len(items) > MAX_FRACTIONAL_ITEMS:
        return False, ERROR_FRAC_ITEMS_EXCEEDS_MAX

    for item in items:
        if not isinstance(item, dict):
            return False, ERROR_ITEM_NOT_DICT
        name = item.get("name", "")
        if not isinstance(name, str) or not name.strip():
            return False, ERROR_ITEM_NAME_INVALID
        w = item.get("weight")
        v = item.get("value")
        if not isinstance(w, (int, float)) or isinstance(w, bool) or w <= 0:
            return False, ERROR_FRAC_ITEM_WEIGHT_INVALID
        if not isinstance(v, (int, float)) or isinstance(v, bool) or v <= 0:
            return False, ERROR_FRAC_ITEM_VALUE_INVALID

    return True, ""


def validate_activity_selection_request(data: dict) -> tuple[bool, str]:
    """
    Validate the request payload for Activity Selection analysis.
    """
    from utils.constants import (
        MAX_ACTIVITIES,
        ERROR_MISSING_ACTIVITIES,
        ERROR_ACTIVITIES_NOT_LIST,
        ERROR_ACTIVITIES_EXCEEDS_MAX,
        ERROR_ACTIVITY_START_FINISH_INVALID,
        ERROR_INVALID_JSON,
    )

    if not isinstance(data, dict):
        return False, ERROR_INVALID_JSON

    activities = data.get("activities")
    if activities is None:
        return False, ERROR_MISSING_ACTIVITIES
    if not isinstance(activities, list) or len(activities) == 0:
        return False, ERROR_ACTIVITIES_NOT_LIST
    if len(activities) > MAX_ACTIVITIES:
        return False, ERROR_ACTIVITIES_EXCEEDS_MAX

    for act in activities:
        if not isinstance(act, dict):
            return False, ERROR_ACTIVITIES_NOT_LIST
        start = act.get("start")
        finish = act.get("finish")
        if not isinstance(start, (int, float)) or isinstance(start, bool) or start < 0:
            return False, ERROR_ACTIVITY_START_FINISH_INVALID
        if not isinstance(finish, (int, float)) or isinstance(finish, bool) or finish <= start:
            return False, ERROR_ACTIVITY_START_FINISH_INVALID

    return True, ""


def validate_rod_cutting_request(data: dict) -> tuple[bool, str]:
    """
    Validate the request payload for Rod Cutting analysis.
    """
    from utils.constants import (
        MAX_ROD_LENGTH,
        ERROR_MISSING_ROD_LENGTH,
        ERROR_ROD_LENGTH_INVALID,
        ERROR_MISSING_PRICES,
        ERROR_PRICES_INVALID,
        ERROR_INVALID_JSON,
    )

    if not isinstance(data, dict):
        return False, ERROR_INVALID_JSON

    length = data.get("length")
    if length is None:
        return False, ERROR_MISSING_ROD_LENGTH
    if not isinstance(length, int) or isinstance(length, bool) or length <= 0 or length > MAX_ROD_LENGTH:
        return False, ERROR_ROD_LENGTH_INVALID

    prices = data.get("prices")
    if prices is None:
        return False, ERROR_MISSING_PRICES
    if not isinstance(prices, list) or len(prices) == 0:
        return False, ERROR_PRICES_INVALID

    for item in prices:
        if not isinstance(item, dict):
            return False, ERROR_PRICES_INVALID
        plen = item.get("length")
        pprice = item.get("price")
        if not isinstance(plen, int) or isinstance(plen, bool) or plen <= 0:
            return False, ERROR_PRICES_INVALID
        if not isinstance(pprice, (int, float)) or isinstance(pprice, bool) or pprice < 0:
            return False, ERROR_PRICES_INVALID

    return True, ""



