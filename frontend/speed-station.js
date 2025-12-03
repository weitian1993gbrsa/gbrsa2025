(function () {
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
    deny("Unauthorized access");
    return;
  }

  function deny(msg) {
    document.body.innerHTML =
      `<div style="padding:2rem;text-align:center;">
         <h2 style="color:#b00020;">Access Denied</h2>
         <p>${msg}</p>
       </div>`;
    throw new Error(msg);
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

  /* SPEED EVENTS */
  const SPEED_EVENTS = window.SPEED_EVENTS || [];

  /* ============================================================
     SAFE CACHE SYSTEM (Instant Load)
  ============================================================ */
  const CACHE_KEY = "station_cache_" + station;

  function saveCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      "\"": "&quot;", "'": "&#39;"
    }[c]));
  }

  function formatNames(p) {
    return [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(v => v && v.trim())
      .map(esc)
      .join(", ");
  }

  /* ============================================================
     CARD CREATION (with SAFE click handler)
  ============================================================ */
  function createCard(p, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className =
      p.status === "done" ? "station-card done" : "station-card pending";

    /* Prevent ghost-taps */
    card.style.touchAction = "manipulation";

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
    statusEl.textContent = p.status === "done" ? "COMPLETED" : "NEW";

    const eventName = document.createElement("div");
    eventName.className = "event";
    eventName.textContent = p.event;

    eventRow.appendChild(statusEl);
    eventRow.appendChild(eventName);

    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(team);
    card.appendChild(eventRow);

    /* ============================================================
       SAFEST CLICK HANDLER (no ghost taps, no double clicks)
    ============================================================ */
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (!navigator.onLine) {
        alert("No internet connection — cannot judge.");
        return;
      }

      // prevent double-tap
      if (card.dataset.clicked === "1") return;
      card.dataset.clicked = "1";
      setTimeout(() => (card.dataset.clicked = "0"), 500);

      // block touch through
      card.style.pointerEvents = "none";
      setTimeout(() => (card.style.pointerEvents = ""), 800);

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
     RENDER LIST
  ============================================================ */
  function renderList(data) {
    let arr = (data.entries || []).filter(p =>
      SPEED_EVENTS.includes(String(p.event).trim())
    );

    /* Sort NEW (green) → COMPLETED (blue) */
    arr.sort((a, b) => {
      const A = a.status === "done" ? "COMPLETED" : "NEW";
      const B = b.status === "done" ? "COMPLETED" : "NEW";

      if (A === "NEW" && B !== "NEW") return -1;
      if (B === "NEW" && A !== "NEW") return 1;
      if (A === "COMPLETED" && B !== "COMPLETED") return 1;
      if (B === "COMPLETED" && A !== "COMPLETED") return -1;
      return 0;
    });

    listEl.innerHTML = "";
    arr.forEach((p, i) => listEl.appendChild(createCard(p, i)));
  }

  /* ============================================================
     LOAD (Instant Cache → Fresh Data)
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
     REFRESH BUTTON (Full Reload)
  ============================================================ */
  if (btnRefresh) btnRefresh.addEventListener("click", () => {
    location.reload();
  });

  /* Faster load */
  window.addEventListener("load", load);
})();
