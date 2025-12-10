/* ============================================================
   STATION CORE — SPEED + FREESTYLE (FIXED 2025)
   - Correct event filtering for SPEED
   - Correct currentEntry save
   - Correct judge page redirects
   - Correct event/division propagation
============================================================ */

(function () {

  const $ = (q, el = document) => el.querySelector(q);

  /* ============================================================
     DEFINE EVENT GROUPS
     (You MUST edit these to match your DATA sheet exactly)
  ============================================================ */

  // ⭐ SPEED EVENTS — ONLY THESE appear in speed-station
  window.SPEED_EVENTS = [
    "S30", "SPEED30",
    "S60", "SPEED60",
    "SR30", "SR60",
    "SS30", "SS60"
  ];

  // ⭐ FREESTYLE EVENTS — These appear in freestyle
  window.FREESTYLE_EVENTS = [
    "SRIF", "FIS", "FS", "FR", "BB"
  ];

  window.StationCore = {
    init(options = {}) {

      const qs = new URLSearchParams(location.search);

      const station = qs.get("station");
      const key = qs.get("key") || "";
      const judgeType = qs.get("judgeType") || "";

      // Determine mode
      const mode =
        options.mode ||
        (judgeType ? "freestyle" : "speed");

      const listEl = $("#entryList");
      const stationLabel = $("#stationLabel");
      const judgeTypeLabel = $("#judgeTypeLabel");
      const btnRefresh = $("#btnRefresh");

      if (stationLabel) stationLabel.textContent = station;
      if (judgeTypeLabel && judgeType)
        judgeTypeLabel.textContent = judgeType.toUpperCase();

      /* ============================================================
         SECURITY CHECK
      ============================================================ */
      const k = window.JUDGE_KEYS[key];

      if (!k || k.event !== mode || String(k.station) !== station) {
        document.body.innerHTML =
          `<div style="padding:2rem;text-align:center;">
            <h2 style="color:#b00020;">Access Denied</h2>
            <p>Unauthorized access</p>
          </div>`;
        return;
      }

      /* ============================================================
         CACHE KEYS
      ============================================================ */
      const CACHE_KEY =
        mode === "speed"
          ? ("station_cache_" + station)
          : ("freestyle_cache_" + station + "_" + judgeType);

      function saveCache(data) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (_) {}
      }
      function loadCache() {
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      }

      const esc = s =>
        String(s || "").replace(/[&<>"']/g, c =>
          ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])
        );

      function formatNames(p) {
        const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
          .filter(n => n && String(n).trim() !== "");
        return esc(names.join(", "));
      }

      /* ============================================================
         BUILD JUDGE PAGE URL + SAVE ENTRY INFO
      ============================================================ */
      function resolveJudgePage(p) {

        // ⭐ Save FULL participant entry
        localStorage.setItem("currentEntry", JSON.stringify({
          NAME1: p.NAME1 || "",
          NAME2: p.NAME2 || "",
          NAME3: p.NAME3 || "",
          NAME4: p.NAME4 || "",
          TEAM: p.team || "",
          STATE: p.state || "",
          HEAT: p.heat || "",
          EVENT: p.event || "",
          DIVISION: p.division || "",
          ID: p.entryId || ""
        }));

        if (mode === "speed") {
          return (
            `speed-judge.html?id=${p.entryId}` +
            `&station=${station}` +
            `&key=${key}`
          );
        }

        // Freestyle: detect page by judgeType
        const type = judgeType;
        const page =
          type === "difficulty"   ? "freestyle-difficulty.html" :
          type === "technical"    ? "freestyle-technical.html" :
          type === "re"           ? "freestyle-re.html" :
          type === "presentation" ? "freestyle-presentation.html" :
                                    "freestyle-difficulty.html";

        return (
          `${page}?id=${p.entryId}` +
          `&station=${station}` +
          `&key=${key}` +
          `&judgeType=${type}`
        );
      }

      /* ============================================================
         CARD CREATION
      ============================================================ */
      function createCard(p) {
        const card = document.createElement("button");
        card.type = "button";
        card.className =
          p.status === "done" ? "station-card done" : "station-card pending";

        const top = document.createElement("div");
        top.className = "top-row";

        const heat = document.createElement("span");
        heat.textContent = "Heat " + p.heat;

        const id = document.createElement("span");
        id.textContent = "ID#: " + p.entryId;

        top.appendChild(heat);
        top.appendChild(id);

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = formatNames(p);

        const team = document.createElement("div");
        team.className = "team";
        team.textContent = p.team || "";

        const eventRow = document.createElement("div");
        eventRow.className = "event-row";

        const status = document.createElement("div");
        status.className = "status";
        status.textContent = p.status === "done" ? "COMPLETED" : "NEW";

        const eventName = document.createElement("div");
        eventName.className = "event";
        eventName.textContent = p.event;

        eventRow.appendChild(status);
        eventRow.appendChild(eventName);

        card.appendChild(top);
        card.appendChild(name);
        card.appendChild(team);
        card.appendChild(eventRow);

        // ⭐ Correct redirect AND save currentEntry
        card.addEventListener("click", () => {
          location.href = resolveJudgePage(p);
        });

        return card;
      }

      /* ============================================================
         FILTERING LOGIC (CRITICAL FIX)
      ============================================================ */
      function filterEntries(arr) {

        if (mode === "speed") {
          // ⭐ SPEED should ONLY show speed events — FIXED
          return arr.filter(p =>
            window.SPEED_EVENTS.includes(String(p.event).trim())
          );
        }

        // Freestyle — use freestyle filters
        return arr.filter(p =>
          window.FREESTYLE_EVENTS.includes(String(p.event).trim())
        );
      }

      function sortEntries(arr) {
        return arr.sort((a, b) => Number(a.heat) - Number(b.heat));
      }

      function render(data) {
        let arr = data.entries || [];

        arr = filterEntries(arr);
        arr = sortEntries(arr);

        listEl.innerHTML = "";
        arr.forEach(p => listEl.appendChild(createCard(p)));
      }

      /* ============================================================
         LOAD DATA
      ============================================================ */
      async function load() {
        const cached = loadCache();
        if (cached) render(cached);
        else listEl.innerHTML = `<div class="hint">Loading…</div>`;

        const data = await apiGet({
          cmd: "stationlist",
          station,
          judgeType,
          _ts: Date.now()
        }).catch(() => null);

        if (!data || !data.ok) return;

        saveCache(data);
        render(data);
      }

      /* ============================================================
         REFRESH BUTTON
      ============================================================ */
      if (btnRefresh) {
        btnRefresh.addEventListener("click", () => {
          localStorage.removeItem(CACHE_KEY);
          location.reload();
        });
      }

      window.addEventListener("load", load);
    }
  };

})();
