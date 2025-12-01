(function () {
  const $ = (q, el = document) => el.querySelector(q);

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");
  const btnRefresh = $("#btnRefresh");

  const qs = new URLSearchParams(location.search);
  const station = qs.get("station") || "1";
  stationLabel.textContent = station;

  /** ESCAPE HTML (safe output) **/
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[m]));
  }

  /** NAME FORMATTER: Always one line **/
  function formatNames(p) {
    const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(n => n && String(n).trim() !== "");
    return names.map(esc).join(", ");
  }

  /** CARD CACHE **/
  const cardMap = {};

  /** ============================================================
   *  CREATE CARD (only first time)
   * ============================================================ **/
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

      <div class="status">${p.status === "done" ? "DONE (SUBMITTED)" : "NEW"}</div>
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
      + `&event=${encodeURIComponent(p.event || "")}`
      + `&division=${encodeURIComponent(p.division || "")}`;

    card.addEventListener("click", () => {
      location.href = judgeURL;
    });

    cardMap[p.entryId] = { card, statusEl };
    return card;
  }

  /** ============================================================
   *  UPDATE CARD (fast status/color update only)
   * ============================================================ **/
  function updateCard(p) {
    const entry = cardMap[p.entryId];
    if (!entry) return;

    const { card, statusEl } = entry;

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

  /** ============================================================
   *  SUPER FAST LOAD SYSTEM
   *  - First load → build cards once
   *  - Next loads → instant update (no rebuild)
   * ============================================================ **/
  async function loadStationList() {
    const firstLoad = Object.keys(cardMap).length === 0;

    // First load → show basic loading message
    if (firstLoad) {
      listEl.innerHTML = `<div class="hint">Loading…</div>`;
    }

    let data;
    try {
      data = await apiGet({
        cmd: "stationlist",
        station,
        _ts: Date.now() // no cache
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

    const arr = data.entries || [];

    /** FIRST LOAD → create cards */
    if (firstLoad) {
      listEl.innerHTML = "";
      arr.forEach((p, i) => {
        const card = createCard(p, i);
        listEl.appendChild(card);
      });
      return;
    }

    /** SUBSEQUENT LOADS → instant update */
    arr.forEach(p => updateCard(p));
  }

  /** ============================================================
   *  REFRESH BUTTON (now fully working)
   * ============================================================ **/
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      listEl.insertAdjacentHTML(
        "afterbegin",
        `<div class="hint">Refreshing…</div>`
      );
      loadStationList();
    });
  }

  /** AUTO-LOAD WHEN OPEN PAGE */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 60);
  });
})();
