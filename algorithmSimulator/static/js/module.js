/**
 * module.js — Module Registry & Navigation System
 *
 * Single responsibility: manage which algorithm module is active,
 * render the correct sidebar & empty-state content, and expose
 * the active module's API caller and validator to main.js.
 *
 * To add a new module in the future:
 *   1. Import its API function from api.js.
 *   2. Add a new entry to MODULES below.
 *   3. That's it — navigation is automatic.
 */

import { solveCoinChange, solveKnapsack, solveFractionalKnapsack, solveActivitySelection, solveRodCutting } from "./api.js";
import { renderAll as renderCoinChange } from "./render.js";
import { renderAll as renderKnapsack } from "./render_knapsack.js";
import { renderAll as renderFractionalKnapsack } from "./render_fractional_knapsack.js";
import { renderAll as renderActivitySelection } from "./render_activity_selection.js";
import { renderAll as renderRodCutting } from "./render_rod_cutting.js";

// ---------------------------------------------------------------------------
// Module Registry
// Each module entry fully describes how to render, validate, and run it.
// ---------------------------------------------------------------------------

const MODULES = {

  coin_change: {
    id:         "coin_change",
    label:      "Coin Change",
    problemTag: "Coin Change Problem",

    // --- Sidebar HTML ---
    sidebarHTML: `
      <div class="sidebar-problem-tag">
        <span class="problem-tag__dot"></span>
        Coin Change Problem
      </div>

      <div class="sidebar-section">
        <label class="input-label" for="amount-input">Target Amount</label>
        <input
          type="number" id="amount-input" class="sidebar-input"
          placeholder="e.g. 11" value="11"
          min="1" max="10000" autocomplete="off"
          aria-describedby="amount-hint"
        />
        <span id="amount-hint" class="input-hint">Positive integer, max 10,000</span>
      </div>

      <div class="sidebar-section">
        <label class="input-label" for="coins-input">Coin Denominations</label>
        <input
          type="text" id="coins-input" class="sidebar-input"
          placeholder="e.g. 1, 5, 6, 9" value="1, 5, 6, 9"
          autocomplete="off" aria-describedby="coins-hint"
        />
        <span id="coins-hint" class="input-hint">Comma-separated, max 20</span>
      </div>

      <div id="input-error"  class="sidebar-error"     role="alert" aria-live="polite" hidden></div>
      <div id="api-error"    class="sidebar-api-error"  role="alert" aria-live="polite" hidden></div>

      <button id="run-btn"   class="run-btn"   type="button">
        <span class="run-btn__icon" aria-hidden="true">&#9654;</span>
        Run Analysis
      </button>
      <button id="reset-btn" class="reset-btn"  type="button">Reset</button>

      <div id="loading-indicator" class="sidebar-loading" hidden aria-live="polite">
        <span class="sidebar-spinner" aria-hidden="true"></span>
        <span>Analyzing&hellip;</span>
      </div>

      <div class="presets">
        <span class="presets__label">Quick presets</span>

        <button class="preset-btn" type="button" data-preset='{"amount":11,"coins":"1,5,6,9"}'
          title="Greedy picks 9+1+1 (3 coins), DP finds 5+6 (2 coins)">
          <span class="preset-btn__tag preset-btn__tag--fail">&#10007;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Greedy Fails</span>
            <span class="preset-btn__meta">11, [1,5,6,9]</span>
          </span>
        </button>

        <button class="preset-btn" type="button" data-preset='{"amount":30,"coins":"1,5,10,25"}'
          title="Standard currency — Greedy is optimal">
          <span class="preset-btn__tag preset-btn__tag--ok">&#10003;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Greedy Optimal</span>
            <span class="preset-btn__meta">30, [1,5,10,25]</span>
          </span>
        </button>

        <button class="preset-btn" type="button" data-preset='{"amount":43,"coins":"1,2,5,10,20,50"}'
          title="Classic coin set">
          <span class="preset-btn__tag preset-btn__tag--ok">&#10003;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Classic</span>
            <span class="preset-btn__meta">43, [1,2,5,10,20,50]</span>
          </span>
        </button>

        <button class="preset-btn" type="button" data-preset='{"amount":6,"coins":"1,3,4"}'
          title="Greedy picks 4+1+1, DP picks 3+3">
          <span class="preset-btn__tag preset-btn__tag--fail">&#10007;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Non-canonical</span>
            <span class="preset-btn__meta">6, [1,3,4]</span>
          </span>
        </button>
      </div>
    `,

    // --- Empty state ---
    emptyTitle:    "Coin Change Visualizer",
    emptySubtitle: "Configure the target amount and coin denominations on the left, then run analysis to watch Greedy and DP compete step-by-step.",
    emptyPresets: [
      { label: "Greedy Fails — 11, [1,5,6,9]",     preset: '{"amount":11,"coins":"1,5,6,9"}' },
      { label: "Both Optimal — 30, [1,5,10,25]",   preset: '{"amount":30,"coins":"1,5,10,25"}' },
      { label: "Non-canonical — 6, [1,3,4]",        preset: '{"amount":6,"coins":"1,3,4"}' },
    ],

    // --- Run: reads inputs, calls API, returns {status, data} ---
    async run() {
      const amountStr = document.getElementById("amount-input").value;
      const coinsStr  = document.getElementById("coins-input").value;

      const validation = validateCoinChangeInput(amountStr, coinsStr);
      if (!validation.valid) return { validationError: validation.errors };

      const { amount, coins } = validation;
      const apiResult = await solveCoinChange(amount, coins);
      return { ...apiResult, inputs: [amount, coins] };
    },

    // --- Render: delegate to render.js (Coin Change) ---
    render: renderCoinChange,

    // --- Reset: restore default input values ---
    reset() {
      const a = document.getElementById("amount-input");
      const c = document.getElementById("coins-input");
      if (a) a.value = "11";
      if (c) c.value = "1, 5, 6, 9";
    },

    // --- Load preset into inputs ---
    loadPreset(preset) {
      const a = document.getElementById("amount-input");
      const c = document.getElementById("coins-input");
      if (a) a.value = preset.amount;
      if (c) c.value = preset.coins.split(",").join(", ");
    },
  },


  zero_one_knapsack: {
    id:         "zero_one_knapsack",
    label:      "0/1 Knapsack",
    problemTag: "0/1 Knapsack Problem",

    // --- Sidebar HTML ---
    sidebarHTML: `
      <div class="sidebar-problem-tag">
        <span class="problem-tag__dot" style="background: var(--dp);"></span>
        0/1 Knapsack Problem
      </div>

      <div class="sidebar-section">
        <label class="input-label" for="capacity-input">Knapsack Capacity</label>
        <input
          type="number" id="capacity-input" class="sidebar-input"
          placeholder="e.g. 50" value="50"
          min="1" max="10000" autocomplete="off"
          aria-describedby="capacity-hint"
        />
        <span id="capacity-hint" class="input-hint">Max weight the knapsack can hold</span>
      </div>

      <div class="sidebar-section">
        <label class="input-label" for="items-input">Items (weight:value pairs)</label>
        <textarea
          id="items-input" class="sidebar-input sidebar-textarea"
          placeholder="e.g. 10:60, 20:100, 30:120"
          autocomplete="off" rows="4"
          aria-describedby="items-hint"
        >10:60, 20:100, 30:120</textarea>
        <span id="items-hint" class="input-hint">Format: weight:value, comma-separated. Max 50 items.</span>
      </div>

      <div id="input-error"  class="sidebar-error"     role="alert" aria-live="polite" hidden></div>
      <div id="api-error"    class="sidebar-api-error"  role="alert" aria-live="polite" hidden></div>

      <button id="run-btn"   class="run-btn"   type="button">
        <span class="run-btn__icon" aria-hidden="true">&#9654;</span>
        Run Analysis
      </button>
      <button id="reset-btn" class="reset-btn"  type="button">Reset</button>

      <div id="loading-indicator" class="sidebar-loading" hidden aria-live="polite">
        <span class="sidebar-spinner" aria-hidden="true"></span>
        <span>Analyzing&hellip;</span>
      </div>

      <div class="presets">
        <span class="presets__label">Quick presets</span>

        <button class="preset-btn" type="button"
          data-preset='{"capacity":50,"items":"10:60, 20:100, 30:120"}'
          title="Classic 3-item knapsack">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Classic</span>
            <span class="preset-btn__meta">Cap: 50, 3 items</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"capacity":7,"items":"1:1, 3:4, 4:5, 5:7"}'
          title="Small example showing DP advantage">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Small Example</span>
            <span class="preset-btn__meta">Cap: 7, 4 items</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"capacity":100,"items":"10:60, 20:100, 30:120, 15:80, 25:110, 5:40"}'
          title="Larger knapsack example">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Larger Set</span>
            <span class="preset-btn__meta">Cap: 100, 6 items</span>
          </span>
        </button>
      </div>
    `,

    // --- Empty state ---
    emptyTitle:    "0/1 Knapsack Visualizer",
    emptySubtitle: "Enter the knapsack capacity and item weights/values on the left, then run analysis to watch Dynamic Programming build the optimal solution step-by-step.",
    emptyPresets: [
      { label: "Classic — Cap: 50",   preset: '{"capacity":50,"items":"10:60, 20:100, 30:120"}' },
      { label: "Small — Cap: 7",      preset: '{"capacity":7,"items":"1:1, 3:4, 4:5, 5:7"}' },
      { label: "Larger Set — Cap: 100", preset: '{"capacity":100,"items":"10:60, 20:100, 30:120, 15:80, 25:110, 5:40"}' },
    ],

    // --- Run: reads inputs, calls API, returns {status, data} ---
    async run() {
      const capacityStr = document.getElementById("capacity-input").value;
      const itemsStr    = document.getElementById("items-input").value;

      const validation = validateKnapsackInput(capacityStr, itemsStr);
      if (!validation.valid) return { validationError: validation.errors };

      const { capacity, items } = validation;
      const apiResult = await solveKnapsack(capacity, items);
      return { ...apiResult, inputs: [] };
    },

    // --- Render: delegate to render_knapsack.js ---
    render: renderKnapsack,

    // --- Reset: restore default input values ---
    reset() {
      const c = document.getElementById("capacity-input");
      const i = document.getElementById("items-input");
      if (c) c.value = "50";
      if (i) i.value = "10:60, 20:100, 30:120";
    },

    // --- Load preset into inputs ---
    loadPreset(preset) {
      const c = document.getElementById("capacity-input");
      const i = document.getElementById("items-input");
      if (c) c.value = preset.capacity;
      if (i) i.value = preset.items;
    },
  },


  fractional_knapsack: {
    id:         "fractional_knapsack",
    label:      "Fractional Knapsack",
    problemTag: "Fractional Knapsack Problem",

    // --- Sidebar HTML ---
    sidebarHTML: `
      <div class="sidebar-problem-tag">
        <span class="problem-tag__dot" style="background: var(--dp);"></span>
        Fractional Knapsack Problem
      </div>

      <div class="sidebar-section">
        <label class="input-label" for="frac-capacity-input">Knapsack Capacity</label>
        <input
          type="number" id="frac-capacity-input" class="sidebar-input"
          placeholder="e.g. 50" value="50"
          min="1" max="10000" autocomplete="off"
          aria-describedby="frac-capacity-hint"
        />
        <span id="frac-capacity-hint" class="input-hint">Max weight the knapsack can hold</span>
      </div>

      <div class="sidebar-section">
        <label class="input-label" for="frac-items-input">Items (name:weight:value)</label>
        <textarea
          id="frac-items-input" class="sidebar-input sidebar-textarea"
          placeholder="e.g. Gold:10:60, Silver:20:100"
          autocomplete="off" rows="4"
          aria-describedby="frac-items-hint"
        >Gold:10:60, Silver:20:100, Bronze:30:120</textarea>
        <span id="frac-items-hint" class="input-hint">Format: name:weight:value, comma-separated. Max 50 items.</span>
      </div>

      <div id="input-error"  class="sidebar-error"     role="alert" aria-live="polite" hidden></div>
      <div id="api-error"    class="sidebar-api-error"  role="alert" aria-live="polite" hidden></div>

      <button id="run-btn"   class="run-btn"   type="button">
        <span class="run-btn__icon" aria-hidden="true">&#9654;</span>
        Run Analysis
      </button>
      <button id="reset-btn" class="reset-btn"  type="button">Reset</button>

      <div id="loading-indicator" class="sidebar-loading" hidden aria-live="polite">
        <span class="sidebar-spinner" aria-hidden="true"></span>
        <span>Analyzing&hellip;</span>
      </div>

      <div class="presets">
        <span class="presets__label">Quick presets</span>

        <button class="preset-btn" type="button"
          data-preset='{"capacity":50,"items":"Gold:10:60, Silver:20:100, Bronze:30:120"}'
          title="Classic 3-item fractional knapsack">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Classic</span>
            <span class="preset-btn__meta">Cap: 50, 3 items</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"capacity":50,"items":"A:5:30, B:10:40, C:15:45, D:22:77, E:25:90"}'
          title="Five items, partial selection guaranteed">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Partial Mix</span>
            <span class="preset-btn__meta">Cap: 50, 5 items</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"capacity":60,"items":"Diamond:5:100, Gold:10:60, Silver:20:100, Bronze:30:120, Iron:40:80"}'
          title="High-value small items demonstrate ratio sorting clearly">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Ratio Showcase</span>
            <span class="preset-btn__meta">Cap: 60, 5 items</span>
          </span>
        </button>
      </div>
    `,

    // --- Empty state ---
    emptyTitle:    "Fractional Knapsack Visualizer",
    emptySubtitle: "Enter the knapsack capacity and items (name:weight:value) on the left, then run analysis to watch Greedy sort by value density and build the optimal solution step-by-step.",
    emptyPresets: [
      { label: "Classic — Cap: 50",         preset: '{"capacity":50,"items":"Gold:10:60, Silver:20:100, Bronze:30:120"}' },
      { label: "Partial Mix — Cap: 50",     preset: '{"capacity":50,"items":"A:5:30, B:10:40, C:15:45, D:22:77, E:25:90"}' },
      { label: "Ratio Showcase — Cap: 60",  preset: '{"capacity":60,"items":"Diamond:5:100, Gold:10:60, Silver:20:100, Bronze:30:120, Iron:40:80"}' },
    ],

    // --- Run: reads inputs, calls API, returns {status, data} ---
    async run() {
      const capacityStr = document.getElementById("frac-capacity-input").value;
      const itemsStr    = document.getElementById("frac-items-input").value;

      const validation = validateFractionalKnapsackInput(capacityStr, itemsStr);
      if (!validation.valid) return { validationError: validation.errors };

      const { capacity, items } = validation;
      const apiResult = await solveFractionalKnapsack(capacity, items);
      return { ...apiResult, inputs: [] };
    },

    // --- Render: delegate to render_fractional_knapsack.js ---
    render: renderFractionalKnapsack,

    // --- Reset: restore default input values ---
    reset() {
      const c = document.getElementById("frac-capacity-input");
      const i = document.getElementById("frac-items-input");
      if (c) c.value = "50";
      if (i) i.value = "Gold:10:60, Silver:20:100, Bronze:30:120";
    },

    // --- Load preset into inputs ---
    loadPreset(preset) {
      const c = document.getElementById("frac-capacity-input");
      const i = document.getElementById("frac-items-input");
      if (c) c.value = preset.capacity;
      if (i) i.value = preset.items;
    },
  },


  activity_selection: {
    id:         "activity_selection",
    label:      "Activity Selection",
    problemTag: "Activity Selection Problem",

    // --- Sidebar HTML ---
    sidebarHTML: `
      <div class="sidebar-problem-tag">
        <span class="problem-tag__dot" style="background: var(--dp);"></span>
        Activity Selection Problem
      </div>

      <div class="sidebar-section">
        <label class="input-label" for="act-input">Activities (start:end)</label>
        <textarea
          id="act-input" class="sidebar-input sidebar-textarea"
          placeholder="e.g. 1:4, 3:5, 0:6, 5:7, 8:9, 5:9"
          autocomplete="off" rows="5"
          aria-describedby="act-hint"
        >1:4, 3:5, 0:6, 5:7, 8:9, 5:9</textarea>
        <span id="act-hint" class="input-hint">Format: start:end, comma-separated. Max 50 activities.</span>
      </div>

      <div id="input-error"  class="sidebar-error"     role="alert" aria-live="polite" hidden></div>
      <div id="api-error"    class="sidebar-api-error"  role="alert" aria-live="polite" hidden></div>

      <button id="run-btn"   class="run-btn"   type="button">
        <span class="run-btn__icon" aria-hidden="true">&#9654;</span>
        Run Analysis
      </button>
      <button id="reset-btn" class="reset-btn"  type="button">Reset</button>

      <div id="loading-indicator" class="sidebar-loading" hidden aria-live="polite">
        <span class="sidebar-spinner" aria-hidden="true"></span>
        <span>Analyzing&hellip;</span>
      </div>

      <div class="presets">
        <span class="presets__label">Quick presets</span>

        <button class="preset-btn" type="button"
          data-preset='{"activities":"1:4, 3:5, 0:6, 5:7, 8:9, 5:9"}'
          title="Classic 6-activity selection">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Classic</span>
            <span class="preset-btn__meta">6 activities</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"activities":"1:10, 2:5, 3:7, 6:9, 8:11"}'
          title="Heavy overlap scenario">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Overlapping</span>
            <span class="preset-btn__meta">5 activities</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"activities":"1:3, 2:4, 3:5, 4:6, 5:7, 6:8"}'
          title="Dense consecutive intervals">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Dense</span>
            <span class="preset-btn__meta">6 activities</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"activities":"1:2, 3:4, 5:6, 7:8, 9:10"}'
          title="Fully non-overlapping sparse intervals">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Sparse</span>
            <span class="preset-btn__meta">5 activities (all selected)</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"activities":"0:4, 1:5, 2:6, 5:8, 7:9, 8:11"}'
          title="Random interval mix">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Random</span>
            <span class="preset-btn__meta">6 activities</span>
          </span>
        </button>
      </div>
    `,

    // --- Empty state ---
    emptyTitle:    "Activity Selection Visualizer",
    emptySubtitle: "Enter activities (start:end) on the left, then run analysis to watch Greedy select the maximum set of mutually compatible activities step-by-step.",
    emptyPresets: [
      { label: "Classic — 6 activities",     preset: '{"activities":"1:4, 3:5, 0:6, 5:7, 8:9, 5:9"}' },
      { label: "Overlapping — 5 activities", preset: '{"activities":"1:10, 2:5, 3:7, 6:9, 8:11"}' },
      { label: "Dense — 6 activities",       preset: '{"activities":"1:3, 2:4, 3:5, 4:6, 5:7, 6:8"}' },
      { label: "Sparse — 5 activities",      preset: '{"activities":"1:2, 3:4, 5:6, 7:8, 9:10"}' },
      { label: "Random — 6 activities",      preset: '{"activities":"0:4, 1:5, 2:6, 5:8, 7:9, 8:11"}' },
    ],

    // --- Run: reads inputs, calls API, returns {status, data} ---
    async run() {
      const actStr = document.getElementById("act-input").value;
      const validation = validateActivitySelectionInput(actStr);
      if (!validation.valid) return { validationError: validation.errors };

      const { activities } = validation;
      const apiResult = await solveActivitySelection(activities);
      return { ...apiResult, inputs: [] };
    },

    // --- Render: delegate to render_activity_selection.js ---
    render: renderActivitySelection,

    // --- Reset: restore default input values ---
    reset() {
      const input = document.getElementById("act-input");
      if (input) input.value = "1:4, 3:5, 0:6, 5:7, 8:9, 5:9";
    },

    // --- Load preset into inputs ---
    loadPreset(preset) {
      const input = document.getElementById("act-input");
      if (input) input.value = preset.activities;
    },
  },


  rod_cutting: {
    id:         "rod_cutting",
    label:      "Rod Cutting",
    problemTag: "Rod Cutting Problem",

    // --- Sidebar HTML ---
    sidebarHTML: `
      <div class="sidebar-problem-tag">
        <span class="problem-tag__dot" style="background: var(--dp);"></span>
        Rod Cutting Problem
      </div>

      <div class="sidebar-section">
        <label class="input-label" for="rod-length-input">Rod Length</label>
        <input
          type="number" id="rod-length-input" class="sidebar-input"
          placeholder="e.g. 8" value="8"
          min="1" max="100" autocomplete="off"
          aria-describedby="rod-length-hint"
        />
        <span id="rod-length-hint" class="input-hint">Total rod length (max 100)</span>
      </div>

      <div class="sidebar-section">
        <label class="input-label" for="rod-prices-input">Price List (length:price)</label>
        <textarea
          id="rod-prices-input" class="sidebar-input sidebar-textarea"
          placeholder="e.g. 1:1, 2:5, 3:8, 4:9, 5:10, 6:17, 7:17, 8:20"
          autocomplete="off" rows="5"
          aria-describedby="rod-prices-hint"
        >1:1, 2:5, 3:8, 4:9, 5:10, 6:17, 7:17, 8:20</textarea>
        <span id="rod-prices-hint" class="input-hint">Format: length:price, comma-separated.</span>
      </div>

      <div id="input-error"  class="sidebar-error"     role="alert" aria-live="polite" hidden></div>
      <div id="api-error"    class="sidebar-api-error"  role="alert" aria-live="polite" hidden></div>

      <button id="run-btn"   class="run-btn"   type="button">
        <span class="run-btn__icon" aria-hidden="true">&#9654;</span>
        Run Analysis
      </button>
      <button id="reset-btn" class="reset-btn"  type="button">Reset</button>

      <div id="loading-indicator" class="sidebar-loading" hidden aria-live="polite">
        <span class="sidebar-spinner" aria-hidden="true"></span>
        <span>Analyzing&hellip;</span>
      </div>

      <div class="presets">
        <span class="presets__label">Quick presets</span>

        <button class="preset-btn" type="button"
          data-preset='{"length":8,"prices":"1:1, 2:5, 3:8, 4:9, 5:10, 6:17, 7:17, 8:20"}'
          title="Classic textbook example">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Classic</span>
            <span class="preset-btn__meta">Length: 8</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"length":6,"prices":"1:2, 2:5, 3:9, 4:14, 5:20, 6:27"}'
          title="Increasing price curve">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Increasing Prices</span>
            <span class="preset-btn__meta">Length: 6</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"length":8,"prices":"1:3, 2:5, 3:10, 4:12, 5:14, 6:19, 7:20, 8:25"}'
          title="Non-linear price fluctuations">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Non-linear Prices</span>
            <span class="preset-btn__meta">Length: 8</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"length":10,"prices":"1:1, 2:5, 3:8, 4:9, 5:10, 6:17, 7:17, 8:20, 9:24, 10:30"}'
          title="Length 10 rod example">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Large Example</span>
            <span class="preset-btn__meta">Length: 10</span>
          </span>
        </button>

        <button class="preset-btn" type="button"
          data-preset='{"length":7,"prices":"1:2, 2:4, 3:7, 4:8, 5:11, 6:13, 7:16"}'
          title="Random price distribution">
          <span class="preset-btn__tag preset-btn__tag--ok">&#9670;</span>
          <span class="preset-btn__info">
            <span class="preset-btn__name">Random</span>
            <span class="preset-btn__meta">Length: 7</span>
          </span>
        </button>
      </div>
    `,

    // --- Empty state ---
    emptyTitle:    "Rod Cutting Visualizer",
    emptySubtitle: "Enter rod length and piece prices (length:price) on the left, then run analysis to watch Dynamic Programming compute the optimal cuts step-by-step.",
    emptyPresets: [
      { label: "Classic — Length: 8",            preset: '{"length":8,"prices":"1:1, 2:5, 3:8, 4:9, 5:10, 6:17, 7:17, 8:20"}' },
      { label: "Increasing Prices — Length: 6",  preset: '{"length":6,"prices":"1:2, 2:5, 3:9, 4:14, 5:20, 6:27"}' },
      { label: "Non-linear Prices — Length: 8",  preset: '{"length":8,"prices":"1:3, 2:5, 3:10, 4:12, 5:14, 6:19, 7:20, 8:25"}' },
      { label: "Large Example — Length: 10",     preset: '{"length":10,"prices":"1:1, 2:5, 3:8, 4:9, 5:10, 6:17, 7:17, 8:20, 9:24, 10:30"}' },
      { label: "Random — Length: 7",             preset: '{"length":7,"prices":"1:2, 2:4, 3:7, 4:8, 5:11, 6:13, 7:16"}' },
    ],

    // --- Run: reads inputs, calls API, returns {status, data} ---
    async run() {
      const lenStr   = document.getElementById("rod-length-input").value;
      const priceStr = document.getElementById("rod-prices-input").value;

      const validation = validateRodCuttingInput(lenStr, priceStr);
      if (!validation.valid) return { validationError: validation.errors };

      const { length, prices } = validation;
      const apiResult = await solveRodCutting(length, prices);
      return { ...apiResult, inputs: [] };
    },

    // --- Render: delegate to render_rod_cutting.js ---
    render: renderRodCutting,

    // --- Reset: restore default input values ---
    reset() {
      const l = document.getElementById("rod-length-input");
      const p = document.getElementById("rod-prices-input");
      if (l) l.value = "8";
      if (p) p.value = "1:1, 2:5, 3:8, 4:9, 5:10, 6:17, 7:17, 8:20";
    },

    // --- Load preset into inputs ---
    loadPreset(preset) {
      const l = document.getElementById("rod-length-input");
      const p = document.getElementById("rod-prices-input");
      if (l) l.value = preset.length;
      if (p) p.value = preset.prices;
    },
  },
};


