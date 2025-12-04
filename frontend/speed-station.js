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

  /* ============================================================
     FREESTYLE REDIRECT
  ============================================================ */
  if (keyInfo.event === "freestyle") {
    const judgeType = keyInfo.judgeType;
    location.href =
      `freestyle-station.html?station=${station}&judgeType=${judgeType}&key=${key}`;
    return;
  }

  const SPEED_EVENTS = window.SPEED_EVENTS || [];

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
     CARD CREATION (index = sorted order)
  ============================================================ */
  function createCard(p, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className =
      p.status === "done" ? "station-card done" : "station-card pending";

    card.style.touchAction = "manipulation"; // prevent ghost taps

    /* TOP ROW */
    const top = document.createElement("div");
    top.className = "top-row";

    const heat = document.createElement("span");
    heat.textContent = "Heat " + p.heat;

    const num = document.createElement("span");
    num.textContent = `#${index + 1} • ${p.entryId}`;

    top.appendChild(heat);
    top.appendChild(num);

    /* NAME */
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = formatNames(p);

    /* TEAM */
    const team = document.createElement("div");
    team.className = "team";
    team.textContent = p.team || "";

    /* EVENT ROW */
    const eventRow = document.createElement("div");
    eventRow.className = "event-row";

    const statusEl = document.createElement("div");
    statusEl.className = "status";
    statusEl.textContent = (p.status === "done") ? "COMPLETED" : "NEW";

    const eventName = document.createElement("div");
    eventName.className = "event";
    eventName.textContent = p.event;

    eventRow.appendChild(statusEl);
    eventRow.appendChild(eventName);

    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(team);
    card.appendChild(eventRow);

    /* SAFE CLICK HANDLER */
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (card.dataset.clicked === "1") return;
      card.dataset.clicked = "1";
      setTimeout(() => card.dataset.clicked = "0", 400);

      card.style.pointerEvents = "none";
      setTimeout(() => (card.style.pointerEvents = ""), 800);

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
     SORT BY HEAT ONLY (ASCENDING)
  ============================================================ */
  function sortEntries(arr) {
    return arr.sort((a, b) => Number(a.heat) - Number(b.heat));
  }

  /* ============================================================
     RENDER LIST
  ============================================================ */
  function renderList(data) {
    let arr = (data.entries || []).filter(p =>
      SPEED_EVENTS.includes(String(p.event).trim())
    );

    // ⭐ SORT STRICTLY BY HEAT NUMBER ONLY
    arr = sortEntries(arr);

    listEl.innerHTML = "";
    arr.forEach((p, i) => listEl.appendChild(createCard(p, i)));
  }

  /* ============================================================
     LOAD (Cache → Backend)
  ============================================================ */
  async function load() {
    const cached = loadCache();
    if (cached) {
      renderList(cached);
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
