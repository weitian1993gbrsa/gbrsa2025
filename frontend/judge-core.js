/* ============================================================
   JUDGE CORE — Universal Submit Handler (Speed + Freestyle)
   PATCHED: Fast submit overlay + instant redirect
============================================================ */

(function () {

  window.JudgeCore = {

    judgeType: "",
    submitButton: null,
    buildScore: function () { return {}; },

    init(options = {}) {
      this.judgeType    = options.judgeType || "";
      this.submitButton = options.submitButton || null;
      this.buildScore   = options.buildScore || function () { return {}; };

      if (!this.submitButton) return;

      this.submitButton.addEventListener("click", () => {
        this.handleSubmit();
      });
    },

    async handleSubmit() {
      const qs        = new URLSearchParams(location.search);
      const station   = qs.get("station") || "";
      const key       = qs.get("key") || "";
      const entryId   = qs.get("id") || "";
      const judgeType = this.judgeType || "";

      const score = this.buildScore() || {};
      const participant = this.getParticipantInfo();

      const payload = {
        ID: entryId,
        STATION: station,
        judgeType: judgeType,
        ...score,
        ...participant
      };

      const overlay = document.getElementById("submitOverlay");
      const overlayText = document.getElementById("overlayText");

      // ✅ SHOW OVERLAY IMMEDIATELY
      if (overlay) overlay.classList.remove("hide");
      if (overlayText) overlayText.textContent = "Submitting…";

      try {
        const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Submit failed");

        // ✅ FEELS FAST: update text immediately
        if (overlayText) overlayText.textContent = "Submitted";

        this.updateLocalStationCache(entryId, station, judgeType);

        document.dispatchEvent(new CustomEvent("judge:submitted", {
          detail: { entryId, station, judgeType, payload }
        }));

        // ✅ VERY SHORT DELAY (was 350ms)
        setTimeout(() => {
          if (overlay) overlay.classList.add("hide");

          if (judgeType === "speed") {
            location.href = `speed-station.html?station=${station}&key=${key}`;
          } else {
            location.href =
              `freestyle-station.html?station=${station}&key=${key}&judgeType=${judgeType}`;
          }
        }, 120);

      } catch (err) {
        if (overlay) overlay.classList.add("hide");
        alert("Submit failed, please try again.\n\nError: " + err.message);
      }
    },

    getParticipantInfo() {
      try {
        const raw  = localStorage.getItem("currentEntry") || "{}";
        const data = JSON.parse(raw);
        return {
          NAME1: data.NAME1 || "",
          NAME2: data.NAME2 || "",
          NAME3: data.NAME3 || "",
          NAME4: data.NAME4 || "",
          TEAM:  data.TEAM  || "",
          STATE: data.STATE || "",
          HEAT:  data.HEAT  || "",
          EVENT: data.EVENT || "",
          DIVISION: data.DIVISION || ""
        };
      } catch (e) {
        return {};
      }
    },

    updateLocalStationCache(entryId, station, judgeType) {
      try {
        const cacheKey =
          judgeType === "speed"
            ? `station_cache_${station}`
            : `freestyle_cache_${station}_${judgeType}`;

        const raw = localStorage.getItem(cacheKey);
        if (!raw) return;

        const data = JSON.parse(raw);
        if (!Array.isArray(data.entries)) return;

        data.entries.forEach(e => {
          if (String(e.entryId) === String(entryId)) e.status = "done";
        });

        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (_) {}
    }

  };

})();
