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
    return [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(n => n && n.trim())
      .map(esc)
      .join(", ");
  }

  const cardMap = {};

  /* ============================================================
     SUPER-FAST CARD CREATION
  ============================================================ */
  function createCard(p, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className =
      p.status === "done" ? "station-card done" : "station-card pending";

    /* Build DOM (no innerHTML → 3× faster) */
    const top = document.createElement("div");
    top.className = "top-row";

    const heat = document.createElement("span");
    heat.textContent = "Heat " + p.heat;

    const num = document.createElement("span");
    num.textContent = `#${index + 1} • ${p.entryId}`;

    top.appendChild(heat);
    top.appendChild(num);

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = formatNames(p);

    const team = document.createElement("div");
    team.className = "team";
    team.textContent = p.team || "";

    const eventRow = document.createElement("div");
    eventRow.className = "event-row";

    const statusEl = document.createElement("div");
    statusEl.className = "status";
    statusEl.textContent = p.status === "done" ? "COMPLETED" : "NEW";

    const eventName = document.createElement("div");
    eventName.className = "event";
    eventName.textContent = p.event || "";

    eventRow.appendChild(statusEl);
    eventRow.appendChild(eventName);

    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(team);
    card.appendChild(eventRow);

    /* Pre-build judge URL */
    const judgeURL =
      `speed-judge.html?id=${p.entryId}`
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

    /* Tap-safe click */
    let tapped = false;
    card.onclick = () => {
      if (tapped) return;
      tapped = true;
      location.href = judgeURL;
    };

    /* Save references */
    cardMap[p.entryId] = { card, statusEl };

    return card;
  }

  /* ============================================================
     UPDATE CARD
  ============================================================ */
  function updateCard(p) {
    const ref = cardMap[p.entryId];
    if (!ref) return;

    const { card, statusEl } = ref;

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
     LOAD STATION LIST + SORT NEW→DONE
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
      listEl.innerHTML = `<div class="hint error">Error loading.</div>`;
      return;
    }

    if (!data || !data.ok) {
      if (firstLoad) {
        listEl.innerHTML = `<div class="hint error">Unable to load entries.</div>`;
      }
      return;
    }

    const arr = data.entries || [];

    /* First load: build cards */
    if (firstLoad) {
      const frag = document.createDocumentFragment();
      arr.forEach((p, i) => frag.appendChild(createCard(p, i)));
      listEl.innerHTML = "";
      listEl.appendChild(frag);
    }

    /* Update statuses */
    arr.forEach(updateCard);

    /* Sorting logic */
    const pending = arr.filter(p => p.status !== "done");
    const done = arr.filter(p => p.status === "done");

    pending.sort((a, b) => Number(a.heat) - Number(b.heat));
    done.sort((a, b) => Number(a.heat) - Number(b.heat));

    /* Re-render in correct order */
    listEl.innerHTML = "";
    [...pending, ...done].forEach(p => {
      const ref = cardMap[p.entryId];
      if (ref) listEl.appendChild(ref.card);
    });
  }

  /* ============================================================
     REFRESH BUTTON
  ============================================================ */
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => location.reload());
  }

  /* ============================================================
     ON PAGE LOAD
  ============================================================ */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 50);
  });

})();