// ---------------------------------------------------------------------------
// Client-side validators (mirrors server-side, for fast feedback)
// ---------------------------------------------------------------------------

function validateCoinChangeInput(amountStr, coinsStr) {
  const errors = [];
  const amount = Number(String(amountStr).trim());

  if (!String(amountStr).trim()) {
    errors.push("Target amount is required.");
  } else if (!Number.isInteger(amount) || amount <= 0) {
    errors.push("Target amount must be a positive integer.");
  } else if (amount > 10_000) {
    errors.push("Target amount must not exceed 10,000.");
  }

  const trimmedCoins = String(coinsStr).trim();
  if (!trimmedCoins) {
    errors.push("Coin denominations are required.");
  } else {
    const parts = trimmedCoins.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      errors.push("Please enter at least one coin denomination.");
    } else if (parts.length > 20) {
      errors.push("Please enter no more than 20 coin denominations.");
    } else {
      const parsed = parts.map(Number);
      if (parsed.some((n) => !Number.isInteger(n) || n <= 0)) {
        errors.push("All coin denominations must be positive integers separated by commas.");
      } else if (new Set(parsed).size !== parsed.length) {
        errors.push("Coin denominations must be unique.");
      } else if (errors.length === 0) {
        return { valid: true, errors: [], amount, coins: parsed };
      }
    }
  }

  return { valid: false, errors, amount: null, coins: null };
}

