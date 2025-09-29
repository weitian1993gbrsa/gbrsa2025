(function(){
  const $ = (q, el=document) => el.querySelector(q);
  const entryInput = $('#entryIdInput');

  function submitEntryId(id) {
    if (!id) return;
    // Redirect directly to judge form with entryId parameter
    window.location.href = "../judge_form_ui.html?entryId=" + encodeURIComponent(id);
  }

  entryInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitEntryId(entryInput.value.trim().toUpperCase());
    }
  });
})();