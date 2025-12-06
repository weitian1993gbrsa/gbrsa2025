/* ============================================================
   JUDGE CORE — Universal Submit Handler (Speed + Freestyle)
   Handles:
   ✔ URL parsing
   ✔ Security check
   ✔ Common payload fields
   ✔ Submit overlay
   ✔ API POST
   ✔ Cache update (turn card blue)
   ✔ Redirect back to correct station
============================================================ */

(function () {

  const $ = (q, el = document) => el.querySelector(q);

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

      /* SUBMIT OVERLAY */
      this.overlay = $("#submitOverlay");
      this.overlayText = $("#overlayText");

      /* SUBMIT BINDING */
      if (config.submitButton) {
        config.submitButton.addEventListener("click", () => this.submit());
      }

      console.log("[JudgeCore] Initialized for:", this.judgeType);
    },

    /* ------------------------------------------------------------
       Determine event type (speed/freestyle)
    ------------------------------------------------------------ */
    getEventType() {
      const info = window.JUDGE_KEYS[this.key];
      return info?.event || "speed";
    },

    /* ------------------------------------------------------------
       BUILD BASE PAYLOAD (NOW INCLUDES REMARK FIX!)
    ------------------------------------------------------------ */
    buildBasePayload() {

      // ⭐ NEW — Get remark from input
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
        REMARK: remarkValue   // ⭐ FIXED HERE
      };
    },

    /* ------------------------------------------------------------
       SUBMIT HANDLER
    ------------------------------------------------------------ */
    async submit() {
      const { submitButton } = this.config;

      if (submitButton.dataset.lock === "1") return;
      submitButton.dataset.lock = "1";

      /* SHOW OVERLAY */
      try {
        this.overlay.classList.remove("hide");
        this.overlay.style.opacity = "1";
        this.overlayText.textContent = "Submitting…";
      } catch (_) {}

      /* BUILD FINAL PAYLOAD */
      const base = this.buildBasePayload();
      const scoreFields = this.config.buildScore();
      const payload = { ...base, ...scoreFields };

      console.log("[JudgeCore] Final Payload:", payload);

      /* SUBMIT TO BACKEND */
      try {
        const result = await apiPost(payload);

        if (!result || !result.ok) throw new Error(result.error || "Server error");

        this.overlayText.textContent = "Saved ✔";

        /* UPDATE CACHE */
        this.updateCache();

        /* REDIRECT */
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
       UPDATE CACHE (turn card blue)
    ------------------------------------------------------------ */
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

    /* ------------------------------------------------------------
       REDIRECT BACK TO STATION
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