function validateKnapsackInput(capacityStr, itemsStr) {
  const errors = [];
  const capacity = Number(String(capacityStr).trim());

  if (!String(capacityStr).trim()) {
    errors.push("Capacity is required.");
  } else if (!Number.isInteger(capacity) || capacity <= 0) {
    errors.push("Capacity must be a positive integer.");
  } else if (capacity > 10_000) {
    errors.push("Capacity must not exceed 10,000.");
  }

  const trimmedItems = String(itemsStr).trim();
  if (!trimmedItems) {
    errors.push("Items are required.");
  } else {
    const parts = trimmedItems.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      errors.push("Please enter at least one item.");
    } else if (parts.length > 50) {
      errors.push("Please enter no more than 50 items.");
    } else {
      const items = [];
      let parseError = false;
      for (const part of parts) {
        const kv = part.split(":").map((s) => s.trim());
        if (kv.length !== 2) { parseError = true; break; }
        const w = Number(kv[0]);
        const v = Number(kv[1]);
        if (!Number.isInteger(w) || w <= 0 || !Number.isInteger(v) || v <= 0) {
          parseError = true; break;
        }
        items.push({ weight: w, value: v });
      }
      if (parseError) {
        errors.push("Each item must be in weight:value format with positive integers, e.g. 10:60");
      } else if (errors.length === 0) {
        return { valid: true, errors: [], capacity, items };
      }
    }
  }

  return { valid: false, errors, capacity: null, items: null };
}


