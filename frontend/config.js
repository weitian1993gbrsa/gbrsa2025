/* ============================================================
   GLOBAL CONFIG – SPEED + FREESTYLE (4-judge system)
============================================================ */

window.CONFIG = {
  APPS_SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbw1UORMl0LqZPdxelb8DdWSKZUUcX3WL03GDUSM-GeLX9v-KYHeeeFwQ8epyS3va3RQTA/exec",

  SHEET_ID: "1jJzY7YPWp2z--NoA9zjegzss4ZJXH4_eTuaePmHe0dg",

  DATA_SHEET_NAME: "DATA",

  // result sheets
  RESULT_SPEED: "RESULT_SPEED",
  FS_DIFF: "DIFF",
  FS_TECH: "TECHNICAL",
  FS_RE: "RE",
  FS_PRESENT: "PRESENTATION",
};

/* ============================================================
   EVENT FILTERS
============================================================ */
window.SPEED_EVENTS = [
  "SRJJ","SRSS","SRDU","SRTU","SRJJR","SRSR",
];

window.FREESTYLE_EVENTS = [
  "SRIF",
  "SRIF_LEVEL 1",
  "SRIF_LEVEL 2"
];

/* ============================================================
   LOGIN KEYS
============================================================ */

// Speed judges
window.JUDGE_KEYS = {
  // Speed
  "abc123": { event:"speed", station:1 },
  "def456": { event:"speed", station:2 },
  "ghi789": { event:"speed", station:3 },
  "jkl555": { event:"speed", station:4 },
  "mno888": { event:"speed", station:5 },
  "pqr222": { event:"speed", station:6 },

  // ========================================================
  // FREESTYLE 3 stations × 4 judge types
  // ========================================================

  // -------- Station 1 --------
  "fd1": { event:"freestyle", station:1, judgeType:"difficulty" },
  "fr1": { event:"freestyle", station:1, judgeType:"re" },
  "ft1": { event:"freestyle", station:1, judgeType:"technical" },
  "fp1": { event:"freestyle", station:1, judgeType:"presentation" },

  // -------- Station 2 --------
  "fd2": { event:"freestyle", station:2, judgeType:"difficulty" },
  "fr2": { event:"freestyle", station:2, judgeType:"re" },
  "ft2": { event:"freestyle", station:2, judgeType:"technical" },
  "fp2": { event:"freestyle", station:2, judgeType:"presentation" },

  // -------- Station 3 --------
  "fd3": { event:"freestyle", station:3, judgeType:"difficulty" },
  "fr3": { event:"freestyle", station:3, judgeType:"re" },
  "ft3": { event:"freestyle", station:3, judgeType:"technical" },
  "fp3": { event:"freestyle", station:3, judgeType:"presentation" },
};

// ADMIN
window.ADMIN_KEY = "admin2025";
