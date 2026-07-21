/**
 * render_fractional_knapsack.js -- Fractional Knapsack DOM Rendering Module (Polished)
 *
 * Full interactive execution visualization:
 *   Left panel  ("Ratio Ranking")  -- animated sequence: compute ratio ->
 *                                      display each item -> sort descending ->
 *                                      highlight final order.
 *   Right panel ("Greedy Selection") -- step-by-step animated greedy decisions
 *                                       with capacity tracker per step.
 *   Selected Items section          -- rich per-item cards with fraction bar,
 *                                      stats grid and visual hierarchy.
 *   Summary card                    -- expanded with 7 stat rows + status.
 *   Insights section                -- bullet points with accent keywords.
 *   Performance section             -- 6-cell metrics grid + animated bar.
 *   Complexity section              -- auto-opened after render.
 *
 * No API calls. No validation. No UI state changes.
 */


// ---------------------------------------------------------------------------
// Shared helpers (same pattern as render.js / render_knapsack.js)
// ---------------------------------------------------------------------------

const STEP_DELAY_MS  = 440;
const SORT_DELAY_MS  = 260;

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function revealSection(el) {
  return new Promise((res) => {
    el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    el.style.opacity    = "1";
    el.style.transform  = "translateY(0)";
    setTimeout(res, 420);
  });
}

function fmtRatio(r) { return Number(r).toFixed(2); }
function fmtPct(f)   { return Math.round(f * 100) + "%"; }

/**
 * Animate a fraction fill bar from 0 to its target width.
 * Defers to next two rAF frames so the CSS transition fires.
 */
function animateFracBar(bar, targetPct) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { bar.style.width = targetPct + "%"; });
  });
}

/**
 * Count-up animation for a numeric text node.
 */
