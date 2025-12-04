/* ============================================================
   GLOBAL CONFIG
   (Speed + Freestyle support)
============================================================ */

window.CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbw1UORMl0LqZPdxelb8DdWSKZUUcX3WL03GDUSM-GeLX9v-KYHeeeFwQ8epyS3va3RQTA/exec",
  SHEET_ID: "1jJzY7YPWp2z--NoA9zjegzss4ZJXH4_eTuaePmHe0dg",
  DATA_SHEET_NAME: "DATA",
  RESULT_SHEET_NAME: "RESULT"
};

// Login backend URL
const LOGIN_API_URL =
  "https://script.google.com/macros/s/AKfycbzq3LYbSAoFRjt8wIbomxwehCOdAdGo4eCkpHlhj_ncTm27tpQJyMhzQHRQTfhKQ6WJ/exec";


/* ============================================================
   EVENT GROUPS  (🔥 REQUIRED for filtering)
============================================================ */
window.SPEED_EVENTS = [
  "SRJJ",
  "SRSS",
  "SRDU",
  "SRTU",
  "SRJJR",
  "SRSR",
];

window.FREESTYLE_EVENTS = [
  "SRIF",
  "SRIF_LEVEL 1",
  "SRIF_LEVEL 2"
];


/* ============================================================
   JUDGE ACCESS KEYS (same as before + freestyle)
============================================================ */

window.JUDGE_KEYS = {

  // SPEED
  "abc123": { event: "speed", station: 1 },
  "def456": { event: "speed", station: 2 },
  "ghi789": { event: "speed", station: 3 },
  "jkl555": { event: "speed", station: 4 },
  "mno888": { event: "speed", station: 5 },
  "pqr222": { event: "speed", station: 6 },
  "stu333": { event: "speed", station: 7 },
  "vwx444": { event: "speed", station: 8 },
  "yyy111": { event: "speed", station: 9 },
  "zzt777": { event: "speed", station: 10 },
  "qqq101": { event: "speed", station: 11 },
  "key999": { event: "speed", station: 12 },

  // FREESTYLE station 1
  "fd1": { event: "freestyle", station: 1, judgeType: "difficulty" },
  "ft1": { event: "freestyle", station: 1, judgeType: "technical" },
  "fp1": { event: "freestyle", station: 1, judgeType: "presentation" },

  // FREESTYLE station 2
  "fd2": { event: "freestyle", station: 2, judgeType: "difficulty" },
  "ft2": { event: "freestyle", station: 2, judgeType: "technical" },
  "fp2": { event: "freestyle", station: 2, judgeType: "presentation" },

  // FREESTYLE station 3
  "fd3": { event: "freestyle", station: 3, judgeType: "difficulty" },
  "ft3": { event: "freestyle", station: 3, judgeType: "technical" },
  "fp3": { event: "freestyle", station: 3, judgeType: "presentation" }
};


// ===== ADMIN LOGIN KEY =====
const ADMIN_KEY = "admin2025";
