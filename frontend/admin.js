/* ============================================================
   ADMIN PAGE SECURITY + FEATURES
   ============================================================ */

// Read ?key=xxxx from URL
const qs = new URLSearchParams(location.search);
const key = qs.get("key");

// Load admin keys
const admins = window.ADMIN_KEYS || {};

// 1️⃣ No key → go home
if (!key) {
  location.href = "index.html";
}

// 2️⃣ Invalid key → block user
if (!admins[key]) {
  alert("Access Denied: Admin key required.");
  location.href = "index.html";
}

// 3️⃣ Disable back-swipe (iOS/Android)
function disableBack() {
  history.pushState(null, null, location.href);
}
disableBack();
window.onpopstate = disableBack;

// 4️⃣ Ensure fresh page on return
window.addEventListener("pageshow", () => {
  if (performance.navigation.type === 2) {
    // forced reload to avoid cached view
    location.reload();
  }
});
