/**
 * render.js — DOM Rendering Module (Redesigned for Interactive Visualization)
 *
 * Single responsibility: take structured API response data and populate
 * the results view with visual execution traces, comparison cards,
 * and insight panels.
 *
 * No API calls. No validation. No UI state changes.
 * All functions receive data as parameters and target specific DOM elements.
 */


// ---------------------------------------------------------------------------
// Step string parsers
// Parse the step strings returned by the backend into structured objects.
// These are consistent formats defined in algorithms/coin_change.py.
// ---------------------------------------------------------------------------

/**
 * Parse Greedy step strings into structured objects for rendering.
 *
 * Backend format: "Selected coin X — remaining amount: Y"
 *             or: "Stuck at remainder X — no coin fits. Greedy failed."
 *
 * @param {string[]} steps  - Step strings from the API.
 * @param {number}   amount - Original target amount (for computing "before").
 * @returns {object[]}      - Array of structured step objects.
 */
function parseGreedySteps(steps, amount) {
  const parsed = [];
  let remaining = amount;

  for (const step of steps) {
    const match = step.match(/Selected coin (\d+) — remaining amount: (\d+)/);
    if (match) {
      const coin       = parseInt(match[1], 10);
      const afterRemaining = parseInt(match[2], 10);
      parsed.push({
        type:   "select",
        before: remaining,
        coin,
        after:  afterRemaining,
      });
      remaining = afterRemaining;
    } else if (step.includes("Stuck") || step.includes("failed")) {
      parsed.push({ type: "stuck", remaining, text: step });
    }
  }

  return parsed;
}

/**
 * Parse DP reconstruction step strings into structured objects.
 *
 * Backend format: "At amount X: used coin Y → backtrack to Z"
 *             or: "Reached 0 — reconstruction complete."
 *
 * @param {string[]} steps - Step strings from the API.
 * @returns {object[]}     - Array of structured step objects.
 */
function parseDPSteps(steps) {
  return steps.map((step) => {
    const match = step.match(
      /At amount (\d+): used coin (\d+) → backtrack to (\d+)/
    );
    if (match) {
      return {
        type: "backtrack",
        from: parseInt(match[1], 10),
        coin: parseInt(match[2], 10),
        to:   parseInt(match[3], 10),
      };
    }
    // "Reached 0 — reconstruction complete."
    return { type: "complete", text: step };
  });
}


// ---------------------------------------------------------------------------
// Step card builders
// Each function creates a single DOM element for one algorithm step.
// ---------------------------------------------------------------------------

const MAX_STEPS_SHOWN = 18; // cap displayed steps to prevent overwhelming the UI
const STEP_DELAY_MS   = 550; // delay between step reveals during animated execution

/**
 * Promise-based delay for sequential step animations.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Smoothly reveal a section that was hidden with opacity:0 / translateY.
 * @param {HTMLElement} el - The element to reveal.
 * @returns {Promise<void>}
 */
function revealSection(el) {
  return new Promise((resolve) => {
    el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    setTimeout(resolve, 420);
  });
}

/**
 * Build a Greedy step card element.
 *
 * @param {object} step       - Parsed step object.
 * @param {number} cardIndex  - Visual index (controls animation delay).
 * @param {number} stepNumber - Human-visible step number.
 * @returns {DocumentFragment} - Card + connector fragment.
 */
