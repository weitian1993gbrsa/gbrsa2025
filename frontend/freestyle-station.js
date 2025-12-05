(function () {

  const $ = (q, el=document) => el.querySelector(q);

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
     SECURITY CHECK
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
     CACHE
  ============================================================ */
  const CACHE_KEY = "freestyle_cache_" + station;

  const saveCache = (d) =>
    localStorage.setItem(CACHE_KEY, JSON.stringify(d));

  const loadCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const esc = (s) =>
    String(s||"").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",
      "\"":"&quot;","'":"&#39;"
    }[c]));

  const formatNames = (p) =>
    [p.NAME1].filter(v => v && v.trim()).map(esc).join(", ");


  /* ============================================================
     CARD CREATION
  ============================================================ */
  function createCard(p) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = p.status === "done"
      ? "station-card done"
      : "station-card pending";

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

    card.onclick = () => {

      location.href =
        `freestyle-judge.html?id=${p.entryId}`
        + `&name1=${encodeURIComponent(p.NAME1||"")}`
        + `&team=${encodeURIComponent(p.team||"")}`
        + `&state=${encodeURIComponent(p.state||"")}`
        + `&heat=${encodeURIComponent(p.heat||"")}`
        + `&station=${station}`
        + `&key=${key}`
        + `&judgeType=${judgeType}`;
    };

    return card;
  }

  /* ============================================================
     LOAD LIST
  ============================================================ */
  async function load() {
    const cache = loadCache();
    if (cache) render(cache);
    else listEl.innerHTML = `<div class="hint">Loading…</div>`;

    const data = await apiGet({
      cmd:"stationlist",
      station,
      _ts:Date.now()
    }).catch(() => null);

    if (!data || !data.ok) return;

    saveCache(data);
    render(data);
  }

  function render(data) {
    let arr = (data.entries || [])
      .filter(p => window.FREESTYLE_EVENTS.includes(String(p.event).trim()));

    arr.sort((a,b)=>Number(a.heat)-Number(b.heat));

    listEl.innerHTML = "";
    arr.forEach(p => listEl.appendChild(createCard(p)));
  }

  btnRefresh.onclick = () => location.reload();
  window.onload = load;

})();
