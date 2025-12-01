(function () {
  const $ = (q) => document.querySelector(q);
  const params = new URLSearchParams(location.search);
  const station = params.get("station") || "1";

  const listBox = $("#entriesBox");
  const titleBox = $("#titleStation");

  titleBox.textContent = `Entries for this Station`;

  // Escape HTML
  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m]));
  }

  // Render one station card
  function renderCard(p) {
    const names = [p.name1, p.name2, p.name3, p.name4].filter(Boolean);

    // Build name HTML using spans to prevent bad line breaks
    const nameHTML = names
      .map((n) => `<span class="name-part">${esc(n)}</span>`)
      .join("");

    const sClass = p.status === "done" ? "done" : "pending";
    const statusLabel = p.status === "done" ? "DONE (SUBMITTED)" : "NEW";

    const html = `
      <button class="station-card ${sClass}" 
        onclick="location.href='speed-judge.html?id=${encodeURIComponent(
          p.entryId
        )}&name1=${encodeURIComponent(
      p.name1 || ""
    )}&name2=${encodeURIComponent(
      p.name2 || ""
    )}&name3=${encodeURIComponent(
      p.name3 || ""
    )}&name4=${encodeURIComponent(
      p.name4 || ""
    )}&team=${encodeURIComponent(
      p.team || ""
    )}&state=${encodeURIComponent(
      p.state || ""
    )}&heat=${encodeURIComponent(
      p.heat || ""
    )}&station=${encodeURIComponent(
      p.station || ""
    )}&event=${encodeURIComponent(
      p.event || ""
    )}&division=${encodeURIComponent(p.division || "")}'">

        <div class="top-row">
          <span>Heat ${esc(p.heat)}</span>
          <span>#${esc(p.index)} • ${esc(p.entryId)}</span>
        </div>

        <div class="name">${nameHTML}</div>

        <div class="team">${esc(p.team)}</div>
        <div class="status">${statusLabel}</div>
      </button>
    `;
    return html;
  }

  async function loadStationList() {
    listBox.innerHTML = `<div class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;

    try {
      const out = await apiGet(`?cmd=stationlist&station=${station}`);
      if (!out.ok) throw new Error(out.error);

      const entries = out.entries || [];
      let html = "";

      let index = 1;
      for (const p of entries) {
        p.index = index++;
        html += renderCard(p);
      }

      listBox.innerHTML = html || `<p>No entries found for this station.</p>`;

    } catch (err) {
      console.error(err);
      listBox.innerHTML = `<p style="color:red;">Failed to load station entries.</p>`;
    }
  }

  loadStationList();

  $("#btnRefresh").addEventListener("click", loadStationList);
})();
