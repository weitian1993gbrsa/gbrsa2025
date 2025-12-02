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
     🔐 SECURITY — Verify Key is correct for this station
  ============================================================ */
  const JUDGE_KEYS = window.JUDGE_KEYS || {};

  // Convert { key: station } → { station: key }
  const validKeys = {};
  for (const [k, s] of Object.entries(JUDGE_KEYS)) {
    validKeys[String(s)] = k;
  }

  if (!key || key !== validKeys[station]) {
    document.body.innerHTML = `
      <div style="padding:2rem;text-align:center;">
        <h2 style="color:#b00020;">Access Denied</h2>
        <p>You do not have permission to view this station.</p>
      </div>
    `;
    throw new Error("Unauthorized access");
  }

  /* ============================================================
     ESCAPE
  ============================================================ */
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[m]));
  }

  function formatNames(p) {
    const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(n => n && String(n).trim() !== "");
    return names.map(esc).join(", ");
  }

  const cardMap = {};

  /* ============================================================
     CREATE CARD
  ============================================================ */
  function createCard(p, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `station-card ${p.status === "done" ? "done" : "pending"}`;

    card.innerHTML = `
      <div class="top-row">
        <span>Heat ${esc(p.heat)}</span>
        <span>#${index + 1} • ${esc(p.entryId)}</span>
      </div>

      <div class="name">${formatNames(p)}</div>
      <div class="team">${esc(p.team)}</div>

      <div class="event-row">
        <div class="status">${p.status === "done" ? "DONE (SUBMITTED)" : "NEW"}</div>
        <div class="event">${esc(p.event)}</div>
      </div>
    `;

    const statusEl = card.querySelector(".status");

    const judgeURL =
      `speed-judge.html`
      + `?id=${encodeURIComponent(p.entryId)}`
      + `&name1=${encodeURIComponent(p.NAME1 || "")}`
      + `&name2=${encodeURIComponent(p.NAME2 || "")}`
      + `&name3=${encodeURIComponent(p.NAME3 || "")}`
      + `&name4=${encodeURIComponent(p.NAME4 || "")}`
      + `&team=${encodeURIComponent(p.team || "")}`
      + `&state=${encodeURIComponent(p.state || "")}`
      + `&heat=${encodeURIComponent(p.heat || "")}`
      + `&station=${encodeURIComponent(station)}`
      + `&key=${encodeURIComponent(key)}`        // keep locked
      + `&event=${encodeURIComponent(p.event || "")}`
      + `&division=${encodeURIComponent(p.division || "")}`;

    card.addEventListener("click", () => {
      location.href = judgeURL;
    });

    cardMap[p.entryId] = { card, statusEl };
    return card;
  }

  /* ============================================================
     UPDATE CARD
  ============================================================ */
  function updateCard(p) {
    const cache = cardMap[p.entryId];
    if (!cache) return;
    const { card, statusEl } = cache;

    if (p.status === "done") {
      card.classList.remove("pending");
      card.classList.add("done");
      statusEl.textContent = "DONE (SUBMITTED)";
    } else {
      card.classList.remove("done");
      card.classList.add("pending");
      statusEl.textContent = "NEW";
    }
  }

  /* ============================================================
     LOAD STATION LIST
  ============================================================ */
  async function loadStationList() {
    const firstLoad = Object.keys(cardMap).length === 0;

    if (firstLoad) {
      listEl.innerHTML = `<div class="hint">Loading…</div>`;
    }

    let data;
    try {
      data = await apiGet({
        cmd: "stationlist",
        station,
        _ts: Date.now()
      });
    } catch (err) {
      console.error(err);
      if (firstLoad) listEl.innerHTML = `<div class="hint error">Error loading.</div>`;
      return;
    }

    if (!data || !data.ok) {
      if (firstLoad) listEl.innerHTML = `<div class="hint error">Unable to load entries.</div>`;
      return;
    }

    const arr = data.entries || [];

    if (firstLoad) {
      listEl.innerHTML = "";
      arr.forEach((p, i) => listEl.appendChild(createCard(p, i)));
      return;
    }

    arr.forEach(p => updateCard(p));
  }

  /* ============================================================
     REFRESH
  ============================================================ */
  if (btnRefresh) btnRefresh.addEventListener("click", () => location.reload());

  /* ============================================================
     AUTO LOAD
  ============================================================ */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 60);
  });
})();
