(function () {
  const $ = (q, el = document) => el.querySelector(q);

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");
  const btnRefresh = $("#btnRefresh");

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station") || "1";
  const key = qs.get("key");

  stationLabel.textContent = station;

  const CACHE_KEY_DATA = "stationData_" + station;
  const CACHE_KEY_HTML = "stationHTML_" + station;

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
    throw new Error("Unauthorized access");
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
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

    card.addEventListener("click", () => {
      location.href = judgeURL;
    });

    cardMap[p.entryId] = {
      card,
      statusEl: card.querySelector(".status")
    };
    return card;
  }

  /* ============================================================
     UPDATE CARD FAST
  ============================================================ */
  function updateCard(p) {
    const cache = cardMap[p.entryId];
    if (!cache) return;
    const { card, statusEl } = cache;

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
     LOAD LIST
  ============================================================ */
  async function loadStationList() {
    // 1️⃣ INSTANT LOAD FROM CACHE (if available)
    const savedHTML = localStorage.getItem(CACHE_KEY_HTML);
    const savedData = localStorage.getItem(CACHE_KEY_DATA);

    if (savedHTML && savedData) {
      listEl.innerHTML = savedHTML;

      const arr = JSON.parse(savedData);
      arr.forEach((p, i) => {
        const card = listEl.children[i];
        if (!card) return;

        cardMap[p.entryId] = {
          card,
          statusEl: card.querySelector(".status")
        };
      });
    } else {
      listEl.innerHTML = `<div class="hint">Loading…</div>`;
    }

    // 2️⃣ BACKGROUND REFRESH
    let data;
    try {
      data = await apiGet({
        cmd: "stationlist",
        station,
        _ts: Date.now()
      });
    } catch (e) {
      console.error(e);
      return;
    }

    if (!data || !data.ok) return;
    const arr = data.entries || [];

    // FIRST LOAD → FULL RENDER
    if (!savedHTML) {
      listEl.innerHTML = "";
      arr.forEach((p, i) => listEl.appendChild(createCard(p, i)));

      localStorage.setItem(CACHE_KEY_HTML, listEl.innerHTML);
      localStorage.setItem(CACHE_KEY_DATA, JSON.stringify(arr));
      return;
    }

    // SUBSEQUENT LOADS → FAST STATUS UPDATE
    arr.forEach(updateCard);

    // UPDATE CACHE
    localStorage.setItem(CACHE_KEY_DATA, JSON.stringify(arr));
    localStorage.setItem(CACHE_KEY_HTML, listEl.innerHTML);
  }

  if (btnRefresh) btnRefresh.addEventListener("click", () => location.reload());

  window.addEventListener("load", () => {
    setTimeout(loadStationList, 50);
  });
})();
