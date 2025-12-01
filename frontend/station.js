(function(){
  const $ = (q,el=document)=>el.querySelector(q);

  const listEl = $('#entryList');
  const stationLabel = $('#stationLabel');
  const btnRefresh = $('#btnRefresh');

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station") || "1";
  stationLabel.textContent = station;

  /** Simple HTML escape */
  function esc(s){
    return String(s || "").replace(/[&<>"']/g, m => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;"
    }[m]));
  }

  /** Cache last participant lookup to speed up clicking */
  let lookupCache = {id:null, data:null, ts:0};

  async function cachedParticipant(id){
    const now = Date.now();
    if (lookupCache.id === id && (now - lookupCache.ts) < 2500){
      return lookupCache.data;
    }
    const data = await apiGet({cmd:"participant", entryId:id});
    lookupCache = {id, data, ts:now};
    return data;
  }

  /** MAIN LOADER */
  async function loadStationList(){
    listEl.innerHTML = `<div class="hint">Loading…</div>`;

    try {
      const data = await apiGet({cmd:"stationlist", station});
      if (!data || !data.ok){
        listEl.innerHTML = `<div class="hint error">Unable to load station entries.</div>`;
        return;
      }

      const entries = data.entries || [];
      if (!entries.length){
        listEl.innerHTML = `<div class="hint">No participants assigned to this station.</div>`;
        return;
      }

      listEl.innerHTML = "";

      entries.forEach((p, idx)=>{
        const card = document.createElement("button");
        card.type = "button";
        card.className = `station-card ${p.status === "done" ? "done" : "pending"}`;

        card.innerHTML = `
          <div class="top-row">
            <span>Heat ${esc(p.heat)}</span>
            <span>#${idx+1} • ${esc(p.entryId)}</span>
          </div>
          <div class="name">${esc(p.displayName)}</div>
          <div class="team">${esc(p.team)}</div>
          <div class="status">
            ${p.status === "done" ? "DONE (SUBMITTED)" : "NOT DONE (TAP TO JUDGE)"}
          </div>
        `;

        /** When card is clicked → load participant → open judge form */
        card.addEventListener("click", async ()=>{
          await cachedParticipant(p.entryId);

          if (window.speedLookupById){
            window.speedLookupById(p.entryId);
          } else {
            console.warn("speedLookupById not found. Ensure speed.js loads BEFORE station.js");
          }

          window.scrollTo({top:0, behavior:"smooth"});
        });

        listEl.appendChild(card);
      });

    } catch (err){
      console.error(err);
      listEl.innerHTML = `<div class="hint error">Error loading station list.</div>`;
    }
  }

  /** Manual refresh button */
  if (btnRefresh){
    btnRefresh.addEventListener("click", loadStationList);
  }

  /** Auto refresh after submitting result */
  window.addEventListener("speed:submitSuccess", ()=>{
    setTimeout(loadStationList, 1000);  // wait for Google Sheets to finish writing
  });

  /** Load AFTER page fully ready */
  window.addEventListener("load", ()=>{
    setTimeout(loadStationList, 300);
  });

})();
