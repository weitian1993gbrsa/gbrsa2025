# GBRSA Score App — FULL (Online-only)
Frontend:
- No offline storage/UI
- Vertical names
- POST avoids CORS preflight (no Content-Type header)

Backend:
- Paste backend/Code.gs in Apps Script, set Script Properties:
  SHEET_ID=1jJzY7YPWp2z--NoA9zjegzss4ZJXH4_eTuaePmHe0dg • DATA_SHEET_NAME=Data • RESULT_SHEET_NAME=Result
- Deploy as Web App: Execute as Me, access Anyone.

Test:
- …/exec?cmd=ping → { ok:true }
- …/exec?cmd=participant&entryId=11F1001 → found:true