function countUp(el, target, suffix, duration) {
  const start     = performance.now();
  const isFloat   = !Number.isInteger(target);
  const precision = isFloat ? 2 : 0;

  function tick(now) {
    const elapsed = Math.min(now - start, duration);
    const pct     = elapsed / duration;
    const eased   = 1 - Math.pow(1 - pct, 3);         // cubic ease-out
    const current = target * eased;
    el.textContent = current.toFixed(precision) + (suffix || "");
    if (elapsed < duration) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}


// ---------------------------------------------------------------------------
// Render: Analysis header
// ---------------------------------------------------------------------------

function renderFracHeader(data) {
  const { capacity, items_provided, maximum_value, utilization_percentage } = data;

  const meta = document.getElementById("result-meta");
  if (meta) {
    meta.textContent =
      `Capacity: ${capacity}  |  Items: ${items_provided.length}  |  Max Value: ${maximum_value}  |  Utilization: ${utilization_percentage}%`;
  }

  const summary = document.getElementById("result-summary");
  summary.innerHTML = "";

  const valItem = document.createElement("div");
  valItem.className = "summary-item summary-item--dp stagger-in";
  const valEl = document.createElement("span");
  valEl.className = "summary-item__value";
  valEl.textContent = "0";
  valItem.appendChild(valEl);
  const valLbl = document.createElement("span");
  valLbl.className = "summary-item__label";
  valLbl.textContent = "Max Value";
  valItem.appendChild(valLbl);

  const utilItem = document.createElement("div");
  utilItem.className = "summary-item summary-item--greedy stagger-in";
  const utilEl = document.createElement("span");
  utilEl.className = "summary-item__value";
  utilEl.textContent = "0%";
  utilItem.appendChild(utilEl);
  const utilLbl = document.createElement("span");
  utilLbl.className = "summary-item__label";
  utilLbl.textContent = "Capacity Used";
  utilItem.appendChild(utilLbl);

  const timeItem = document.createElement("div");
  timeItem.className = "summary-item stagger-in";
  timeItem.innerHTML = `
    <span class="summary-item__value" style="font-size:0.85rem;">${data.execution_time_ms} ms</span>
    <span class="summary-item__label">Greedy Time</span>
  `;

  const verdictItem = document.createElement("div");
  verdictItem.className = "summary-verdict summary-verdict--optimal stagger-in";
  verdictItem.textContent = "Greedy Optimal";

  summary.append(valItem, utilItem, timeItem, verdictItem);

  // Trigger count-up after a brief delay
  setTimeout(() => {
    countUp(valEl, maximum_value, "", 900);
    countUp(utilEl, utilization_percentage, "%", 900);
  }, 200);
}


// ---------------------------------------------------------------------------
// Left panel: Ratio Ranking
// Phase 1 -- show items unsorted with ratios (calculated)
// Phase 2 -- re-sort with visual transition
// ---------------------------------------------------------------------------

async function renderRatioRanking(data) {
  const container = document.getElementById("greedy-execution");
  container.innerHTML = "";

  const badge = document.getElementById("greedy-result-badge");
  badge.textContent = "Computing...";
  badge.className   = "result-badge";

  const { ratio_sorted_items, items_provided } = data;

  // --- Phase 1: Show items in original input order with ratio ---
  const computeHeader = document.createElement("div");
  computeHeader.className = "step-card step-card--done";
  computeHeader.style.animationDelay = "0ms";
  computeHeader.innerHTML = `
    <div class="step-num" style="color:var(--text-muted); background:var(--bg-card-alt); border:1px solid var(--border);">&#8594;</div>
    <div class="step-body">
      <div class="step-row">
        <span class="step-action" style="color:var(--text-muted); font-weight:600; font-size:0.78rem;">Step 1 &mdash; Calculate Value / Weight Ratio</span>
      </div>
    </div>
  `;
  container.appendChild(computeHeader);
  await delay(280);

  // Build original-order cards (unsorted)
  const originalOrder = items_provided.map((item) => {
    const w = parseFloat(item.weight);
    const v = parseFloat(item.value);
    return { name: item.name, weight: w, value: v, ratio: Math.round((v / w) * 10000) / 10000 };
  });

  for (let i = 0; i < originalOrder.length; i++) {
    const item = originalOrder[i];

    const conn = document.createElement("div");
    conn.className = "step-connector";
    conn.innerHTML = `<span class="step-connector__line"></span>`;
    container.appendChild(conn);

    const card = document.createElement("div");
    card.className = "step-card step-card--dp";
    card.style.animationDelay = "0ms";
    card.innerHTML = `
      <div class="step-num" style="color:var(--text-muted); background:var(--bg-card-alt); border:1px solid var(--border); font-size:0.65rem;">${i + 1}</div>
      <div class="step-body">
        <div class="step-row">
          <span class="step-label">Item</span>
          <span class="step-value" style="font-weight:600; color:var(--text);">${item.name}</span>
        </div>
        <div class="step-row">
          <span class="step-label">V &divide; W</span>
          <span style="font-size:0.7rem; color:var(--text-muted);">${item.value} &divide; ${item.weight}</span>
        </div>
        <div class="step-row">
          <span class="step-label">Ratio</span>
          <span class="step-coin step-coin--dp" style="width:auto; padding:0 8px; border-radius:4px;">${fmtRatio(item.ratio)}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
    container.scrollTop = container.scrollHeight;
    await delay(SORT_DELAY_MS);
  }

  await delay(350);

  // --- Phase 2: Sorted order ---
  const sortHeader = document.createElement("div");
  sortHeader.className = "step-connector";
  sortHeader.innerHTML = `<span class="step-connector__line"></span>`;
  container.appendChild(sortHeader);

  const sortLabel = document.createElement("div");
  sortLabel.className = "step-card step-card--done";
  sortLabel.style.animationDelay = "0ms";
  sortLabel.innerHTML = `
    <div class="step-num" style="color:var(--dp); background:var(--dp-dim); border:1px solid var(--dp-border);">&#8595;</div>
    <div class="step-body">
      <div class="step-row">
        <span class="step-action" style="color:var(--dp); font-weight:600; font-size:0.78rem;">Step 2 &mdash; Sort by Ratio Descending</span>
      </div>
      <div class="step-row">
        <span style="font-size:0.7rem; color:var(--text-muted);">Highest density item goes first</span>
      </div>
    </div>
  `;
  container.appendChild(sortLabel);
  await delay(350);

  for (let i = 0; i < ratio_sorted_items.length; i++) {
    const item = ratio_sorted_items[i];
    const rank = i + 1;

    const conn = document.createElement("div");
    conn.className = "step-connector";
    conn.innerHTML = `<span class="step-connector__line"></span>`;
    container.appendChild(conn);

    const card = document.createElement("div");
    card.className = "step-card step-card--dp";
    card.style.animationDelay = "0ms";

    // Rank 1 gets a highlight
    const isTop = rank === 1;

    card.innerHTML = `
      <div class="step-num" style="
        background:${isTop ? "var(--dp-dim)" : "var(--bg-card-alt)"};
        color:${isTop ? "var(--dp)" : "var(--text-muted)"};
        border:1px solid ${isTop ? "var(--dp-border)" : "var(--border)"};
      ">#${rank}</div>
      <div class="step-body">
        <div class="step-row">
          <span class="step-label">Item</span>
          <span class="step-value" style="font-weight:700; color:${isTop ? "var(--dp)" : "var(--text)"};">${item.name}</span>
        </div>
        <div class="step-row">
          <span class="step-label">Ratio</span>
          <span class="step-coin step-coin--dp" style="width:auto; padding:0 8px; border-radius:4px; ${isTop ? "box-shadow:0 0 12px var(--dp-glow);" : ""}">${fmtRatio(item.ratio)}</span>
        </div>
        <div class="step-row">
          <span class="step-label">W / V</span>
          <span style="font-size:0.7rem; color:var(--text-muted);">${item.weight} / ${item.value}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
    container.scrollTop = container.scrollHeight;
    await delay(SORT_DELAY_MS);
  }

  badge.textContent = "Sorted";
  badge.className   = "result-badge result-badge--optimal";
}


// ---------------------------------------------------------------------------
// Right panel: Greedy Selection trace (full / partial / skip)
// Each step shows: current capacity -> decision -> new capacity
// ---------------------------------------------------------------------------

async function renderSelectionTrace(data) {
  const container = document.getElementById("dp-execution");
  container.innerHTML = "";

  const badge = document.getElementById("dp-result-badge");
  badge.textContent = "Selecting...";
  badge.className   = "result-badge";

  const { selection_steps, capacity } = data;
  const shown  = selection_steps.slice(0, 20);
  const hidden = selection_steps.length - shown.length;

  // Opening: capacity indicator
  const capCard = document.createElement("div");
  capCard.className = "step-card step-card--done";
  capCard.style.animationDelay = "0ms";
  capCard.innerHTML = `
    <div class="step-num" style="background:var(--bg-card-alt); color:var(--text-muted); border:1px solid var(--border);">W</div>
    <div class="step-body">
      <div class="step-row">
        <span class="step-label">Capacity</span>
        <span class="step-value">${capacity}</span>
      </div>
      <div class="step-row">
        <span style="font-size:0.7rem; color:var(--text-muted);">Begin greedy selection</span>
      </div>
    </div>
  `;
  container.appendChild(capCard);

  let stepNum = 0;

  for (let i = 0; i < shown.length; i++) {
    const step    = shown[i];
    const isFull    = step.action === "full";
    const isPartial = step.action === "partial";
    const isSkip    = step.action === "skip";

    if (!isSkip) stepNum++;

    const conn = document.createElement("div");
    conn.className = "step-connector";
    conn.innerHTML = `<span class="step-connector__line"></span>`;
    container.appendChild(conn);

    const cardClass = isFull ? "step-card--dp" : isPartial ? "step-card--partial" : "step-card--skip";
    const numColor  = isFull ? "var(--dp)" : isPartial ? "var(--warning)" : "var(--text-subtle)";
    const numIcon   = isSkip ? "&mdash;" : stepNum;

    const card = document.createElement("div");
    card.className = `step-card ${cardClass}`;
    card.style.animationDelay = "0ms";

    // Fraction bar HTML
    const pctInt    = Math.round(step.fraction_taken * 100);
    const barClass  = isFull ? "frac-bar-fill--full" : "frac-bar-fill--partial";
    const barId     = `sel-bar-${i}`;

    card.innerHTML = `
      <div class="step-num" style="color:${numColor};">${numIcon}</div>
      <div class="step-body">
        <div class="step-row">
          <span class="step-label">Item</span>
          <span class="step-value" style="font-weight:700;">${step.item_name}</span>
        </div>
        <div class="step-row">
          <span class="step-label">Ratio</span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--dp);">${fmtRatio(step.ratio)}</span>
        </div>
        ${!isSkip ? `
        <div class="step-row">
          <span class="step-label">Cap</span>
          <span style="font-size:0.72rem; color:var(--text-muted); font-family:var(--font-mono);">${step.capacity_before} &rarr; ${step.capacity_after}</span>
        </div>
        <div class="frac-bar-wrap">
          <div class="frac-bar-label">
            <span class="frac-bar-name">${isPartial ? "Partial fraction" : "Full item"}</span>
            <span class="frac-bar-pct" style="color:${isFull ? "var(--dp)" : "var(--warning)"};">${pctInt}%</span>
          </div>
          <div class="frac-bar-track">
            <div class="frac-bar-fill ${barClass}" id="${barId}" style="width:0%;"></div>
          </div>
        </div>
        <div class="step-row">
          <span class="step-label">Added</span>
          <span class="step-value" style="color:${isFull ? "var(--dp)" : "var(--warning)"};">+${step.contributed_value}</span>
          <span style="font-size:0.68rem; color:var(--text-subtle);">&nbsp;(total: ${step.total_value_so_far})</span>
        </div>
        ` : `
        <div class="step-row">
          <span style="font-size:0.7rem; color:var(--text-subtle); font-style:italic;">Knapsack full &mdash; item skipped</span>
        </div>
        `}
      </div>
    `;

    container.appendChild(card);
    container.scrollTop = container.scrollHeight;

    // Animate the fraction bar after the card appears
    if (!isSkip) {
      const barEl = document.getElementById(barId);
      if (barEl) animateFracBar(barEl, pctInt);
    }

    await delay(STEP_DELAY_MS);
  }

  if (hidden > 0) {
    const notice = document.createElement("div");
    notice.className = "step-truncated";
    notice.textContent = `... and ${hidden} more step${hidden !== 1 ? "s" : ""} not shown`;
    container.appendChild(notice);
  }

  // Completion card
  const conn = document.createElement("div");
  conn.className = "step-connector";
  conn.innerHTML = `<span class="step-connector__line"></span>`;
  container.appendChild(conn);

  const doneCard = document.createElement("div");
  doneCard.className = "step-card step-card--done";
  doneCard.style.animationDelay = "0ms";
  doneCard.innerHTML = `
    <div class="step-num" style="color:var(--success);">&#10003;</div>
    <div class="step-body">
      <div class="step-row">
        <span style="font-size:0.78rem; color:var(--success); font-weight:600;">Selection complete</span>
      </div>
      <div class="step-row">
        <span style="font-size:0.7rem; color:var(--text-muted); font-family:var(--font-mono);">Total value: ${data.maximum_value}</span>
      </div>
    </div>
  `;
  container.appendChild(doneCard);
  container.scrollTop = container.scrollHeight;

  badge.textContent = "Optimal";
  badge.className   = "result-badge result-badge--optimal";
}


// ---------------------------------------------------------------------------
// Selected items section — rich per-item cards + summary
// ---------------------------------------------------------------------------

function renderSelectedItems(data) {
  const container = document.getElementById("comparison-cards");
  container.innerHTML = "";

  const {
    selected_items, capacity, maximum_value,
    weight_used, remaining_capacity,
    items_provided, items_fully_taken,
    items_partially_taken, items_skipped,
    utilization_percentage,
  } = data;

  // Per-item cards
  selected_items.forEach((item, idx) => {
    const isFull    = item.fraction_taken >= 0.9999;
    const pctInt    = Math.round(item.fraction_taken * 100);
    const barId     = `res-bar-${idx}`;
    const fillClass = isFull ? "frac-bar-fill--full" : "frac-bar-fill--partial";

    const card = document.createElement("div");
    card.className = `frac-item-card frac-item-card--${isFull ? "full" : "partial"} stagger-in`;
    card.innerHTML = `
      <div class="frac-item-card__header">
        <span class="frac-item-card__name">${item.item_name}</span>
        <span class="frac-item-card__badge frac-item-card__badge--${isFull ? "full" : "partial"}">${isFull ? "Full" : "Partial"}</span>
      </div>

      <div class="frac-bar-wrap">
        <div class="frac-bar-label">
          <span class="frac-bar-name">Fraction taken</span>
          <span class="frac-bar-pct" style="color:${isFull ? "var(--dp)" : "var(--warning)"};">${pctInt}%</span>
        </div>
        <div class="frac-bar-track">
          <div class="frac-bar-fill ${fillClass}" id="${barId}" style="width:0%;"></div>
        </div>
      </div>

      <div class="frac-item-stats">
        <div class="frac-item-stat">
          <span class="frac-item-stat__label">Weight</span>
          <span class="frac-item-stat__value">${item.weight}</span>
        </div>
        <div class="frac-item-stat">
          <span class="frac-item-stat__label">Full Value</span>
          <span class="frac-item-stat__value">${item.value}</span>
        </div>
        <div class="frac-item-stat">
          <span class="frac-item-stat__label">Ratio</span>
          <span class="frac-item-stat__value frac-item-stat__value--accent">${fmtRatio(item.ratio)}</span>
        </div>
        <div class="frac-item-stat">
          <span class="frac-item-stat__label">Taken %</span>
          <span class="frac-item-stat__value frac-item-stat__value--${isFull ? "accent" : "warn"}">${pctInt}%</span>
        </div>
        <div class="frac-item-stat" style="grid-column:span 2;">
          <span class="frac-item-stat__label">Value Contributed</span>
          <span class="frac-item-stat__value frac-item-stat__value--ok">+${item.contributed_value}</span>
        </div>
      </div>
    `;
    container.appendChild(card);

    // Animate bar after cards appear
    setTimeout(() => {
      const barEl = document.getElementById(barId);
      if (barEl) animateFracBar(barEl, pctInt);
    }, 120 * idx + 200);
  });

  // Expanded summary card
  const summaryCard = document.createElement("div");
  summaryCard.className = "cmp-card cmp-card--verdict cmp-card--verdict-optimal stagger-in";
  summaryCard.innerHTML = `
    <div class="cmp-card__title">Knapsack Summary</div>
    <div class="cmp-verdict-icon" aria-hidden="true" style="color:var(--success);">&#10003;</div>
    <div class="cmp-verdict-title" style="color:var(--success);">Greedy Optimal &mdash; ${maximum_value}</div>

    <div class="frac-summary-grid">
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Max Value</span>
        <span class="frac-summary-row__value frac-summary-row__value--ok">${maximum_value}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Capacity Used</span>
        <span class="frac-summary-row__value frac-summary-row__value--dp">${weight_used} / ${capacity}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Remaining</span>
        <span class="frac-summary-row__value">${remaining_capacity}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Utilization</span>
        <span class="frac-summary-row__value frac-summary-row__value--dp">${utilization_percentage}%</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Fully Selected</span>
        <span class="frac-summary-row__value frac-summary-row__value--ok">${items_fully_taken}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Partially Selected</span>
        <span class="frac-summary-row__value frac-summary-row__value--warn">${items_partially_taken}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Algorithm</span>
        <span class="frac-summary-row__value frac-summary-row__value--dp">Greedy</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Status</span>
        <span class="frac-summary-row__value frac-summary-row__value--ok">Optimal</span>
      </div>
    </div>
  `;
  container.appendChild(summaryCard);
}


// ---------------------------------------------------------------------------
// Insights panel — concise bullets with accent keywords
// ---------------------------------------------------------------------------

function renderFracInsights(data) {
  const container = document.getElementById("insights-grid");
  container.innerHTML = "";

  const {
    maximum_value, capacity, weight_used,
    utilization_percentage, execution_time_ms,
    items_provided, selected_items,
    items_fully_taken, items_partially_taken, items_skipped,
    ratio_sorted_items,
  } = data;

  const topItem    = ratio_sorted_items[0];
  const totalItems = items_provided.length;

  // Main insight card
  const mainCard = document.createElement("div");
  mainCard.className = "insight-card insight-card--success stagger-in";
  mainCard.innerHTML = `
    <div class="insight-header">
      <span class="insight-icon" aria-hidden="true">&#10003;</span>
      <span class="insight-title">Why Greedy is Provably Optimal</span>
    </div>
    <div class="insight-blocks">
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span><span class="kw-density">Value Density</span> (value &divide; weight) ranks how efficiently each item uses capacity. Higher ratio = more value per unit.</span>
      </div>
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span>The <span class="kw-greedy">Greedy Choice</span> always picks the highest-density item first. Because items are divisible, this is always locally and globally safe.</span>
      </div>
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span><span class="kw-optimal">Optimal</span> by exchange argument: swapping any selected fraction for a lower-ratio fraction can only reduce total value.</span>
      </div>
      ${items_partially_taken > 0 ? `
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span><span class="kw-partial">Fractional Selection</span> filled the last ${remaining_capacity === 0 ? "unit of" : ""} capacity with ${fmtPct(data.selected_items.find(s => s.fraction_taken < 1)?.fraction_taken || 0)} of <strong>${data.selected_items.find(s => s.fraction_taken < 1)?.item_name || ""}</strong> &mdash; zero capacity wasted.</span>
      </div>
      ` : `
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span>All selected items were taken <span class="kw-optimal">fully</span>. No fractional splitting was needed for this input.</span>
      </div>
      `}
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span>Unlike <strong>0/1 Knapsack</strong>, no DP table is needed. Sorting is O(n log n) and the pass is O(n) &mdash; the entire algorithm is <span class="kw-density">O(n log n)</span>.</span>
      </div>
    </div>
  `;

  // Performance card with metrics grid
  const perfCard = document.createElement("div");
  perfCard.className = "insight-card insight-card--neutral stagger-in";
  perfCard.innerHTML = `
    <div class="insight-header">
      <span class="insight-icon" aria-hidden="true">&#9889;</span>
      <span class="insight-title">Performance &amp; Metrics</span>
    </div>

    <div class="frac-perf-grid">
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">Items Processed</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--muted">${totalItems}</span>
      </div>
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">Greedy Decisions</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--dp">${items_fully_taken + items_partially_taken}</span>
      </div>
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">Items Skipped</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--muted">${items_skipped}</span>
      </div>
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">Fully Taken</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--success">${items_fully_taken}</span>
      </div>
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">Partially Taken</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--warning">${items_partially_taken}</span>
      </div>
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">Cap. Utilization</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--dp">${utilization_percentage}%</span>
      </div>
    </div>

    <div class="perf-bars">
      <div class="perf-bar-row">
        <div class="perf-bar-header">
          <span class="perf-bar-algo perf-bar-algo--dp">Greedy Execution</span>
          <span class="perf-bar-time">${execution_time_ms} ms</span>
        </div>
        <div class="perf-bar-track">
          <div class="perf-bar-fill perf-bar-fill--dp" style="width:0%;" data-target-width="100%"></div>
        </div>
      </div>
    </div>
  `;

  container.append(mainCard, perfCard);

  // Animate perf bars
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      perfCard.querySelectorAll(".perf-bar-fill").forEach((bar) => {
        bar.style.width = bar.dataset.targetWidth;
      });
    });
  });
}


