(function () {
  const $ = (q, el = document) => el.querySelector(q);

  const listEl = $("#entryList");
  const stationLabel = $("#stationLabel");

  const qs = new URLSearchParams(location.search);

  const station = qs.get("station");
  const key = qs.get("key");
  const judgeType = qs.get("judgeType");

  stationLabel.textContent = station;

  const keyInfo = window.JUDGE_KEYS[key];
  if (!keyInfo || keyInfo.event !== "freestyle") {
    document.body.innerHTML =
      `<h2 style="padding:2rem;color:#b00020;">Invalid Access</h2>`;
    return;
  }

  const FREESTYLE_EVENTS = window.FREESTYLE_EVENTS || [];

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      "\"": "&quot;", "'": "&#39;"
    }[c]));
  }

  function formatNames(p) {
    return [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
      .filter(v => v && v.trim())
      .map(esc)
      .join(", ");
  }

  const cardMap = {};

  function createCard(p, index) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = p.status === "done"
      ? "station-card done"
      : "station-card pending";

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
    eventName.textContent = p.event;

    eventRow.appendChild(statusEl);
    eventRow.appendChild(eventName);

    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(team);
    card.appendChild(eventRow);

    card.onclick = () => {
      location.href =
        `freestyle-${judgeType}.html?id=${p.entryId}`
        + `&name1=${encodeURIComponent(p.NAME1 || "")}`
        + `&name2=${encodeURIComponent(p.NAME2 || "")}`
        + `&name3=${encodeURIComponent(p.NAME3 || "")}`
        + `&name4=${encodeURIComponent(p.NAME4 || "")}`
        + `&team=${encodeURIComponent(p.team || "")}`
        + `&state=${encodeURIComponent(p.state || "")}`
        + `&heat=${encodeURIComponent(p.heat || "")}`
        + `&station=${station}`
        + `&key=${key}`
        + `&event=${encodeURIComponent(p.event || "")}`
        + `&division=${encodeURIComponent(p.division || "")}`
        + `&judgeType=${judgeType}`;
    };

    cardMap[p.entryId] = { card, statusEl };
    return card;
  }

  async function load() {
    listEl.innerHTML = `<div class="hint">Loading performers…</div>`;

    const data = await apiGet({
      cmd: "stationlist",
      station,
      _ts: Date.now()
    }).catch(() => null);

    if (!data || !data.ok) {
      listEl.innerHTML = `<div class="hint error">Error loading data.</div>`;
      return;
    }

    const arr = (data.entries || []).filter(p =>
      FREESTYLE_EVENTS.includes(String(p.event).trim())
    );

    listEl.innerHTML = "";
    arr.forEach((p, i) => listEl.appendChild(createCard(p, i)));
  }

  window.addEventListener("load", () => setTimeout(load, 80));

})();
