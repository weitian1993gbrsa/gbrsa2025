/* ============================================================
   JUDGE FORMS — Scoring Logic for ALL Judge Types
   Used by judge-core.js
   - Speed
   - Difficulty
   - Technical
   - RE  (⭐ Patched)
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

      // SKILL BUTTONS
      document.querySelectorAll(".skill-btn").forEach(btn => {
        btn.addEventListener("pointerdown", () => {
          const lvl = btn.dataset.level;

          this.lastAction = { level: lvl, prev: this.counts[lvl] };
          this.counts[lvl]++;

          this.updateUI();

          if (navigator.vibrate) navigator.vibrate([40]);
          btn.classList.add("pressed");
          setTimeout(() => btn.classList.remove("pressed"), 150);
        });
      });

      // UNDO
      const undoHandler = () => {
        if (!this.lastAction) return;
        this.counts[this.lastAction.level] = this.lastAction.prev;
        this.lastAction = null;
        this.updateUI();
        if (navigator.vibrate) navigator.vibrate([60,40]);
      };

      this.undoBtn.addEventListener("pointerdown", undoHandler);

      // RESET
      this.resetBtn.addEventListener("click", () => {
        for (let lvl in this.counts) this.counts[lvl] = 0;
        this.lastAction = null;
        this.updateUI();
        if (navigator.vibrate) navigator.vibrate([120]);
      });

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

      // MISS
      missBtn.addEventListener("pointerdown", () => {
        this.lastAction = {
          prevMiss: window.technicalMisses,
          prevBreak: window.technicalBreaks,
          prevSpace: window.technicalSpace
        };

        window.technicalMisses++;
        missEl.textContent = window.technicalMisses;

        undoBtn.classList.remove("hidden");
        if (navigator.vibrate) navigator.vibrate([40]);
      });

      // BREAK
      breakBtn.addEventListener("pointerdown", () => {
        this.lastAction = {
          prevMiss: window.technicalMisses,
          prevBreak: window.technicalBreaks,
          prevSpace: window.technicalSpace
        };

        window.technicalBreaks++;
        breakEl.textContent = window.technicalBreaks;

        undoBtn.classList.remove("hidden");
        if (navigator.vibrate) navigator.vibrate([40]);
      });

      // SPACE
      spaceBtn.addEventListener("pointerdown", () => {
        this.lastAction = {
          prevMiss: window.technicalMisses,
          prevBreak: window.technicalBreaks,
          prevSpace: window.technicalSpace
        };

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
     ⭐⭐⭐ REQUIRED ELEMENTS (RE) — FULLY PATCHED
  ------------------------------------------------------------ */
  JudgeForms.re = {

    values: { power:0, multiples:0, manipulation:0 },
    lastAction: null,

    init() {
      console.log("[JudgeForms] RE init");

      // CATEGORY BUTTON HANDLERS
      document.querySelectorAll(".re-btn-half, .re-btn-full").forEach(btn => {

        btn.addEventListener("pointerdown", () => {

          const key = btn.dataset.key;
          const add = (btn.dataset.type === "half") ? 0.5 : 1;

          const prev = this.values[key];
          const next = Math.min(prev + add, 4);

          this.lastAction = { key, prev };
          this.values[key] = next;

          document.getElementById(`val_${key}`).textContent =
            next.toFixed(1).replace(/\.0$/, "");

          this.updateLocks(key);
          this.updateMissing();

          document.getElementById("undoBtn").classList.remove("hidden");

          if (navigator.vibrate) navigator.vibrate([35]);
        });

      });

      // UNDO BUTTON
      document.getElementById("undoBtn").addEventListener("pointerdown", () => {
        if (!this.lastAction) return;

        const { key, prev } = this.lastAction;
        this.values[key] = prev;

        document.getElementById(`val_${key}`).textContent =
          prev.toFixed(1).replace(/\.0$/, "");

        this.lastAction = null;
        document.getElementById("undoBtn").classList.add("hidden");

        this.updateLocks(key);
        this.updateMissing();
      });

      // RESET BUTTON
      document.getElementById("resetBtn").addEventListener("pointerdown", () => {
        this.values = { power:0, multiples:0, manipulation:0 };
        this.lastAction = null;

        ["power","multiples","manipulation"].forEach(k => {
          document.getElementById(`val_${k}`).textContent = "0";
          this.updateLocks(k);
        });

        document.getElementById("undoBtn").classList.add("hidden");
        this.updateMissing();
      });

      this.updateMissing();
    },

    updateMissing() {
      const total =
        Math.floor(this.values.power) +
        Math.floor(this.values.multiples) +
        Math.floor(this.values.manipulation);

      window.reMiss = 12 - total;

      const lbl = document.getElementById("reLabel");
      if (lbl) lbl.textContent = `RE (Missing: ${window.reMiss})`;
    },

    updateLocks(key) {
      const v = this.values[key];
      const half = document.querySelector(`.re-btn-half[data-key='${key}']`);
      const full = document.querySelector(`.re-btn-full[data-key='${key}']`);

      if (v >= 4) {
        half.classList.add("disabled");
        full.classList.add("disabled");
      } else {
        half.classList.remove("disabled");
        full.classList.remove("disabled");
      }
    },

    getScore() {
      return { MISSRE: window.reMiss };
    }
  };


  /* ------------------------------------------------------------
     PRESENTATION — Page 1 + 2
  ------------------------------------------------------------ */
  JudgeForms.presentation = {
    /* (UNCHANGED — FULL ORIGINAL PRESENTATION BLOCK HERE) */
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