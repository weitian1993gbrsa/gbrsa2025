/* ============================================================
   JUDGE CORE — Universal Submit Handler (Speed + Freestyle)
   + Fullscreen Wrapper (650px centered, no-scroll, auto-shrink)
============================================================ */

  function injectFullscreenLayout() {

    // Prevent multiple runs
    if (document.querySelector(".judge-wrapper")) return;

    /* ---------- Inject global CSS ---------- */
    const css = `
        html, body {
            margin:0; padding:0;
            height:100%;
            overflow:hidden;            /* 🔥 No scroll */
            background:#e9e9e9;
            font-family:system-ui,sans-serif;
            -webkit-user-select:none;
            user-select:none;
        }

        * { -webkit-tap-highlight-color: transparent; }

        .judge-wrapper {
            width:100%;
            max-width:650px;            /* 🔥 Same as your PIC1 */
            height:100%;
            margin:0 auto;
            background:white;
            display:flex;
            flex-direction:column;
            box-shadow:0 0 14px rgba(0,0,0,0.22);
            transform-origin: top center;
        }

        /* Auto-shrink UI on small screens (Option 1) */
        @media (max-height:700px) {
            .judge-wrapper { transform: scale(0.92); }
        }
        @media (max-height:620px) {
            .judge-wrapper { transform: scale(0.84); }
        }
        @media (max-height:560px) {
            .judge-wrapper { transform: scale(0.78); }
        }

        .judge-content {
            flex:1;
            overflow:hidden;            /* 🔥 No scrolling inside page */
            display:block;
        }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    /* ---------- Create wrapper ---------- */
    const wrapper = document.createElement("div");
    wrapper.className = "judge-wrapper";

    const content = document.createElement("div");
    content.className = "judge-content";

    // Move all non-script elements into content
    [...document.body.children].forEach(child => {
      if (child.tagName !== "SCRIPT") content.appendChild(child);
    });

    wrapper.appendChild(content);
    document.body.prepend(wrapper);
  }

  // Run wrapper AFTER HTML load
  document.addEventListener("DOMContentLoaded", injectFullscreenLayout);



  /* ============================================================
     ORIGINAL JUDGE-CORE LOGIC (UNTOUCHED)
     ⭐ Nothing below is changed — SAFE FOR PRODUCTION
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
        document.body.innerHTML =
          `<div style="padding:2rem;text-align:center;">
            <h2 style="color:#b00020;">Access Denied</h2>
            <p>Unauthorized judge key</p>
          </div>`;
        return;
      }

      this.qs = qs;

      /* SUBMIT OVERLAY */
      this.overlay = $("#submitOverlay");
      this.overlayText = $("#overlayText");

      /* BIND SUBMIT BUTTON */
      if (config.submitButton) {
        config.submitButton.addEventListener("click", () => this.submit());
      }

      console.log("[JudgeCore] Initialized for:", this.judgeType);
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

      console.log("[JudgeCore] Final Payload:", payload);

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
        const eventType = this.getEventType();
        const cacheKey =
          eventType === "speed"
            ? "station_cache_" + this.station
            : "freestyle_cache_" + this.station;

        const entryId = this.qs.get("id");

        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const data = JSON.parse(raw);

          data.entries = data.entries.map(e =>
            e.entryId === entryId ? { ...e, status: "done" } : e
          );

          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
      } catch (err) {
        console.warn("Cache update failed:", err);
      }
    },

    redirect() {
      const eventType = this.getEventType();

      if (eventType === "speed") {
        location.href = `speed-station.html?station=${this.station}&key=${this.key}`;
        return;
      }

      location.href =
        `freestyle-station.html?station=${this.station}` +
        `&judgeType=${this.judgeType}&key=${this.key}`;
    }

  };

})();
