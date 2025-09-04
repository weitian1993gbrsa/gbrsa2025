/** GBRSA backend (fast lookup) */
const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '1jJzY7YPWp2z--NoA9zjegzss4ZJXH4_eTuaePmHe0dg';
const DATA_SHEET = PropertiesService.getScriptProperties().getProperty('DATA_SHEET_NAME') || 'Data';
const RESULT_SHEET = PropertiesService.getScriptProperties().getProperty('RESULT_SHEET_NAME') || 'Result';

function normalizeId(s){ return String(s == null ? '' : s).trim(); }
function stripLeadingZeros(s){ return normalizeId(s).replace(/^0+/, ''); }
function sameId(a,b){ const A=normalizeId(a), B=normalizeId(b); if (A===B) return true; if (stripLeadingZeros(A)===stripLeadingZeros(B)) return true; return false; }

function doGet(e){
  const cmd=(e.parameter.cmd||'').toLowerCase();
  if (cmd==='ping') return json({ ok:true, ts: Date.now() });
  if (cmd==='participant'){ 
    const entryId=normalizeId(e.parameter.entryId);
    if(!entryId) return json({ error:'Missing entryId' });
    const sh=SpreadsheetApp.openById(SHEET_ID).getSheetByName(DATA_SHEET);
    if(!sh) return json({ error:`Data sheet 'Data' not found`});
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    if (lastRow < 2) return json({ found:false });
    const headers = sh.getRange(1,1,1,lastCol).getValues()[0].map(String);
    // search only ID column (assumed col 1 header 'ID')
    const idHeader = headers[0].trim().toUpperCase();
    if (idHeader !== 'ID') return json({ error:"Column 'ID' must be in A1" });
    const idRange = sh.getRange(2,1,lastRow-1,1);
    const finder = idRange.createTextFinder(entryId).matchEntireCell(true).matchCase(true);
    const cell = finder.findNext();
    if (!cell) return json({ found:false });
    const rowIndex = cell.getRow();
    const rowVals = sh.getRange(rowIndex,1,1,lastCol).getValues()[0];
    const obj = {};
    headers.forEach((h,i)=> obj[String(h).trim().toUpperCase()] = rowVals[i]);
    return json({ found:true, participant: obj, matchedRow: rowIndex });
  }
  return json({ error:'Unknown command' });
}

function doPost(e){
  try{ const bodyStr = e.postData && e.postData.contents ? e.postData.contents : '{}'; const body = JSON.parse(bodyStr);
    const sh=SpreadsheetApp.openById(SHEET_ID).getSheetByName(RESULT_SHEET); if(!sh) return json({ error:`Result sheet 'Result' not found`});
    const values=sh.getDataRange().getValues(); if(!values.length) return json({ error:'Result sheet has no header row' });
    const headers=values[0].map(String); const row=headers.map(h=>{ const key=String(h).trim(); if(key.toLowerCase()==='timestamp') return new Date(); if(Object.prototype.hasOwnProperty.call(body,key)) return body[key]; const found=Object.keys(body).find(k=> k.trim().toLowerCase()===key.toLowerCase()); return found?body[found]:''; });
    sh.appendRow(row); return json({ ok:true });
  }catch(err){ return json({ error:String(err) }); }
}

function json(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
