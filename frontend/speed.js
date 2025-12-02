(function () {
  const $ = (q, el = document) => el.querySelector(q);

  /* ============================================================
     DOM ELEMENTS
     ============================================================ */

  const entryInput = $("#entryIdInput");

  const participantCard = $("#participantCard");

  const pcID = $("#pcID");
  const pcName = $("#pcName");
  const pcHeat = $("#pcHeat");
  const pcTeam = $("#pcTeam");
  const pcStation = $("#pcStation");
  const pcState = $("#pcState");
  const pcEvent = $("#pcEvent");
  const pcDivision = $("#pcDivision");

  const pcStatus = $("#pcStatus"); // removed from UI but target exists

  const scoreFormWrap = $("#scoreFormWrap");
  const scoreForm = $("#scoreForm");

  const submitOverlay = document.getElementById("submitOverlay");
  const overlayText = document.getElementById("overlayText");

  /* Hidden submission fields */
  const fId = $("#fId");
  const fNAME1 = $("#fNAME1");
  const fNAME2 = $("#fNAME2");
  const fNAME3 = $("#fNAME3");
  const fNAME4 = $("#fNAME4");
  const fREP = $("#fREP");
  const fSTATE = $("#fSTATE");
  const fHEAT = $("#fHEAT");
  const fSTATION = $("#fSTATION");
  const fEVENT = $("#fEVENT");
  const fDIVISION = $("#fDIVISION");

  /* ============================================================
     HELPERS
     ============================================================ */

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m]));
  }

  function hideStep2() {
    scoreFormWrap.classList.add("hide");
  }

  function showParticipant() {
    participantCard.classList.remove("hide");
  }
  function hideParticipant() {
    participantCard.classList.add("hide");
  }

  function clearHidden() {
    [
      fId,
      fNAME1,
      fNAME2,
      fNAME3,
      fNAME4,
      fREP,
      fSTATE,
      fHEAT,
      fSTATION,
      fEVENT,
      fDIVISION,
    ].forEach((el) => (el.value = ""));
  }

  function resetUI() {
    scoreForm.reset();
    clearHidden();
    hideParticipant();
    hideStep2();

    pcID.textContent = "ID —";
    pcName.textContent = "NAME —";
    pcHeat.textContent = "Heat —";
    pcTeam.textContent = "Team —";
    pcStation.textContent = "Station —";
    pcState.textContent = "State —";
    pcEvent.textContent = "Event —";
    pcDivision.textContent = "Division —";

    pcStatus.style.display = "none";

    participantCard.classList.remove("done", "pending");

    if (entryInput) entryInput.value = "";
  }

  /* ============================================================
     CHECK STATUS (done / pending)
     ============================================================ */

  async function checkStatus(id, station) {
    try {
      const res = await apiGet({ cmd: "stationlist", station });
      if (!res || !res.entries) return "pending";

      const found = res.entries.find((e) => e.entryId === id);
      return found ? found.status : "pending";
    } catch (e) {
      return "pending";
    }
  }

  /* ============================================================
     LOOKUP + CARD POPULATION
     ============================================================ */

  async function lookupById(raw) {
    const id = String(raw || "").trim().toUpperCase();
    if (!id) {
      hideParticipant();
      hideStep2();
      clearHidden();
      return;
    }

    hideStep2();
    clearHidden();

    showParticipant();

    pcID.textContent = "Loading…";

    try {
      const data = await apiGet({ cmd: "participant", entryId: id });
      if (!data || !data.participant) {
        hideParticipant();
        hideStep2();
        clearHidden();
        if (window.toast) toast("ID not found.");
        return;
      }

      const p = data.participant;

      /* Build full joined name */
      const names = [p.NAME1, p.NAME2, p.NAME3, p.NAME4]
        .filter(Boolean)
        .map(escapeHtml)
        .join(", ");

      /* Fill UI */
      pcID.textContent = id;
      pcName.textContent = names || "—";

      pcHeat.textContent = "Heat " + (p.HEAT || "—");
      pcTeam.textContent = "Team " + (p.TEAM || "—");
      pcStation.textContent = "Station " + (p.STATION || "—");
      pcState.textContent = "State " + (p.STATE || "—");
      pcEvent.textContent = "Event " + (p.EVENT || "—");
      pcDivision.textContent = "Division " + (p.DIVISION || "—");

      /* Hidden fields */
      fId.value = id;
      fNAME1.value = p.NAME1 || "";
      fNAME2.value = p.NAME2 || "";
      fNAME3.value = p.NAME3 || "";
      fNAME4.value = p.NAME4 || "";
      fREP.value = p.TEAM || "";
      fSTATE.value = p.STATE || "";
      fHEAT.value = p.HEAT || "";
      fSTATION.value = p.STATION || "";
      fEVENT.value = p.EVENT || "";
      fDIVISION.value = p.DIVISION || "";

      /* ============================================
         STATUS → SET CARD COLOR (no text displayed)
         ============================================ */
      const judgedStatus = await checkStatus(id, p.STATION);

      participantCard.classList.remove("done", "pending");

      if (judgedStatus === "done") {
        participantCard.classList.add("done");
      } else {
        participantCard.classList.add("pending");
      }

      pcStatus.style.display = "none"; // fully hide status text

    } catch (e) {
      console.error(e);
      hideParticipant();
      if (window.toast) toast("Lookup failed.");
    }
  }

  /* ============================================================
     INPUT TRIGGERS
     ============================================================ */

  if (entryInput) {
    entryInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.toUpperCase();
      if (!e.target.value.trim()) {
        hideParticipant();
        hideStep2();
      }
    });

    entryInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") lookupById(entryInput.value);
    });

    entryInput.addEventListener("change", (e) => {
      lookupById(e.target.value);
    });
  }

  /* ============================================================
     SUBMIT SCORE
     ============================================================ */

  if (scoreForm) {
    scoreForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (submitOverlay) {
        overlayText.textContent = "Sending…";
        submitOverlay.classList.remove("hide");
      }

      const fd = new FormData(scoreForm);
      const payload = Object.fromEntries(fd.entries());

      payload["FALSE START"] = fd.get("FALSE START") ? "YES" : "";
      payload._form = "speed";

      try {
        const out = await apiPost(payload);
        if (!out || out.ok === false) {
          throw new Error(out.error || "Server error");
        }

        if (window.toast) toast("Submitted ✅");

        overlayText.textContent = "Saved!";
        await new Promise((r) => setTimeout(r, 500));

        submitOverlay.classList.add("hide");

        resetUI();
      } catch (err) {
        console.error(err);
        if (submitOverlay) submitOverlay.classList.add("hide");
        if (window.toast) toast("Submit failed.");
      }
    });
  }

  /* EXPORT FOR STATION PAGE */
  window.speedLookupById = lookupById;

  /* INITIAL CLEAN UI */
  hideParticipant();
  hideStep2();
})();
