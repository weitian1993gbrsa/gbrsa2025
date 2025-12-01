/* ============================================================
   GBRSA 2025 — Station Page Script (Final Rebuild)
   Clean • Fast • One-Line Names • No Forced Line Breaks
=============================================================== */

(function () {

  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);
  const station = params.get("station") || "1";

  const listBox = $("#entriesBox");
  const stationLabel = $("#stationLabel");
  const btnRefresh = $("#btnRefresh");

  stationLabel.textContent = `Speed Station ${station}`;

  /* ----------------------------------------------
     HTML safe encode
  ---------------------------------------------- */
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m]));
  }

  /* ----------------------------------------------
     Format participant names (ALL in ONE LINE)
  ---------------------------------------------- */
  function formatNames(p) {
    const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter((n) => n && n.trim() !== "");

    return names.map(esc).join(", ");
  }

  /* ----------------------------------------------
     Render one participant card
  ---------------------------------------------- */
  function renderCard(p, index) {

    const namesHTML = formatNames(p);
    const status = p.status === "done" ? "done" : "pending";
    const statusText = p.status === "done" ? "DONE (SUBMITTED)" : "NEW";

    const judgeURL =
      `speed-judge.html`
      + `?id=${encodeURIComponent(p.entryId)}`
      + `&name1=${encodeURIComponent(p.NAME1 || "")}`
      + `&name2=${encodeURIComponent(p.NAME2 || "")}`
      + `&name3=${encodeURIComponent(p.NAME3 || "")}`
      + `&name4=${encodeURIComponent(p.NAME4 || "")}`
      + `&team=${encodeURIComponent(p.team || "")}`
      + `&state=${encodeURIComponent(p.STATE || "")}`
      + `&heat=${encodeURIComponent(p.heat || "")}`
      + `&station=${encodeURIComponent(p.STATION || station)}`
      + `&event=${encodeURIComponent(p.EVENT || "")}`
      + `&division=${encodeURIComponent(p.DIVISION || "")}`;

    return `
      <button class="station-card ${status}" onclick="location.href='${judgeURL}'">
        <div class="top-row">
          <span>Heat ${esc(p.heat)}</span>
          <span>#${index} • ${esc(p.entryId)}</span>
        </div>

        <div class="name">${namesHTML}</div>

        <div class="team">${esc(p.team)}</div>

        <div class="status">${statusText}</div>
      </button>
    `;
  }

  /* ----------------------------------------------
     Load station participant list
  ---------------------------------------------- */
  async function loadStationList() {

    listBox.innerHTML = `
      <div class="loading">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    `;

    try {
      const data = await apiGet(`?cmd=stationlist&station=${station}`);

      if (!data.ok) {
        listBox.innerHTML = `<p class="hint" style="color:red;">Failed to load entries.</p>`;
        return;
      }

      const entries = data.entries || [];
      if (!entries.length) {
        listBox.innerHTML = `<p class="hint">No participants assigned to this station.</p>`;
        return;
      }

      let html = "";
      let index = 1;
      for (let p of entries) {
        html += renderCard(p, index++);
      }

      listBox.innerHTML = html;

    } catch (err) {
      console.error(err);
      listBox.innerHTML = `<p class="hint" style="color:red;">Error loading station data.</p>`;
    }
  }

  /* ----------------------------------------------
     Events
  ---------------------------------------------- */
  btnRefresh.addEventListener("click", loadStationList);

  window.addEventListener("load", () => {
    setTimeout(loadStationList, 150);
  });

})();
