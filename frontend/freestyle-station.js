(function () {

  const $ = (q, el = document) => el.querySelector(q);

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");
  const judgeLabel = $("#judgeTypeLabel");
  const btnRefresh = $("#btnRefresh");

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station");
  const key = qs.get("key");
  const judgeType = qs.get("judgeType"); // difficulty / technical / re / presentation

  /* ============================================================
     SECURITY CHECK
  ============================================================ */
  const keyInfo = window.JUDGE_KEYS[key];
  if (!keyInfo || keyInfo.event !== "freestyle") {
    document.body.innerHTML =
      `<h2 style="padding:2rem;color:red;">Invalid Access</h2>`;
    return;
  }

  if (!judgeType) {
    document.body.innerHTML =
      `<h2 style="padding:2rem;color:red;">Missing judgeType</h2>`;
    return;
  }

  stationLabel.textContent = station;
  judgeLabel.textContent = judgeType.toUpperCase();

  /* ============================================================
     HTML ESCAPE
  ============================================================ */
  const esc = s => String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    "\"": "&quot;", "'": "&#39;"
  }[c]));

  /* ============================================================
     NAME FORMAT (ONLY NAME1)
  ============================================================ */
  function formatName(p) {
    return esc(p.NAME1 || "");
  }

  /* ============================================================
     CREATE CARD
  ============================================================ */
  function createCard(p) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = p.status === "done"
      ? "station-card done"
      : "station-card pending";

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

    /* NAME1 ONLY */
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = formatName(p);

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

    /* APPEND ALL */
    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(team);
    card.appendChild(eventRow);

    /* CARD CLICK HANDLER — FIXED WITH judgeType PASSING */
    card.addEventListener("pointerdown", (e) => {
      e.preventDefault();

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

  /* ============================================================
     SORT BY HEAT
  ============================================================ */
  function sortEntries(arr) {
    return arr.sort((a, b) => Number(a.heat) - Number(b.heat));
  }

  /* ============================================================
     RENDER
  ============================================================ */
  function renderList(data) {
    let arr = data.entries || [];
    arr = sortEntries(arr);

    listEl.innerHTML = "";
    arr.forEach(p => listEl.appendChild(createCard(p)));
  }

  /* ============================================================
     LOAD
  ============================================================ */
  async function load() {
    listEl.innerHTML = `<div class="hint">Loading…</div>`;

    const data = await apiGet({
      cmd: "stationlist_fs",
      station,
      judgeType,
      _ts: Date.now()
    }).catch(() => null);

    if (!data || !data.ok) {
      listEl.innerHTML = `<div class="hint">Failed to load</div>`;
      return;
    }

    renderList(data);
  }

  /* ============================================================
     REFRESH BUTTON
  ============================================================ */
  btnRefresh.addEventListener("click", load);

  window.addEventListener("load", load);

})();
