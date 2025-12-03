(function () {
  const $ = (q, el = document) => el.querySelector(q);

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");
  const btnRefresh = $("#btnRefresh");

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station") || "1";
  const key = qs.get("key");

  stationLabel.textContent = station;

  const CACHE_DATA = "station_data_" + station;
  const CACHE_HTML = "station_html_" + station;

  /* ============================================================
     🔐 SECURITY
  ============================================================ */
  const JUDGE_KEYS = window.JUDGE_KEYS || {};
  const validKeys = {};
  for (const [k, s] of Object.entries(JUDGE_KEYS)) validKeys[String(s)] = k;

  if (!key || key !== validKeys[station]) {
    document.body.innerHTML = `
      <div style="padding:2rem;text-align:center;">
        <h2 style="color:#b00020;">Access Denied</h2>
        <p>You do not have permission to view this station.</p>
      </div>
    `;
    throw new Error("Unauthorized");
  }

  /* ============================================================
     ESCAPES + NAME FORMAT
  ============================================================ */
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));
  }

  function formatNames(p) {
    return [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(n => n && n.trim())
      .map(esc)
      .join(", ");
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
        <div class="status">${p.status === "done" ? "COMPLETED" : "NEW"}</div>
        <div class="event">${esc(p.event)}</div>
      </div>
    `;

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

    card.onclick = () => location.href = judgeURL;

    cardMap[p.entryId] = {
      card,
      statusEl: card.querySelector(".status")
    };

    return card;
  }

  /* ============================================================
     UPDATE CARD
  ============================================================ */
  function updateCard(p) {
    const entry = cardMap[p.entryId];
    if (!entry) return;

    const { card, statusEl } = entry;

    if (p.status === "done") {
      card.classList.remove("pending");
      card.classList.add("done");
      statusEl.textContent = "COMPLETED";
    } else {
      card.classList.remove("done");
      card.classList.add("pending");
      statusEl.textContent = "NEW";
    }
  }

  /* ============================================================
     APPLY SORT (NEW → DONE by heat)
  ============================================================ */
  function applySortedLayout(arr) {
    const pending = arr.filter(p => p.status !== "done");
    const done = arr.filter(p => p.status === "done");

    pending.sort((a, b) => Number(a.heat) - Number(b.heat));
    done.sort((a, b) => Number(a.heat) - Number(b.heat));

    listEl.innerHTML = "";

    [...pending, ...done].forEach(p => {
      const entry = cardMap[p.entryId];
      if (entry) listEl.appendChild(entry.card);
    });

    localStorage.setItem(CACHE_HTML, listEl.innerHTML);
  }

  /* ============================================================
     1️⃣ INSTANT LOAD FROM MEMORY FIRST
  ============================================================ */
  function tryLoadFromMemory() {
    const mem = window.__stationCache?.[station];
    if (!mem) return false;

    console.log("Loaded from memory:", station, mem.length);

    listEl.innerHTML = "";
    mem.forEach((p, i) => {
      if (!cardMap[p.entryId]) createCard(p, i);
    });

    applySortedLayout(mem);

    // Update local cache too
    localStorage.setItem(CACHE_DATA, JSON.stringify(mem));

    return true;
  }

  /* ============================================================
     2️⃣ INSTANT LOAD FROM LOCALSTORAGE
  ============================================================ */
  function tryLoadFromCache() {
    const html = localStorage.getItem(CACHE_HTML);
    const json = localStorage.getItem(CACHE_DATA);
    if (!html || !json) return false;

    listEl.innerHTML = html;

    const arr = JSON.parse(json);
    const cards = listEl.querySelectorAll(".station-card");

    arr.forEach((p, i) => {
      const card = cards[i];
      if (!card) return;

      cardMap[p.entryId] = {
        card,
        statusEl: card.querySelector(".status")
      };
    });

    return true;
  }

  /* ============================================================
     3️⃣ BACKGROUND REFRESH (SILENT)
  ============================================================ */
  async function backgroundRefresh() {
    let data;
    try {
      data = await apiGet({
        cmd: "stationlist",
        station,
        _ts: Date.now()
      });
    } catch (err) {
      console.warn("Background refresh failed", err);
      return;
    }

    if (!data || !data.ok) return;

    const arr = data.entries || [];

    arr.forEach(updateCard);
    applySortedLayout(arr);

    // save latest
    localStorage.setItem(CACHE_DATA, JSON.stringify(arr));
    window.__stationCache[station] = arr;
  }

  /* ============================================================
     REFRESH BUTTON
  ============================================================ */
  if (btnRefresh) {
    btnRefresh.onclick = () => {
      localStorage.removeItem(CACHE_HTML);
      localStorage.removeItem(CACHE_DATA);
      location.reload();
    };
  }

  /* ============================================================
     PAGE LOAD FLOW
  ============================================================ */
  window.addEventListener("load", () => {

    // 1️⃣ Memory-first = FASTEST
    const memLoaded = tryLoadFromMemory();

    // 2️⃣ If not in memory → load from cache
    if (!memLoaded) {
      const cacheLoaded = tryLoadFromCache();

      // 3️⃣ If still nothing → show loading text
      if (!cacheLoaded) {
        listEl.innerHTML = `<div class="hint">Loading…</div>`;
      }
    }

    // Always run background update (non-blocking)
    backgroundRefresh();
  });
})();
