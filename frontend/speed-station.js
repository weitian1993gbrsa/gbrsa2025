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
     🔥 FREESTYLE KEYS SHOULD REDIRECT (safety)
  ============================================================ */
  if (keyInfo.event === "freestyle") {
    const judgeType = keyInfo.judgeType;
    location.href =
      `freestyle-station.html?station=${station}&judgeType=${judgeType}&key=${key}`;
    return;
  }

  /* ============================================================
     SPEED MODE — FILTER ONLY SPEED EVENTS
  ============================================================ */
  const SPEED_EVENTS = window.SPEED_EVENTS || [];

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

  function createCard(p, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className =
      p.status === "done" ? "station-card done" : "station-card pending";

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

    /* Append */
    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(team);
    card.appendChild(eventRow);

    /* Click → speed-judge */
    card.onclick = () => {
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
    };

    return card;
  }

  /* ============================================================
     LOAD LIST
  ============================================================ */
  async function load() {
    listEl.innerHTML = `<div class="hint">Loading…</div>`;

    const data = await apiGet({
      cmd: "stationlist",
      station,
      _ts: Date.now()
    }).catch(() => null);

    if (!data || !data.ok) {
      listEl.innerHTML = `<div class="hint error">Error loading.</div>`;
      return;
    }

    /* FILTER SPEED EVENTS */
    const arr = (data.entries || []).filter(p =>
      SPEED_EVENTS.includes(String(p.event).trim())
    );

    listEl.innerHTML = "";

    arr.forEach((p, i) => {
      const card = createCard(p, i);
      listEl.appendChild(card);
    });
  }

  if (btnRefresh) btnRefresh.addEventListener("click", () => location.reload());

  window.addEventListener("load", () => setTimeout(load, 80));
})();
