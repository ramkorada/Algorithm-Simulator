/**
 * render_rod_cutting.js -- Rod Cutting DOM Rendering Module
 *
 * Full interactive execution visualization for Rod Cutting (Dynamic Programming):
 *   - Top summary header (Maximum Revenue, Cuts Used, Rod Length, Execution Time)
 *   - Left Panel ("DP Table Construction"): Animated sequence showing sub-length evaluation
 *   - Right Panel ("Solution Reconstruction"): Step-by-step backtracking trace
 *   - Visual Rod Cutting Chart: Horizontal segmented rod showing pieces with distinct color accents
 *   - Optimal Cut Cards: Individual cards for every selected cut
 *   - Summary Card & Insights: Educational explanation with accent highlights
 *   - Performance Summary: Metrics grid + animated progress bar
 *   - Complexity Section: Auto-opened complexity details
 */

const STEP_DELAY_MS = 480;

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

function countUp(el, target, suffix, duration) {
  const start = performance.now();
  const isFloat = !Number.isInteger(target);
  function tick(now) {
    const elapsed = Math.min(now - start, duration);
    const pct = elapsed / duration;
    const eased = 1 - Math.pow(1 - pct, 3);
    const current = target * eased;
    el.textContent = (isFloat ? current.toFixed(2) : Math.round(current)) + (suffix || "");
    if (elapsed < duration) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
// Render: Top Summary Header
// ---------------------------------------------------------------------------

function renderRodHeader(data) {
  const { rod_length, max_revenue, cuts_count, execution_time_ms } = data;

  const meta = document.getElementById("result-meta");
  if (meta) {
    meta.textContent = `Rod Length: ${rod_length}  |  Max Revenue: ${max_revenue}  |  Cuts Used: ${cuts_count}`;
  }

  const summary = document.getElementById("result-summary");
  summary.innerHTML = "";

  // Max Revenue badge
  const valItem = document.createElement("div");
  valItem.className = "summary-item summary-item--dp stagger-in";
  const valEl = document.createElement("span");
  valEl.className = "summary-item__value";
  valEl.textContent = "0";
  valItem.appendChild(valEl);
  const valLbl = document.createElement("span");
  valLbl.className = "summary-item__label";
  valLbl.textContent = "Max Revenue";
  valItem.appendChild(valLbl);

  // Cuts Used badge
  const cutsItem = document.createElement("div");
  cutsItem.className = "summary-item summary-item--greedy stagger-in";
  const cutsVal = document.createElement("span");
  cutsVal.className = "summary-item__value";
  cutsVal.style.color = "var(--dp)";
  cutsVal.textContent = "0";
  cutsItem.appendChild(cutsVal);
  const cutsLbl = document.createElement("span");
  cutsLbl.className = "summary-item__label";
  cutsLbl.textContent = "Cuts Used";
  cutsItem.appendChild(cutsLbl);

  // Rod Length badge
  const lenItem = document.createElement("div");
  lenItem.className = "summary-item stagger-in";
  const lenVal = document.createElement("span");
  lenVal.className = "summary-item__value";
  lenVal.style.color = "var(--text-muted)";
  lenVal.textContent = "0";
  lenItem.appendChild(lenVal);
  const lenLbl = document.createElement("span");
  lenLbl.className = "summary-item__label";
  lenLbl.textContent = "Rod Length";
  lenItem.appendChild(lenLbl);

  // Execution Time badge
  const timeItem = document.createElement("div");
  timeItem.className = "summary-item stagger-in";
  timeItem.innerHTML = `
    <span class="summary-item__value" style="font-size:0.85rem;">${execution_time_ms} ms</span>
    <span class="summary-item__label">Execution Time</span>
  `;

  const verdictItem = document.createElement("div");
  verdictItem.className = "summary-verdict summary-verdict--optimal stagger-in";
  verdictItem.textContent = "DP Optimal";

  summary.append(valItem, cutsItem, lenItem, timeItem, verdictItem);

  setTimeout(() => {
    countUp(valEl, max_revenue, "", 800);
    countUp(cutsVal, cuts_count, "", 800);
    countUp(lenVal, rod_length, "", 800);
  }, 150);
}


// ---------------------------------------------------------------------------
// Left Panel: DP Table Construction
// ---------------------------------------------------------------------------

async function renderDPTableConstruction(data) {
  const container = document.getElementById("greedy-execution");
  container.innerHTML = "";

  const badge = document.getElementById("greedy-result-badge");
  badge.textContent = "Computing...";
  badge.className = "result-badge";

  const { execution_trace } = data;

  for (let i = 0; i < execution_trace.length; i++) {
    const step = execution_trace[i];

    if (i > 0) {
      const conn = document.createElement("div");
      conn.className = "step-connector";
      conn.innerHTML = `<span class="step-connector__line"></span>`;
      container.appendChild(conn);
    }

    const card = document.createElement("div");
    card.className = "step-card step-card--dp";
    card.style.animationDelay = "0ms";

    card.innerHTML = `
      <div class="step-num" style="color:var(--dp); font-weight:700;">L${step.sub_length}</div>
      <div class="step-body">
        <div class="step-row">
          <span class="step-action" style="color:var(--dp); font-weight:600; font-size:0.8rem;">Length ${step.sub_length} &rarr; Revenue: ${step.best_revenue}</span>
        </div>
        <div class="step-row">
          <span class="step-label">First Cut</span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text);">${step.first_cut}</span>
        </div>
      </div>
    `;

    container.appendChild(card);
    container.scrollTop = container.scrollHeight;
    await delay(STEP_DELAY_MS);
  }

  badge.textContent = "Built";
  badge.className = "result-badge result-badge--optimal";
}


// ---------------------------------------------------------------------------
// Right Panel: Solution Reconstruction
// ---------------------------------------------------------------------------

async function renderSolutionReconstruction(data) {
  const container = document.getElementById("dp-execution");
  container.innerHTML = "";

  const badge = document.getElementById("dp-result-badge");
  badge.textContent = "Reconstructing...";
  badge.className = "result-badge";

  const { reconstruction_steps } = data;

  for (let i = 0; i < reconstruction_steps.length; i++) {
    const step = reconstruction_steps[i];
    const isComplete = step.remaining_after === 0 && step.cut_length === 0;

    if (i > 0) {
      const conn = document.createElement("div");
      conn.className = "step-connector";
      conn.innerHTML = `<span class="step-connector__line"></span>`;
      container.appendChild(conn);
    }

    const card = document.createElement("div");
    card.className = `step-card ${isComplete ? "step-card--complete" : "step-card--dp"}`;
    card.style.animationDelay = "0ms";

    if (isComplete) {
      card.innerHTML = `
        <div class="step-num" style="color:var(--success);">&#10003;</div>
        <div class="step-body">
          <div class="step-row">
            <span style="font-size:0.78rem; color:var(--success); font-weight:600;">Solution Complete</span>
          </div>
          <div class="step-row">
            <span style="font-size:0.7rem; color:var(--text-muted);">Remaining length: 0</span>
          </div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="step-num" style="color:var(--dp); font-weight:700;">#${step.step}</div>
        <div class="step-body">
          <div class="step-row">
            <span class="step-action" style="font-weight:700; color:var(--text);">Cut Length: ${step.cut_length}</span>
            <span class="result-badge" style="background:var(--success-dim); color:var(--success); border:1px solid var(--success-border);">+${step.piece_price}</span>
          </div>
          <div class="step-row" style="margin-top:2px;">
            <span class="step-label">Remaining</span>
            <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">${step.remaining_before} &rarr; ${step.remaining_after}</span>
          </div>
        </div>
      `;
    }

    container.appendChild(card);
    container.scrollTop = container.scrollHeight;
    await delay(STEP_DELAY_MS);
  }

  badge.textContent = "Optimal";
  badge.className = "result-badge result-badge--optimal";
}


// ---------------------------------------------------------------------------
// Rod Cut Visualizer (Segmented Rod)
// ---------------------------------------------------------------------------

function renderRodVisualizer(data) {
  const { rod_length, optimal_cuts } = data;
  if (!optimal_cuts || optimal_cuts.length === 0) return null;

  const wrapper = document.createElement("div");
  wrapper.className = "rod-visual-card stagger-in";

  let html = `
    <div class="rod-visual-header">
      <div class="rod-visual-title">
        <span style="color:var(--dp);">&#9646;&#9646;</span> Rod Cutting Visualization
      </div>
      <div style="font-size:0.72rem; color:var(--text-subtle);">
        Rod Length: ${rod_length}
      </div>
    </div>
    <div class="rod-visual-body">
      <div class="rod-block">
        <span class="rod-label">Original Uncut Rod (Length ${rod_length})</span>
        <div class="rod-bar-uncut">Length ${rod_length}</div>
      </div>
      <div class="rod-block">
        <span class="rod-label">Optimal Segmented Cuts</span>
        <div class="rod-bar-segmented">
  `;

  optimal_cuts.forEach((cut, idx) => {
    const widthPct = (cut.length / rod_length) * 100;
    const colorClass = `rod-piece-color-${(idx % 5) + 1}`;

    html += `
      <div class="rod-piece-seg ${colorClass}" style="width:${widthPct}%;" title="Piece Length ${cut.length} (Revenue: ${cut.price})">
        <span class="rod-piece-seg__len">Len ${cut.length}</span>
        <span class="rod-piece-seg__price">+${cut.price}</span>
      </div>
    `;
  });

  html += `
        </div>
      </div>
    </div>
  `;

  wrapper.innerHTML = html;
  return wrapper;
}


// ---------------------------------------------------------------------------
// Optimal Cut Cards + Summary Card
// ---------------------------------------------------------------------------

function renderCutCards(data) {
  const container = document.getElementById("comparison-cards");
  container.innerHTML = "";

  // Render Visual Rod Segmentation Chart
  const rodVisual = renderRodVisualizer(data);
  if (rodVisual) {
    const wrapper = document.createElement("div");
    wrapper.style.gridColumn = "1 / -1";
    wrapper.appendChild(rodVisual);
    container.appendChild(wrapper);
  }

  const { optimal_cuts, rod_length, max_revenue, cuts_count, average_piece_length } = data;

  // Individual Cut Cards
  optimal_cuts.forEach((cut) => {
    const card = document.createElement("div");
    card.className = "rod-cut-card stagger-in";
    card.innerHTML = `
      <div class="act-card__header">
        <span class="act-card__id">Cut ${cut.cut_index}</span>
        <span class="result-badge result-badge--optimal">Length ${cut.length}</span>
      </div>
      <div class="act-card__stats">
        <div class="frac-item-stat">
          <span class="frac-item-stat__label">Piece Length</span>
          <span class="frac-item-stat__value">${cut.length}</span>
        </div>
        <div class="frac-item-stat">
          <span class="frac-item-stat__label">Revenue</span>
          <span class="frac-item-stat__value frac-item-stat__value--ok">+${cut.price}</span>
        </div>
        <div class="frac-item-stat">
          <span class="frac-item-stat__label">Next Rem.</span>
          <span class="frac-item-stat__value frac-item-stat__value--accent">${cut.remaining_length}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Summary Card
  const summaryCard = document.createElement("div");
  summaryCard.className = "cmp-card cmp-card--verdict cmp-card--verdict-optimal stagger-in";
  summaryCard.innerHTML = `
    <div class="cmp-card__title">Rod Cutting Summary</div>
    <div class="cmp-verdict-icon" aria-hidden="true" style="color:var(--success);">&#10003;</div>
    <div class="cmp-verdict-title" style="color:var(--success);">Max Revenue: ${max_revenue}</div>

    <div class="frac-summary-grid">
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Max Revenue</span>
        <span class="frac-summary-row__value frac-summary-row__value--ok">${max_revenue}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Rod Length</span>
        <span class="frac-summary-row__value">${rod_length}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Cuts Count</span>
        <span class="frac-summary-row__value frac-summary-row__value--dp">${cuts_count}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Avg Piece Len</span>
        <span class="frac-summary-row__value">${average_piece_length}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Algorithm</span>
        <span class="frac-summary-row__value frac-summary-row__value--dp">Dynamic Programming</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Status</span>
        <span class="frac-summary-row__value frac-summary-row__value--ok">Globally Optimal</span>
      </div>
    </div>
  `;
  container.appendChild(summaryCard);
}


// ---------------------------------------------------------------------------
// Insights & Performance Summary
// ---------------------------------------------------------------------------

function renderRodInsights(data) {
  const container = document.getElementById("insights-grid");
  container.innerHTML = "";

  const {
    rod_length, max_revenue, cuts_count,
    dp_states_computed, execution_time_ms
  } = data;

  const mainCard = document.createElement("div");
  mainCard.className = "insight-card insight-card--success stagger-in";
  mainCard.innerHTML = `
    <div class="insight-header">
      <span class="insight-icon" aria-hidden="true">&#10003;</span>
      <span class="insight-title">Optimal Revenue Found</span>
    </div>
    <div class="insight-blocks">
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span>Dynamic Programming computes the best revenue for every intermediate sub-length from 1 to ${rod_length}.</span>
      </div>
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span>Every subproblem builds upon smaller <span class="kw-density">optimal sub-structures</span>: $dp[i] = \\max_{1 \\le j \\le i} (p_j + dp[i-j])$.</span>
      </div>
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span>The reconstructed optimal cuts guarantee the maximum obtainable revenue of <span class="kw-optimal">${max_revenue}</span> across ${cuts_count} piece(s).</span>
      </div>
    </div>
  `;

  const perfCard = document.createElement("div");
  perfCard.className = "insight-card insight-card--neutral stagger-in";
  perfCard.innerHTML = `
    <div class="insight-header">
      <span class="insight-icon" aria-hidden="true">&#9889;</span>
      <span class="insight-title">Performance Summary</span>
    </div>

    <div class="frac-perf-grid">
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">Rod Length</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--muted">${rod_length}</span>
      </div>
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">DP States</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--dp">${dp_states_computed}</span>
      </div>
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">Cuts Made</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--success">${cuts_count}</span>
      </div>
      <div class="frac-perf-cell" style="grid-column: span 3;">
        <span class="frac-perf-cell__label">DP Table Size</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--dp">${rod_length + 1} cells</span>
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

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      perfCard.querySelectorAll(".perf-bar-fill").forEach((bar) => {
        bar.style.width = bar.dataset.targetWidth;
      });
    });
  });
}


