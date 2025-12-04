(function () {

  // ============================================================
  // CLEAR CACHE ON HARD REFRESH (F5 / Reload)
  // ============================================================
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("freestyle_cache_")) {
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
  const judgeType = qs.get("judgeType");

  stationLabel.textContent = station;

  /* ============================================================
     SECURITY — Must be freestyle judge
  ============================================================ */
  const keyInfo = window.JUDGE_KEYS[key];
  if (!keyInfo || keyInfo.event !== "freestyle") {
    document.body.innerHTML =
      `<h2 style="padding:2rem;color:#b00020;">Invalid Access</h2>`;
    return;
  }

  const FREESTYLE_EVENTS = window.FREESTYLE_EVENTS || [];

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
     CARD CREATION (NO INDEX)
  ============================================================ */
  function createCard(p) {
    const card = document.createElement("button");
    card.type = "button";
    card.className =
      p.status === "done" ? "station-card done" : "station-card pending";

    card.style.touchAction = "manipulation";

    /* HEADER (Heat + ID) */
    const top = document.createElement("div");
    top.className = "top-row";

    const heat = document.createElement("span");
    heat.textContent = "Heat " + p.heat;

    const idLabel = document.createElement("span");
    idLabel.textContent = `ID#: ${p.entryId}`;

    top.appendChild(heat);
    top.appendChild(idLabel);

    /* NAME */
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = formatNames(p);

    /* TEAM */
    const team = document.createElement("div");
    team.className = "team";
    team.textContent = p.team || "";

    /* STATUS + EVENT */
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

    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(team);
    card.appendChild(eventRow);

    /* SAFE TAP HANDLER */
    card.addEventListener("pointerdown", (e) => {
      e.preventDefault();

      if (card.dataset.clicked === "1") return;
      card.dataset.clicked = "1";
      setTimeout(() => (card.dataset.clicked = "0"), 350);

      if (!navigator.onLine) {
        alert("No Internet");
        return;
      }

      location.href =
        `freestyle-${judgeType}.html?id=${p.entryId}`
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
     SORT STRICTLY BY HEAT (JUST LIKE SPEED)
  ============================================================ */
  function sortEntries(arr) {
    return arr.sort((a, b) => Number(a.heat) - Number(b.heat));
  }

  /* ============================================================
     RENDER LIST
  ============================================================ */
  function renderList(data) {
    let arr = (data.entries || []).filter(p =>
      FREESTYLE_EVENTS.includes(String(p.event).trim())
    );

    arr = sortEntries(arr);

    listEl.innerHTML = "";
    arr.forEach(p => listEl.appendChild(createCard(p)));
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
