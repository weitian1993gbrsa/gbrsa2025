/* ============================================================
   STATION CORE — FREESTYLE ONLY (ORIGINAL VERSION)
   This is exactly how your file was BEFORE merging speed logic.
============================================================ */

(function () {

  const $ = (q, el = document) => el.querySelector(q);

  window.StationCore = {

    init(options = {}) {
      const qs = new URLSearchParams(location.search);

      const station   = qs.get("station");
      const key       = qs.get("key");
      const judgeType = qs.get("judgeType");

      const listEl        = $("#entryList");
      const stationLabel  = $("#stationLabel");
      const judgeTypeLabel = $("#judgeTypeLabel");
      const btnRefresh    = $("#btnRefresh");

      stationLabel.textContent = station;
      judgeTypeLabel.textContent = judgeType.toUpperCase();

      /* ============================================================
         SECURITY  (Freestyle ONLY in original version)
      ============================================================ */
      const k = window.JUDGE_KEYS[key];
      if (!k || k.event !== "freestyle" || String(k.station) !== station) {
        document.body.innerHTML =
          `<div style="padding:2rem;text-align:center;">
            <h2 style="color:#b00020;">Access Denied</h2>
            <p>Unauthorized access</p>
          </div>`;
        throw new Error("Unauthorized");
      }

      /* ============================================================
         CACHE KEY (Freestyle ONLY)
      ============================================================ */
      const CACHE_KEY = "freestyle_cache_" + station;

      function saveCache(data) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); }
        catch (_) {}
      }

      function loadCache() {
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch { return null; }
      }

      /* ============================================================
         UTILS
      ============================================================ */
      const esc = s =>
        String(s || "").replace(/[&<>"']/g, c =>
          ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])
        );

      const formatNames = p => esc(
        [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
          .filter(x => x && x.trim() !== "")
          .join(", ")
      );

      /* ============================================================
         CARD CREATION (Freestyle ONLY)
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

        /* ORIGINAL FREESTYLE REDIRECT ONLY */
        card.addEventListener("click", () => {
          let page = "";

          if (judgeType === "difficulty") page = "freestyle-difficulty.html";
          if (judgeType === "technical")  page = "freestyle-technical.html";
          if (judgeType === "re")         page = "freestyle-re.html";
          if (judgeType === "presentation") page = "freestyle-presentation.html";

          location.href =
            `${page}?id=${p.entryId}` +
            `&name1=${encodeURIComponent(p.NAME1 || "")}` +
            `&team=${encodeURIComponent(p.team || "")}` +
            `&state=${encodeURIComponent(p.state || "")}` +
            `&heat=${encodeURIComponent(p.heat || "")}` +
            `&station=${station}` +
            `&key=${key}` +
            `&event=${encodeURIComponent(p.event || "")}` +
            `&division=${encodeURIComponent(p.division || "")}` +
            `&judgeType=${judgeType}`;
        });

        return card;
      }

      /* ============================================================
         SORT + RENDER
      ============================================================ */
      function sortEntries(arr) {
        return arr.sort((a, b) => Number(a.heat) - Number(b.heat));
      }

      function render(data) {
        let arr = (data.entries || [])
          .filter(p => window.FREESTYLE_EVENTS.includes(String(p.event).trim()));

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

      /* REFRESH BUTTON */
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
