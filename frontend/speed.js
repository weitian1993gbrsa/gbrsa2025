(async function(){
  const entryInput = $('#entryIdInput');
  const participantCard = $('#participantCard');
  const badgeHeat = $('#badgeHeat');
  const badgeCourt = $('#badgeCourt');
  const pId = $('#pId');
  const pNames = $('#pNames');
  const pRep = $('#pRep');
  const pState = $('#pState');
  const fId = $('#fId'); const fNAME1 = $('#fNAME1'); const fNAME2 = $('#fNAME2'); const fNAME3 = $('#fNAME3'); const fNAME4 = $('#fNAME4'); const fREP = $('#fREP'); const fSTATE = $('#fSTATE'); const fHEAT = $('#fHEAT'); const fCOURT = $('#fCOURT');
  const btnConfirm = $('#btnConfirm'); const scoreFormWrap = $('#scoreFormWrap'); const scoreForm = $('#scoreForm'); const pendingBox = $('#pendingBox'); const pendingCount = $('#pendingCount'); const btnSaveOffline = $('#btnSaveOffline'); const btnSync = $('#btnSync');
  const cam = $('#cam'); const cameraWrap = $('#cameraWrap'); const btnOpenCamera = $('#btnOpenCamera'); const btnCloseCamera = $('#btnCloseCamera'); let stream=null, detector=null, scanning=false;
  function updatePendingBadge(){ const n = queue.all().length; pendingCount.textContent = String(n); pendingBox.classList.toggle('hide', n===0); } updatePendingBadge();
  async function lookupById(id){ if(!id) return; try{ const data = await apiGet({ cmd:'participant', entryId:id }); if(!data||!data.found){ participantCard.classList.add('hide'); return toast('ID not found.'); }
    const p = data.participant||{}; const name1=p['NAME1']||''; const name2=p['NAME2']||''; const name3=p['NAME3']||''; const name4=p['NAME4']||''; const names=[name1,name2,name3,name4].filter(Boolean).join(' / ');
    const rep=p['REPRESENTATIVE']||''; const state=p['STATE']||''; const heat=p['HEAT']||''; const court=p['COURT']||'';
    pId.textContent=id; pNames.textContent=names||'—'; pRep.textContent=rep||'—'; pState.textContent=state||'—'; badgeHeat.textContent=`HEAT ${heat||'—'}`; badgeCourt.textContent=`COURT ${court||'—'}`;
    fId.value=id; fNAME1.value=name1; fNAME2.value=name2; fNAME3.value=name3; fNAME4.value=name4; fREP.value=rep; fSTATE.value=state; fHEAT.value=heat; fCOURT.value=court;
    participantCard.classList.remove('hide');
  }catch(err){ console.error(err); toast('Lookup failed.'); } }
  entryInput.addEventListener('change', e=> lookupById(e.target.value.trim()));
  entryInput.addEventListener('keyup', e=> { if(e.key==='Enter') lookupById(entryInput.value.trim()); });
  async function startScan(){ if(!('BarcodeDetector' in window)) return toast('QR scanning not supported. Type ID instead.');
    try{ detector=new BarcodeDetector({formats:['qr_code']}); }catch(e){ return toast('QR unavailable.'); }
    try{ stream=await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ideal:'environment'}, width:{ideal:1280}, height:{ideal:720} }, audio:false }); cam.srcObject=stream; await cam.play(); cameraWrap.classList.remove('hide'); scanning=true; scanLoop(); }
    catch(e){ console.error(e); toast('Cannot open camera.'); }
  }
  async function scanLoop(){ if(!scanning) return; try{ const codes=await detector.detect(cam); if(codes&&codes.length){ let id=(codes[0].rawValue||'').trim(); try{ const u=new URL(id); id=u.searchParams.get('id')||id; }catch{} entryInput.value=id; await stopScan(); await lookupById(id); } }catch(e){} requestAnimationFrame(scanLoop); }
  async function stopScan(){ scanning=false; if(cam) cam.pause(); if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; } cameraWrap.classList.add('hide'); }
  btnOpenCamera.addEventListener('click', startScan); btnCloseCamera.addEventListener('click', stopScan);
  btnConfirm.addEventListener('click', ()=> { scoreFormWrap.classList.remove('hide'); toast('Ready to enter score.'); scoreFormWrap.scrollIntoView({behavior:'smooth', block:'start'}); });
  scoreForm.addEventListener('submit', async (e)=> { e.preventDefault(); const fd=new FormData(scoreForm); const payload=Object.fromEntries(fd.entries()); payload['FALSE START']=fd.get('FALSE START')?'TRUE':'FALSE';
    try{ const out=await apiPost(payload); if(out&&out.ok){ toast('Submitted ✅'); scoreForm.reset(); updatePendingBadge(); } else throw new Error('reject'); }
    catch(err){ queue.add(payload); toast('Offline — saved locally. Tap Sync later.'); updatePendingBadge(); } });
  btnSaveOffline.addEventListener('click', ()=> { const fd=new FormData(scoreForm); const payload=Object.fromEntries(fd.entries()); payload['FALSE START']=fd.get('FALSE START')?'TRUE':'FALSE'; queue.add(payload); updatePendingBadge(); toast('Saved offline.'); });
  btnSync.addEventListener('click', async ()=> { const items=queue.all(); if(!items.length) return toast('Nothing to sync.'); let remaining=[]; for(const item of items){ try{ const out=await apiPost(item); if(!out||!out.ok) remaining.push(item); } catch{ remaining.push(item); } } if(remaining.length===0){ queue.clear(); toast('All pending submissions synced ✅'); } else { queue.set(remaining); toast(`Some items failed. Remaining: ${remaining.length}`); } updatePendingBadge(); });
})();