function validateFractionalKnapsackInput(capacityStr, itemsStr) {
  const errors   = [];
  const capacity = Number(String(capacityStr).trim());

  if (!String(capacityStr).trim()) {
    errors.push("Capacity is required.");
  } else if (isNaN(capacity) || capacity <= 0) {
    errors.push("Capacity must be a positive number.");
  } else if (capacity > 10_000) {
    errors.push("Capacity must not exceed 10,000.");
  }

  const trimmedItems = String(itemsStr).trim();
  if (!trimmedItems) {
    errors.push("Items are required.");
  } else {
    const parts = trimmedItems.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      errors.push("Please enter at least one item.");
    } else if (parts.length > 50) {
      errors.push("Please enter no more than 50 items.");
    } else {
      const items = [];
      let parseError = false;
      for (const part of parts) {
        const kv = part.split(":").map((s) => s.trim());
        if (kv.length !== 3) { parseError = true; break; }
        const name = kv[0];
        const w    = Number(kv[1]);
        const v    = Number(kv[2]);
        if (!name) { parseError = true; break; }
        if (isNaN(w) || w <= 0 || isNaN(v) || v <= 0) { parseError = true; break; }
        items.push({ name, weight: w, value: v });
      }
      if (parseError) {
        errors.push("Each item must be in name:weight:value format with positive numbers, e.g. Gold:10:60");
      } else if (errors.length === 0) {
        return { valid: true, errors: [], capacity, items };
      }
    }
  }

  return { valid: false, errors, capacity: null, items: null };
}


