# GBRSA Score App — Online-only (FALSE START 'YES' / '-')
Frontend:
- Vertical names, no offline mode
- FALSE START sends 'YES' when checked, '-' when unchecked
- POST avoids preflight

Backend:
- Paste backend/Code.gs to Apps Script, set Script Properties:
  SHEET_ID=1jJzY7YPWp2z--NoA9zjegzss4ZJXH4_eTuaePmHe0dg, DATA_SHEET_NAME=Data, RESULT_SHEET_NAME=Result
- Deploy as Web App: Execute as Me, Anyone

Test: …/exec?cmd=ping, then submit a score and check the Result tab.
