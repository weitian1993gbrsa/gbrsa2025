(function(){
  const $ = (q,el=document)=>el.querySelector(q);

  const listEl = $('#entryList');
  const stationLabel = $('#stationLabel');
  const btnRefresh = $('#btnRefresh');

  const params = new URLSearchParams(location.search);
  const station = params.get("station") || "1";
  stationLabel.textContent = station;

  function escape(t){
    return String(t||"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));
  }

  async function loadStationList(){
    listEl.innerHTML = "<div class='hint'>Loading…</div>";

    try{
      const data = await apiGet({cmd:"stationlist", station});
      if (!data || !data.ok){
        listEl.innerHTML = "<div class='hint error'>Failed to load.</div>";
        return;
      }

      const entries = data.entries || [];

      if (!entries.length){
        listEl.innerHTML = "<div class='hint'>No entries for this station.</div>";
        return;
      }

      listEl.innerHTML = "";

      entries.forEach((p, idx)=>{
        const div = document.createElement("button");
        div.type = "button";
        div.className = `station-card ${p.status==="done" ? "done" : "pending"}`;

        div.innerHTML = `
          <div class="top-row">
            <span>Heat ${escape(p.heat)}</span>
            <span>#${idx+1} • ${escape(p.entryId)}</span>
          </div>
          <div class="name">${escape(p.displayName)}</div>
          <div class="team">${escape(p.team)}</div>
          <div class="status">
            ${p.status==="done" ? "DONE (SUBMITTED)" : "NOT DONE (TAP TO JUDGE)"}
          </div>
        `;

        div.addEventListener("click", ()=>{
          if (window.speedLookupById){
            window.speedLookupById(p.entryId);
            window.scrollTo({top:0,behavior:"smooth"});
          }
        });

        listEl.appendChild(div);
      });

    }catch(err){
      listEl.innerHTML = "<div class='hint error'>Error loading station data.</div>";
    }
  }

  if (btnRefresh){
    btnRefresh.addEventListener("click", loadStationList);
  }

  /** Give Google Sheets time to write the row */
  window.addEventListener("speed:submitSuccess", ()=>{
    setTimeout(()=>loadStationList(), 1000);
  });

  loadStationList();
})();
