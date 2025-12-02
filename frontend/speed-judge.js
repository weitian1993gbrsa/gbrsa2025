/* ============================================================
   NUMBERPAD + SCORE SCREEN (MAX 3 DIGITS)
============================================================ */
const scoreScreen = $("#scoreScreen");
const hiddenScore = $("#hiddenScore");

const numButtons = document.querySelectorAll(".numpad-grid button");

numButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;

    // CLEAR
    if (key === "clear") {
      scoreScreen.textContent = "0";
      hiddenScore.value = "";
      return;
    }

    // ENTER → submit
    if (key === "enter") {
      const form = $("#scoreForm");
      form.dispatchEvent(new Event("submit"));
      return;
    }

    // DIGITS 0–9 with MAX LENGTH = 3
    if (/^[0-9]$/.test(key)) {
      let current = scoreScreen.textContent.trim();

      // If current already has 3 digits → stop
      if (current.length >= 3) return;

      // Replace leading zero
      if (current === "0") {
        scoreScreen.textContent = key;
      } else {
        scoreScreen.textContent = current + key;
      }

      hiddenScore.value = scoreScreen.textContent;
    }
  });
});
