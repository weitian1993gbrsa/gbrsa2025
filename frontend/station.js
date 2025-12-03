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

  /* ============================================================
     HELPERS
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
     CREATE CARD (Now with move-on-tap)
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

    /* 🔥 MOVE ON TAP: Instant visual update */
    card.onclick = () => {
      // 1. Move card to bottom immediately
      listEl.appendChild(card);

      // 2. Turn it into "completed" instantly
      card.classList.remove("pending");
      card.classList.add("done");
      const statusEl = card.querySelector(".status");
      if (statusEl) statusEl.textContent = "COMPLETED";

      // 3. Save updated HTML order to cache
      localStorage.setItem(CACHE_KEY_HTML, listEl.innerHTML);

      // 4. Mark which entry was completed (for return sync)
      sessionStorage.setItem("completedEntry", p.entryId);

      // 5. Navigate to judge page
      location.href = judgeURL;
    };

    // Save reference for updateCard()
    cardMap[p.entryId] = {
      card,
      statusEl: card.querySelector(".status")
    };

    return card;
  }

  /* ============================================================
     UPDATE CARD (Keeps bottom sort consistent)
  ============================================================ */
  function updateCard(p) {
    const cache = cardMap[p.entryId];
    if (!cache) return;

    const { card, statusEl } = cache;
    const isDone = p.status === "done";

    if (isDone) {
      card.classList.remove("pending");
      card.classList.add("done");
      statusEl.textContent = "COMPLETED";

      // Always move done cards down
      listEl.appendChild(card);
    } else {
      card.classList.remove("done");
      card.classList.add("pending");
      statusEl.textContent = "NEW";

      // Always move pending cards above done ones
      const firstDone = listEl.querySelector(".station-card.done");
      if (firstDone) {
        listEl.insertBefore(card, firstDone);
      } else {
        listEl.insertBefore(card, listEl.firstChild);
      }
    }
  }

  /* ============================================================
     LOAD LIST (with cached HTML, instant-complete, reorder)
  ============================================================ */
  async function loadStationList() {
    const savedHTML = localStorage.getItem(CACHE_KEY_HTML);
    const savedData = localStorage.getItem(CACHE_KEY_DATA);

    const justDone = sessionStorage.getItem("completedEntry");

    /* 1️⃣ INSTANT LOAD FROM CACHE */
    if (savedHTML && savedData) {
      listEl.innerHTML = savedHTML;

      const arr = JSON.parse(savedData);
      const cardNodes = listEl.querySelectorAll(".station-card");

      arr.forEach((p, i) => {
        const card = cardNodes[i];
        if (!card) return;

        // rebuild cardMap
        cardMap[p.entryId] = {
          card,
          statusEl: card.querySelector(".status")
        };

        // rebuild click event (move-on-tap)
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

        card.onclick = () => {
          // move on tap
          listEl.appendChild(card);
          card.classList.remove("pending");
          card.classList.add("done");
          const statusEl = card.querySelector(".status");
          if (statusEl) statusEl.textContent = "COMPLETED";
          localStorage.setItem(CACHE_KEY_HTML, listEl.innerHTML);
          sessionStorage.setItem("completedEntry", p.entryId);
          location.href = judgeURL;
        };

        // 🔥 apply instant-complete when returning
        if (justDone && p.entryId === justDone) {
          card.classList.remove("pending");
          card.classList.add("done");
          const statusEl = card.querySelector(".status");
          if (statusEl) statusEl.textContent = "COMPLETED";
          listEl.appendChild(card);
        }
      });
    } else {
      listEl.innerHTML = `<div class="hint">Loading…</div>`;
    }

    /* 2️⃣ BACKGROUND REFRESH FROM SERVER */
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

    /* FIRST LOAD (NO CACHE) */
    if (!savedHTML) {
      listEl.innerHTML = "";
      arr.forEach((p, i) => listEl.appendChild(createCard(p, i)));
      localStorage.setItem(CACHE_KEY_HTML, listEl.innerHTML);
      localStorage.setItem(CACHE_KEY_DATA, JSON.stringify(arr));
      sessionStorage.removeItem("completedEntry");
      return;
    }

    /* SUBSEQUENT LOAD — UPDATE ONLY */
    arr.forEach(updateCard);

    /* UPDATE CACHE */
    localStorage.setItem(CACHE_KEY_DATA, JSON.stringify(arr));
    localStorage.setItem(CACHE_KEY_HTML, listEl.innerHTML);

    sessionStorage.removeItem("completedEntry");
  }

  /* ============================================================
     REFRESH BUTTON
  ============================================================ */
  if (btnRefresh) btnRefresh.addEventListener("click", () => location.reload());

  /* ============================================================
     AUTO LOAD
  ============================================================ */
  window.addEventListener("load", () => {
    setTimeout(loadStationList, 50);
  });
})();
