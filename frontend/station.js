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
     🔐 SECURITY CHECK
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
     CREATE CARD  (MOVE-ON-TAP)
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

    /* 🔥 MOVE ON TAP for instant judge UX */
    card.onclick = () => {
      // Move card to bottom immediately
      listEl.appendChild(card);

      // Switch to completed immediately
      card.classList.remove("pending");
      card.classList.add("done");
      const s = card.querySelector(".status");
      if (s) s.textContent = "COMPLETED";

      // Save new visual order
      localStorage.setItem(CACHE_KEY_HTML, listEl.innerHTML);

      // Mark which entry was just completed
      sessionStorage.setItem("completedEntry", p.entryId);

      // Go to scoring page
      location.href = judgeURL;
    };

    cardMap[p.entryId] = {
      card,
      statusEl: card.querySelector(".status")
    };

    return card;
  }

  /* ============================================================
     UPDATE CARD (COLOR + POSITION)
  ============================================================ */
  function updateCard(p) {
    const entry = cardMap[p.entryId];
    if (!entry) return;

    const { card, statusEl } = entry;

    if (p.status === "done") {
      card.classList.remove("pending");
      card.classList.add("done");
      statusEl.textContent = "COMPLETED";
      listEl.appendChild(card);
    } else {
      card.classList.remove("done");
      card.classList.add("pending");
      statusEl.textContent = "NEW";
      const firstDone = listEl.querySelector(".station-card.done");
      if (firstDone) listEl.insertBefore(card, firstDone);
      else listEl.insertBefore(card, listEl.firstChild);
    }
  }

  /* ============================================================
     LOAD LIST (CACHE + SAFETY FIX + SERVER REORDER)
  ============================================================ */
  async function loadStationList() {
    const savedHTML = localStorage.getItem(CACHE_KEY_HTML);
    const savedData = localStorage.getItem(CACHE_KEY_DATA);
    const justDone = sessionStorage.getItem("completedEntry");

    /* 1️⃣ QUICK LOAD FROM CACHE */
    let cachedArr = null;

    if (savedHTML && savedData) {
      cachedArr = JSON.parse(savedData);
      listEl.innerHTML = savedHTML;

      const cardNodes = listEl.querySelectorAll(".station-card");

      cachedArr.forEach((p, i) => {
        const card = cardNodes[i];
        if (!card) return;

        cardMap[p.entryId] = {
          card,
          statusEl: card.querySelector(".status")
        };

        /* Rebuild tap handler */
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
          listEl.appendChild(card);
          card.classList.add("done");
          const s = card.querySelector(".status");
          if (s) s.textContent = "COMPLETED";
          localStorage.setItem(CACHE_KEY_HTML, listEl.innerHTML);
          sessionStorage.setItem("completedEntry", p.entryId);
          location.href = judgeURL;
        };

        /* Apply instant-complete on return */
        if (justDone && p.entryId === justDone) {
          card.classList.add("done");
          const s = card.querySelector(".status");
          if (s) s.textContent = "COMPLETED";
          listEl.appendChild(card);
        }
      });
    } else {
      listEl.innerHTML = `<div class="hint">Loading…</div>`;
    }

    /* 2️⃣ GET FRESH DATA FROM SERVER */
    let data;
    try {
      data = await apiGet({
        cmd: "stationlist",
        station,
        _ts: Date.now()
      });
    } catch (err) {
      console.error(err);
      return;
    }

    if (!data || !data.ok) return;

    const arr = data.entries || [];

    /* 3️⃣ SAFETY CHECK — AUTO RESET BAD CACHE */
    if (cachedArr) {
      if (cachedArr.length !== arr.length) {
        localStorage.removeItem(CACHE_KEY_HTML);
        localStorage.removeItem(CACHE_KEY_DATA);
        location.reload();
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].entryId !== cachedArr[i].entryId) {
          localStorage.removeItem(CACHE_KEY_HTML);
          localStorage.removeItem(CACHE_KEY_DATA);
          location.reload();
          return;
        }
      }
    }

    /* FIRST-TIME BUILD (NO CACHE) */
    if (!savedHTML) {
      listEl.innerHTML = "";
      arr.forEach((p, i) => listEl.appendChild(createCard(p, i)));

      localStorage.setItem(CACHE_KEY_HTML, listEl.innerHTML);
      localStorage.setItem(CACHE_KEY_DATA, JSON.stringify(arr));
      sessionStorage.removeItem("completedEntry");
      return;
    }

    /* 4️⃣ FULL SERVER REORDER (NEW top → DONE sorted by HEAT) */
    const pending = arr.filter(p => p.status !== "done");
    const done = arr.filter(p => p.status === "done");

    // Sort both groups by HEAT DESC (server truth)
    pending.sort((a, b) => Number(b.heat) - Number(a.heat));
    done.sort((a, b) => Number(b.heat) - Number(a.heat));

    const merged = [...pending, ...done];

    listEl.innerHTML = "";

    merged.forEach(p => {
      const entry = cardMap[p.entryId];
      if (!entry) return;
      listEl.appendChild(entry.card);
      updateCard(p);
    });

    /* update cache */
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