// ---------------------------------------------------------------------------
// Complexity section (auto-opened)
// ---------------------------------------------------------------------------

function renderFracComplexity(complexity) {
  const container = document.getElementById("complexity-content");
  container.innerHTML = "";

  const col = document.createElement("div");
  col.className = "complexity-col complexity-col--dp";
  col.innerHTML = `
    <div class="complexity-col__header">
      <span class="algo-badge algo-badge--dp">Greedy &mdash; Fractional Knapsack</span>
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
    <div class="complexity-row__note" style="margin-top:8px; padding:8px; background:var(--bg-card-alt); border-radius:4px; border:1px solid var(--border);">
      <strong style="color:var(--dp);">Why sorting dominates:</strong> The greedy selection pass itself is O(n) &mdash; one pass through the sorted list. The O(n log n) sort is what sets the overall bound, not the item-taking loop.
    </div>
  `;

  container.appendChild(col);
}


// ---------------------------------------------------------------------------
// Top-level entry point
// ---------------------------------------------------------------------------

/**
 * Orchestrate the full animated reveal for Fractional Knapsack results.
 * Called by the module registry (module.js) via mod.render(data).
 *
 * @param {object} data - Full API response from /api/v1/fractional-knapsack.
 */
async function renderAll(data) {
  const { complexity } = data;

  const itemsSection = document.getElementById("comparison-cards").closest(".section-block");
  const insSection   = document.getElementById("insights-grid").closest(".section-block");
  const cmpxSection  = document.getElementById("complexity-details");

  // Relabel execution panels
  const greedyPanel    = document.querySelector(".exec-panel--greedy");
  const greedyTitleGrp = greedyPanel?.querySelector(".exec-panel__title-group");
  if (greedyTitleGrp) {
    greedyTitleGrp.innerHTML = `
      <span class="algo-badge algo-badge--dp">Greedy</span>
      <span class="exec-panel__title">Ratio Ranking</span>
    `;
  }

  const dpPanel    = document.querySelector(".exec-panel--dp");
  const dpTitleGrp = dpPanel?.querySelector(".exec-panel__title-group");
  if (dpTitleGrp) {
    dpTitleGrp.innerHTML = `
      <span class="algo-badge algo-badge--dp">Greedy</span>
      <span class="exec-panel__title">Item Selection</span>
    `;
  }

  // Relabel comparison section heading
  const compLabel = document.querySelector(".section-block .section-block__label");
  if (compLabel) compLabel.textContent = "Selected Items";

  // Hide post-execution sections (reveal animated later)
  [itemsSection, insSection, cmpxSection].forEach((el) => {
    if (!el) return;
    el.style.opacity    = "0";
    el.style.transform  = "translateY(16px)";
    el.style.transition = "none";
  });

  // 1. Header (with count-up)
  renderFracHeader(data);

  // 2. Left panel: ratio ranking (two-phase animated)
  await renderRatioRanking(data);

  await delay(300);

  // 3. Right panel: greedy selection with fraction bars
  await renderSelectionTrace(data);

  await delay(350);

  // 4. Selected items cards with fraction bars
  renderSelectedItems(data);
  if (itemsSection) await revealSection(itemsSection);

  await delay(200);

  // 5. Insights + performance metrics
  renderFracInsights(data);
  if (insSection) await revealSection(insSection);

  await delay(200);

  // 6. Complexity -- auto-open
  renderFracComplexity(complexity);
  if (cmpxSection) {
    cmpxSection.setAttribute("open", "");   // auto-expand
    await revealSection(cmpxSection);
  }
}

export { renderAll };
