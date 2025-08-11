# GBRSA Score App — FULL (header-aligned)
Deploy steps:
1) Apps Script → paste backend/Code.gs → Project Settings > Script properties:
   - SHEET_ID = 1jJzY7YPWp2z--NoA9zjegzss4ZJXH4_eTuaePmHe0dg
   - DATA_SHEET_NAME = Data
   - RESULT_SHEET_NAME = Result
   Deploy as Web App: Execute as Me, access Anyone.
2) Netlify → publish the `frontend` folder (contains index.html). `_redirects` included.
3) Test:
   - …/exec?cmd=ping → { ok:true }
   - …/exec?cmd=participant&entryId=11F1001 → found:true (if row exists).
