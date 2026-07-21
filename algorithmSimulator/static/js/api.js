/**
 * api.js — API Communication Module
 *
 * Single responsibility: send requests to the Flask REST API
 * and return the parsed response.
 *
 * No DOM manipulation. No validation. No rendering.
 * Easily replaceable or mockable for testing.
 */

const API_BASE = "/api/v1";

/**
 * POST to /api/v1/coin-change and return the parsed JSON response.
 *
 * @param {number}   amount - Target amount.
 * @param {number[]} coins  - Array of coin denominations.
 * @returns {Promise<{status: number, data: object}>}
 */
async function solveCoinChange(amount, coins) {
  const response = await fetch(`${API_BASE}/coin-change`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, coins }),
  });

  const data = await response.json();
  return { status: response.status, data };
}

/**
 * POST to /api/v1/zero-one-knapsack and return the parsed JSON response.
 *
 * @param {number}   capacity - Maximum knapsack weight capacity.
 * @param {object[]} items    - Array of {weight, value} item objects.
 * @returns {Promise<{status: number, data: object}>}
 */
async function solveKnapsack(capacity, items) {
  const response = await fetch(`${API_BASE}/zero-one-knapsack`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ capacity, items }),
  });

  const data = await response.json();
  return { status: response.status, data };
}

/**
 * POST to /api/v1/fractional-knapsack and return the parsed JSON response.
 *
 * @param {number}   capacity - Maximum knapsack weight capacity.
 * @param {object[]} items    - Array of {name, weight, value} item objects.
 * @returns {Promise<{status: number, data: object}>}
 */
async function solveFractionalKnapsack(capacity, items) {
  const response = await fetch(`${API_BASE}/fractional-knapsack`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ capacity, items }),
  });

  const data = await response.json();
  return { status: response.status, data };
}

/**
 * POST to /api/v1/activity-selection and return the parsed JSON response.
 *
 * @param {object[]} activities - Array of {start, finish} objects.
 * @returns {Promise<{status: number, data: object}>}
 */
async function solveActivitySelection(activities) {
  const response = await fetch(`${API_BASE}/activity-selection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activities }),
  });

  const data = await response.json();
  return { status: response.status, data };
}

/**
 * POST to /api/v1/rod-cutting and return the parsed JSON response.
 *
 * @param {number}   length - Total rod length.
 * @param {object[]} prices - Array of {length, price} objects.
 * @returns {Promise<{status: number, data: object}>}
 */
async function solveRodCutting(length, prices) {
  const response = await fetch(`${API_BASE}/rod-cutting`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ length, prices }),
  });

  const data = await response.json();
  return { status: response.status, data };
}

export { solveCoinChange, solveKnapsack, solveFractionalKnapsack, solveActivitySelection, solveRodCutting };



