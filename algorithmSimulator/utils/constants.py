"""
Constants used across the application.

This module centralizes all hardcoded values, limits, and magic numbers
to ensure consistency and maintainability.
"""

MAX_AMOUNT = 10_000
MAX_COINS = 20

MAX_KNAPSACK_CAPACITY = 10_000
MAX_KNAPSACK_ITEMS = 50

# Common API messages
ERROR_INVALID_JSON = "Request body must be a JSON object."
ERROR_MISSING_AMOUNT = "Missing required field: 'amount'."
ERROR_AMOUNT_NOT_INT = "'amount' must be a positive integer."
ERROR_AMOUNT_ZERO_NEG = "'amount' must be greater than 0."
ERROR_AMOUNT_EXCEEDS_MAX = f"'amount' must not exceed {MAX_AMOUNT}."

ERROR_MISSING_COINS = "Missing required field: 'coins'."
ERROR_COINS_NOT_LIST = "'coins' must be a non-empty list."
ERROR_COINS_EXCEEDS_MAX = f"'coins' must contain at most {MAX_COINS} denominations."
ERROR_COINS_NOT_POS_INT = "Every denomination in 'coins' must be a positive integer."
ERROR_COINS_DUPLICATES = "'coins' must not contain duplicate denominations."

ERROR_NO_SOLUTION = "Unsolvable."
ERROR_UNEXPECTED = "Internal server error."

# Knapsack specific errors
ERROR_MISSING_CAPACITY = "Missing required field: 'capacity'."
ERROR_CAPACITY_NOT_INT = "'capacity' must be a positive integer."
ERROR_CAPACITY_ZERO_NEG = "'capacity' must be greater than 0."
ERROR_CAPACITY_EXCEEDS_MAX = f"'capacity' must not exceed {MAX_KNAPSACK_CAPACITY}."

ERROR_MISSING_ITEMS = "Missing required field: 'items'."
ERROR_ITEMS_NOT_LIST = "'items' must be a non-empty list."
ERROR_ITEMS_EXCEEDS_MAX = f"'items' must contain at most {MAX_KNAPSACK_ITEMS} items."
ERROR_ITEM_NOT_DICT = "Each item must be a JSON object."
ERROR_ITEM_MISSING_KEYS = "Each item must have 'weight' and 'value' fields."
ERROR_ITEM_WEIGHT_INVALID = "Item 'weight' must be a positive integer."
ERROR_ITEM_VALUE_INVALID = "Item 'value' must be a positive integer."

# Fractional Knapsack specific constants
MAX_FRACTIONAL_ITEMS = 50

ERROR_MISSING_CAPACITY = "Missing required field: 'capacity'."
ERROR_ITEM_NAME_INVALID = "Each item must have a non-empty 'name' string."
ERROR_FRAC_ITEM_WEIGHT_INVALID = "Item 'weight' must be a positive number."
ERROR_FRAC_ITEM_VALUE_INVALID = "Item 'value' must be a positive number."
ERROR_FRAC_ITEMS_EXCEEDS_MAX = f"'items' must contain at most {MAX_FRACTIONAL_ITEMS} items."

# Activity Selection specific constants
MAX_ACTIVITIES = 50

ERROR_MISSING_ACTIVITIES = "Missing required field: 'activities'."
ERROR_ACTIVITIES_NOT_LIST = "Field 'activities' must be a non-empty list."
ERROR_ACTIVITIES_EXCEEDS_MAX = f"'activities' must contain at most {MAX_ACTIVITIES} items."
ERROR_ACTIVITY_START_FINISH_INVALID = "Each activity must have 'start' and 'finish' numbers where start < finish."

# Rod Cutting specific constants
MAX_ROD_LENGTH = 100

ERROR_MISSING_ROD_LENGTH = "Missing required field: 'length'."
ERROR_ROD_LENGTH_INVALID = "Rod length must be a positive integer <= 100."
ERROR_MISSING_PRICES = "Missing required field: 'prices'."
ERROR_PRICES_INVALID = "Prices must be a non-empty list of items with positive 'length' and 'price'."


