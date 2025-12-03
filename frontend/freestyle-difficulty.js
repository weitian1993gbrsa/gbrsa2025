(function () {
  // IJRU difficulty point values
  const levelPoints = {
    0:   0.00,
    0.5: 0.12,
    1:   0.15,
    2:   0.23,
    3:   0.34,
    4:   0.51,
    5:   0.76,
    6:   1.14,
    7:   1.71,
    8:   2.56
  };

  const buttons     = document.querySelectorAll(".skill-btn");
  const totalScoreEl= document.getElementById("totalScore");
  const undoBtn     = document.getElementById("btnUndo");
  const resetBtn    = document.getElementById("btnReset");
  const submitBtn   = document.getElementById("btnSubmit");

  const counts = {};
  buttons.forEach(btn => {
    const level = btn.dataset.level;
    counts[level] = 0;
  });

  let lastAction = null; // e.g. "4", "0.5"

  function updateUI() {
    let total = 0;

    buttons.forEach(btn => {
      const level = btn.dataset.level;
      const count = counts[level] || 0;
      btn.querySelector(".skill-count").textContent = count;
      total += count * (levelPoints[level] || 0);
    });

    totalScoreEl.textContent = `Total: ${total.toFixed(2)}`;
  }

  // Tap to add skill
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const level = btn.dataset.level;
      counts[level] = (counts[level] || 0) + 1;
      lastAction = level; // only remember the last tap
      updateUI();
    });
  });

  // Single-step undo
  undoBtn.addEventListener("click", () => {
    if (!lastAction) return;
    if (counts[lastAction] > 0) {
      counts[lastAction]--;
    }
    lastAction = null;
    updateUI();
  });

  // Reset all
  resetBtn.addEventListener("click", () => {
    Object.keys(counts).forEach(k => counts[k] = 0);
    lastAction = null;
    updateUI();
  });

  // Submit placeholder (hook to backend later)
  submitBtn.addEventListener("click", () => {
    // later: send counts + total to Apps Script
    alert("Submit difficulty: backend hookup coming later.");
  });

  // Initial paint
  updateUI();
})();
