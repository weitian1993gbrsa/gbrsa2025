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
      window.technicalSpace  = 0;   // ⭐ NEW

      const missEl  = document.getElementById("missCount");
      const breakEl = document.getElementById("breakCount");
      const spaceEl = document.getElementById("spaceCount");  // ⭐ NEW

      const missBtn  = document.querySelector("[data-type='miss']");
      const breakBtn = document.querySelector("[data-type='break']");
      const spaceBtn = document.getElementById("spaceBtn");   // ⭐ NEW

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

      // ⭐ SPACE VIOLATION
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
        SPACE:  window.technicalSpace    // ⭐ NEW
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
     PRESENTATION — Page 1 + Page 2
  ------------------------------------------------------------ */
  JudgeForms.presentation = {

    WEIGHTS: {
      creativity: 0.15,
      musicality: 0.20,
      entertainment: 0.25,
      form: 0.25,
      variety: 0.15
    },

    page1Data: {
      creMinus: 0, crePlus: 0,
      musMinus: 0, musPlus: 0,
      entMinus: 0, entPlus: 0,
      formMinus: 0, formPlus: 0,
      varMinus: 0, varPlus: 0,
      misses: 0
    },

    init() {
      const isPage2 = document.body.dataset.page === "presentation-summary";
      if (isPage2) this.initPage2();
      else this.initPage1();
    },

    /* ---------------------- PAGE 1 ---------------------- */
    initPage1() {

      const undoBtn = document.getElementById("undoBtn");
      undoBtn.classList.add("hidden");

      // ALWAYS RESET
      this.page1Data = {
        creMinus: 0, crePlus: 0,
        musMinus: 0, musPlus: 0,
        entMinus: 0, entPlus: 0,
        formMinus: 0, formPlus: 0,
        varMinus: 0, varPlus: 0,
        misses: 0
      };

      const currentEntry = JSON.parse(localStorage.getItem("currentEntry") || "{}");
      localStorage.setItem("lastPresentationEntry", JSON.stringify(currentEntry));

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

      ids.forEach((id,i)=>{ document.getElementById(id).textContent = vals[i]; });

      /* BUTTON MAPPING */
      const map = {
        "creativity-minus": "creMinus",
        "creativity-plus": "crePlus",
        "musicality-minus": "musMinus",
        "musicality-plus": "musPlus",
        "entertain-minus": "entMinus",
        "entertain-plus": "entPlus",
        "form-minus": "formMinus",
        "form-plus": "formPlus",
        "variety-minus": "varMinus",
        "variety-plus": "varPlus"
      };

      Object.keys(map).forEach(type => {
        const btn = document.querySelector(`[data-type='${type}']`);
        if (!btn) return;
        const key = map[type];
        const lbl = document.getElementById(key);

        btn.addEventListener("pointerdown", () => {
          this.page1Data[key]++;
          lbl.textContent = this.page1Data[key];

          this.lastAction = { field: key };
          undoBtn.classList.remove("hidden");
          if (navigator.vibrate) navigator.vibrate([40]);
        });
      });

      /* MISSES */
      const missBtn = document.getElementById("missBtn");
      const missLbl = document.getElementById("missCount");

      missBtn.addEventListener("pointerdown", () => {
        this.page1Data.misses++;
        missLbl.textContent = this.page1Data.misses;
        this.lastAction = { field: "misses" };
        undoBtn.classList.remove("hidden");
        if (navigator.vibrate) navigator.vibrate([40]);
      });

      /* UNDO */
      undoBtn.addEventListener("click", () => {
        if (!this.lastAction) return;

        const f = this.lastAction.field;
        this.page1Data[f]--;
        if (this.page1Data[f] < 0) this.page1Data[f] = 0;

        if (f === "misses") missLbl.textContent = this.page1Data.misses;
        else document.getElementById(f).textContent = this.page1Data[f];

        this.lastAction = null;
        undoBtn.classList.add("hidden");
        if (navigator.vibrate) navigator.vibrate([60,40]);
      });

      /* NEXT → Summary page */
      document.getElementById("nextBtn").addEventListener("click", () => {
        localStorage.setItem("presentationPage1", JSON.stringify(this.page1Data));
        window.location.href = "freestyle-presentation summary.html" + location.search;
      });
    },

    /* ---------------------- PAGE 2 ---------------------- */
    initPage2() {
      console.log("[Presentation] Page 2 Init");
      const d = JSON.parse(localStorage.getItem("presentationPage1") || "{}");
      this.page1Data = d;
      this.finalScore = this.computeWeightedScore(d);
    },

    computeWeightedScore(d) {

      let sum =
        (12 + d.crePlus - d.creMinus) * this.WEIGHTS.creativity +
        (12 + d.musPlus - d.musMinus) * this.WEIGHTS.musicality +
        (12 + d.entPlus - d.entMinus) * this.WEIGHTS.entertainment +
        (12 + d.formPlus - d.formMinus) * this.WEIGHTS.form +
        (12 + d.varPlus - d.varMinus) * this.WEIGHTS.variety;

      sum -= d.misses;
      return Number(sum.toFixed(1));
    },

    getScore() {
      return { PRESENTATION: this.finalScore || 0 };
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
