/**
 * main.js — Application Entry Point
 *
 * Single responsibility: wire up event listeners and orchestrate the
 * full request-response flow using the other modules.
 *
 * Module-aware: all input reading, API calls, and rendering are
 * delegated to the currently active module registered in module.js.
 *
 * Flow:
 *   validate (via module) → call API (via module) → render (via module)
 *   → update UI state
 */

import {
  getActiveModule,
  switchModule,
  mountInitialModule,
} from "./module.js";

import {
  showLoading,
  hideLoading,
  showInputError,
  clearInputError,
  clearAPIError,
  markInputsAsError,
  showAPIError,
  showResultsSection,
  resetUI,
} from "./ui.js";


// ---------------------------------------------------------------------------
// Core analysis flow  (module-agnostic)
// ---------------------------------------------------------------------------

async function runAnalysis() {
  clearInputError();
  clearAPIError();

  const mod = getActiveModule();

  // Delegate validation + API call to the active module
  showLoading();
  let result;
  try {
    result = await mod.run();
  } catch (networkError) {
    hideLoading();
    showAPIError("Could not reach the server. Make sure the application is running.");
    console.error("Network error:", networkError);
    return;
  }

  // Client-side validation failure (returned by module.run())
  if (result && result.validationError) {
    hideLoading();
    showInputError(result.validationError);
    markInputsAsError();
    return;
  }

  const { status, data, inputs = [] } = result;

  if (status === 200) {
    hideLoading();
    showResultsSection();
    await mod.render(data, ...inputs);
  } else if (status === 422) {
    hideLoading();
    showAPIError(data.message || "Invalid input. Please check your values.");
  } else {
    hideLoading();
    showAPIError(data.message || "An unexpected server error occurred. Please try again.");
  }
}


// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

function handleReset() {
  const mod = getActiveModule();
  mod.reset();
  resetUI();
}


// ---------------------------------------------------------------------------
// Load a preset and immediately run
// ---------------------------------------------------------------------------

function loadPreset(preset) {
  const mod = getActiveModule();
  mod.loadPreset(preset);
  runAnalysis();
}


// ---------------------------------------------------------------------------
// Wire up event listeners
// Called on initial load AND after every module switch (sidebar is re-injected)
// ---------------------------------------------------------------------------

function wireListeners() {
  // Run button
  const runBtn = document.getElementById("run-btn");
  if (runBtn) runBtn.addEventListener("click", runAnalysis);

  // Reset button
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) resetBtn.addEventListener("click", handleReset);

  // Enter key in any sidebar input triggers analysis
  document.querySelectorAll(".sidebar-input").forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runAnalysis();
    });
  });

  // Sidebar preset buttons
  document.querySelectorAll(".preset-btn[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      try {
        const preset = JSON.parse(btn.dataset.preset);
        loadPreset(preset);
      } catch (_) { /* ignore */ }
    });
  });

  // Empty-state CTA preset buttons
  document.querySelectorAll("#empty-state-presets .empty-cta-btn[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      try {
        const preset = JSON.parse(btn.dataset.preset);
        loadPreset(preset);
      } catch (_) { /* ignore */ }
    });
  });
}


// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

  // 1. Mount the initial module (coin_change) and wire its listeners
  mountInitialModule(wireListeners);

  // 2. Wire module navigation buttons
  document.querySelectorAll(".module-btn[data-module]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const moduleId = btn.dataset.module;
      resetUI();
      switchModule(moduleId, wireListeners);
    });
  });
});



