(function () {

  const $ = (q, el = document) => el.querySelector(q);

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station");
  const key = qs.get("key");

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");
  const btnRefresh = $("#btnRefresh");

  stationLabel.textContent = station;

  /* ============================================================
     SECURITY
  ============================================================ */
  const k = window.JUDGE_KEYS[key];
  if (!k || k.event !== "speed" || String(k.station) !== station) {
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
  const CACHE_KEY = "station_cache_" + station;

  function saveCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])
    );
  }

  const formatNames = p => esc(p.NAME1 || "");

  /* ============================================================
     CARD CREATION
  ============================================================ */
  function createCard(p) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = p.status === "done" ? "station-card done" : "station-card pending";

    /* ROW: HEAT + ID */
    const top = document.createElement("div");
    top.className = "top-row";

    const heat = document.createElement("span");
    heat.textContent = "Heat " + p.heat;

    const id = document.createElement("span");
    id.textContent = "ID#: " + p.entryId;

    top.appendChild(heat);
    top.appendChild(id);

    /* NAME */
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = formatNames(p);

    /* TEAM */
    const team = document.createElement("div");
    team.className = "team";
    team.textContent = p.team || "";

    /* EVENT + STATUS */
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

    /* ============================================================
       ⭐ FIX: MUST SAVE FULL ENTRY FOR JUDGECORE
       So EVENT + DIVISION + NAME + TEAM go into Google Sheet correctly
    ============================================================ */
    card.addEventListener("click", () => {

      // Save full participant data EXACTLY as received from backend
      localStorage.setItem("currentEntry", JSON.stringify({
        NAME1: p.NAME1 || "",
        NAME2: p.NAME2 || "",
        NAME3: p.NAME3 || "",
        NAME4: p.NAME4 || "",
        TEAM: p.team || "",
        STATE: p.state || "",
        HEAT: p.heat || "",
        EVENT: p.event || "",
        DIVISION: p.division || "",
        ID: p.entryId || ""
      }));

      // Redirect to speed judge
      location.href =
        `speed-judge.html?id=${p.entryId}`
        + `&station=${station}`
        + `&key=${key}`;
    });

    return card;
  }

  /* ============================================================
     SORT & RENDER
  ============================================================ */
  function sortEntries(arr) {
    return arr.sort((a, b) => Number(a.heat) - Number(b.heat));
  }

  function render(data) {
    let arr = data.entries || [];
    arr = sortEntries(arr);

    listEl.innerHTML = "";
    arr.forEach(p => listEl.appendChild(createCard(p)));
  }

  /* ============================================================
     LOAD FROM SERVER OR CACHE
  ============================================================ */
  async function load() {
    const cached = loadCache();
    if (cached) render(cached);
    else listEl.innerHTML = `<div class="hint">Loading…</div>`;

    const data = await apiGet({
      cmd: "stationlist",
      station,
      _ts: Date.now()
    }).catch(() => null);

    if (!data || !data.ok) return;

    saveCache(data);
    render(data);
  }

  /* ============================================================
     REFRESH BUTTON (Clear cache + hard reload)
  ============================================================ */
  btnRefresh.addEventListener("click", () => {
    localStorage.removeItem(CACHE_KEY);
    location.reload();
  });

  window.addEventListener("load", load);

})();
