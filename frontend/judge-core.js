/* ============================================================
   JUDGE CORE — Universal Submit Handler + Fullscreen Layout Engine
   (Speed + Freestyle)
============================================================ */

(function () {

  /* ============================================================
     GLOBAL FULLSCREEN LAYOUT INJECTION (OPTION A + AUTO SCALE)
     - No scroll anywhere
     - 650px centered wrapper
     - Auto shrink on small screens
  ============================================================ */

  function injectFullscreenLayout() {

      // Prevent double injection
      if (document.querySelector(".judge-wrapper")) return;

      /* ---------- Inject global CSS ---------- */
      const css = `
          html, body {
              margin:0; padding:0;
              height:100%;
              overflow:hidden;                     /* NO SCROLL */
              background:#e9e9e9;                  /* grey outer */
              font-family:system-ui,sans-serif;
              -webkit-user-select:none;
              user-select:none;
          }

          * { -webkit-tap-highlight-color: transparent; }

          .judge-wrapper {
              width:100%;
              max-width:650px;
              height:100%;
              margin:0 auto;
              background:white;
              display:flex;
              flex-direction:column;
              box-shadow:0 0 12px rgba(0,0,0,0.18);
              transform-origin: top center;
          }

          /* Auto-scale for VERY small screens */
          @media (max-height:700px) {
              .judge-wrapper {
                  transform: scale(0.92);
              }
          }
          @media (max-height:620px) {
              .judge-wrapper {
                  transform: scale(0.85);
              }
          }
      `;

      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);

      /* ---------- Apply wrapper ---------- */
      const wrapper = document.createElement("div");
      wrapper.className = "judge-wrapper";

      // Move ALL content except scripts into wrapper
      const content = document.createElement("div");
      content.style.flex = "1";           /* Fill vertical space */
      content.style.overflow = "hidden";  /* No scroll allowed */

      [...document.body.children].forEach(el => {
          if (el.tagName !== "SCRIPT") content.appendChild(el);
      });

      wrapper.appendChild(content);
      document.body.prepend(wrapper);
  }

  document.addEventListener("DOMContentLoaded", injectFullscreenLayout);



  /* ============================================================
     ORIGINAL JUDGE LOGIC (UNCHANGED)
  ============================================================ */

  const $ = (q, el = document) => el.querySelector(q);

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

      /* SUBMIT BUTTON */
      if (config.submitButton) {
        config.submitButton.addEventListener("click", () => this.submit());
      }

      console.log("[JudgeCore] Init:", this.judgeType);
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
