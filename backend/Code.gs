/**
 * GBRSA backend (extended with Judge Login)
 */
const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '1jJzY7YPWp2z--NoA9zjegzss4ZJXH4_eTuaePmHe0dg';
const DATA_SHEET = PropertiesService.getScriptProperties().getProperty('DATA_SHEET_NAME') || 'Data';
const RESULT_SHEET = PropertiesService.getScriptProperties().getProperty('RESULT_SHEET_NAME') || 'Result';
const JUDGE_SHEET = PropertiesService.getScriptProperties().getProperty('JUDGE_SHEET_NAME') || 'Judges';

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
    const data=sh.getDataRange().getValues();
    for (let i=1;i<data.length;i++){
      if(sameId(entryId, data[i][0])) return json({ ok:true, row:data[i] });
    }
    return json({ error:'Not found' });
  }
  return json({ error:'Unknown command' });
}

function doPost(e){
  const body = JSON.parse(e.postData.contents);
  const cmd = (body.cmd||'').toLowerCase();

  if (cmd==='login'){
    return json(checkJudgeLogin(body));
  }
  if (cmd==='submitresult'){
    return json(saveResult(body));
  }
  return json({ error:'Unknown command' });
}

function checkJudgeLogin(body){
  const judgeId = (body.judgeId||'').trim();
  const password = (body.password||'').trim();
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(JUDGE_SHEET);
  const data = sh.getDataRange().getValues();
  for (let i=1;i<data.length;i++){
    if (data[i][0]==judgeId && data[i][1]==password){
      return { success:true, judgeId:judgeId };
    }
  }
  return { success:false, message:'Invalid JudgeID or Password' };
}

function saveResult(body){
  try{
    const ss=SpreadsheetApp.openById(SHEET_ID);
    const sh=ss.getSheetByName(RESULT_SHEET);
    const values=[
      new Date(),
      body.entryId||'',
      body.score||'',
      body.event||'',
      body.judgeId||''
    ];
    sh.appendRow(values);
    return { success:true };
  }catch(err){
    return { success:false, message:err.message };
  }
}

function json(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
