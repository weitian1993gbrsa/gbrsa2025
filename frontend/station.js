(function(){
  const $ = (q, el = document) => el.querySelector(q);

  const listEl = $('#entryList');
  const stationLabel = $('#stationLabel');
  const btnRefresh = $('#btnRefresh');

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station") || "1";
  stationLabel.textContent = station;

  /** HTML escape */
  function esc(s){
    return String(s || "").replace(/[&<>"']/g, m => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;"
    }[m]));
  }

  /** ============================================================
   *  FORMAT NAMES (1–4 names) CLEAN & READABLE
   * ============================================================ **/
  function formatNames(p){
    const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(n => n && String(n).trim() !== "");

    if (names.length === 0) return "—";

    // 1 name
    if (names.length === 1) {
      return esc(names[0]);
    }

    // 2 names → NAME1, NAME2
    if (names.length === 2) {
      return `${esc(names[0])}, ${esc(names[1])}`;
    }

    // 3–4 names split across 2 lines
    const line1 = `${esc(names[0])}, ${esc(names[1])}`;
    const line2 = names.slice(2).map(esc).join(", ");
    return `${line1}<br>${line2}`;
  }

  /** ============================================================
   *  LOAD STATION LIST
   * ============================================================ **/
  async function loadStationList(){
    listEl.innerHTML = `<div class="hint">Loading…</div>`;

    try {
      const data = await apiGet({cmd:"stationlist", station});
      if (!data || !data.ok){
        listEl.innerHTML = `<div class="hint error">Unable to load entries.</div>`;
        return;
      }

      const arr = data.entries || [];
      if (!arr.length){
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
            <span>#${i+1} • ${esc(p.entryId)}</span>
          </div>
          <div class="name">${formatNames(p)}</div>
          <div class="team">${esc(p.team)}</div>
          <div class="status">
            ${p.status === "done" ? "DONE (SUBMITTED)" : "NOT DONE (TAP TO JUDGE)"}
          </div>
        `;

        /** Build FULL URL → Pass ALL participant fields */
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

    } catch (err){
      console.error(err);
      listEl.innerHTML = `<div class="hint error">Error loading station.</div>`;
    }
  }

  /** Refresh button */
  if (btnRefresh){
    btnRefresh.addEventListener("click", loadStationList);
  }

  /** Load on page ready */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 200);
  });

})();
