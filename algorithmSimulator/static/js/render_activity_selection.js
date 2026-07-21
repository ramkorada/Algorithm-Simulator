/**
 * render_activity_selection.js -- Activity Selection DOM Rendering Module
 *
 * Full interactive execution visualization for Activity Selection (Greedy):
 *   - Top summary header (Activities, Selected, Skipped, Execution Time)
 *   - Left Panel ("Execution Trace"): Animated sequence showing sorting and decision steps
 *   - Right Panel ("Selection Trace"): Reason & status for every activity decision
 *   - Timeline Visualization: Horizontal visual timeline chart with green (selected) / gray (skipped) bars
 *   - Selected Activities: Cards for every chosen activity
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
  function tick(now) {
    const elapsed = Math.min(now - start, duration);
    const pct = elapsed / duration;
    const eased = 1 - Math.pow(1 - pct, 3);
    const current = target * eased;
    el.textContent = Math.round(current) + (suffix || "");
    if (elapsed < duration) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
// Render: Top Summary Header
// ---------------------------------------------------------------------------

function renderActivityHeader(data) {
  const { total_activities, selected_count, skipped_count, execution_time_ms } = data;

  const meta = document.getElementById("result-meta");
  if (meta) {
    meta.textContent = `Activities: ${total_activities}  |  Selected: ${selected_count}  |  Skipped: ${skipped_count}`;
  }

  const summary = document.getElementById("result-summary");
  summary.innerHTML = "";

  // Total Activities badge
  const totalItem = document.createElement("div");
  totalItem.className = "summary-item summary-item--dp stagger-in";
  const totVal = document.createElement("span");
  totVal.className = "summary-item__value";
  totVal.textContent = "0";
  totalItem.appendChild(totVal);
  const totLbl = document.createElement("span");
  totLbl.className = "summary-item__label";
  totLbl.textContent = "Total Activities";
  totalItem.appendChild(totLbl);

  // Selected badge
  const selItem = document.createElement("div");
  selItem.className = "summary-item summary-item--greedy stagger-in";
  const selVal = document.createElement("span");
  selVal.className = "summary-item__value";
  selVal.style.color = "var(--success)";
  selVal.textContent = "0";
  selItem.appendChild(selVal);
  const selLbl = document.createElement("span");
  selLbl.className = "summary-item__label";
  selLbl.textContent = "Selected";
  selItem.appendChild(selLbl);

  // Skipped badge
  const skipItem = document.createElement("div");
  skipItem.className = "summary-item stagger-in";
  const skipVal = document.createElement("span");
  skipVal.className = "summary-item__value";
  skipVal.style.color = "var(--text-subtle)";
  skipVal.textContent = "0";
  skipItem.appendChild(skipVal);
  const skipLbl = document.createElement("span");
  skipLbl.className = "summary-item__label";
  skipLbl.textContent = "Skipped";
  skipItem.appendChild(skipLbl);

  // Time badge
  const timeItem = document.createElement("div");
  timeItem.className = "summary-item stagger-in";
  timeItem.innerHTML = `
    <span class="summary-item__value" style="font-size:0.85rem;">${execution_time_ms} ms</span>
    <span class="summary-item__label">Execution Time</span>
  `;

  const verdictItem = document.createElement("div");
  verdictItem.className = "summary-verdict summary-verdict--optimal stagger-in";
  verdictItem.textContent = "Greedy Optimal";

  summary.append(totalItem, selItem, skipItem, timeItem, verdictItem);

  setTimeout(() => {
    countUp(totVal, total_activities, "", 800);
    countUp(selVal, selected_count, "", 800);
    countUp(skipVal, skipped_count, "", 800);
  }, 150);
}


// ---------------------------------------------------------------------------
// Left Panel: Execution Trace (Step-by-step Greedy decisions)
// ---------------------------------------------------------------------------

async function renderExecutionTrace(data) {
  const container = document.getElementById("greedy-execution");
  container.innerHTML = "";

  const badge = document.getElementById("greedy-result-badge");
  badge.textContent = "Running...";
  badge.className = "result-badge";

  const { sorted_activities, execution_trace } = data;

  // Step 1: Sort Notice
  const sortCard = document.createElement("div");
  sortCard.className = "step-card step-card--done";
  sortCard.style.animationDelay = "0ms";
  sortCard.innerHTML = `
    <div class="step-num" style="color:var(--dp); background:var(--dp-dim); border:1px solid var(--dp-border);">&#8595;</div>
    <div class="step-body">
      <div class="step-row">
        <span class="step-action" style="color:var(--dp); font-weight:600; font-size:0.78rem;">Sort by Finish Time</span>
      </div>
      <div class="step-row">
        <span style="font-size:0.7rem; color:var(--text-muted);">${sorted_activities.length} activities ordered by earliest finish</span>
      </div>
    </div>
  `;
  container.appendChild(sortCard);
  await delay(350);

  // Animate steps
  for (let i = 0; i < execution_trace.length; i++) {
    const step = execution_trace[i];
    const act = step.activity;
    const isSelected = step.action === "selected";

    const conn = document.createElement("div");
    conn.className = "step-connector";
    conn.innerHTML = `<span class="step-connector__line"></span>`;
    container.appendChild(conn);

    const card = document.createElement("div");
    card.className = `step-card ${isSelected ? "step-card--done" : "step-card--skip"}`;
    card.style.animationDelay = "0ms";

    const color = isSelected ? "var(--success)" : "var(--text-subtle)";
    const icon = isSelected ? "&#10003;" : "&#10007;";
    const label = isSelected ? `Selected ${act.id}` : `Skipped ${act.id}`;

    card.innerHTML = `
      <div class="step-num" style="color:${color}; border-color:${isSelected ? "var(--success-border)" : "var(--border)"};">${icon}</div>
      <div class="step-body">
        <div class="step-row">
          <span class="step-action" style="color:${color}; font-weight:600; font-size:0.8rem;">${label}</span>
        </div>
        <div class="step-row">
          <span class="step-label">Interval</span>
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text);">${act.start} &rarr; ${act.finish}</span>
          <span style="font-size:0.68rem; color:var(--text-subtle);">(dur: ${act.duration})</span>
        </div>
      </div>
    `;

    container.appendChild(card);
    container.scrollTop = container.scrollHeight;
    await delay(STEP_DELAY_MS);
  }

  // Completion step
  const conn = document.createElement("div");
  conn.className = "step-connector";
  conn.innerHTML = `<span class="step-connector__line"></span>`;
  container.appendChild(conn);

  const doneCard = document.createElement("div");
  doneCard.className = "step-card step-card--complete";
  doneCard.style.animationDelay = "0ms";
  doneCard.innerHTML = `
    <div class="step-num" style="color:var(--success);">&#10003;</div>
    <div class="step-body">
      <div class="step-row">
        <span style="font-size:0.78rem; color:var(--success); font-weight:600;">Trace Completed</span>
      </div>
      <div class="step-row">
        <span style="font-size:0.7rem; color:var(--text-muted); font-family:var(--font-mono);">${data.selected_count} activities selected</span>
      </div>
    </div>
  `;
  container.appendChild(doneCard);
  container.scrollTop = container.scrollHeight;

  badge.textContent = "Completed";
  badge.className = "result-badge result-badge--optimal";
}


// ---------------------------------------------------------------------------
// Right Panel: Selection Trace (Detailed reason for each activity)
// ---------------------------------------------------------------------------

async function renderSelectionTrace(data) {
  const container = document.getElementById("dp-execution");
  container.innerHTML = "";

  const badge = document.getElementById("dp-result-badge");
  badge.textContent = "Evaluating...";
  badge.className = "result-badge";

  const { execution_trace } = data;

  for (let i = 0; i < execution_trace.length; i++) {
    const step = execution_trace[i];
    const act = step.activity;
    const isSelected = step.action === "selected";

    if (i > 0) {
      const conn = document.createElement("div");
      conn.className = "step-connector";
      conn.innerHTML = `<span class="step-connector__line"></span>`;
      container.appendChild(conn);
    }

    const card = document.createElement("div");
    card.className = `step-card ${isSelected ? "step-card--dp" : "step-card--skip"}`;
    card.style.animationDelay = "0ms";

    const statusColor = isSelected ? "var(--success)" : "var(--error)";
    const statusText  = isSelected ? "Selected" : "Skipped";

    card.innerHTML = `
      <div class="step-num" style="color:${statusColor}; font-weight:700;">#${i + 1}</div>
      <div class="step-body">
        <div class="step-row">
          <span class="step-action" style="font-weight:700; color:var(--text);">${act.id} [${act.start} &ndash; ${act.finish}]</span>
          <span class="result-badge" style="background:${statusColor}15; color:${statusColor}; border:1px solid ${statusColor}40;">${statusText}</span>
        </div>
        <div class="step-row" style="margin-top:2px;">
          <span class="step-label">Reason</span>
        </div>
        <div style="font-size:0.72rem; color:var(--text-muted); line-height:1.4; padding-left:4px; border-left:2px solid ${statusColor};">
          ${step.reason}
        </div>
      </div>
    `;

    container.appendChild(card);
    container.scrollTop = container.scrollHeight;
    await delay(STEP_DELAY_MS);
  }

  badge.textContent = "Complete";
  badge.className = "result-badge result-badge--optimal";
}


// ---------------------------------------------------------------------------
// Timeline Visualization: Horizontal bar chart
// ---------------------------------------------------------------------------

function renderTimelineVisualization(data) {
  const { sorted_activities, selected_activities } = data;
  if (!sorted_activities || sorted_activities.length === 0) return null;

  // Calculate timeline max finish
  const minTime = Math.min(...sorted_activities.map(a => a.start));
  const maxTime = Math.max(...sorted_activities.map(a => a.finish));
  const timeSpan = maxTime - minTime || 1;

  const selectedIds = new Set(selected_activities.map(a => a.id));

  const wrapper = document.createElement("div");
  wrapper.className = "timeline-card stagger-in";

  let html = `
    <div class="timeline-header">
      <div class="timeline-title">
        <span style="color:var(--success);">&#9616;</span> Activity Timeline Visualization
      </div>
      <div class="timeline-legend">
        <div class="legend-item"><span class="legend-dot legend-dot--selected"></span> Selected</div>
        <div class="legend-item"><span class="legend-dot legend-dot--skipped"></span> Skipped</div>
      </div>
    </div>
    <div class="timeline-body">
      <div class="timeline-axis">
        <span>Time ${minTime}</span>
        <span>Time ${Math.round((minTime + maxTime) / 2)}</span>
        <span>Time ${maxTime}</span>
      </div>
  `;

  sorted_activities.forEach((act) => {
    const isSelected = selectedIds.has(act.id);
    const leftPct = ((act.start - minTime) / timeSpan) * 100;
    const widthPct = Math.max(((act.finish - act.start) / timeSpan) * 100, 3);
    const barClass = isSelected ? "timeline-bar-item--selected" : "timeline-bar-item--skipped";

    html += `
      <div class="timeline-row">
        <div class="timeline-row-label">${act.id}</div>
        <div class="timeline-track-area">
          <div class="timeline-bar-item ${barClass}" style="left:${leftPct}%; width:${widthPct}%;" title="${act.id}: ${act.start} - ${act.finish}">
            ${act.start}-${act.finish}
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  wrapper.innerHTML = html;
  return wrapper;
}


// ---------------------------------------------------------------------------
// Selected Activities Cards + Summary Card
// ---------------------------------------------------------------------------

function renderSelectedCards(data) {
  const container = document.getElementById("comparison-cards");
  container.innerHTML = "";

  // Render Timeline Visualization as the first main element
  const timelineEl = renderTimelineVisualization(data);
  if (timelineEl) {
    const timelineWrapper = document.createElement("div");
    timelineWrapper.style.gridColumn = "1 / -1";
    timelineWrapper.appendChild(timelineEl);
    container.appendChild(timelineWrapper);
  }

  const { selected_activities, total_activities, selected_count, skipped_count } = data;

  // Selected Activity Cards
  selected_activities.forEach((act) => {
    const card = document.createElement("div");
    card.className = "act-card stagger-in";
    card.innerHTML = `
      <div class="act-card__header">
        <span class="act-card__id">${act.id}</span>
        <span class="result-badge result-badge--optimal">Selected</span>
      </div>
      <div class="act-card__stats">
        <div class="frac-item-stat">
          <span class="frac-item-stat__label">Start</span>
          <span class="frac-item-stat__value">${act.start}</span>
        </div>
        <div class="frac-item-stat">
          <span class="frac-item-stat__label">Finish</span>
          <span class="frac-item-stat__value frac-item-stat__value--accent">${act.finish}</span>
        </div>
        <div class="frac-item-stat">
          <span class="frac-item-stat__label">Duration</span>
          <span class="frac-item-stat__value frac-item-stat__value--ok">${act.duration}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Summary Card
  const summaryCard = document.createElement("div");
  summaryCard.className = "cmp-card cmp-card--verdict cmp-card--verdict-optimal stagger-in";
  summaryCard.innerHTML = `
    <div class="cmp-card__title">Activity Summary</div>
    <div class="cmp-verdict-icon" aria-hidden="true" style="color:var(--success);">&#10003;</div>
    <div class="cmp-verdict-title" style="color:var(--success);">Optimal Set: ${selected_count} Activities</div>

    <div class="frac-summary-grid">
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Max Compatible</span>
        <span class="frac-summary-row__value frac-summary-row__value--ok">${selected_count}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Total Input</span>
        <span class="frac-summary-row__value">${total_activities}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Selected Count</span>
        <span class="frac-summary-row__value frac-summary-row__value--ok">${selected_count}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Skipped Count</span>
        <span class="frac-summary-row__value frac-summary-row__value--warn">${skipped_count}</span>
      </div>
      <div class="frac-summary-row">
        <span class="frac-summary-row__label">Algorithm</span>
        <span class="frac-summary-row__value frac-summary-row__value--dp">Greedy</span>
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
// Insights panel & Performance summary
// ---------------------------------------------------------------------------

function renderActivityInsights(data) {
  const container = document.getElementById("insights-grid");
  container.innerHTML = "";

  const {
    total_activities, selected_count, skipped_count,
    compatibility_checks, execution_time_ms
  } = data;

  const mainCard = document.createElement("div");
  mainCard.className = "insight-card insight-card--success stagger-in";
  mainCard.innerHTML = `
    <div class="insight-header">
      <span class="insight-icon" aria-hidden="true">&#10003;</span>
      <span class="insight-title">Why Greedy is Optimal</span>
    </div>
    <div class="insight-blocks">
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span>Activities are sorted by <span class="kw-density">Earliest Finish Time</span>.</span>
      </div>
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span>Selecting the activity that finishes earliest leaves the <span class="kw-greedy">maximum available time</span> for future activities.</span>
      </div>
      <div class="insight-block">
        <span class="insight-block__marker" aria-hidden="true">&#9658;</span>
        <span>This <span class="kw-optimal">Greedy Strategy</span> is mathematically proven to yield the maximum number of mutually compatible activities.</span>
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
        <span class="frac-perf-cell__label">Activities</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--muted">${total_activities}</span>
      </div>
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">Selected</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--success">${selected_count}</span>
      </div>
      <div class="frac-perf-cell">
        <span class="frac-perf-cell__label">Skipped</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--warning">${skipped_count}</span>
      </div>
      <div class="frac-perf-cell" style="grid-column: span 3;">
        <span class="frac-perf-cell__label">Compatibility Checks</span>
        <span class="frac-perf-cell__value frac-perf-cell__value--dp">${compatibility_checks}</span>
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

function renderActivityComplexity(complexity) {
  const container = document.getElementById("complexity-content");
  container.innerHTML = "";

  const col = document.createElement("div");
  col.className = "complexity-col complexity-col--dp";
  col.innerHTML = `
    <div class="complexity-col__header">
      <span class="algo-badge algo-badge--dp">Greedy &mdash; Activity Selection</span>
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
      <strong style="color:var(--dp);">Why sorting dominates:</strong> Sorting $n$ activities by finish time requires $O(n \\log n)$ time. The linear selection pass requires only $O(n)$, so the sorting step determines the overall time complexity.
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
      <span class="algo-badge algo-badge--dp">Greedy</span>
      <span class="exec-panel__title">Execution Trace</span>
    `;
  }

  const dpPanel = document.querySelector(".exec-panel--dp");
  const dpTitle = dpPanel?.querySelector(".exec-panel__title-group");
  if (dpTitle) {
    dpTitle.innerHTML = `
      <span class="algo-badge algo-badge--dp">Greedy</span>
      <span class="exec-panel__title">Selection Trace</span>
    `;
  }

  const compLabel = document.querySelector(".section-block .section-block__label");
  if (compLabel) compLabel.textContent = "Timeline & Selected Activities";

  // Hide post-execution sections for smooth progressive reveal
  [itemsSection, insSection, cmpxSection].forEach((el) => {
    if (!el) return;
    el.style.opacity    = "0";
    el.style.transform  = "translateY(16px)";
    el.style.transition = "none";
  });

  // 1. Render Top Summary Header
  renderActivityHeader(data);

  // 2. Animate Left Panel (Execution Trace)
  await renderExecutionTrace(data);

  await delay(300);

  // 3. Animate Right Panel (Selection Trace)
  await renderSelectionTrace(data);

  await delay(350);

  // 4. Render Timeline & Selected Activities Cards
  renderSelectedCards(data);
  if (itemsSection) await revealSection(itemsSection);

  await delay(200);

  // 5. Render Insights & Performance Summary
  renderActivityInsights(data);
  if (insSection) await revealSection(insSection);

  await delay(200);

  // 6. Render & Auto-Open Complexity
  renderActivityComplexity(complexity);
  if (cmpxSection) {
    cmpxSection.setAttribute("open", "");
    await revealSection(cmpxSection);
  }
}

export { renderAll };
