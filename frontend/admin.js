// ================================
// SECURITY CHECK: ONLY ADMINS
// ================================
(function(){

  const params = new URLSearchParams(window.location.search);
  const key = params.get("key");

  // No key? block access
  if (!key) return location.href = "index.html";

  // Not an admin? block access
  if (!window.ADMIN_KEYS[key]) {
    alert("Access denied – admin only.");
    return location.href = "index.html";
  }

})();

// ================================
// LOGOUT BUTTON
// ================================
document.getElementById("btnLogout").addEventListener("click", () => {
  location.href = "index.html";
});

// ================================
// FORCE REFRESH BUTTON
// ================================
document.getElementById("forceRefresh").addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  caches?.keys().then(keys => keys.forEach(k => caches.delete(k)));

  alert("Cache cleared. Reloading...");
  location.reload();
});
