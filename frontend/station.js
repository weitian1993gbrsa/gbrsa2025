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
     APPLY SORT (NEW → DONE, sorted by heat)
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

    // Cache the updated HTML
    localStorage.setItem(CACHE_HTML, listEl.innerHTML);
  }

  /* ============================================================
     LOAD FROM CACHE INSTANTLY (0ms)
  ============================================================ */
  function instantLoadFromCache() {
    const html = localStorage.getItem(CACHE_HTML);
    const json = localStorage.getItem(CACHE_DATA);

    if (!html || !json) return false;

    const arr = JSON.parse(json);

    // Restore instantly
    listEl.innerHTML = html;

    // Restore cardMap from DOM
    const cards = listEl.querySelectorAll(".station-card");

    arr.forEach((p, i) => {
      const card = cards[i];
      if (!card) return;

      cardMap[p.entryId] = {
        card,
        statusEl: card.querySelector(".status")
      };
    });

    // If user just completed a result → update card immediately
    const justDone = sessionStorage.getItem("completedEntry");
    if (justDone) {
      const entry = cardMap[justDone];
      if (entry) {
        entry.card.classList.remove("pending");
        entry.card.classList.add("done");
        entry.statusEl.textContent = "COMPLETED";
      }

      applySortedLayout(arr);
      sessionStorage.removeItem("completedEntry");
    }

    return true;
  }

  /* ============================================================
     BACKGROUND REFRESH (doesn't block UI)
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
      console.error("Background refresh failed", err);
      return;
    }

    if (!data || !data.ok) return;

    const arr = data.entries || [];

    // Update card status
    arr.forEach(updateCard);

    // Apply sorting
    applySortedLayout(arr);

    // Update cache
    localStorage.setItem(CACHE_DATA, JSON.stringify(arr));
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
     PAGE LOAD
  ============================================================ */
  window.addEventListener("load", () => {
    // 1️⃣ Instant load if cache exists
    const loaded = instantLoadFromCache();

    // 2️⃣ If no cache — fallback slow load
    if (!loaded) {
      listEl.innerHTML = `<div class="hint">Loading…</div>`;
    }

    // 3️⃣ Background update always runs
    backgroundRefresh();
  });
})();
