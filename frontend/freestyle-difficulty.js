// ============================================================
//  FREESTYLE DIFFICULTY — FINAL UPDATED JS (2025)
//  Supports:
//   - Tap to increase count
//   - Single-step undo
//   - Reset
//   - Live scoring
// ============================================================

// IJRU Difficulty Point Table
const DIFF_POINTS = {
  0.5: 0.12,
  1: 0.15,
  2: 0.23,
  3: 0.34,
  4: 0.51,
  5: 0.76,
  6: 1.14,
  7: 1.71,
  8: 2.56
};

// Track counts for each level
const countMap = {
  "0.5": 0,
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
  "6": 0,
  "7": 0,
  "8": 0
};

// Store the last tap for UNDO
let lastAction = null;

// DOM elements
const totalScoreEl = document.getElementById("totalScore");
const undoBtn = document.getElementById("btnUndo");
const resetBtn = document.getElementById("btnReset");
const skillButtons = document.querySelectorAll(".skill-btn");


// ============================================================
//  ADD TAP HANDLERS
// ============================================================
skillButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const level = btn.dataset.level;
    countMap[level]++;

    // Save undo
    lastAction = { level: level };

    updateUI();
  });
});


// ============================================================
//  UPDATE UI
// ============================================================
function updateUI() {
  // Update counts on each button
  skillButtons.forEach(btn => {
    const level = btn.dataset.level;
    const count = countMap[level];

    btn.querySelector(".count").textContent = count;
  });

  // Recalculate score
  let total = 0;
  for (const level in countMap) {
    const c = countMap[level];
    const pts = DIFF_POINTS[level];
    total += c * pts;
  }

  // Update score display
  totalScoreEl.textContent = total.toFixed(2);
}


// ============================================================
//  UNDO (single-step)
// ============================================================
undoBtn.addEventListener("click", () => {
  if (!lastAction) return;

  const lvl = lastAction.level;

  if (countMap[lvl] > 0) {
    countMap[lvl]--;
  }

  // clear undo history
  lastAction = null;

  updateUI();
});


// ============================================================
//  RESET
// ============================================================
resetBtn.addEventListener("click", () => {
  for (const lvl in countMap) {
    countMap[lvl] = 0;
  }
  lastAction = null;
  updateUI();
});


// INITIAL DISPLAY UPDATE
updateUI();