function validateActivitySelectionInput(activitiesStr) {
  const errors = [];
  const trimmed = String(activitiesStr).trim();

  if (!trimmed) {
    errors.push("Activities are required.");
    return { valid: false, errors, activities: null };
  }

  const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) {
    errors.push("Please enter at least one activity.");
  } else if (parts.length > 50) {
    errors.push("Please enter no more than 50 activities.");
  } else {
    const activities = [];
    let parseError = false;
    for (let idx = 0; idx < parts.length; idx++) {
      const part = parts[idx];
      const kv = part.split(":").map((s) => s.trim());
      if (kv.length !== 2) { parseError = true; break; }
      const start  = Number(kv[0]);
      const finish = Number(kv[1]);
      if (isNaN(start) || start < 0 || isNaN(finish) || finish <= start) {
        parseError = true; break;
      }
      activities.push({ id: `A${idx + 1}`, start, finish });
    }
    if (parseError) {
      errors.push("Each activity must be in start:finish format with non-negative numbers where start < finish, e.g. 1:4");
    } else if (errors.length === 0) {
      return { valid: true, errors: [], activities };
    }
  }

  return { valid: false, errors, activities: null };
}


function validateRodCuttingInput(lengthStr, pricesStr) {
  const errors = [];
  const length = Number(String(lengthStr).trim());

  if (!String(lengthStr).trim()) {
    errors.push("Rod length is required.");
  } else if (!Number.isInteger(length) || length <= 0) {
    errors.push("Rod length must be a positive integer.");
  } else if (length > 100) {
    errors.push("Rod length must not exceed 100.");
  }

  const trimmedPrices = String(pricesStr).trim();
  if (!trimmedPrices) {
    errors.push("Price list is required.");
  } else {
    const parts = trimmedPrices.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      errors.push("Please enter at least one piece price.");
    } else {
      const prices = [];
      let parseError = false;
      for (const part of parts) {
        const kv = part.split(":").map((s) => s.trim());
        if (kv.length !== 2) { parseError = true; break; }
        const len   = Number(kv[0]);
        const price = Number(kv[1]);
        if (!Number.isInteger(len) || len <= 0 || isNaN(price) || price < 0) {
          parseError = true; break;
        }
        prices.push({ length: len, price });
      }
      if (parseError) {
        errors.push("Each price must be in length:price format, e.g. 1:1, 2:5");
      } else if (errors.length === 0) {
        return { valid: true, errors: [], length, prices };
      }
    }
  }

  return { valid: false, errors, length: null, prices: null };
}





