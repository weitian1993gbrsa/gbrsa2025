// 🔒 Redirect to login if not logged in
(function() {
  if (sessionStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  }
})();

// 🚪 Logout function
function logout() {
  sessionStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

// 👀 Auto-logout when app/tab goes into background
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    sessionStorage.removeItem("loggedIn");
    window.location.href = "login.html";
  }
});

// 📴 Auto-logout when app/tab is closed or refreshed
window.addEventListener("beforeunload", () => {
  sessionStorage.removeItem("loggedIn");
});
