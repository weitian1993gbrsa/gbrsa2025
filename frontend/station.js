(function(){
  const $ = (q,el=document)=>el.querySelector(q);

  const listEl = $('#entryList');
  const stationLabel = $('#stationLabel');
  const btnRefresh = $('#btnRefresh');

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station") || "1";
  stationLabel.textContent = station;

  function esc(s){
    return String(s || "").replace(/[&<>"']/g, m => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;"
    }[m]));
  }

  /** Load station entries */
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

      arr.forEach((p,i)=>{
        const card = document.createElement("button");
        card.type = "button";
        card.className = `station-card ${p.status==="done" ? "done" : "pending"}`;

        card.innerHTML = `
          <div class="top-row">
            <span>Heat ${esc(p.heat)}</span>
            <span>#${i+1} • ${esc(p.entryId)}</span>
          </div>
          <div class="name">${esc(p.displayName)}</div>
          <div class="team">${esc(p.team)}</div>
          <div class="status">
            ${p.status === "done" ? "DONE (SUBMITTED)" : "NOT DONE (TAP TO JUDGE)"}
          </div>
        `;

        /** BUILD FULL URL — SEND ALL PARTICIPANT FIELDS */
        const judgeURL = `speed-judge.html`
          + `?id=${encodeURIComponent(p.entryId)}`
          + `&name1=${encodeURIComponent(p.NAME1||"")}`
          + `&name2=${encodeURIComponent(p.NAME2||"")}`
          + `&name3=${encodeURIComponent(p.NAME3||"")}`
          + `&name4=${encodeURIComponent(p.NAME4||"")}`
          + `&team=${encodeURIComponent(p.team||"")}`
          + `&state=${encodeURIComponent(p.state||"")}`
          + `&heat=${encodeURIComponent(p.heat||"")}`
          + `&station=${encodeURIComponent(station)}`
          + `&event=${encodeURIComponent(p.event||"")}`
          + `&division=${encodeURIComponent(p.division||"")}`;

        card.addEventListener("click", ()=>{
          location.href = judgeURL;
        });

        listEl.appendChild(card);
      });

    } catch (err){
      console.error(err);
      listEl.innerHTML = `<div class="hint error">Error loading station.</div>`;
    }
  }

  if (btnRefresh){
    btnRefresh.addEventListener("click", loadStationList);
  }

  window.addEventListener("load", ()=>{ setTimeout(loadStationList, 200); });

})();
