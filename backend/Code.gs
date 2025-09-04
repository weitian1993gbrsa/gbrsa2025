/** GBRSA backend (header-aligned, tolerant ID) — COMPETITION-READY */

const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '1jJzY7YPWp2z--NoA9zjegzss4ZJXH4_eTuaePmHe0dg';
const DATA_SHEET = PropertiesService.getScriptProperties().getProperty('DATA_SHEET_NAME') || 'Data';
const RESULT_SHEET = PropertiesService.getScriptProperties().getProperty('RESULT_SHEET_NAME') || 'Result';

function normalizeId(s) {
  return String(s == null ? '' : s).trim();
}
function stripLeadingZeros(s) {
  return normalizeId(s).replace(/^0+/, '');
}
function sameId(a, b) {
  const A = normalizeId(a), B = normalizeId(b);
  if (A === B) return true;
  if (stripLeadingZeros(A) === stripLeadingZeros(B)) return true; // 0012 vs 12
  return false;
}

function doGet(e) {
  const cmd = (e.parameter.cmd || '').toLowerCase();

  // === If called as API ===
  if (cmd === 'ping') return json({ ok: true, ts: Date.now() });

  if (cmd === 'participant') {
    const entryId = normalizeId(e.parameter.entryId);
    if (!entryId) return json({ error: 'Missing entryId' });

    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(DATA_SHEET);
    if (!sh) return json({ error: `Data sheet '${DATA_SHEET}' not found` });

    const values = sh.getDataRange().getValues();
    if (!values.length) return json({ found: false });

    const headers = values[0].map(String);
    const idCol = headers.findIndex(h => String(h).trim().toUpperCase() === 'ID');
    if (idCol === -1) return json({ error: "Column 'ID' not found in Data sheet" });

    for (let r = 1; r < values.length; r++) {
      if (sameId(values[r][idCol], entryId)) {
        const obj = {};
        headers.forEach((h, i) => obj[String(h).trim().toUpperCase()] = values[r][i]);
        return json({ found: true, participant: obj, matchedRow: r + 1 });
      }
    }
    return json({ found: false });
  }

  // === If no API command → show login page ===
  return HtmlService.createHtmlOutputFromFile('index');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(5000); // wait up to 5 seconds

    const body = JSON.parse(e.postData.contents || '{}');
    const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(RESULT_SHEET);
    if (!sh) return json({ error: `Result sheet '${RESULT_SHEET}' not found` });

    const values = sh.getDataRange().getValues();
    if (!values.length) return json({ error: 'Result sheet has no header row' });
    const headers = values[0].map(String);

    const row = headers.map(h => {
      const key = String(h).trim();
      if (key.toLowerCase() === 'timestamp') return new Date();
      if (Object.prototype.hasOwnProperty.call(body, key)) return body[key];
      const found = Object.keys(body).find(k => k.trim().toLowerCase() === key.toLowerCase());
      return (found ? body[found] : '');
    });

    sh.appendRow(row);
    return json({ ok: true });
  } catch (err) {
    return json({ error: String(err) });
  } finally {
    if (lock) lock.releaseLock(); // Always unlock
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON); // no setHeader needed
}

/**
 * === LOGIN SYSTEM EXTENSION ===
 * New functions for user login validation
 */

// Validate login credentials
function checkLogin(userID, password) {
  var ss = SpreadsheetApp.openById(SHEET_ID);  // use the same spreadsheet
  var sheet = ss.getSheetByName("Users");      // new Users tab you created
  if (!sheet) {
    throw new Error("Users sheet not found!");
  }

  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues(); // skip header row
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === userID && data[i][1] === password) {
      return { success: true, user: userID };
    }
  }
  return { success: false };
}

// Expose login function for frontend
function login(userID, password) {
  return checkLogin(userID, password);
}
