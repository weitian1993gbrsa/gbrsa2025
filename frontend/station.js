(function () {
  const $ = (q, el = document) => el.querySelector(q);

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");
  const btnRefresh = $("#btnRefresh");

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station") || "1";
  stationLabel.textContent = station;

  /** ============================================================
   *  FIXED HTML ESCAPE FUNCTION
   * ============================================================ **/
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[m]));
  }

  /** ============================================================
   *  FIXED NAME FORMATTER — ALWAYS ONE LINE
   * ============================================================ **/
  function formatNames(p) {
    const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(n => n && String(n).trim() !== "");

    return names.map(esc).join(", ");
  }

  /** ============================================================
   *  LOAD STATION LIST FROM BACKEND
   * ============================================================ **/
  async function loadStationList() {
    listEl.innerHTML = `<div class="hint">Loading…</div>`;

    try {
      const data = await apiGet({ cmd: "stationlist", station });
      if (!data || !data.ok) {
        listEl.innerHTML = `<div class="hint error">Unable to load entries.</div>`;
        return;
      }

      const arr = data.entries || [];
      if (!arr.length) {
        listEl.innerHTML = `<div class="hint">No participants assigned.</div>`;
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
      listEl.innerHTML = `<div class="hint error">Error loading station.</div>`;
    }
  }

  /** ============================================================
   *  FIXED REFRESH BUTTON — ALWAYS WORKS
   * ============================================================ **/
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      listEl.innerHTML = `<div class="hint">Refreshing…</div>`;
      loadStationList();
    });
  }

  /** Auto-load */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 200);
  });
})();
