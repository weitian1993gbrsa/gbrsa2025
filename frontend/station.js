(function(){
  const $ = (q, el=document) => el.querySelector(q);

  const listEl       = $('#entryList');
  const stationInfo  = $('#stationInfo');
  const stationLabel = $('#stationLabel');
  const btnRefresh   = $('#btnRefresh');

  const params  = new URLSearchParams(location.search);
  const station = (params.get('station') || '1').trim();

  if (stationLabel) stationLabel.textContent = station;

  function escapeHtml(s) {
    const map = {
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    };
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return map[c] || c;
    });
  }

  async function loadStationList() {
    if (!listEl) return;
    listEl.innerHTML = '<div class="hint">Loading…</div>';

    try {
      const data = await apiGet({ cmd: 'stationlist', station });
      if (!data || !data.ok) {
        listEl.innerHTML = '<div class="hint error">Failed to load station list.</div>';
        if (window.toast) toast(data && data.error ? data.error : 'Load failed');
        return;
      }
      const entries = data.entries || [];

      if (!entries.length) {
        listEl.innerHTML = '<div class="hint">No participants found for this station.</div>';
        return;
      }

      listEl.innerHTML = '';
      entries.forEach((p, idx) => {
        const card = document.createElement('button');
        card.type = 'button';

        const status = p.status === 'done' ? 'done' : 'pending';
        card.className = 'station-card ' + status;

        card.innerHTML = `
          <div class="top-row">
            <span>Heat ${escapeHtml(p.heat || '-') }</span>
            <span>#${idx + 1} • ${escapeHtml(p.entryId || '')}</span>
          </div>
          <div class="name">${escapeHtml(p.displayName || '')}</div>
          <div class="team">${escapeHtml(p.team || '')}</div>
          <div class="status">
            ${status === 'done' ? 'DONE (submitted)' : 'NOT DONE (tap to judge)'}
          </div>
        `;

        card.addEventListener('click', () => {
          if (window.speedLookupById) {
            window.speedLookupById(p.entryId);
            const cardEl = document.getElementById('participantCard');
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else {
            if (window.toast) toast('Speed script not ready.');
          }
        });

        listEl.appendChild(card);
      });

      if (stationInfo) {
        stationInfo.textContent = `Showing ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} for Station ${station}.`;
      }
    } catch (err) {
      console.error(err);
      listEl.innerHTML = '<div class="hint error">Error loading station list.</div>';
      if (window.toast) toast('Error loading station list');
    }
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', loadStationList);
  }

  window.addEventListener('speed:submitSuccess', () => {
    loadStationList();
  });

  loadStationList();
})();
