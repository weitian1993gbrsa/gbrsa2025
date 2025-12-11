/* ============================================================
   JUDGE CORE — Universal Submit Handler (Speed + Freestyle)
   FINAL 2025 VERSION
   - Handles all judge types
   - Sends payload to Apps Script backend
   - Updates local station cache
   - Dispatches 'judge:submitted' on success
============================================================ */

(function () {

  window.JudgeCore = {

    judgeType: "",
    submitButton: null,
    buildScore: function () { return {}; },

    /* --------------------------------------------------------
       INIT
    -------------------------------------------------------- */
    init(options = {}) {
      console.log("[JudgeCore] Init", options);

      this.judgeType    = options.judgeType || "";
      this.submitButton = options.submitButton || null;
      this.buildScore   = options.buildScore || function () { return {}; };

      if (!this.submitButton) {
        console.warn("[JudgeCore] No submitButton supplied.");
        return;
      }

      this.submitButton.addEventListener("click", () => {
        this.handleSubmit();
      });
    },

    /* --------------------------------------------------------
       SUBMIT HANDLER
    -------------------------------------------------------- */
    async handleSubmit() {
      const qs        = new URLSearchParams(location.search);
      const station   = qs.get("station") || "";
      const key       = qs.get("key") || "";
      const entryId   = qs.get("id") || "";
      const judgeType = this.judgeType || "";

      console.log("[JudgeCore] handleSubmit", { station, key, entryId, judgeType });

      // Build score (page-specific logic)
      const score = this.buildScore() || {};
      console.log("[JudgeCore] Score payload", score);

      // Participant info from localStorage
      const participant = this.getParticipantInfo();
      console.log("[JudgeCore] Participant", participant);

      const payload = {
        ID: entryId,
        STATION: station,
        judgeType: judgeType,
        ...score,
        ...participant
      };

      console.log("[JudgeCore] Final payload", payload);

      const overlay = document.getElementById("submitOverlay");
      if (overlay) overlay.classList.remove("hide");

      try {
        const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        const json = await res.json();
        console.log("[JudgeCore] Response", json);

        if (!json.ok) {
          throw new Error(json.error || "Submit failed");
        }

        // Update local cache so station card turns blue immediately
        this.updateLocalStationCache(entryId, station, judgeType);

        // Notify listeners (for overlay, etc.)
        document.dispatchEvent(new CustomEvent("judge:submitted", {
          detail: { entryId, station, judgeType, payload }
        }));

        // Redirect back to the correct station page
        setTimeout(() => {
          if (judgeType === "speed") {
            location.href = `speed-station.html?station=${station}&key=${key}`;
          } else {
            location.href =
              `freestyle-station.html?station=${station}&key=${key}&judgeType=${judgeType}`;
          }
        }, 350);

      } catch (err) {
        console.error("[JudgeCore] Submit failed", err);
        if (overlay) overlay.classList.add("hide");
        alert("Submit failed, please try again.\n\nError: " + err.message);
      }
    },

    /* --------------------------------------------------------
       PARTICIPANT INFO
    -------------------------------------------------------- */
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
        console.warn("[JudgeCore] getParticipantInfo failed", e);
        return {};
      }
    },

    /* --------------------------------------------------------
       LOCAL STATION CACHE (BLUE CARD)
    -------------------------------------------------------- */
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
          if (String(e.entryId) === String(entryId)) {
            e.status = "done";
          }
        });

        localStorage.setItem(cacheKey, JSON.stringify(data));
        console.log("[JudgeCore] Updated local cache", cacheKey);
      } catch (err) {
        console.warn("[JudgeCore] Local cache update failed:", err);
      }
    }

  };

})();
