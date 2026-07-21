"""
Execution timing utilities.

Reusable helper functions for measuring wall-clock execution time
of arbitrary functions.
"""

import time


def benchmark(func, *args) -> tuple:
    """
    Execute a function and measure its wall-clock runtime.

    Uses time.perf_counter() for high-resolution timing.

    Args:
        func: The function to execute.
        *args: Arguments to pass to the function.

    Returns:
        Tuple of (result, elapsed_ms) where elapsed_ms is rounded
        to 4 decimal places.
    """
    start = time.perf_counter()
    result = func(*args)
    elapsed_ms = (time.perf_counter() - start) * 1000
    return result, round(elapsed_ms, 4)
