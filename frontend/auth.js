// 🔒 Redirect to login if not logged in
(function() {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  }
})();

// 🚪 Logout function
function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}