// ---------------------------------------------------------------------------
// Complexity Section (Auto-opened)
// ---------------------------------------------------------------------------

function renderRodComplexity(complexity) {
  const container = document.getElementById("complexity-content");
  container.innerHTML = "";

  const col = document.createElement("div");
  col.className = "complexity-col complexity-col--dp";
  col.innerHTML = `
    <div class="complexity-col__header">
      <span class="algo-badge algo-badge--dp">Dynamic Programming &mdash; Rod Cutting</span>
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
      <strong style="color:var(--dp);">Why $O(n^2)$ time:</strong> For each sub-length $i$ from 1 to $n$, the algorithm checks every possible first cut $j$ (1 to $i$). The total checks sum to $\\sum_{i=1}^n i = \\frac{n(n+1)}{2} = O(n^2)$.
    </div>
  `;

  container.appendChild(col);
}


// ---------------------------------------------------------------------------
// Main Top-level Entry Point
// ---------------------------------------------------------------------------

async function renderAll(data) {
  const { complexity } = data;

  const itemsSection = document.getElementById("comparison-cards").closest(".section-block");
  const insSection   = document.getElementById("insights-grid").closest(".section-block");
  const cmpxSection  = document.getElementById("complexity-details");

  // Relabel panels
  const greedyPanel = document.querySelector(".exec-panel--greedy");
  const greedyTitle = greedyPanel?.querySelector(".exec-panel__title-group");
  if (greedyTitle) {
    greedyTitle.innerHTML = `
      <span class="algo-badge algo-badge--dp">DP</span>
      <span class="exec-panel__title">DP Table Construction</span>
    `;
  }

  const dpPanel = document.querySelector(".exec-panel--dp");
  const dpTitle = dpPanel?.querySelector(".exec-panel__title-group");
  if (dpTitle) {
    dpTitle.innerHTML = `
      <span class="algo-badge algo-badge--dp">DP</span>
      <span class="exec-panel__title">Solution Reconstruction</span>
    `;
  }

  const compLabel = document.querySelector(".section-block .section-block__label");
  if (compLabel) compLabel.textContent = "Rod Cutting & Optimal Cuts";

  // Hide post-execution sections for smooth progressive reveal
  [itemsSection, insSection, cmpxSection].forEach((el) => {
    if (!el) return;
    el.style.opacity    = "0";
    el.style.transform  = "translateY(16px)";
    el.style.transition = "none";
  });

  // 1. Render Top Summary Header
  renderRodHeader(data);

  // 2. Animate Left Panel (DP Table Construction)
  await renderDPTableConstruction(data);

  await delay(300);

  // 3. Animate Right Panel (Solution Reconstruction)
  await renderSolutionReconstruction(data);

  await delay(350);

  // 4. Render Visual Rod & Optimal Cut Cards
  renderCutCards(data);
  if (itemsSection) await revealSection(itemsSection);

  await delay(200);

  // 5. Render Insights & Performance Summary
  renderRodInsights(data);
  if (insSection) await revealSection(insSection);

  await delay(200);

  // 6. Render & Auto-Open Complexity
  renderRodComplexity(complexity);
  if (cmpxSection) {
    cmpxSection.setAttribute("open", "");
    await revealSection(cmpxSection);
  }
}

export { renderAll };
