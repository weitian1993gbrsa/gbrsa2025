(function(){
  const $ = (q,el=document)=>el.querySelector(q);

  const listEl = $('#entryList');
  const stationLabel = $('#stationLabel');
  const btnRefresh = $('#btnRefresh');

  const params = new URLSearchParams(location.search);
  const station = params.get("station") || "1";
  stationLabel.textContent = station;

  let cache = {id:null, data:null, ts:0};

  async function cachedLookup(id){
    const now = Date.now();
    if (cache.id === id && now - cache.ts < 2000){
      return cache.data;
    }
    const data = await apiGet({cmd:"participant", entryId:id});
    cache = {id, data, ts:now};
    return data;
  }

  function esc(t){
    return String(t||"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));
  }

  async function loadStationList(){
    listEl.innerHTML = "<div class='hint'>Loading…</div>";

    try{
      const data = await apiGet({cmd:"stationlist", station});
      if (!data || !data.ok){
        listEl.innerHTML = "<div class='hint error'>Failed to load station data.</div>";
        return;
      }

      const arr = data.entries || [];
      if (!arr.length){
        listEl.innerHTML = "<div class='hint'>No participants assigned.</div>";
        return;
      }

      listEl.innerHTML = "";
      arr.forEach((e, i)=>{
        const card = document.createElement("button");
        card.type = "button";
        card.className = `station-card ${e.status==="done" ? "done" : "pending"}`;

        card.innerHTML = `
          <div class="top-row">
            <span>Heat ${esc(e.heat)}</span>
            <span>#${i+1} • ${esc(e.entryId)}</span>
          </div>
          <div class="name">${esc(e.displayName)}</div>
          <div class="team">${esc(e.team)}</div>
          <div class="status">
            ${e.status==="done" ? "DONE (SUBMITTED)" : "NOT DONE (TAP TO JUDGE)"}
          </div>
        `;

        card.addEventListener("click", async ()=>{
          await cachedLookup(e.entryId);
          if (window.speedLookupById){
            window.speedLookupById(e.entryId);
          }
          window.scrollTo({top:0,behavior:"smooth"});
        });

        listEl.appendChild(card);
      });

    }catch(err){
      listEl.innerHTML = "<div class='hint error'>Error loading station.</div>";
    }
  }

  /** Manual refresh */
  if (btnRefresh){
    btnRefresh.addEventListener("click", loadStationList);
  }

  /** Auto refresh after submit (delay for Google Sheets write) */
  window.addEventListener("speed:submitSuccess", ()=>{
    setTimeout(()=>loadStationList(), 1000);
  });

  /** Load only AFTER whole page + speed.js is ready */
  window.addEventListener("load", ()=>{
    setTimeout(loadStationList, 300);
  });

})();
