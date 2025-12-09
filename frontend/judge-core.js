/* ============================================================
   JUDGE CORE — Universal Submit Handler (Speed + Freestyle)
   + Fullscreen Wrapper (Adaptive width, no-scroll, auto-shrink)
============================================================ */

(function () {

  const $ = (q, el = document) => el.querySelector(q);

  /* ============================================================
     🔥 UNIVERSAL FULLSCREEN LAYOUT ENGINE (OPTION C — ADAPTIVE)
     - Phones:       max-width: 650px
     - Small Tablet: max-width: 900px
     - Large Tablet: max-width: 1100px
     - Removes page scroll
     - Auto-shrinks UI if device is short
  ============================================================ */

  function injectFullscreenLayout() {

    // Avoid double injection
    if (document.querySelector(".judge-wrapper")) return;

    /* ---------- Inject Global CSS ---------- */
    const css = `
        html, body {
            margin:0; padding:0;
            height:100%;
            overflow:hidden;           /* 🔥 No scrolling */
            background:#e9e9e9;
            font-family:system-ui,sans-serif;
            -webkit-user-select:none;
            user-select:none;
        }

        * { -webkit-tap-highlight-color:transparent; }

        .judge-wrapper {
            width:100%;
            max-width:650px;           /* 🔥 Default (phones) */
            height:100%;
            margin:0 auto;
            background:white;
            display:flex;
            flex-direction:column;
            box-shadow:0 0 14px rgba(0,0,0,0.22);
            transform-origin: top center;
        }

        /* 🔥 Adaptive width (Option C) */
        @media (min-width:800px) {
            .judge-wrapper { max-width:900px; }
        }
        @media (min-width:1200px) {
            .judge-wrapper { max-width:1100px; }
        }

        /* 🔥 Auto-Shrink for short screens */
        @media (max-height:700px) {
            .judge-wrapper { transform:scale(0.92); }
        }
        @media (max-height:620px) {
            .judge-wrapper { transform:scale(0.85); }
        }
        @media (max-height:560px) {
            .judge-wrapper { transform:scale(0.78); }
        }

        .judge-content {
            flex:1;
            overflow:hidden;           /* NO scrolling */
            display:block;
        }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    /* ---------- Wrap Page Content ---------- */
    const wrapper = document.createElement("div");
    wrapper.className = "judge-wrapper";

    const content = document.createElement("div");
    content.className = "judge-content";

    // Move everything except <script> into wrapper
    [...document.body.children].forEach(el => {
        if (el.tagName !== "SCRIPT") content.appendChild(el);
    });

    wrapper.appendChild(content);
    document.body.prepend(wrapper);
  }

  document.addEventListener("DOMContentLoaded", injectFullscreenLayout);



  /* ============================================================
     ORIGINAL JUDGE-CORE LOGIC (unchanged)
  ============================================================ */

  window.JudgeCore = {

    init(config) {
      this.config = config;

      const qs = new URLSearchParams(location.search);
      this.station = qs.get("station");
      this.key = qs.get("key");
      this.judgeType = config.judgeType || qs.get("judgeType") || "speed";

      /* SECURITY CHECK */
      const access = window.JUDGE_KEYS[this.key];
      if (!access || access.event !== this.getEventType() || String(access.station) !== this.station) {
        document.body.innerHTML = `
          <div style="padding:2rem;text-align:center;">
            <h2 style="color:#b00020;">Access Denied</h2>
            <p>Unauthorized judge key</p>
          </div>`;
        return;
      }

      this.qs = qs;

      /* SUBMIT OVERLAY */
      this.overlay = $("#submitOverlay");
      this.overlayText = $("#overlayText");

      /* SUBMIT BUTTON */
      if (config.submitButton) {
        config.submitButton.addEventListener("click", () => this.submit());
      }

      console.log("[JudgeCore] Initialized:", this.judgeType);
    },

    getEventType() {
      const info = window.JUDGE_KEYS[this.key];
      return info?.event || "speed";
    },

    buildBasePayload() {
      const remarkInput = document.querySelector('[name="REMARK"]');
      const remarkValue = remarkInput ? remarkInput.value.trim() : "";

      return {
        judgeType: this.judgeType,
        ID: this.qs.get("id") || "",
        NAME1: this.qs.get("name1") || "",
        TEAM: this.qs.get("team") || "",
        STATE: this.qs.get("state") || "",
        HEAT: this.qs.get("heat") || "",
        STATION: this.station,
        EVENT: this.qs.get("event") || "",
        DIVISION: this.qs.get("division") || "",
        REMARK: remarkValue
      };
    },

    async submit() {
      const { submitButton } = this.config;

      if (submitButton.dataset.lock === "1") return;
      submitButton.dataset.lock = "1";

      try {
        this.overlay.classList.remove("hide");
        this.overlay.style.opacity = "1";
        this.overlayText.textContent = "Submitting…";
      } catch (_) {}

      const base = this.buildBasePayload();
      const scoreFields = this.config.buildScore();
      const payload = { ...base, ...scoreFields };

      console.log("[JudgeCore] Payload:", payload);

      try {
        const result = await apiPost(payload);

        if (!result || !result.ok)
          throw new Error(result.error || "Server error");

        this.overlayText.textContent = "Saved ✔";

        this.updateCache();

        setTimeout(() => this.redirect(), 300);

      } catch (err) {
        console.error("Submit failed:", err);
        this.overlayText.textContent = "Submit Failed";

        setTimeout(() => {
          this.overlay.classList.add("hide");
          submitButton.dataset.lock = "0";
        }, 700);
      }
    },

    updateCache() {
      try {
        const type = this.getEventType();
        const cacheKey =
          type === "speed"
            ? "station_cache_" + this.station
            : "freestyle_cache_" + this.station;

        const id = this.qs.get("id");
        const raw = localStorage.getItem(cacheKey);

        if (raw) {
          const data = JSON.parse(raw);
          data.entries = data.entries.map(e =>
            e.entryId === id ? { ...e, status: "done" } : e
          );
          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Cache update failed:", err);
      }
    },

    redirect() {
      const type = this.getEventType();

      if (type === "speed") {
        location.href = `speed-station.html?station=${this.station}&key=${this.key}`;
      } else {
        location.href =
          `freestyle-station.html?station=${this.station}` +
          `&judgeType=${this.judgeType}&key=${this.key}`;
      }
    }

  };

})();
