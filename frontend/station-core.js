/* ============================================================
   STATION CORE — Universal Station Loader (Speed + Freestyle)
============================================================ */

(function () {

  const $ = (q, el = document) => el.querySelector(q);
  const stationListEl = $("#entriesList");
  const headerTitleEl = $("#stationTitle");

  let station = null;
  let judgeKey = null;
  let judgeType = null;
  let eventType = null;

  function init() {
    const qs = new URLSearchParams(location.search);

    station = qs.get("station");
    judgeKey = qs.get("key");
    judgeType = qs.get("judgeType") || "";
    eventType = window.JUDGE_KEYS?.[judgeKey]?.event || "speed";

    headerTitleEl.textContent = `Station ${station}`;
    loadStationList();
  }

  async function loadStationList() {

    stationListEl.innerHTML = `<div class="loading">Loading...</div>`;

    const url = `${window.CONFIG.APPS_SCRIPT_URL}?cmd=stationlist&station=${station}&judgeType=${judgeType}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.ok) {
        stationListEl.innerHTML = `<div class="error">Unable to load station list.</div>`;
        return;
      }

      renderEntries(data.entries);

    } catch (err) {
      console.error(err);
      stationListEl.innerHTML = `<div class="error">Network error loading station.</div>`;
    }
  }

  function renderEntries(entries) {

    if (!entries || entries.length === 0) {
      stationListEl.innerHTML = `<div class="empty">No entries for this station.</div>`;
      return;
    }

    stationListEl.innerHTML = "";

    entries.forEach(e => {

      const card = document.createElement("div");
      card.className = `station-card ${e.status === "done" ? "done" : "new"}`;

      /* ⭐ FIXED — SAFE COMBINATION OF NAMES */
      const names = [e.NAME1, e.NAME2, e.NAME3, e.NAME4]
        .filter(n => n && String(n).trim() !== "")
        .join(" • ");

      card.innerHTML = `
        <div class="entry-content">

            <div class="entry-left">
                <div class="entry-heat">Heat ${e.heat}</div>
                <div class="entry-name">${names}</div>
                <div class="entry-team">${e.team}</div>
                <div class="entry-status">${e.status === "done" ? "COMPLETED" : "NEW"}</div>
            </div>

            <div class="entry-right">
                <div class="entry-id">ID#: ${e.entryId}</div>
                <div class="entry-event">${e.event}</div>
            </div>

        </div>
      `;

      /* onClick → go to judge page */
      card.addEventListener("click", () => openJudgeForm(e));

      stationListEl.appendChild(card);
    });
  }

  function openJudgeForm(e) {

    const params = new URLSearchParams({
      id: e.entryId,
      name1: e.NAME1,
      name2: e.NAME2 || "",
      name3: e.NAME3 || "",
      name4: e.NAME4 || "",
      team: e.team,
      state: e.state,
      heat: e.heat,
      station,
      event: e.event,
      division: e.division,
      key: judgeKey,
      judgeType
    });

    if (eventType === "speed") {
      location.href = `speed-judge.html?${params.toString()}`;
      return;
    }

    location.href = `freestyle-difficulty.html?${params.toString()}`;
  }

  window.refreshStation = function () {
    loadStationList();
  };

  document.addEventListener("DOMContentLoaded", init);
})();