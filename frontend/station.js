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
     🔐 SECURITY: BLOCK UNAUTHORIZED ACCESS
     Build station → key mapping dynamically.
  ============================================================ */
  const JUDGE_KEYS = window.JUDGE_KEYS || {};

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
    throw new Error("Unauthorized access to station " + station);
  }

  /* ============================================================
     ESCAPE HTML
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

  /* ============================================================
     NAME FORMATTER
  ============================================================ */
  function formatNames(p) {
    const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(n => n && String(n).trim() !== "");
    return names.map(esc).join(", ");
  }

  /* ============================================================
     CARD CACHE (for turbo refresh)
  ============================================================ */
  const cardMap = {};

  /* ============================================================
     PREFETCH SPEED-JUDGE PAGE (Instant Open)
  ============================================================ */
  function prefetchJudgePage() {
    const link1 = document.createElement("link");
    link1.rel = "prefetch";
    link1.href = "speed-judge.html";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.rel = "prefetch";
    link2.href = "speed-judge.js";
    document.head.appendChild(link2);
  }
  prefetchJudgePage();

  /* ============================================================
     CREATE CARD (first load)
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

    // Build secure judge URL
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
      + `&key=${encodeURIComponent(key)}`
      + `&event=${encodeURIComponent(p.event || "")}`
      + `&division=${encodeURIComponent(p.division || "")}`;

    card.addEventListener("click", () => {
      location.href = judgeURL;
    });

    cardMap[p.entryId] = { card, statusEl };
    return card;
  }

  /* ============================================================
     FAST STATUS UPDATE ONLY
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
     FULL TURBO LOAD (INSTANT + BACKGROUND UPDATE)
  ============================================================ */
  async function loadStationList() {

    const firstLoad = Object.keys(cardMap).length === 0;

    if (firstLoad) {
      listEl.innerHTML = `<div class="hint">Loading…</div>`;
    }

    // ⚡ STEP 1: If we already have cards, show them instantly
    if (!firstLoad) {
      // Cards already on screen — no clearing, no waiting
    }

    // ⚡ STEP 2: Fetch backend in background (non-blocking)
    apiGet({
      cmd: "stationlist",
      station,
      _ts: Date.now()
    }).then(data => {

      if (!data || !data.ok) return;

      const arr = data.entries || [];

      // 🔥 First load: build cards
      if (firstLoad) {
        listEl.innerHTML = "";
        arr.forEach((p, i) => {
          const card = createCard(p, i);
          listEl.appendChild(card);
        });
        return;
      }

      // 🔥 Subsequent loads: update status instantly
      requestAnimationFrame(() => {
        arr.forEach(p => updateCard(p));
      });

    }).catch(err => console.error(err));
  }

  /* ============================================================
     REFRESH BUTTON
  ============================================================ */
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => location.reload());
  }

  /* ============================================================
     AUTO LOAD (Start fast load)
  ============================================================ */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 30);
  });

})();
