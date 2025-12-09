/* ============================================================
   JUDGE CORE — Universal Submit Handler (Speed + Freestyle)
   + IJRU-STYLE RESPONSIVE WRAPPER (SAFE VERSION)
============================================================ */

(function () {

  const $ = (q, el = document) => el.querySelector(q);

  /* ============================================================
     UNIVERSAL RESPONSIVE LAYOUT (SAFE VERSION)
  ============================================================ */
  function injectResponsiveLayout() {
    const body = document.body;

    if (body.classList.contains("gbrsa-responsive-ready")) return;
    body.classList.add("gbrsa-responsive-ready");

    const wrapper = document.createElement("div");
    wrapper.className = "judge-container";

    [...body.children].forEach(child => {
      if (child.tagName !== "SCRIPT") {
        wrapper.appendChild(child);
      }
    });

    body.prepend(wrapper);
  }

  document.addEventListener("DOMContentLoaded", injectResponsiveLayout);



  /* ============================================================
     ORIGINAL JUDGE-CORE LOGIC
  ============================================================ */
  window.JudgeCore = {

    /* ------------------------------------------------------------
       INIT
    ------------------------------------------------------------ */
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

      this.overlay = $("#submitOverlay");
      this.overlayText = $("#overlayText");

      if (config.submitButton) {
        config.submitButton.addEventListener("click", () => this.submit());
      }

      console.log("[JudgeCore] Initialized for:", this.judgeType);
    },

    getEventType() {
      const info = window.JUDGE_KEYS[this.key];
      return info?.event || "speed";
    },

    /* ------------------------------------------------------------
       BASE PAYLOAD
    ------------------------------------------------------------ */
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

    /* ------------------------------------------------------------
       SUBMIT
    ------------------------------------------------------------ */
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

        if (!result || !result.ok) throw new Error(result.error || "Server error");

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

    /* ------------------------------------------------------------
       UPDATE CACHE
       ⭐ SPEED: keep old behavior (status: "done")
       ⭐ FREESTYLE: DO NOT modify shared status
                     Instead set per-judge localStorage flag
    ------------------------------------------------------------ */
    updateCache() {
      try {
        const eventType = this.getEventType();
        const entryId = this.qs.get("id");

        /* SPEED — unchanged */
        if (eventType === "speed") {
          const cacheKey = "station_cache_" + this.station;
          const raw = localStorage.getItem(cacheKey);

          if (raw) {
            const data = JSON.parse(raw);
            data.entries = data.entries.map(e =>
              e.entryId === entryId ? { ...e, status: "done" } : e
            );
            localStorage.setItem(cacheKey, JSON.stringify(data));
          }
          return;
        }

        /* FREESTYLE — NEW BEHAVIOR */
        const judgeType = this.judgeType;
        const keyDone = `fs_done_${this.station}_${judgeType}_${entryId}`;

        // ⭐ Mark THIS judge as completed
        localStorage.setItem(keyDone, "1");

        // ❗ Do NOT touch the shared freestyle cache
        // (This prevents cross-judge completion bleed)

      } catch (err) {
        console.warn("Cache update failed:", err);
      }
    },

    /* ------------------------------------------------------------
       REDIRECT BACK TO STATION LIST
    ------------------------------------------------------------ */
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
