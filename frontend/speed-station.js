(function () {

  // ============================================================
  // CLEAR CACHE ON HARD REFRESH (F5 / Reload)
  // ============================================================
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("station_cache_")) {
        localStorage.removeItem(k);
      }
    });
  }

  const $ = (q, el = document) => el.querySelector(q);

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");
  const btnRefresh = $("#btnRefresh");

  const qs = new URLSearchParams(location.search);

  const station = qs.get("station") || "1";
  const key = qs.get("key");

  stationLabel.textContent = station;

  /* ============================================================
     SECURITY — Key must match station
  ============================================================ */
  const keyInfo = window.JUDGE_KEYS[key];
  if (!keyInfo || String(keyInfo.station) !== String(station)) {
    document.body.innerHTML =
      `<div style="padding:2rem;text-align:center;">
        <h2 style="color:#b00020;">Access Denied</h2>
        <p>Unauthorized access</p>
      </div>`;
    throw new Error("Unauthorized");
  }

  /* FREESTYLE → redirect */
  if (keyInfo.event === "freestyle") {
    const judgeType = keyInfo.judgeType;
    location.href =
      `freestyle-station.html?station=${station}&judgeType=${judgeType}&key=${key}`;
    return;
  }

  const SPEED_EVENTS = window.SPEED_EVENTS || [];
  const SPEED_SET = new Set(SPEED_EVENTS);

  /* ============================================================
     CACHE SYSTEM
  ============================================================ */
  const CACHE_KEY = "station_cache_" + station;

  function saveCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  const esc = s => String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    "\"": "&quot;", "'": "&#39;"
  }[c]));

  function formatNames(p) {
    return [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(v => v && v.trim())
      .map(esc)
      .join(", ");
  }

  /* ============================================================
     CARD CREATION (EXTREMELY LIGHTWEIGHT)
  ============================================================ */
  function createCard(p) {
    const card = document.createElement("button");
    card.className = (p.status === "done") ? "station-card done" : "station-card pending";
    card.type = "button";
    card.style.touchAction = "manipulation";

    card.innerHTML = `
      <div class="top-row">
        <span>Heat ${p.heat}</span>
        <span>ID#: ${p.entryId}</span>
      </div>
      <div class="name">${formatNames(p)}</div>
      <div class="team">${p.team || ""}</div>
      <div class="event-row">
        <div class="status">${(p.status === "done") ? "COMPLETED" : "NEW"}</div>
        <div class="event">${p.event}</div>
      </div>
    `;

    /* SAFE CLICK */
    card.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (card.dataset.clicked === "1") return;
      card.dataset.clicked = "1";
      setTimeout(() => (card.dataset.clicked = "0"), 400);

      if (!navigator.onLine) {
        alert("No internet connection — cannot judge.");
        return;
      }

      location.href =
        `speed-judge.html?id=${p.entryId}`
        + `&name1=${encodeURIComponent(p.NAME1 || "")}`
        + `&name2=${encodeURIComponent(p.NAME2 || "")}`
        + `&name3=${encodeURIComponent(p.NAME3 || "")}`
        + `&name4=${encodeURIComponent(p.NAME4 || "")}`
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

  /* ============================================================
     SORT STRICTLY BY HEAT
  ============================================================ */
  function sortEntries(arr) {
    return arr.sort((a, b) => Number(a.heat) - Number(b.heat));
  }

  /* ============================================================
     SUPER-FAST RENDERING (ADAPTIVE)
  ============================================================ */
  function renderList(data) {
    let arr = (data.entries || []).filter(p =>
      SPEED_SET.has(String(p.event).trim())
    );

    arr = sortEntries(arr);
    listEl.innerHTML = "";

    // Adaptive chunk size → fast phones get bigger chunks
    let CHUNK =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 6)
        ? 25
        : 10;

    let i = 0;

    function renderChunk() {
      const end = Math.min(i + CHUNK, arr.length);

      const frag = document.createDocumentFragment();
      for (; i < end; i++) {
        frag.appendChild(createCard(arr[i]));
      }
      listEl.appendChild(frag);

      if (i < arr.length) {
        requestIdleCallback(renderChunk, { timeout: 50 });
      }
    }

    renderChunk();
  }

  /* ============================================================
     LOAD (Cache → Backend)
  ============================================================ */
  async function load() {
    const cached = loadCache();
    if (cached) {
      renderList(cached);   // Instantly show cached version
    } else {
      listEl.innerHTML = `<div class="hint">Loading…</div>`;
    }

    const data = await apiGet({
      cmd: "stationlist",
      station,
      _ts: Date.now()
    }).catch(() => null);

    if (!data || !data.ok) return;

    saveCache(data);
    renderList(data);
  }

  /* ============================================================
     REFRESH BUTTON
  ============================================================ */
  if (btnRefresh) btnRefresh.addEventListener("click", () => {
    location.reload();
  });

  window.addEventListener("load", load);

})();
