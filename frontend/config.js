window.CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw1UORMl0LqZPdxelb8DdWSKZUUcX3WL03GDUSM-GeLX9v-KYHeeeFwQ8epyS3va3RQTA/exec",
  SHEET_ID: "1jJzY7YPWp2z--NoA9zjegzss4ZJXH4_eTuaePmHe0dg",
  DATA_SHEET_NAME: "DATA",
  RESULT_SHEET_NAME: "RESULT"
};

// Login backend URL (currently unused but safe to keep)
const LOGIN_API_URL =
  "https://script.google.com/macros/s/AKfycbzq3LYbSAoFRjt8wIbomxwehCOdAdGo4eCkpHlhj_ncTm27tpQJyMhzQHRQTfhKQ6WJ/exec";

// Force browser repaint helper
function forceRepaint() {
  document.body.classList.add("hidden");
  void document.body.offsetHeight;
  document.body.classList.remove("hidden");
}

/* ============================================================
   JUDGE ACCESS KEYS  
   ✔ Update judge keys here ONLY
   ✔ Used by index.html & station.js
============================================================ */

window.JUDGE_KEYS = {
  "admin": 1,
  "def456": 2,
  "ghi789": 3,
  "jkl555": 4,
  "mno888": 5,
  "pqr222": 6,
  "stu333": 7,
  "vwx444": 8,
  "yyy111": 9,
  "zzt777": 10,
  "qqq101": 11,
  "key999": 12
};

/* ============================================================
   ADMIN ACCESS KEYS  
   ✔ Used for admin.html access
   ✔ NOT tied to station numbers
============================================================ */

window.ADMIN_KEYS = {
  "admin123": true,
  "gbadmin": true
};
