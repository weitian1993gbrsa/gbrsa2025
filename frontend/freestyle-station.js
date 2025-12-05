(function () {

  /* ============================================================
     CLEAR CACHE ON HARD RELOAD
  ============================================================ */
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("freestyle_cache_")) {
        localStorage.removeItem(k);
      }
    });
  }

  const $ = (q, el = document) => el.querySelector(q);

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station");
  const judgeType = qs.get("judgeType");
  const key = qs.get("key");

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");
  const judgeTypeLabel = $("#judgeTypeLabel");
  const btnRefresh = $("#btnRefresh");

  stationLabel.textContent = station;
  judgeTypeLabel.textContent = judgeType.toUpperCase();

  /* ============================================================
     SECURITY
  ============================================================ */
  const k = window.JUDGE_KEYS[key];
  if (!k || k.event !== "freestyle" || String(k.station) !== station) {
    document.body.innerHTML =
      `<div style="padding:2rem;text-align:center;">
        <h2 style="color:#b00020;">Access Denied</h2>
        <p>Unauthorized access</p>
      </div>`;
    throw new Error("Unauthorized");
  }

  /* ============================================================
     CACHE SYSTEM
  ============================================================ */
  const CACHE_KEY = "freestyle_cache_" + station;

  function saveCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  const esc = s =>
    String(s || "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])
    );

  const formatNames = p => esc(p.NAME1 || "");

  /* ============================================================
     CARD CREATION
  ============================================================ */
  function createCard(p) {
    const card = document.createElement("button");
    card.type = "button";

    card.className =
      p.status === "done" ? "station-card done" : "station-card pending";

    const top = document.createElement("div");
    top.className = "top-row";

    const heat = document.createElement("span");
    heat.textContent = "Heat " + p.heat;

    const id = document.createElement("span");
    id.textContent = "ID#: " + p.entryId;

    top.appendChild(heat);
    top.appendChild(id);

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = formatNames(p);

    const team = document.createElement("div");
    team.className = "team";
    team.textContent = p.team || "";

    const eventRow = document.createElement("div");
    eventRow.className = "event-row";

    const status = document.createElement("div");
    status.className = "status";
    status.textContent = p.status === "done" ? "COMPLETED" : "NEW";

    const eventName = document.createElement("div");
    eventName.className = "event";
    eventName.textContent = p.event;

    eventRow.appendChild(status);
    eventRow.appendChild(eventName);

    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(team);
    card.appendChild(eventRow);

    card.addEventListener("click", () => {
      location.href =
        `freestyle-difficulty.html?id=${p.entryId}`
        + `&name1=${encodeURIComponent(p.NAME1 || "")}`
        + `&team=${encodeURIComponent(p.team || "")}`
        + `&state=${encodeURIComponent(p.state || "")}`
        + `&heat=${encodeURIComponent(p.heat || "")}`
        + `&station=${station}`
        + `&key=${key}`
        + `&event=${encodeURIComponent(p.event || "")}`
        + `&division=${encodeURIComponent(p.division || "")}`
        + `&judgeType=${judgeType}`;
    });

    return card;
  }

  /* ============================================================
     SORT
  ============================================================ */
  function sortEntries(arr) {
    return arr.sort((a, b) => Number(a.heat) - Number(b.heat));
  }

  /* ============================================================
     RENDER
  ============================================================ */
  function render(data) {
    let arr = (data.entries || [])
      .filter(p => window.FREESTYLE_EVENTS.includes(String(p.event).trim()));

    arr = sortEntries(arr);

    listEl.innerHTML = "";
    arr.forEach(p => listEl.appendChild(createCard(p)));
  }

  /* ============================================================
     LOAD DATA
  ============================================================ */
  async function load() {
    const cached = loadCache();
    if (cached) render(cached);
    else listEl.innerHTML = `<div class="hint">Loading…</div>`;

    const data = await apiGet({
      cmd: "stationlist",
      station,
      judgeType,
      _ts: Date.now()
    }).catch(() => null);

    if (!data || !data.ok) return;

    saveCache(data);
    render(data);
  }

  /* ============================================================
     ⭐ REFRESH BUTTON FIX — CLEAR CACHE FIRST
  ============================================================ */
  if (btnRefresh)
    btnRefresh.addEventListener("click", () => {
      localStorage.removeItem("freestyle_cache_" + station); // clear cache
      location.reload();                                     // force reload
    });

  window.addEventListener("load", load);

})();
