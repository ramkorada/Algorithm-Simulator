/**
 * render_knapsack.js — 0/1 Knapsack DOM Rendering Module
 *
 * Mirrors the architecture of render.js for Coin Change.
 *
 * Animates:
 *   1. DP Table construction overview (scrollable)
 *   2. Reconstruction steps one-by-one
 *   3. Selected items reveal
 *   4. Summary (max value, execution time)
 *   5. Insights and complexity
 *
 * No API calls. No validation. No UI state changes.
 */


// ---------------------------------------------------------------------------
// Shared animation utilities (same pattern as render.js)
// ---------------------------------------------------------------------------

const STEP_DELAY_MS = 500;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function revealSection(el) {
  return new Promise((resolve) => {
    el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    el.style.opacity    = "1";
    el.style.transform  = "translateY(0)";
    setTimeout(resolve, 420);
  });
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format milliseconds with appropriate precision. */
function fmtMs(ms) {
  return ms < 1 ? `${ms} ms` : `${ms} ms`;
}


// ---------------------------------------------------------------------------
// Render: Analysis header (problem summary)
// ---------------------------------------------------------------------------

function renderKnapsackHeader(data) {
  const { capacity, items_provided, max_value } = data;

  const meta = document.getElementById("result-meta");
  if (meta) {
    meta.textContent = `Capacity: ${capacity}  ·  Items: ${items_provided.length}  ·  Max Value: ${max_value}`;
  }

  const summary = document.getElementById("result-summary");
  summary.innerHTML = "";

  // Max Value badge
  const valItem = document.createElement("div");
  valItem.className = "summary-item summary-item--dp stagger-in";
  valItem.innerHTML = `
    <span class="summary-item__value">${max_value}</span>
    <span class="summary-item__label">Max Value</span>
  `;

  // Items Selected badge
  const selItem = document.createElement("div");
  selItem.className = "summary-item summary-item--greedy stagger-in";
  selItem.innerHTML = `
    <span class="summary-item__value">${data.selected_items.length}</span>
    <span class="summary-item__label">Items Selected</span>
  `;

  // Time badge
  const timeItem = document.createElement("div");
  timeItem.className = "summary-item stagger-in";
  timeItem.innerHTML = `
    <span class="summary-item__value" style="font-size:0.85rem;">${data.execution_time_ms} ms</span>
    <span class="summary-item__label">DP Time</span>
  `;

  summary.append(valItem, selItem, timeItem);
}


// ---------------------------------------------------------------------------
// Render: DP table (compact visual)
// ---------------------------------------------------------------------------

function renderDPTable(dpTable, items) {
  const container = document.getElementById("greedy-execution");
  container.innerHTML = "";

  const n = items.length;
  const maxCols = Math.min(dpTable[0].length, 26); // cap columns for display
  const truncated = dpTable[0].length > maxCols;

  // Build a compact HTML table
  const wrapper = document.createElement("div");
  wrapper.style.overflowX = "auto";
  wrapper.style.maxHeight = "100%";

  const table = document.createElement("table");
  table.className = "dp-table";
  table.setAttribute("aria-label", "DP Table");

  // Header row: capacity indices 0 … W (capped)
  const thead = document.createElement("thead");
  let headerRow = "<tr><th class='dp-th dp-th--corner'>Item \\ Cap</th>";
  for (let c = 0; c < maxCols; c++) {
    headerRow += `<th class="dp-th">${c}</th>`;
  }
  if (truncated) headerRow += `<th class="dp-th">…</th>`;
  headerRow += "</tr>";
  thead.innerHTML = headerRow;
  table.appendChild(thead);

  // Body rows: one per item
  const tbody = document.createElement("tbody");
  for (let i = 0; i <= n; i++) {
    const rowLabel = i === 0 ? "∅ (none)" : items[i - 1].id || `Item ${i}`;
    let row = `<tr><td class="dp-td dp-td--label">${rowLabel}</td>`;
    for (let c = 0; c < maxCols; c++) {
      const isOptimal = (i === n && c === dpTable[0].length - 1);
      row += `<td class="dp-td${isOptimal ? " dp-td--optimal" : ""}">${dpTable[i][c]}</td>`;
    }
    if (truncated) row += `<td class="dp-td dp-td--muted">…</td>`;
    row += "</tr>";
    tbody.innerHTML += row;
  }
  table.appendChild(tbody);

  wrapper.appendChild(table);

  if (truncated) {
    const note = document.createElement("div");
    note.className = "step-truncated";
    note.textContent = `Table truncated — showing first ${maxCols} of ${dpTable[0].length} capacity columns.`;
    wrapper.appendChild(note);
  }

  container.appendChild(wrapper);
}


// ---------------------------------------------------------------------------
// Render: DP Reconstruction trace (animated, one step at a time)
// ---------------------------------------------------------------------------

async function renderReconstructionTrace(data) {
  const container = document.getElementById("dp-execution");
  container.innerHTML = "";

  const badge = document.getElementById("dp-result-badge");
  badge.textContent = "Solving…";
  badge.className   = "result-badge";

  const { reconstruction_steps, items_provided: items } = data;
  const shown  = reconstruction_steps.slice(0, 20);
  const hidden = reconstruction_steps.length - shown.length;

  let stepNum = 0;

  for (let i = 0; i < shown.length; i++) {
    const step = shown[i];
    const isComplete = step.toLowerCase().includes("reconstruction complete");
    const isSelected = step.toLowerCase().startsWith("selected");

    stepNum++;
    const card = document.createElement("div");
    card.className = `step-card${isComplete ? " step-card--complete" : isSelected ? " step-card--select" : ""}`;
    card.style.animationDelay = "0ms";

    if (isComplete) {
      card.innerHTML = `
        <div class="step-num" style="color:var(--success);">✓</div>
        <div class="step-body">
          <div class="step-row">
            <span style="font-size:0.8rem; color:var(--success); font-weight:600;">Reconstruction complete.</span>
          </div>
        </div>
      `;
    } else {
      // Parse "Selected Item X (weight: W, value: V). Remaining capacity: R."
      // or "Excluded Item X (weight: W, value: V). Not optimal or doesn't fit."
      const action = isSelected ? "Selected" : "Excluded";
      const color  = isSelected ? "var(--dp)" : "var(--text-subtle)";
      const icon   = isSelected ? "+" : "–";

      card.innerHTML = `
        <div class="step-num" style="color:${color};">${isComplete ? "✓" : stepNum}</div>
        <div class="step-body">
          <div class="step-row">
            <span class="step-action" style="color:${color}; font-weight:600;">${action}</span>
          </div>
          <div class="step-row">
            <span style="font-size:0.75rem; color:var(--text-muted);">${step.replace(action + " ", "")}</span>
          </div>
        </div>
      `;
    }

    // Connector
    if (i > 0) {
      const conn = document.createElement("div");
      conn.className = "step-connector";
      conn.innerHTML = `<span class="step-connector__line"></span>`;
      container.appendChild(conn);
    }

    container.appendChild(card);
    container.scrollTop = container.scrollHeight;
    await delay(STEP_DELAY_MS);
  }

  if (hidden > 0) {
    const notice = document.createElement("div");
    notice.className = "step-truncated";
    notice.textContent = `… and ${hidden} more step${hidden !== 1 ? "s" : ""} not shown`;
    container.appendChild(notice);
  }

  badge.textContent = "Optimal";
  badge.className   = "result-badge result-badge--optimal";
}


// ---------------------------------------------------------------------------
// Render: Selected items grid
// ---------------------------------------------------------------------------

function renderSelectedItems(data) {
  const container = document.getElementById("comparison-cards");
  container.innerHTML = "";

  const { selected_items, capacity, max_value, items_provided } = data;
  const totalWeight = selected_items.reduce((s, it) => s + it.weight, 0);

  // Selected items cards
  selected_items.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "cmp-card stagger-in";
    card.innerHTML = `
      <div class="cmp-card__title">${item.id || `Item ${idx + 1}`}</div>
      <div class="cmp-values">
        <div class="cmp-value-cell cmp-value-cell--winner">
          <span class="cmp-value-cell__algo cmp-value-cell__algo--dp">Weight</span>
          <span class="cmp-value-cell__val">${item.weight}</span>
        </div>
        <div class="cmp-value-cell cmp-value-cell--winner">
          <span class="cmp-value-cell__algo cmp-value-cell__algo--greedy">Value</span>
          <span class="cmp-value-cell__val">${item.value}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Summary card
  const summaryCard = document.createElement("div");
  summaryCard.className = "cmp-card cmp-card--verdict cmp-card--verdict-optimal stagger-in";
  summaryCard.innerHTML = `
    <div class="cmp-card__title">Knapsack Summary</div>
    <div class="cmp-verdict-icon" aria-hidden="true" style="color:var(--dp);">&#9670;</div>
    <div class="cmp-verdict-title" style="color:var(--dp);">Max Value: ${max_value}</div>
    <div class="cmp-verdict-text">
      ${selected_items.length} of ${items_provided.length} items selected.<br>
      Total weight: ${totalWeight} / ${capacity}.
    </div>
  `;
  container.appendChild(summaryCard);
}


// ---------------------------------------------------------------------------
// Render: Insights
// ---------------------------------------------------------------------------

function renderKnapsackInsights(data) {
  const container = document.getElementById("insights-grid");
  container.innerHTML = "";

  const { selected_items, items_provided, capacity, max_value, execution_time_ms } = data;
  const totalWeight    = selected_items.reduce((s, it) => s + it.weight, 0);
  const utilizationPct = Math.round((totalWeight / capacity) * 100);

  // Main insight: how DP solved it
  const mainCard = document.createElement("div");
  mainCard.className = "insight-card insight-card--success stagger-in";
  mainCard.innerHTML = `
    <div class="insight-header">
      <span class="insight-icon" aria-hidden="true">✓</span>
      <span class="insight-title">Optimal Solution Found</span>
    </div>
    <div class="insight-blocks">
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">▸</span>
        <span>DP built a (${items_provided.length + 1}) × (${capacity + 1}) table, computing the best value for every sub-capacity from 0 to ${capacity}.</span>
      </div>
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">▸</span>
        <span>Selected ${selected_items.length} item${selected_items.length !== 1 ? "s" : ""} with total weight ${totalWeight} — using ${utilizationPct}% of capacity.</span>
      </div>
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">▸</span>
        <span>The optimal value of <strong>${max_value}</strong> is guaranteed — no greedy heuristic can improve on it.</span>
      </div>
    </div>
  `;

  // Performance insight with bars
  const n = items_provided.length;
  const w = capacity;

  const perfCard = document.createElement("div");
  perfCard.className = "insight-card insight-card--neutral stagger-in";
  perfCard.innerHTML = `
    <div class="insight-header">
      <span class="insight-icon" aria-hidden="true">⚡</span>
      <span class="insight-title">Performance Summary</span>
    </div>
    <div class="insight-stats">
      <div class="insight-stat">
        <span class="insight-stat__label">DP Table size</span>
        <span class="insight-stat__value insight-stat__value--dp">${(n + 1) * (w + 1)} cells</span>
      </div>
      <div class="insight-stat">
        <span class="insight-stat__label">Capacity utilization</span>
        <span class="insight-stat__value insight-stat__value--dp">${utilizationPct}%</span>
      </div>
    </div>
    <div class="perf-bars">
      <div class="perf-bar-row">
        <div class="perf-bar-header">
          <span class="perf-bar-algo perf-bar-algo--dp">DP Execution</span>
          <span class="perf-bar-time">${execution_time_ms} ms</span>
        </div>
        <div class="perf-bar-track">
          <div class="perf-bar-fill perf-bar-fill--dp" style="width:0%;" data-target-width="100%"></div>
        </div>
      </div>
    </div>
  `;

  container.append(mainCard, perfCard);

  // Animate bar
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      perfCard.querySelectorAll(".perf-bar-fill").forEach((bar) => {
        bar.style.width = bar.dataset.targetWidth;
      });
    });
  });
}


// ---------------------------------------------------------------------------
// Render: Complexity section
// ---------------------------------------------------------------------------

function renderKnapsackComplexity(complexity) {
  const container = document.getElementById("complexity-content");
  container.innerHTML = "";

  const dpCol = document.createElement("div");
  dpCol.className = "complexity-col complexity-col--dp";
  dpCol.innerHTML = `
    <div class="complexity-col__header">
      <span class="algo-badge algo-badge--dp">Dynamic Programming</span>
    </div>
    <div class="complexity-row">
      <span class="complexity-row__label">Time</span>
      <span class="complexity-row__value">${complexity.time}</span>
    </div>
    <div class="complexity-row__note">${complexity.time_note}</div>
    <div class="complexity-row">
      <span class="complexity-row__label">Space</span>
      <span class="complexity-row__value">${complexity.space}</span>
    </div>
    <div class="complexity-row__note">${complexity.space_note}</div>
  `;

  container.appendChild(dpCol);
}


// ---------------------------------------------------------------------------
// Top-level entry point (mirrors renderAll in render.js)
// ---------------------------------------------------------------------------

/**
 * Orchestrate the full animated reveal for 0/1 Knapsack results.
 * Called by the module registry (module.js) via mod.render(data).
 *
 * @param {object} data - Full API response from /api/v1/zero-one-knapsack.
 */
async function renderAll(data) {
  const { items_provided, dp_table, reconstruction_steps, complexity } = data;

  // Find sections that should appear after animations
  const itemsSection = document.getElementById("comparison-cards").closest(".section-block");
  const insSection   = document.getElementById("insights-grid").closest(".section-block");
  const cmpxSection  = document.getElementById("complexity-details");

  // Swap the execution panel labels for Knapsack context
  const greedyPanel    = document.querySelector(".exec-panel--greedy");
  const greedyTitleGrp = greedyPanel?.querySelector(".exec-panel__title-group");
  if (greedyTitleGrp) {
    greedyTitleGrp.innerHTML = `
      <span class="algo-badge algo-badge--dp">DP Table</span>
      <span class="exec-panel__title">Value Matrix</span>
    `;
  }
  const dpPanel    = document.querySelector(".exec-panel--dp");
  const dpTitleGrp = dpPanel?.querySelector(".exec-panel__title-group");
  if (dpTitleGrp) {
    dpTitleGrp.innerHTML = `
      <span class="algo-badge algo-badge--dp">Reconstruction</span>
      <span class="exec-panel__title">Item Trace</span>
    `;
  }

  // Swap comparison section label
  const compLabel = document.querySelector(".section-block .section-block__label");
  if (compLabel) compLabel.textContent = "Selected Items";

  // Hide post-execution sections
  [itemsSection, insSection, cmpxSection].forEach((el) => {
    if (!el) return;
    el.style.opacity   = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "none";
  });

  // Greedy result badge — show "N/A" since Knapsack has no greedy
  const greedyBadge = document.getElementById("greedy-result-badge");
  if (greedyBadge) {
    greedyBadge.textContent = "Built";
    greedyBadge.className   = "result-badge result-badge--optimal";
  }

  // 1. Render analysis header immediately
  renderKnapsackHeader(data);

  // 2. Show DP table immediately (it's a reference, not step-by-step)
  renderDPTable(dp_table, items_provided);

  await delay(400);

  // 3. Animate reconstruction trace
  await renderReconstructionTrace(data);

  await delay(350);

  // 4. Reveal selected items
  renderSelectedItems(data);
  if (itemsSection) await revealSection(itemsSection);

  await delay(200);

  // 5. Reveal insights
  renderKnapsackInsights(data);
  if (insSection) await revealSection(insSection);

  await delay(200);

  // 6. Reveal complexity
  renderKnapsackComplexity(complexity);
  document.getElementById("complexity-details").removeAttribute("open");
  if (cmpxSection) await revealSection(cmpxSection);
}

export { renderAll };
