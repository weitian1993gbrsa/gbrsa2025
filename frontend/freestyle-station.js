(function () {

  // ============================================================
  // CLEAR CACHE ON HARD REFRESH (same as speed-station.js)
  // ============================================================
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("fs_station_cache_")) {
        localStorage.removeItem(k);
      }
    });
  }

  const $ = (q, el = document) => el.querySelector(q);

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");
  const btnRefresh = $("#btnRefresh");

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station");
  const key = qs.get("key");
  const judgeType = qs.get("judgeType"); // difficulty / technical / re / presentation

  // ============================================================
  // SECURITY CHECK (same logic)
  // ============================================================
  const keyInfo = window.JUDGE_KEYS[key];
  if (!keyInfo || keyInfo.event !== "freestyle") {
    document.body.innerHTML =
      `<div style="padding:2rem;text-align:center;color:red;">
        <h2>Invalid Access</h2>
      </div>`;
    return;
  }

  if (!judgeType) {
    document.body.innerHTML =
      `<div style="padding:2rem;text-align:center;color:red;">
        <h2>Missing judgeType</h2>
      </div>`;
    return;
  }

  stationLabel.textContent = station;

  // ============================================================
  // HTML ESCAPE
  // ============================================================
  const esc = s => String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    "\"": "&quot;", "'": "&#39;"
  }[c]));

  // ============================================================
  // NAME FORMAT (freestyle has only NAME1)
  // ============================================================
  function formatName(p) {
    return esc(p.NAME1 || "");
  }

  // ============================================================
  // CACHE SYSTEM (copied from speed-station)
  // ============================================================
  const CACHE_KEY = `fs_station_cache_${station}_${judgeType}`;

  function saveCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  // ============================================================
  // CREATE CARD (copied behavior from speed)
  // ============================================================
  function createCard(p) {
    const card = document.createElement("button");
    card.type = "button";
    card.className =
      p.status === "done" ? "station-card done" : "station-card pending";

    card.style.touchAction = "manipulation";

    // --- TOP ROW ---
    const top = document.createElement("div");
    top.className = "top-row";

    const heat = document.createElement("span");
    heat.textContent = "Heat " + p.heat;

    const idLabel = document.createElement("span");
    idLabel.textContent = `ID#: ${p.entryId}`;

    top.appendChild(heat);
    top.appendChild(idLabel);

    // --- NAME ---
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = formatName(p);

    // --- TEAM ---
    const team = document.createElement("div");
    team.className = "team";
    team.textContent = p.team || "";

    // --- STATUS + EVENT ---
    const eventRow = document.createElement("div");
    eventRow.className = "event-row";

    const statusEl = document.createElement("div");
    statusEl.className = "status";
    statusEl.textContent = p.status === "done" ? "COMPLETED" : "NEW";

    const evt = document.createElement("div");
    evt.className = "event";
    evt.textContent = p.event;

    eventRow.appendChild(statusEl);
    eventRow.appendChild(evt);

    // Append
    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(team);
    card.appendChild(eventRow);

    // ============================================================
    // SAFE CLICK HANDLER (same as speed)
    // ============================================================
    card.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // block double-tap
      if (card.dataset.clicked === "1") return;
      card.dataset.clicked = "1";
      setTimeout(() => card.dataset.clicked = "0", 400);

      // disable for a moment
      card.style.pointerEvents = "none";
      setTimeout(() => (card.style.pointerEvents = ""), 800);

      if (!navigator.onLine) {
        alert("No internet connection — cannot judge.");
        return;
      }

      // redirect to correct judge page
      location.href =
        `freestyle-${judgeType}.html`
        + `?judgeType=${judgeType}`
        + `&id=${p.entryId}`
        + `&name1=${encodeURIComponent(p.NAME1 || "")}`
        + `&team=${encodeURIComponent(p.team || "")}`
        + `&state=${encodeURIComponent(p.state || "")}`
        + `&heat=${encodeURIComponent(p.heat || "")}`
        + `&station=${station}`
        + `&key=${key}`
        + `&event=${encodeURIComponent(p.event || "")}`
        + `&division=${encodeURIComponent(p.division || "")}`;
    });

    return card;
  }

  // ============================================================
  // SORT BY HEAT ONLY
  // ============================================================
  function sortEntries(arr) {
    return arr.sort((a, b) => Number(a.heat) - Number(b.heat));
  }

  // ============================================================
  // RENDER LIST
  // ============================================================
  function renderList(data) {
    let arr = data.entries || [];
    arr = sortEntries(arr);

    listEl.innerHTML = "";
    arr.forEach(p => listEl.appendChild(createCard(p)));
  }

  // ============================================================
  // LOAD (Cache → Backend)
  // ============================================================
  async function load() {
    const cached = loadCache();
    if (cached) {
      renderList(cached);
    } else {
      listEl.innerHTML = `<div class="hint">Loading…</div>`;
    }

    const data = await apiGet({
      cmd: "stationlist_fs",
      station,
      judgeType,
      _ts: Date.now()
    }).catch(() => null);

    if (!data || !data.ok) return;

    saveCache(data);
    renderList(data);
  }

  // ============================================================
  // REFRESH BUTTON
  // ============================================================
  btnRefresh.addEventListener("click", () => {
    location.reload();
  });

  window.addEventListener("load", load);

})();
