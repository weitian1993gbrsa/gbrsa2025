(function(){
  const $ = (q, el=document) => el.querySelector(q);
  const entryInput = $('#entryIdInput');
  const submitOverlay = document.getElementById('submitOverlay');
  const overlayText   = document.getElementById('overlayText');

  function submitEntryId(id) {
    if (!id) return;
    overlayText.textContent = "Submitting " + id + "...";
    submitOverlay.style.display = 'flex';
    // TODO: integrate with backend submission if required
    setTimeout(() => {
      submitOverlay.style.display = 'none';
      entryInput.value = "";
    }, 800);
  }

  entryInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitEntryId(entryInput.value.trim().toUpperCase());
    }
  });
})();