function buildGreedyCard(step, cardIndex, stepNumber) {
  const frag = document.createDocumentFragment();

  // Connector (↓) between cards
  if (cardIndex > 0) {
    const conn = document.createElement("div");
    conn.className = "step-connector";
    conn.setAttribute("aria-hidden", "true");
    conn.textContent = "↓";
    frag.appendChild(conn);
  }

  const card = document.createElement("div");
  card.style.animationDelay = `${cardIndex * 60}ms`;

  if (step.type === "select") {
    card.className = "step-card step-card--greedy";
    card.setAttribute("aria-label", `Step ${stepNumber}: chose coin ${step.coin}, remaining ${step.after}`);
    card.innerHTML = `
      <div class="step-num">${stepNumber}</div>
      <div class="step-body">
        <div class="step-row">
          <span class="step-label">Remaining</span>
          <span class="step-value">${step.before}</span>
        </div>
        <div class="step-row">
          <span class="step-label">Chose</span>
          <span class="step-coin step-coin--greedy" aria-label="coin ${step.coin}">${step.coin}</span>
        </div>
        <div class="step-row">
          <span class="step-label">New</span>
          <span class="step-value">${step.after}</span>
        </div>
      </div>
    `;
  } else {
    // Stuck / failed
    card.className = "step-card step-card--stuck";
    card.innerHTML = `
      <div class="step-num">!</div>
      <div class="step-body">
        <div class="step-row">
          <span class="step-label">Stuck at</span>
          <span class="step-value">${step.remaining}</span>
        </div>
        <div class="step-row">
          <span style="font-size:0.72rem; color:var(--error);">No coin fits — Greedy failed</span>
        </div>
      </div>
    `;
  }

  frag.appendChild(card);
  return frag;
}

/**
 * Build the "Done" completion card for Greedy.
 *
 * @param {number} count      - Total coins used.
 * @param {number} cardIndex  - For animation delay.
 * @returns {DocumentFragment}
 */
function buildGreedyDoneCard(count, cardIndex) {
  const frag = document.createDocumentFragment();

  const conn = document.createElement("div");
  conn.className = "step-connector";
  conn.setAttribute("aria-hidden", "true");
  conn.textContent = "↓";
  frag.appendChild(conn);

  const card = document.createElement("div");
  card.className = "step-card step-card--done";
  card.style.animationDelay = `${cardIndex * 60}ms`;
  card.setAttribute("aria-label", `Complete: ${count} coins used`);
  card.innerHTML = `
    <div class="step-num">✓</div>
    <div class="step-body">
      <div class="step-done-icon" aria-hidden="true">●</div>
      <div class="step-done-text">Complete</div>
      <div class="step-done-detail">${count} coin${count !== 1 ? "s" : ""} used</div>
    </div>
  `;

  frag.appendChild(card);
  return frag;
}

/**
 * Build a DP reconstruction step card.
 *
 * @param {object} step       - Parsed step object.
 * @param {number} cardIndex  - For animation delay.
 * @param {number} stepNumber - Human-visible step number.
 * @returns {DocumentFragment}
 */
function buildDPCard(step, cardIndex, stepNumber) {
  const frag = document.createDocumentFragment();

  if (cardIndex > 0) {
    const conn = document.createElement("div");
    conn.className = "step-connector";
    conn.setAttribute("aria-hidden", "true");
    conn.textContent = "↓";
    frag.appendChild(conn);
  }

  const card = document.createElement("div");
  card.style.animationDelay = `${cardIndex * 60}ms`;

  if (step.type === "backtrack") {
    card.className = "step-card step-card--dp";
    card.setAttribute("aria-label", `Step ${stepNumber}: at amount ${step.from}, used coin ${step.coin}, go to ${step.to}`);
    card.innerHTML = `
      <div class="step-num">${stepNumber}</div>
      <div class="step-body">
        <div class="step-row">
          <span class="step-label">Amount</span>
          <span class="step-value">${step.from}</span>
        </div>
        <div class="step-row">
          <span class="step-label">Used</span>
          <span class="step-coin step-coin--dp" aria-label="coin ${step.coin}">${step.coin}</span>
        </div>
        <div class="step-row">
          <span class="step-label">→ Go to</span>
          <span class="step-value">${step.to}</span>
        </div>
      </div>
    `;
  } else {
    // complete
    card.className = "step-card step-card--done";
    card.innerHTML = `
      <div class="step-num">✓</div>
      <div class="step-body">
        <div class="step-done-text">Reconstruction complete</div>
        <div class="step-done-detail">Reached amount 0</div>
      </div>
    `;
  }

  frag.appendChild(card);
  return frag;
}


// ---------------------------------------------------------------------------
// Execution panel renderers
// ---------------------------------------------------------------------------

