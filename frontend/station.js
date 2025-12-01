<<<<<<< HEAD
/* ============================================================
   GBRSA 2025 — Station Page Script (Final Rebuild)
   Clean • Fast • One-Line Names • No Forced Line Breaks
=============================================================== */

=======
>>>>>>> parent of de7ae5d (Update station.js)
(function () {
  const $ = (q, el = document) => el.querySelector(q);

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");
  const btnRefresh = $("#btnRefresh");

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station") || "1";
  stationLabel.textContent = station;

<<<<<<< HEAD
  /* ----------------------------------------------
     HTML safe encode
  ---------------------------------------------- */
=======
  /** ============================================================
   *  FIXED HTML ESCAPE FUNCTION
   * ============================================================ **/
>>>>>>> parent of de7ae5d (Update station.js)
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[m]));
  }

<<<<<<< HEAD
  /* ----------------------------------------------
     Format participant names (ALL in ONE LINE)
  ---------------------------------------------- */
  function formatNames(p) {
    const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter((n) => n && n.trim() !== "");
=======
  /** ============================================================
   *  SMART NAME FORMATTER (1–4 names)
   * ============================================================ **/
  function formatNames(p) {
    const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter((n) => n && String(n).trim() !== "");
>>>>>>> parent of de7ae5d (Update station.js)

    if (names.length === 0) return "—";

    if (names.length === 1) return esc(names[0]);

    if (names.length === 2)
      return `${esc(names[0])}, ${esc(names[1])}`;

    const line1 = `${esc(names[0])}, ${esc(names[1])}`;
    const line2 = names.slice(2).map(esc).join(", ");
    return `${line1}<br>${line2}`;
  }

<<<<<<< HEAD
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
=======
  /** ============================================================
   *  LOAD STATION LIST FROM BACKEND
   * ============================================================ **/
>>>>>>> parent of de7ae5d (Update station.js)
  async function loadStationList() {
    listEl.innerHTML = `<div class="hint">Loading…</div>`;

    try {
<<<<<<< HEAD
      const data = await apiGet(`?cmd=stationlist&station=${station}`);

      if (!data.ok) {
        listBox.innerHTML = `<p class="hint" style="color:red;">Failed to load entries.</p>`;
        return;
      }

      const entries = data.entries || [];
      if (!entries.length) {
        listBox.innerHTML = `<p class="hint">No participants assigned to this station.</p>`;
=======
      const data = await apiGet({ cmd: "stationlist", station });
      if (!data || !data.ok) {
        listEl.innerHTML = `<div class="hint error">Unable to load entries.</div>`;
        return;
      }

      const arr = data.entries || [];
      if (!arr.length) {
        listEl.innerHTML = `<div class="hint">No participants assigned.</div>`;
>>>>>>> parent of de7ae5d (Update station.js)
        return;
      }

      listEl.innerHTML = "";

      arr.forEach((p, i) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = `station-card ${p.status === "done" ? "done" : "pending"}`;

        card.innerHTML = `
          <div class="top-row">
            <span>Heat ${esc(p.heat)}</span>
            <span>#${i + 1} • ${esc(p.entryId)}</span>
          </div>

          <div class="name">${formatNames(p)}</div>

          <div class="team">${esc(p.team)}</div>

          <div class="status">
            ${p.status === "done" ? "DONE (SUBMITTED)" : "NEW"}
          </div>
        `;

        /** Build URL → send full participant data to judge page */
        const judgeURL =
          `speed-judge.html`
          + `?id=${encodeURIComponent(p.entryId)}`
          + `&name1=${encodeURIComponent(p.NAME1 || "")}`
          + `&name2=${encodeURIComponent(p.NAME2 || "")}`
          + `&name3=${encodeURIComponent(p.NAME3 || "")}`
          + `&name4=${encodeURIComponent(p.NAME4 || "")}`
          + `&team=${encodeURIComponent(p.team || "")}`
          + `&state=${encodeURIComponent(p.state || "")}`
          + `&heat=${encodeURIComponent(p.heat || "")}`
          + `&station=${encodeURIComponent(station)}`
          + `&event=${encodeURIComponent(p.event || "")}`
          + `&division=${encodeURIComponent(p.division || "")}`;

        card.addEventListener("click", () => {
          location.href = judgeURL;
        });

        listEl.appendChild(card);
      });

    } catch (err) {
      console.error(err);
<<<<<<< HEAD
      listBox.innerHTML = `<p class="hint" style="color:red;">Error loading station data.</p>`;
    }
  }

  /* ----------------------------------------------
     Events
  ---------------------------------------------- */
  btnRefresh.addEventListener("click", loadStationList);
=======
      listEl.innerHTML = `<div class="hint error">Error loading station.</div>`;
    }
  }

  /** Refresh button */
  if (btnRefresh) {
    btnRefresh.addEventListener("click", loadStationList);
  }
>>>>>>> parent of de7ae5d (Update station.js)

  /** Auto-load */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 200);
  });
})();
