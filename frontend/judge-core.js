/* ============================================================
   UNIVERSAL JUDGE ENGINE — GBRSA SCORE 2025
   Supports SPEED + FREESTYLE (DIFFICULTY)
   ============================================================ */

window.JudgeCore = (() => {

  /* ------------------------------------------------------------
     SHOW / HIDE OVERLAY
  ------------------------------------------------------------ */
  function showOverlay() {
    const o = document.getElementById("submitOverlay");
    if (o) o.classList.remove("hide");
  }

  function hideOverlay() {
    const o = document.getElementById("submitOverlay");
    if (o) o.classList.add("hide");
  }

  /* ------------------------------------------------------------
     LOCK / UNLOCK SUBMIT BUTTON
  ------------------------------------------------------------ */
  function lockButton(btn) {
    if (!btn) return;
    btn.disabled = true;
    btn.dataset.lock = "1";
  }

  function unlockButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.dataset.lock = "0";
  }

  /* ------------------------------------------------------------
     UNIVERSAL POST FUNCTION — FIXED with ?cmd=submit
  ------------------------------------------------------------ */
  async function sendToBackend(payload) {

    // ⭐ REQUIRED FIX — Google Apps Script needs a query parameter
    const url = window.CONFIG.APPS_SCRIPT_URL + "?cmd=submit";

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    return await res.json();
  }

  /* ------------------------------------------------------------
     UPDATE LOCAL CACHE → TURN CARD BLUE INSTANTLY
  ------------------------------------------------------------ */
  function markEntryDoneInCache(station, entryId) {
    const CACHE_KEY = "freestyle_cache_" + station;
    const raw = localStorage.getItem(CACHE_KEY);

    if (!raw) return;

    try {
      const cacheData = JSON.parse(raw);
      cacheData.entries = cacheData.entries.map(e =>
        e.entryId === entryId ? { ...e, status: "done" } : e
      );
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.warn("Cache update failed:", err);
    }
  }

  /* ------------------------------------------------------------
     UNIVERSAL REDIRECT (back to station)
  ------------------------------------------------------------ */
  function goBackToStation() {
    history.back();
  }

  /* ------------------------------------------------------------
     UNIVERSAL SUBMIT HANDLER
     judgeType: "speed" | "difficulty"
     fields: event-specific scoring fields
  ------------------------------------------------------------ */
  async function submit(judgeType, fields) {

    const params = new URLSearchParams(location.search);

    const payload = {
      TIMESTAMP: new Date().toISOString(),
      judgeType,

      // Universal participant info
      ID: params.get("id") || "",
      NAME1: params.get("name1") || "",
      TEAM: params.get("team") || "",
      STATE: params.get("state") || "",
      HEAT: params.get("heat") || "",
      STATION: params.get("station") || "",
      EVENT: params.get("event") || "",
      DIVISION: params.get("division") || "",

      // Event-specific fields
      ...fields
    };

    const btnSubmit = document.getElementById("btnSubmit");
    lockButton(btnSubmit);
    showOverlay();

    try {
      const result = await sendToBackend(payload);

      if (!result || !result.ok)
        throw new Error(result?.error || "Unknown server error");

      // Update card immediately
      markEntryDoneInCache(payload.STATION, payload.ID);

      // Redirect back to station
      setTimeout(goBackToStation, 350);

    } catch (err) {
      alert("Submit failed — " + err.message);
      unlockButton(btnSubmit);
      hideOverlay();
    }
  }

  return { submit };

})();