/**
 * Render the Greedy execution trace into the exec-flow container.
 *
 * @param {object} greedy - Greedy result from the API.
 * @param {number} amount - Original target amount.
 */
async function renderGreedyExecution(greedy, amount) {
  const container = document.getElementById("greedy-execution");
  container.innerHTML = "";

  // Set panel result badge
  const badge = document.getElementById("greedy-result-badge");

  if (!greedy.solvable) {
    badge.textContent = "Failed";
    badge.className   = "result-badge result-badge--failed";

    const card = document.createElement("div");
    card.className = "step-card step-card--stuck";
    card.style.animationDelay = "0ms";
    card.innerHTML = `
      <div class="step-num">!</div>
      <div class="step-body">
        <div class="step-row">
          <span style="font-size:0.8rem; color:var(--error);">Greedy could not find a solution.</span>
        </div>
        <div class="step-row">
          <span style="font-size:0.72rem; color:var(--text-subtle);">No coin combination reaches the target.</span>
        </div>
      </div>
    `;
    container.appendChild(card);
    return;
  }

  const parsed = parseGreedySteps(greedy.steps, amount);
  const shown  = parsed.slice(0, MAX_STEPS_SHOWN);
  const hidden = parsed.length - shown.length;

  let stepNum = 0;

  // Reveal steps one at a time for an animated execution feel
  for (let i = 0; i < shown.length; i++) {
    const step = shown[i];
    if (step.type === "select") stepNum++;

    const frag = buildGreedyCard(step, i, stepNum);
    const card = frag.querySelector(".step-card");
    const coin = frag.querySelector(".step-coin");
    if (card) card.style.animationDelay = "0ms";

    container.appendChild(frag);

    // Coin glow effect
    if (coin) coin.classList.add("step-coin--glow");

    // Auto-scroll to reveal the latest step
    container.scrollTop = container.scrollHeight;

    await delay(STEP_DELAY_MS);
  }

  // Done card
  const doneFrag = buildGreedyDoneCard(greedy.count, 0);
  const doneCard = doneFrag.querySelector(".step-card");
  if (doneCard) doneCard.style.animationDelay = "0ms";
  container.appendChild(doneFrag);
  container.scrollTop = container.scrollHeight;

  // Truncation notice
  if (hidden > 0) {
    const notice = document.createElement("div");
    notice.className = "step-truncated";
    notice.textContent = `… and ${hidden} more step${hidden !== 1 ? "s" : ""} not shown`;
    container.appendChild(notice);
  }
}

/**
 * Render the DP reconstruction trace into the exec-flow container.
 *
 * @param {object} dp - DP result from the API.
 */