// ---------------------------------------------------------------------------
// Module state & navigation
// ---------------------------------------------------------------------------

let currentModuleId = "coin_change";

/**
 * Return the currently active module config object.
 * @returns {object}
 */
function getActiveModule() {
  return MODULES[currentModuleId];
}

/**
 * Switch to a new module:
 *   1. Fade out the main content area.
 *   2. Inject the sidebar HTML for the new module.
 *   3. Update empty-state text and presets.
 *   4. Update module nav button styles.
 *   5. Reset results view back to empty state.
 *   6. Fade main content back in.
 *   7. Re-register event listeners (delegated from main.js via a callback).
 *
 * @param {string}   moduleId   - Key in MODULES.
 * @param {Function} onSwitch   - Callback fired after the DOM is updated,
 *                                so main.js can re-wire its event listeners.
 */
async function switchModule(moduleId, onSwitch) {
  if (moduleId === currentModuleId) return;
  if (!MODULES[moduleId]) return;

  const appBody = document.querySelector(".app-body");

  // 1. Fade out
  appBody.style.transition = "opacity 0.2s ease";
  appBody.style.opacity = "0";
  await new Promise((r) => setTimeout(r, 210));

  // 2. Switch state
  currentModuleId = moduleId;
  const mod = MODULES[moduleId];

  // 3. Inject sidebar
  const sidebarInner = document.getElementById("sidebar-inner");
  sidebarInner.innerHTML = mod.sidebarHTML;

  // 4. Update empty state
  document.getElementById("empty-state-title").textContent    = mod.emptyTitle;
  document.getElementById("empty-state-subtitle").textContent = mod.emptySubtitle;

  const presetsContainer = document.getElementById("empty-state-presets");
  presetsContainer.innerHTML = mod.emptyPresets
    .map(
      (p) => `<button class="empty-cta-btn" data-preset='${p.preset}'>${p.label}</button>`
    )
    .join("");

  // 5. Update module nav buttons
  document.querySelectorAll(".module-btn[data-module]").forEach((btn) => {
    const isActive = btn.dataset.module === moduleId;
    btn.classList.toggle("module-btn--active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    // Manage the checkmark ✓ prefix
    const check = btn.querySelector(".module-btn__check");
    if (!check && isActive) {
      btn.insertAdjacentHTML("afterbegin", '<span class="module-btn__check">\u2713</span> ');
    } else if (check && !isActive) {
      check.remove();
    }
  });

  // 6. Reset result view to empty state
  const emptyState   = document.getElementById("empty-state");
  const resultsView  = document.getElementById("results-view");
  emptyState.hidden  = false;
  resultsView.hidden = true;

  // 7. Notify main.js to re-wire event listeners
  if (typeof onSwitch === "function") onSwitch();

  // 8. Fade back in
  appBody.style.opacity = "1";
}

/**
 * Mount the initial module (coin_change) on first page load.
 * @param {Function} onSwitch - Same callback used by switchModule.
 */
function mountInitialModule(onSwitch) {
  const mod            = MODULES[currentModuleId];
  const sidebarInner   = document.getElementById("sidebar-inner");
  sidebarInner.innerHTML = mod.sidebarHTML;

  document.getElementById("empty-state-title").textContent    = mod.emptyTitle;
  document.getElementById("empty-state-subtitle").textContent = mod.emptySubtitle;

  const presetsContainer = document.getElementById("empty-state-presets");
  presetsContainer.innerHTML = mod.emptyPresets
    .map(
      (p) => `<button class="empty-cta-btn" data-preset='${p.preset}'>${p.label}</button>`
    )
    .join("");

  if (typeof onSwitch === "function") onSwitch();
}

export { MODULES, getActiveModule, switchModule, mountInitialModule };
