/**
 * ui.js — UI State Management Module
 *
 * Single responsibility: manage application state transitions
 * (loading, error, empty state, results state).
 *
 * No API calls. No data processing. No rendering of results.
 * Only controls visibility and error display.
 */


// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function showLoading() {
  document.getElementById("loading-indicator").hidden = false;
  document.getElementById("run-btn").disabled = true;
}

function hideLoading() {
  document.getElementById("loading-indicator").hidden = true;
  document.getElementById("run-btn").disabled = false;
}


// ---------------------------------------------------------------------------
// Input validation errors
// ---------------------------------------------------------------------------

/**
 * Display one or more validation error messages.
 * @param {string[]} messages
 */
function showInputError(messages) {
  const container = document.getElementById("input-error");

  if (messages.length === 1) {
    container.textContent = messages[0];
  } else {
    const ul = document.createElement("ul");
    ul.style.paddingLeft = "1rem";
    messages.forEach((msg) => {
      const li = document.createElement("li");
      li.textContent = msg;
      ul.appendChild(li);
    });
    container.innerHTML = "";
    container.appendChild(ul);
  }

  container.hidden = false;
}

function clearInputError() {
  const container = document.getElementById("input-error");
  if (container) {
    container.textContent = "";
    container.hidden = true;
  }
  // Module-agnostic: clear error styling from whichever inputs are currently rendered
  document.querySelectorAll(".sidebar-input").forEach((el) =>
    el.classList.remove("field-input--error")
  );
}

function markInputsAsError() {
  // Module-agnostic: mark whichever inputs are currently rendered
  document.querySelectorAll(".sidebar-input").forEach((el) =>
    el.classList.add("field-input--error")
  );
}


// ---------------------------------------------------------------------------
// API-level errors (422 Unsolvable, 500 Server Error)
// ---------------------------------------------------------------------------

/**
 * @param {string} message
 */
function showAPIError(message) {
  const container = document.getElementById("api-error");
  container.textContent = message;
  container.hidden = false;
}

function clearAPIError() {
  const container = document.getElementById("api-error");
  container.textContent = "";
  container.hidden = true;
}


// ---------------------------------------------------------------------------
// Application view states
// ---------------------------------------------------------------------------

/**
 * Switch from empty state to results view and scroll to top of main.
 */
function showResultsSection() {
  document.getElementById("empty-state").hidden   = true;
  document.getElementById("results-view").hidden  = false;
  document.getElementById("main-content").scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Return to empty state and hide results.
 */
function hideResultsSection() {
  document.getElementById("results-view").hidden = true;
  document.getElementById("empty-state").hidden  = false;
}


// ---------------------------------------------------------------------------
// Full reset
// ---------------------------------------------------------------------------

function resetUI() {
  clearInputError();   // already module-agnostic — clears all .sidebar-input errors
  clearAPIError();
  hideResultsSection();
}

export {
  showLoading,
  hideLoading,
  showInputError,
  clearInputError,
  markInputsAsError,
  showAPIError,
  clearAPIError,
  showResultsSection,
  hideResultsSection,
  resetUI,
};