async function renderDPExecution(dp) {
  const container = document.getElementById("dp-execution");
  container.innerHTML = "";

  const badge = document.getElementById("dp-result-badge");

  if (!dp.solvable) {
    badge.textContent = "Unsolvable";
    badge.className   = "result-badge result-badge--failed";

    const card = document.createElement("div");
    card.className = "step-card step-card--stuck";
    card.style.animationDelay = "0ms";
    card.innerHTML = `
      <div class="step-num">!</div>
      <div class="step-body">
        <div class="step-row">
          <span style="font-size:0.8rem; color:var(--error);">No solution exists for this input.</span>
        </div>
      </div>
    `;
    container.appendChild(card);
    return;
  }

  const parsed = parseDPSteps(dp.steps);
  const shown  = parsed.slice(0, MAX_STEPS_SHOWN);
  const hidden = parsed.length - shown.length;

  let stepNum = 0;

  // Reveal steps one at a time for an animated reconstruction
  for (let i = 0; i < shown.length; i++) {
    const step = shown[i];
    if (step.type === "backtrack") stepNum++;

    const frag = buildDPCard(step, i, stepNum);
    const card = frag.querySelector(".step-card");
    const coin = frag.querySelector(".step-coin");
    if (card) card.style.animationDelay = "0ms";

    container.appendChild(frag);

    // Coin glow effect
    if (coin) coin.classList.add("step-coin--glow");

    // Auto-scroll to reveal the latest step
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
// Result summary header
// ---------------------------------------------------------------------------

/**
 * Render the analysis header: meta info + top-level summary badges.
 *
 * @param {number}   amount
 * @param {number[]} coins
 * @param {object}   greedy
 * @param {object}   dp
 * @param {object}   comparison
 */
function renderAnalysisHeader(amount, coins, greedy, dp, comparison) {
  const sortedCoins = [...coins].sort((a, b) => a - b);
  document.getElementById("result-meta").textContent =
    `Amount: ${amount}   ·   Coins: [${sortedCoins.join(", ")}]`;

  const summary = document.getElementById("result-summary");
  summary.innerHTML = "";

  // Greedy count
  const greedyItem = document.createElement("div");
  greedyItem.className = "summary-item summary-item--greedy stagger-in";
  greedyItem.setAttribute("aria-label", `Greedy used ${greedy.count ?? "no"} coins`);
  greedyItem.innerHTML = `
    <span class="summary-item__value">${greedy.solvable ? greedy.count : "—"}</span>
    <span class="summary-item__label">Greedy Coins</span>
  `;

  // DP count
  const dpItem = document.createElement("div");
  dpItem.className = "summary-item summary-item--dp stagger-in";
  dpItem.setAttribute("aria-label", `DP used ${dp.count ?? "no"} coins`);
  dpItem.innerHTML = `
    <span class="summary-item__value">${dp.solvable ? dp.count : "—"}</span>
    <span class="summary-item__label">DP Coins</span>
  `;

  // Faster algorithm card
  const fasterItem = document.createElement("div");
  const fasterIsGreedy = comparison.faster_algorithm === "greedy";
  fasterItem.className = `summary-item ${fasterIsGreedy ? "summary-item--greedy" : "summary-item--dp"} stagger-in`;
  fasterItem.innerHTML = `
    <span class="summary-item__value" style="font-size:1rem;">${fasterIsGreedy ? "Greedy" : "DP"}</span>
    <span class="summary-item__label">Faster</span>
  `;

  // Verdict badge
  const verdict = document.createElement("div");
  if (comparison.greedy_is_optimal) {
    verdict.className   = "summary-verdict summary-verdict--optimal stagger-in";
    verdict.textContent = "Both Optimal";
  } else if (!greedy.solvable) {
    verdict.className   = "summary-verdict summary-verdict--subopt stagger-in";
    verdict.textContent = "Greedy Failed";
  } else {
    verdict.className   = "summary-verdict summary-verdict--subopt stagger-in";
    verdict.textContent = `DP saves ${comparison.coin_difference} coin${comparison.coin_difference !== 1 ? "s" : ""}`;
  }

  summary.append(greedyItem, dpItem, fasterItem, verdict);

  // Set panel result badges
  const greedyBadge = document.getElementById("greedy-result-badge");
  if (!greedy.solvable) {
    greedyBadge.textContent = "Failed";
    greedyBadge.className   = "result-badge result-badge--failed";
  } else if (comparison.greedy_is_optimal) {
    greedyBadge.textContent = "Optimal";
    greedyBadge.className   = "result-badge result-badge--optimal";
  } else {
    greedyBadge.textContent = "Sub-optimal";
    greedyBadge.className   = "result-badge result-badge--subopt";
  }
}


// ---------------------------------------------------------------------------
// Comparison cards
// ---------------------------------------------------------------------------

/**
 * Render the three comparison cards: Coins Used, Execution Time, Verdict.
 *
 * @param {object} greedy
 * @param {object} dp
 * @param {object} comparison
 */
function renderComparisonCards(greedy, dp, comparison) {
  const container = document.getElementById("comparison-cards");
  container.innerHTML = "";

  // --- Card 1: Coins Used ---
  const greedyWinsCoins = greedy.solvable && dp.solvable && comparison.coin_difference === 0;
  const dpWinsCoins     = comparison.coin_difference > 0;

  const coinsCard = document.createElement("div");
  coinsCard.className = "cmp-card stagger-in";
  coinsCard.innerHTML = `
    <div class="cmp-card__title">Coins Used</div>
    <div class="cmp-values">
      <div class="cmp-value-cell ${!dpWinsCoins && greedy.solvable ? "cmp-value-cell--winner" : ""}">
        <span class="cmp-value-cell__algo cmp-value-cell__algo--greedy">Greedy</span>
        <span class="cmp-value-cell__val">${greedy.solvable ? greedy.count : "—"}</span>
      </div>
      <div class="cmp-value-cell ${dpWinsCoins || (!greedy.solvable && dp.solvable) ? "cmp-value-cell--winner" : ""}">
        <span class="cmp-value-cell__algo cmp-value-cell__algo--dp">DP</span>
        <span class="cmp-value-cell__val">${dp.solvable ? dp.count : "—"}</span>
      </div>
    </div>
    <div class="cmp-footer">${
      !greedy.solvable ? "Greedy found no solution. DP guaranteed the minimum."
      : comparison.coin_difference === 0 ? "Both algorithms found the same minimum."
      : `DP used ${comparison.coin_difference} fewer coin${comparison.coin_difference !== 1 ? "s" : ""}.`
    }</div>
  `;

  // --- Card 2: Execution Time ---
  const greedyFaster = comparison.faster_algorithm === "greedy";
  const dpFaster     = comparison.faster_algorithm === "dynamic_programming";

  const timeCard = document.createElement("div");
  timeCard.className = "cmp-card stagger-in";
  timeCard.innerHTML = `
    <div class="cmp-card__title">Execution Time</div>
    <div class="cmp-values">
      <div class="cmp-value-cell ${greedyFaster ? "cmp-value-cell--winner" : ""}">
        <span class="cmp-value-cell__algo cmp-value-cell__algo--greedy">Greedy</span>
        <span class="cmp-value-cell__val cmp-value-cell__val--mono-sm">${greedy.execution_time_ms}&nbsp;ms</span>
      </div>
      <div class="cmp-value-cell ${dpFaster ? "cmp-value-cell--winner" : ""}">
        <span class="cmp-value-cell__algo cmp-value-cell__algo--dp">DP</span>
        <span class="cmp-value-cell__val cmp-value-cell__val--mono-sm">${dp.execution_time_ms}&nbsp;ms</span>
      </div>
    </div>
    <div class="cmp-footer">${
      greedyFaster
        ? "Greedy is faster — it does not build a DP table."
        : "DP is faster for this input — likely due to a very small DP table."
    }</div>
  `;

  // --- Card 3: Verdict ---
  const verdictCard = document.createElement("div");
  if (comparison.greedy_is_optimal) {
    verdictCard.className = "cmp-card cmp-card--verdict cmp-card--verdict-optimal stagger-in";
    verdictCard.innerHTML = `
      <div class="cmp-card__title">Verdict</div>
      <div class="cmp-verdict-icon" aria-hidden="true">✓</div>
      <div class="cmp-verdict-title" style="color:var(--success);">Greedy is Optimal</div>
      <div class="cmp-verdict-text">Both algorithms found the minimum number of coins for this input.</div>
    `;
  } else if (!greedy.solvable) {
    verdictCard.className = "cmp-card cmp-card--verdict cmp-card--verdict-subopt stagger-in";
    verdictCard.innerHTML = `
      <div class="cmp-card__title">Verdict</div>
      <div class="cmp-verdict-icon" aria-hidden="true">✗</div>
      <div class="cmp-verdict-title" style="color:var(--error);">Greedy Failed</div>
      <div class="cmp-verdict-text">Greedy could not make change for this amount. DP found the optimal solution.</div>
    `;
  } else {
    verdictCard.className = "cmp-card cmp-card--verdict cmp-card--verdict-subopt stagger-in";
    verdictCard.innerHTML = `
      <div class="cmp-card__title">Verdict</div>
      <div class="cmp-verdict-icon" aria-hidden="true">✗</div>
      <div class="cmp-verdict-title" style="color:var(--warning);">Greedy is Sub-optimal</div>
      <div class="cmp-verdict-text">Greedy used ${comparison.coin_difference} extra coin${comparison.coin_difference !== 1 ? "s" : ""}. This coin set is non-canonical.</div>
    `;
  }

  container.append(coinsCard, timeCard, verdictCard);
}


// ---------------------------------------------------------------------------
// Insight cards
// ---------------------------------------------------------------------------

/**
 * Render the insight panel with contextual cards.
 *
 * @param {object} greedy
 * @param {object} dp
 * @param {object} comparison
 */
function renderInsights(greedy, dp, comparison) {
  const container = document.getElementById("insights-grid");
  container.innerHTML = "";

  // --- Main insight: why Greedy succeeded or failed ---
  const mainCard = document.createElement("div");
  const isOptimal = comparison.greedy_is_optimal;
  const isFailed  = !greedy.solvable && dp.solvable;

  mainCard.className = `insight-card stagger-in ${
    isOptimal ? "insight-card--success"
    : isFailed ? "insight-card--neutral"
    : "insight-card--warning"
  }`;

  // Break explanation into structured blocks
  const explanationSentences = comparison.explanation
    .split(/\.\s+/)
    .filter((s) => s.trim().length > 0)
    .map((s) => s.trim().replace(/\.$/, ""));

  const blocksHTML = explanationSentences
    .map((s) => `<div class="insight-block"><span class="insight-block__marker" aria-hidden="true">▸</span><span>${s}.</span></div>`)
    .join("");

  mainCard.innerHTML = `
    <div class="insight-header">
      <span class="insight-icon" aria-hidden="true">${isOptimal ? "✓" : "✗"}</span>
      <span class="insight-title">${
        isOptimal ? "Greedy is Optimal for this input"
        : isFailed ? "Greedy Found No Solution"
        : "Greedy Chose a Sub-optimal Path"
      }</span>
    </div>
    <div class="insight-blocks">${blocksHTML}</div>
  `;

  // --- Performance insight with bars ---
  const greedyDecisions = greedy.steps
    ? greedy.steps.filter((s) => s.includes("Selected")).length
    : 0;

  const dpStates = dp.steps
    ? dp.steps.filter((s) => s.includes("At amount")).length
    : 0;

  const maxTime = Math.max(greedy.execution_time_ms, dp.execution_time_ms, 0.001);
  const greedyPct = Math.round((greedy.execution_time_ms / maxTime) * 100);
  const dpPct     = Math.round((dp.execution_time_ms / maxTime) * 100);

  const perfCard = document.createElement("div");
  perfCard.className = "insight-card insight-card--neutral stagger-in";
  perfCard.innerHTML = `
    <div class="insight-header">
      <span class="insight-icon" aria-hidden="true">⚡</span>
      <span class="insight-title">Performance Summary</span>
    </div>
    <div class="insight-stats">
      <div class="insight-stat">
        <span class="insight-stat__label">Greedy decisions made</span>
        <span class="insight-stat__value insight-stat__value--greedy">${greedyDecisions}</span>
      </div>
      <div class="insight-stat">
        <span class="insight-stat__label">DP reconstruction steps</span>
        <span class="insight-stat__value insight-stat__value--dp">${dpStates}</span>
      </div>
    </div>
    <div class="perf-bars">
      <div class="perf-bar-row">
        <div class="perf-bar-header">
          <span class="perf-bar-algo perf-bar-algo--greedy">Greedy</span>
          <span class="perf-bar-time">${greedy.execution_time_ms} ms</span>
        </div>
        <div class="perf-bar-track">
          <div class="perf-bar-fill perf-bar-fill--greedy" style="width: 0%;" data-target-width="${greedyPct}%"></div>
        </div>
      </div>
      <div class="perf-bar-row">
        <div class="perf-bar-header">
          <span class="perf-bar-algo perf-bar-algo--dp">DP</span>
          <span class="perf-bar-time">${dp.execution_time_ms} ms</span>
        </div>
        <div class="perf-bar-track">
          <div class="perf-bar-fill perf-bar-fill--dp" style="width: 0%;" data-target-width="${dpPct}%"></div>
        </div>
      </div>
    </div>
  `;

  container.append(mainCard, perfCard);

  // Animate bars after a brief delay so the CSS transition triggers
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      perfCard.querySelectorAll(".perf-bar-fill").forEach((bar) => {
        bar.style.width = bar.dataset.targetWidth;
      });
    });
  });
}


