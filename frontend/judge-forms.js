/* ============================================================
   JUDGE FORMS — Scoring Logic for ALL Judge Types
   Used by judge-core.js
   - Speed
   - Difficulty
   - Technical
   - RE
   - Presentation
============================================================ */

(function () {

  window.JudgeForms = {};

  /* ------------------------------------------------------------
     SPEED JUDGE
  ------------------------------------------------------------ */
  JudgeForms.speed = {
    init() {
      console.log("[JudgeForms] SPEED init");

      this.scoreScreen   = document.querySelector("#scoreScreen");
      this.falseStartBtn = document.querySelector("#falseStartBtn");
      this.falseStartVal = document.querySelector("#falseStartVal");
      this.numpadButtons = document.querySelectorAll(".numpad-grid button");

      const MAX_DIGITS = 3;

      // FALSE START TOGGLE
      this.falseStartBtn.addEventListener("click", () => {
        if (this.falseStartVal.value === "YES") {
          this.falseStartVal.value = "";
          this.falseStartBtn.textContent = "False Start: No";
          this.falseStartBtn.classList.remove("fs-yes");
          this.falseStartBtn.classList.add("fs-no");
        } else {
          this.falseStartVal.value = "YES";
          this.falseStartBtn.textContent = "False Start: Yes";
          this.falseStartBtn.classList.remove("fs-no");
          this.falseStartBtn.classList.add("fs-yes");
        }
        if (navigator.vibrate) navigator.vibrate([80]);
      });

      // NUMPAD
      this.numpadButtons.forEach(btn => {
        const key = btn.dataset.key;
        if (!key) return;

        btn.addEventListener("pointerdown", () => {

          if (key === "clear") {
            this.scoreScreen.textContent = "0";
            if (navigator.vibrate) navigator.vibrate([80]);
            return;
          }

          let current = this.scoreScreen.textContent.trim();

          if (current === "0") current = "";
          if (current.length >= MAX_DIGITS) return;

          this.scoreScreen.textContent = current + key;
          if (navigator.vibrate) navigator.vibrate([40]);
        });
      });
    },

    getScore() {
      return {
        SCORE: Number(this.scoreScreen?.textContent || 0),
        "FALSE START": this.falseStartVal?.value || ""
      };
    }
  };


  /* ------------------------------------------------------------
     DIFFICULTY
  ------------------------------------------------------------ */
  JudgeForms.difficulty = {

    POINTS: {
      "0.5": 0.12, "1": 0.15, "2": 0.23, "3": 0.34,
      "4": 0.51, "5": 0.76, "6": 1.14, "7": 1.71, "8": 2.56
    },

    counts: { "0.5":0, "1":0, "2":0, "3":0, "4":0, "5":0, "6":0, "7":0, "8":0 },
    lastAction: null,

    init() {
      console.log("[JudgeForms] DIFFICULTY init");

      this.totalScoreEl = document.querySelector("#totalScore");
      this.undoBtn = document.querySelector("#undoBtn");
      this.resetBtn = document.querySelector("#resetBtn");

      // Mirror RE behavior: Undo is hidden until an action happens.
      if (this.undoBtn) this.undoBtn.classList.add("hidden");

      // SKILL BUTTONS
      document.querySelectorAll(".skill-btn").forEach(btn => {
        btn.addEventListener("pointerdown", () => {
          const lvl = btn.dataset.level;

          this.lastAction = { level: lvl, prev: this.counts[lvl] };
          this.counts[lvl]++;

          this.updateUI();

          if (this.undoBtn) this.undoBtn.classList.remove("hidden");

          if (navigator.vibrate) navigator.vibrate([40]);
          btn.classList.add("pressed");
          setTimeout(() => btn.classList.remove("pressed"), 150);
        }, { passive: true });
      });

      // UNDO (one-step)
      const undoHandler = () => {
        if (!this.lastAction) return;

        this.counts[this.lastAction.level] = this.lastAction.prev;
        this.lastAction = null;

        this.updateUI();

        if (this.undoBtn) this.undoBtn.classList.add("hidden");

        if (navigator.vibrate) navigator.vibrate([60, 40]);
      };

      if (this.undoBtn) this.undoBtn.addEventListener("pointerdown", undoHandler);

      // RESET
      const resetHandler = () => {
        for (let lvl in this.counts) this.counts[lvl] = 0;
        this.lastAction = null;

        this.updateUI();

        if (this.undoBtn) this.undoBtn.classList.add("hidden");

        if (navigator.vibrate) navigator.vibrate([120]);
      };

      if (this.resetBtn) this.resetBtn.addEventListener("pointerdown", resetHandler);

      this.updateUI();
    },

    updateUI() {
      for (const lvl in this.counts) {
        const id = "#count" + lvl.replace(".", "");
        const el = document.querySelector(id);
        if (el) el.textContent = this.counts[lvl];
      }

      let total = 0;
      for (const lvl in this.counts) total += this.counts[lvl] * this.POINTS[lvl];
      this.totalScoreEl.textContent = total.toFixed(2);
    },

    getScore() {
      return { DIFF: Number(this.totalScoreEl?.textContent || 0) };
    }
  };


  /* ------------------------------------------------------------
     TECHNICAL (with SPACE VIOLATION)
  ------------------------------------------------------------ */
  JudgeForms.technical = {

    lastAction: null,

    init() {
      console.log("[JudgeForms] TECH init");

      // Counters
      window.technicalMisses = 0;
      window.technicalBreaks = 0;
      window.technicalSpace  = 0;

      const missEl  = document.getElementById("missCount");
      const breakEl = document.getElementById("breakCount");
      const spaceEl = document.getElementById("spaceCount");

      const missBtn  = document.querySelector("[data-type='miss']");
      const breakBtn = document.querySelector("[data-type='break']");
      const spaceBtn = document.getElementById("spaceBtn");

      const undoBtn  = document.getElementById("undoBtn");
      const resetBtn = document.getElementById("resetBtn");

      undoBtn.classList.add("hidden");

      function snapshot() {
        return {
          prevMiss: window.technicalMisses,
          prevBreak: window.technicalBreaks,
          prevSpace: window.technicalSpace
        };
      }

      // MISS
      missBtn.addEventListener("pointerdown", () => {
        this.lastAction = snapshot();

        window.technicalMisses++;
        missEl.textContent = window.technicalMisses;

        undoBtn.classList.remove("hidden");
        if (navigator.vibrate) navigator.vibrate([40]);
      });

      // BREAK
      breakBtn.addEventListener("pointerdown", () => {
        this.lastAction = snapshot();

        window.technicalBreaks++;
        breakEl.textContent = window.technicalBreaks;

        undoBtn.classList.remove("hidden");
        if (navigator.vibrate) navigator.vibrate([40]);
      });

      // SPACE VIOLATION
      spaceBtn.addEventListener("pointerdown", () => {
        this.lastAction = snapshot();

        window.technicalSpace++;
        spaceEl.textContent = window.technicalSpace;

        undoBtn.classList.remove("hidden");
        if (navigator.vibrate) navigator.vibrate([40]);
      });

      // UNDO
      undoBtn.addEventListener("click", () => {
        if (!this.lastAction) return;

        window.technicalMisses = this.lastAction.prevMiss;
        window.technicalBreaks = this.lastAction.prevBreak;
        window.technicalSpace  = this.lastAction.prevSpace;

        missEl.textContent  = window.technicalMisses;
        breakEl.textContent = window.technicalBreaks;
        spaceEl.textContent = window.technicalSpace;

        undoBtn.classList.add("hidden");
        this.lastAction = null;

        if (navigator.vibrate) navigator.vibrate([60,40]);
      });

      // RESET
      resetBtn.addEventListener("click", () => {
        window.technicalMisses = 0;
        window.technicalBreaks = 0;
        window.technicalSpace  = 0;

        missEl.textContent  = 0;
        breakEl.textContent = 0;
        spaceEl.textContent = 0;

        undoBtn.classList.add("hidden");
        this.lastAction = null;

        if (navigator.vibrate) navigator.vibrate([120]);
      });
    },

    getScore() {
      return {
        MISSES: window.technicalMisses,
        BREAKS: window.technicalBreaks,
        SPACE:  window.technicalSpace
      };
    }
  };


  /* ------------------------------------------------------------
     RE
  ------------------------------------------------------------ */
  JudgeForms.re = {

    init() {
      console.log("[JudgeForms] RE init");
      if (window.reMiss == null) window.reMiss = 0;
    },

    getScore() {
      return { MISSRE: window.reMiss };
    }
  };


  /* ------------------------------------------------------------
     PRESENTATION — Page 1 (merged version uses Page 2 in HTML)
     - Always resets on page load (same behavior as other judge pages)
     - Updates Score/Miss bar if those elements exist
  ------------------------------------------------------------ */
  JudgeForms.presentation = {

    WEIGHTS: { cre:.15, mus:.20, ent:.25, form:.25, var:.15 },

    page1Data: {
      creMinus: 0, crePlus: 0,
      musMinus: 0, musPlus: 0,
      entMinus: 0, entPlus: 0,
      formMinus: 0, formPlus: 0,
      varMinus: 0, varPlus: 0,
      misses: 0
    },

    lastAction: null,

    init() {
      this.initPage1();
      this.updateTotalsUI();
    },

    clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); },

    computePage1Score() {
      const d = this.page1Data;

      const cre  = this.clamp(12 + d.crePlus  - d.creMinus,  0, 24);
      const mus  = this.clamp(12 + d.musPlus  - d.musMinus,  0, 24);
      const ent  = this.clamp(12 + d.entPlus  - d.entMinus,  0, 24);
      const form = this.clamp(12 + d.formPlus - d.formMinus, 0, 24);
      const vari = this.clamp(12 + d.varPlus  - d.varMinus,  0, 24);

      let sum =
        (cre  * this.WEIGHTS.cre)  +
        (mus  * this.WEIGHTS.mus)  +
        (ent  * this.WEIGHTS.ent)  +
        (form * this.WEIGHTS.form) +
        (vari * this.WEIGHTS.var);

      sum -= (d.misses || 0);
      return Number(sum.toFixed(2));
    },

    updateTotalsUI() {
      const scoreEl = document.getElementById("scoreText");
      const missEl  = document.getElementById("missText");

      if (missEl) missEl.textContent = `Misses (${this.page1Data.misses || 0})`;
      if (scoreEl) scoreEl.textContent = `Score (${this.computePage1Score().toFixed(2)})`;
    },

    initPage1() {
      console.log("[JudgeForms] PRESENTATION init (Page 1)");

      const undoBtn  = document.getElementById("undoBtn");
      const resetBtn = document.getElementById("resetBtn");

      if (undoBtn) undoBtn.classList.add("hidden");

      // ALWAYS RESET
      this.page1Data = {
        creMinus: 0, crePlus: 0,
        musMinus: 0, musPlus: 0,
        entMinus: 0, entPlus: 0,
        formMinus: 0, formPlus: 0,
        varMinus: 0, varPlus: 0,
        misses: 0
      };
      this.lastAction = null;

      // Render initial counters
      const ids = [
        "creMinus","crePlus","musMinus","musPlus",
        "entMinus","entPlus","formMinus","formPlus",
        "varMinus","varPlus","missCount"
      ];
      const d = this.page1Data;
      const vals = [
        d.creMinus, d.crePlus, d.musMinus, d.musPlus,
        d.entMinus, d.entPlus, d.formMinus, d.formPlus,
        d.varMinus, d.varPlus, d.misses
      ];
      ids.forEach((id,i)=>{
        const el = document.getElementById(id);
        if (el) el.textContent = vals[i];
      });

      // Button mapping for +/-
      const map = {
        "creativity-minus": "creMinus",
        "creativity-plus":  "crePlus",
        "musicality-minus": "musMinus",
        "musicality-plus":  "musPlus",
        "entertain-minus":  "entMinus",
        "entertain-plus":   "entPlus",
        "form-minus":       "formMinus",
        "form-plus":        "formPlus",
        "variety-minus":    "varMinus",
        "variety-plus":     "varPlus"
      };

      Object.keys(map).forEach(type => {
        const btn = document.querySelector(`[data-type='${type}']`);
        if (!btn) return;

        const key = map[type];
        const lbl = document.getElementById(key);

        btn.addEventListener("pointerdown", () => {
          this.page1Data[key]++;
          if (lbl) lbl.textContent = this.page1Data[key];

          this.lastAction = { field: key };
          if (undoBtn) undoBtn.classList.remove("hidden");

          this.updateTotalsUI();
          if (navigator.vibrate) navigator.vibrate([40]);
        });
      });

      // MISSES
      const missBtn = document.getElementById("missBtn");
      const missLbl = document.getElementById("missCount");

      if (missBtn) {
        missBtn.addEventListener("pointerdown", () => {
          this.page1Data.misses++;
          if (missLbl) missLbl.textContent = this.page1Data.misses;

          this.lastAction = { field: "misses" };
          if (undoBtn) undoBtn.classList.remove("hidden");

          this.updateTotalsUI();
          if (navigator.vibrate) navigator.vibrate([40]);
        });
      }

      // UNDO (Page 1)
      if (undoBtn) {
        undoBtn.addEventListener("click", () => {
          if (!this.lastAction) return;

          const f = this.lastAction.field;
          this.page1Data[f]--;
          if (this.page1Data[f] < 0) this.page1Data[f] = 0;

          if (f === "misses") {
            if (missLbl) missLbl.textContent = this.page1Data.misses;
          } else {
            const el = document.getElementById(f);
            if (el) el.textContent = this.page1Data[f];
          }

          this.lastAction = null;
          undoBtn.classList.add("hidden");

          this.updateTotalsUI();
          if (navigator.vibrate) navigator.vibrate([60,40]);
        });
      }

      // RESET (Page 1)
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          for (const k in this.page1Data) this.page1Data[k] = 0;
          this.lastAction = null;

          ids.forEach((id)=>{
            const el = document.getElementById(id);
            if (el) el.textContent = 0;
          });

          if (undoBtn) undoBtn.classList.add("hidden");
          this.updateTotalsUI();

          if (navigator.vibrate) navigator.vibrate([120]);
        });
      }
    },

    // Legacy compatibility
    getScore() {
      return { PRESENTATION: this.computePage1Score() };
    }
  };


  /* ------------------------------------------------------------
     AUTO INIT WRAPPER
  ------------------------------------------------------------ */
  window.initJudgeForm = function (judgeType) {
    const block = JudgeForms[judgeType];
    if (!block) return null;
    if (typeof block.init === "function") block.init();
    return block;
  };

})();
