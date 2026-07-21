/**
 * validation.js — Client-Side Input Validation Module
 *
 * Single responsibility: validate raw form input strings before
 * making an API request.
 *
 * Rules mirror the server-side validation in routes/api.py to provide
 * consistent error messages. Catching errors here avoids a round-trip
 * to the server for clearly invalid inputs.
 *
 * No DOM manipulation. No API calls. No rendering.
 */

/**
 * Validate the raw string inputs from the form.
 *
 * @param {string} amountStr - Raw value from the amount input field.
 * @param {string} coinsStr  - Raw value from the coins input field.
 * @returns {{
 *   valid:  boolean,
 *   errors: string[],
 *   amount: number|null,
 *   coins:  number[]|null
 * }}
 */
function validateInput(amountStr, coinsStr) {
  const errors = [];

  // --- Validate amount ---
  const trimmedAmount = String(amountStr).trim();
  const amount = Number(trimmedAmount);

  if (!trimmedAmount) {
    errors.push("Target amount is required.");
  } else if (!Number.isInteger(amount) || amount <= 0) {
    errors.push("Target amount must be a positive integer.");
  } else if (amount > 10_000) {
    errors.push("Target amount must not exceed 10,000.");
  }

  // --- Validate coins ---
  const trimmedCoins = String(coinsStr).trim();

  if (!trimmedCoins) {
    errors.push("Coin denominations are required.");
  } else {
    const parts = trimmedCoins
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (parts.length === 0) {
      errors.push("Please enter at least one coin denomination.");
    } else if (parts.length > 20) {
      errors.push("Please enter no more than 20 coin denominations.");
    } else {
      const parsed = parts.map(Number);

      const hasInvalid = parsed.some(
        (n) => !Number.isInteger(n) || n <= 0
      );
      if (hasInvalid) {
        errors.push(
          "All coin denominations must be positive integers separated by commas."
        );
      } else if (new Set(parsed).size !== parsed.length) {
        errors.push("Coin denominations must be unique.");
      } else {
        // Valid — return parsed values
        if (errors.length === 0) {
          return { valid: true, errors: [], amount, coins: parsed };
        }
      }
    }
  }

  return { valid: false, errors, amount: null, coins: null };
}

export { validateInput };
