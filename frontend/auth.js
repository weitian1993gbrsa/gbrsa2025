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


function forceRepaint() {
  document.body.classList.add("hidden");
  void document.body.offsetHeight;
  document.body.classList.remove("hidden");
}
