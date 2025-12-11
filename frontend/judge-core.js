/* ============================================================
   JUDGE CORE — Universal Submit Handler (Speed + Freestyle)
============================================================ */

(function () {

  window.JudgeCore = {

    judgeType: "",

    init(options = {}) {
      console.log("[JudgeCore] Init", options);

      this.judgeType = options.judgeType || "";
      this.submitButton = options.submitButton;
      this.buildScore = options.buildScore || function () { return {}; };

      if (!this.submitButton) return;

      this.submitButton.addEventListener("click", () => {
        this.handleSubmit();
      });
    },

    async handleSubmit() {
      const qs = new URLSearchParams(location.search);
      const station = qs.get("station");
      const key = qs.get("key");
      const entryId = qs.get("id");
      const judgeType = this.judgeType;

      // Build score payload
      const score = this.buildScore() || {};

      // ⭐ GET REMARK ONLY IF FIELD EXISTS (Speed Judge)
      const remarkValue =
        document.getElementById("remarkField")
          ? document.getElementById("remarkField").value.trim()
          : "";

      // Build request payload
      const payload = {
        ID: entryId,
        STATION: station,
        judgeType: judgeType,
        REMARK: remarkValue,           // ⭐⭐⭐ PATCHED HERE
        ...score,
        ...this.getParticipantInfo()
      };

      // Show overlay if exists
      const overlay = document.getElementById("submitOverlay");
      if (overlay) overlay.classList.remove("hide");

      try {
        // Submit to Google Apps Script backend
        const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!json.ok) throw new Error("Submit failed");

        // ⭐ Mark card as DONE instantly (local cache update)
        this.updateLocalStationCache(entryId, station, judgeType);

        // ⭐ Redirect depending on judge type
        setTimeout(() => {

          if (judgeType === "speed") {
            // SPEED ONLY
            location.href = `speed-station.html?station=${station}&key=${key}`;
          } else {
            // FREESTYLE
            location.href =
              `freestyle-station.html?station=${station}&key=${key}&judgeType=${judgeType}`;
          }

        }, 350);

      } catch (err) {
        alert("Submit failed, please try again.\n\n" + err);
        console.error(err);
      }
    },

    /* ------------------------------------------------------------
       PARTICIPANT INFO (stored by station loader)
    ------------------------------------------------------------ */
    getParticipantInfo() {
      try {
        const data = JSON.parse(localStorage.getItem("currentEntry") || "{}");
        return {
          NAME1: data.NAME1 || "",
          NAME2: data.NAME2 || "",
          NAME3: data.NAME3 || "",
          NAME4: data.NAME4 || "",
          TEAM: data.TEAM || "",
          STATE: data.STATE || "",
          HEAT: data.HEAT || "",
          EVENT: data.EVENT || "",
          DIVISION: data.DIVISION || ""
        };
      } catch {
        return {};
      }
    },

    /* ------------------------------------------------------------
       ⭐⭐⭐ INSTANT BLUE CARD — Local cache update
    ------------------------------------------------------------ */
    updateLocalStationCache(entryId, station, judgeType) {
      try {
        const cacheKey =
          judgeType === "speed"
            ? `station_cache_${station}`          // speed mode cache
            : `freestyle_cache_${station}_${judgeType}`; // freestyle cache

        const raw = localStorage.getItem(cacheKey);
        if (!raw) return;

        const data = JSON.parse(raw);

        if (Array.isArray(data.entries)) {
          data.entries.forEach(e => {
            if (String(e.entryId) === String(entryId)) {
              e.status = "done";  // ⭐ Set card to blue instantly
            }
          });

          localStorage.setItem(cacheKey, JSON.stringify(data));
          console.log(`[JudgeCore] Updated local cache → ${cacheKey}`);
        }
      } catch (err) {
        console.warn("Local cache update failed:", err);
      }
    }

  };

})();