// ---------------------------------------------------------------------------
// Complexity section (collapsed)
// ---------------------------------------------------------------------------

/**
 * Populate the collapsed complexity panel.
 *
 * @param {object} complexity - Complexity data from the API.
 */
function renderComplexity(complexity) {
  const container = document.getElementById("complexity-content");
  container.innerHTML = "";

  // Greedy column
  const greedyCol = document.createElement("div");
  greedyCol.className = "complexity-item";
  greedyCol.innerHTML = `
    <div class="complexity-item__algo complexity-item__algo--greedy">Greedy</div>
    <div class="complexity-row">
      <span class="complexity-row__label">Time</span>
      <span class="complexity-row__value">${complexity.greedy.time}</span>
    </div>
    <div class="complexity-row__note">${complexity.greedy.time_note}</div>
    <div class="complexity-row">
      <span class="complexity-row__label">Space</span>
      <span class="complexity-row__value">${complexity.greedy.space}</span>
    </div>
    <div class="complexity-row__note">${complexity.greedy.space_note}</div>
  `;

  // DP column
  const dpCol = document.createElement("div");
  dpCol.className = "complexity-item";
  dpCol.innerHTML = `
    <div class="complexity-item__algo complexity-item__algo--dp">Dynamic Programming</div>
    <div class="complexity-row">
      <span class="complexity-row__label">Time</span>
      <span class="complexity-row__value">${complexity.dynamic_programming.time}</span>
    </div>
    <div class="complexity-row__note">${complexity.dynamic_programming.time_note}</div>
    <div class="complexity-row">
      <span class="complexity-row__label">Space</span>
      <span class="complexity-row__value">${complexity.dynamic_programming.space}</span>
    </div>
    <div class="complexity-row__note">${complexity.dynamic_programming.space_note}</div>
  `;

  container.append(greedyCol, dpCol);
}


