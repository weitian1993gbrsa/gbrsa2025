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
     Each station has its own secret key.
  ============================================================ */
  const validKeys = {
    "1": "abc123",
    "2": "def456",
    "3": "ghi789",
    "4": "jkl555",
    "5": "mno888",
    "6": "pqr222",
    "7": "stu333",
    "8": "vwx444",
    "9": "yyy111",
    "10": "zzt777",
    "11": "qqq101",
    "12": "key999"
  };

  // If key missing or correct key doesn't match station → deny access
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
     ESCAPE HTML (safe output)
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
     JOIN NAMES ON ONE LINE
  ============================================================ */
  function formatNames(p) {
    const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(n => n && String(n).trim() !== "");
    return names.map(esc).join(", ");
  }

  /* ============================================================
     CARD CACHE (for fast updates)
  ============================================================ */
  const cardMap = {};

  /* ============================================================
     CREATE CARD (first load only)
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

    /* Build URL to speed-judge page */
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
      + `&key=${encodeURIComponent(key)}`     /* ⭐ keep judge locked in */
      + `&event=${encodeURIComponent(p.event || "")}`
      + `&division=${encodeURIComponent(p.division || "")}`;

    card.addEventListener("click", () => {
      location.href = judgeURL;
    });

    cardMap[p.entryId] = { card, statusEl };
    return card;
  }

  /* ============================================================
     FAST CARD UPDATE (status only)
  ============================================================ */
  function updateCard(p) {
    const cached = cardMap[p.entryId];
    if (!cached) return;

    const { card, statusEl } = cached;

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
     LOAD STATION DATA
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
      if (firstLoad) {
        listEl.innerHTML = `<div class="hint error">Error loading station.</div>`;
      }
      return;
    }

    if (!data || !data.ok) {
      if (firstLoad) {
        listEl.innerHTML = `<div class="hint error">Unable to load entries.</div>`;
      }
      return;
    }

    const entries = data.entries || [];

    /* First load → build cards */
    if (firstLoad) {
      listEl.innerHTML = "";
      entries.forEach((p, i) => {
        const card = createCard(p, i);
        listEl.appendChild(card);
      });
      return;
    }

    /* Next loads → update only status */
    entries.forEach(p => updateCard(p));
  }

  /* ============================================================
     REFRESH BUTTON (full page reload)
  ============================================================ */
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      location.reload();
    });
  }

  /* ============================================================
     AUTO LOAD ON PAGE OPEN
  ============================================================ */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 60);
  });

})();
