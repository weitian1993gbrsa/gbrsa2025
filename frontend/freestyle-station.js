(function () {

  /* ============================================================
     UTILITIES
  ============================================================ */
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
  judgeTypeLabel.textContent = judgeType ? judgeType.toUpperCase() : "";


  /* ============================================================
     SECURITY CHECK
  ============================================================ */
  const keyInfo = window.JUDGE_KEYS[key];

  if (
    !keyInfo ||
    keyInfo.event !== "freestyle" ||
    String(keyInfo.station) !== String(station)
  ) {
    document.body.innerHTML = `
      <div style="padding:2rem;text-align:center;">
        <h2 style="color:#b00020;">Access Denied</h2>
        <p>Unauthorized access</p>
      </div>
    `;
    throw new Error("Unauthorized");
  }


  /* ============================================================
     CACHE (match SPEED behavior)
  ============================================================ */
  const CACHE_KEY = "freestyle_cache_" + station;

  function saveCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (_) { }
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }


  /* ============================================================
     ESCAPE + NAME FORMAT
  ============================================================ */
  const esc = (s) =>
    String(s || "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[c]));

  // Freestyle only needs NAME1
  function formatNames(p) {
    return esc(p.NAME1 || "");
  }


  /* ============================================================
     CREATE STATION CARD (same UI rules as speed)
  ============================================================ */
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

    const id = document.createElement("span");
    id.textContent = `ID#: ${p.entryId}`;

    top.appendChild(heat);
    top.appendChild(id);

    // --- NAME ---
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = formatNames(p);

    // --- TEAM ---
    const team = document.createElement("div");
    team.className = "team";
    team.textContent = p.team || "";

    // --- EVENT ROW ---
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

    // assemble
    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(team);
    card.appendChild(eventRow);


    /* ============================================================
       CLICK → Freestyle Judge Page
    ============================================================ */
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Same safe click lock like speed
      if (card.dataset.clicked === "1") return;
      card.dataset.clicked = "1";
      setTimeout(() => (card.dataset.clicked = "0"), 400);

      card.style.pointerEvents = "none";
      setTimeout(() => (card.style.pointerEvents = ""), 800);

      if (!navigator.onLine) {
        alert("No internet connection — cannot judge.");
        return;
      }

      location.href =
        `freestyle-judge.html?id=${p.entryId}`
        + `&name1=${encodeURIComponent(p.NAME1 || "")}`
        + `&team=${encodeURIComponent(p.team || "")}`
        + `&state=${encodeURIComponent(p.state || "")}`
        + `&heat=${encodeURIComponent(p.heat || "")}`
        + `&station=${station}`
        + `&key=${key}`
        + `&judgeType=${judgeType}`;
    });

    return card;
  }


  /* ============================================================
     SORT (strict heat order — same as speed)
  ============================================================ */
  function sortEntries(arr) {
    return arr.sort((a, b) => Number(a.heat) - Number(b.heat));
  }


  /* ============================================================
     RENDER LIST
  ============================================================ */
  function renderList(data) {
    let arr = (data.entries || [])
      .filter(p =>
        window.FREESTYLE_EVENTS.includes(String(p.event).trim())
      );

    arr = sortEntries(arr);

    listEl.innerHTML = "";
    arr.forEach((p) => listEl.appendChild(createCard(p)));
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
     REFRESH BUTTON (exact same as SPEED)
  ============================================================ */
  if (btnRefresh) btnRefresh.addEventListener("click", () => {
    location.reload();
  });


  /* ============================================================
     INIT
  ============================================================ */
  window.addEventListener("load", load);

})();
