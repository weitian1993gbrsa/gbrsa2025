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

  /** 🔥 CARD CACHE (no rebuild needed) **/
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

    /** Save important elements for fast updates */
    const statusEl = card.querySelector(".status");

    /** Build judge page URL */
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

    /** Store card + elements */
    cardMap[p.entryId] = { card, statusEl };

    return card;
  }

  /** ============================================================
   *  FAST UPDATE — No rebuild, only update color + status
   * ============================================================ **/
  function updateCard(p) {
    const entry = cardMap[p.entryId];
    if (!entry) return; // shouldn’t happen

    const { card, statusEl } = entry;

    // Update class (color)
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
   *  LOAD STATION DATA (initial + refresh)
   * ============================================================ **/
  async function loadStationList() {
    listEl.innerHTML = `<div class="hint">Loading…</div>`;

    const data = await apiGet({
      cmd: "stationlist",
      station,
      _ts: Date.now()  // force fresh data
    });

    if (!data || !data.ok) {
      listEl.innerHTML = `<div class="hint error">Unable to load entries.</div>`;
      return;
    }

    const arr = data.entries || [];

    /** FIRST LOAD → build cards once */
    if (Object.keys(cardMap).length === 0) {
      listEl.innerHTML = "";
      arr.forEach((p, i) => {
        const card = createCard(p, i);
        listEl.appendChild(card);
      });
      return;
    }

    /** NEXT LOADS → super fast update */
    arr.forEach(p => updateCard(p));
  }

  /** REFRESH BUTTON */
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      loadStationList(); // No rebuild, instant update
    });
  }

  /** AUTO LOAD */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 150);
  });
})();