// ---------------------------------------------------------------------------
// Top-level render entry point
// ---------------------------------------------------------------------------

/**
 * Render the complete results view from the API response.
 * Called by main.js after a successful 200 response.
 *
 * @param {object}   data   - Full API response body.
 * @param {number}   amount - Submitted amount.
 * @param {number[]} coins  - Submitted coin denominations.
 */
async function renderAll(data, amount, coins) {
  const { greedy, dynamic_programming: dp, comparison, complexity } = data;

  // Identify the post-execution sections to hide until traces are done
  const compSection  = document.getElementById("comparison-cards").closest(".section-block");
  const insSection   = document.getElementById("insights-grid").closest(".section-block");
  const cmpxSection  = document.getElementById("complexity-details");

  // Hide post-execution sections immediately
  [compSection, insSection, cmpxSection].forEach((el) => {
    el.style.opacity    = "0";
    el.style.transform  = "translateY(16px)";
    el.style.transition = "none";
  });

  // 1. Render analysis header (summary badges) immediately
  renderAnalysisHeader(amount, coins, greedy, dp, comparison);

  // 2. Animate Greedy execution step-by-step
  await renderGreedyExecution(greedy, amount);

  await delay(350);

  // 3. Animate DP reconstruction step-by-step
  await renderDPExecution(dp);

  await delay(350);

  // 4. Reveal comparison cards
  renderComparisonCards(greedy, dp, comparison);
  await revealSection(compSection);

  await delay(200);

  // 5. Reveal insights
  renderInsights(greedy, dp, comparison);
  await revealSection(insSection);

  await delay(200);

  // 6. Reveal complexity
  renderComplexity(complexity);
  document.getElementById("complexity-details").removeAttribute("open");
  await revealSection(cmpxSection);
}

export { renderAll };
