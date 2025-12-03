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

  /* ============================================================
     ESCAPE
  ============================================================ */
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
      + `&key=${encodeURIComponent(key)}`
      + `&event=${encodeURIComponent(p.event || "")}`
      + `&division=${encodeURIComponent(p.division || "")}`;

    card.onclick = () => location.href = judgeURL;

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
      if (!card.classList.contains("done")) {
        card.classList.remove("pending");
        card.classList.add("done");
        statusEl.textContent = "COMPLETED";
      }
    } else {
      if (!card.classList.contains("pending")) {
        card.classList.remove("done");
        card.classList.add("pending");
        statusEl.textContent = "NEW";
      }
    }
  }

  /* ============================================================
     LOAD STATION LIST (with NEW → DONE reorder)
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
        listEl.innerHTML = `<div class="hint error">Error loading.</div>`;
      }
      return;
    }

    if (!data || !data.ok) {
      if (firstLoad) {
        listEl.innerHTML = `<div class="hint error">Unable to load entries.</div>`;
      }
      return;
    }

    const arr = data.entries || [];

    /* FIRST LOAD: build all cards */
    if (firstLoad) {
      const frag = document.createDocumentFragment();
      arr.forEach((p, i) => frag.appendChild(createCard(p, i)));
      listEl.innerHTML = "";
      listEl.appendChild(frag);
    }

    /* UPDATE CARD STATUS FAST */
    arr.forEach(updateCard);

    /* ============================================================
       🔥 REORDER LOGIC — NEW first, DONE last, DONE sorted by Heat
    ============================================================ */
    const pending = arr.filter(p => p.status !== "done");
    const done = arr.filter(p => p.status === "done");

    // Sort NEW by heat ASCENDING (Heat 1,2,3,...)
    pending.sort((a, b) => Number(a.heat) - Number(b.heat));

    // Sort DONE also by heat ASCENDING
    done.sort((a, b) => Number(a.heat) - Number(b.heat));

    const merged = [...pending, ...done];

    // Put DOM in correct order
    listEl.innerHTML = "";
    merged.forEach(p => {
      const entry = cardMap[p.entryId];
      if (entry) listEl.appendChild(entry.card);
    });
  }

  /* ============================================================
     REFRESH BUTTON
  ============================================================ */
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => location.reload());
  }

  /* ============================================================
     AUTO LOAD
  ============================================================ */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 50);
  });
})();
