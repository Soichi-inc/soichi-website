(() => {
  'use strict';
  const script = document.currentScript;
  const assets = new URL('campus/', script.src).href;
  const offices = [
    {id:'hq',name:'Soichi inc.',en:'HEADQUARTERS',x:50,y:40,color:'#e63722',work:['全体の進行を整理','アイデアを共有','次の一手を検討']},
    {id:'engineering',name:'Engineering Office',en:'ENGINEERING',x:23,y:35,color:'#287db5',work:['コードを実装','テストを実行','設計をレビュー']},
    {id:'design',name:'Design Studio',en:'DESIGN STUDIO',x:77,y:36,color:'#c66b42',work:['ビジュアルを制作','構図を検討','デザインをレビュー']},
    {id:'agent',name:'Media Planning Office',en:'MEDIA PLANNING',x:30,y:72,color:'#8c73c0',work:['メディア企画を検討','コンテンツをリサーチ','構成案を作成']},
    {id:'sales',name:'Sales Branch',en:'SALES BRANCH',x:70,y:72,color:'#4c8164',work:['提案を準備','商談の準備','情報を整理']}
  ];
  const door = '<svg viewBox="0 0 32 36" aria-hidden="true"><path class="door-frame" d="M5 32V3h22v29M2 33h28"/><g class="door-leaf"><path d="M8 5h16v26H8z"/><circle cx="20" cy="19" r="1"/></g></svg>';
  const trigger = document.createElement('button');
  trigger.className='campus-trigger';trigger.type='button';
  trigger.setAttribute('aria-label','バーチャルオフィスを開く');
  trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');
  trigger.setAttribute('aria-controls','soichi-campus');trigger.innerHTML=door+'<span>OFFICE<small>COME ON IN</small></span>';
  const dialog = document.createElement('dialog');
  dialog.id='soichi-campus';dialog.className='campus';dialog.setAttribute('aria-labelledby','campus-title');dialog.setAttribute('data-lenis-prevent','');
  dialog.innerHTML=`<header class="campus-bar"><a class="campus-brand" href="#campus-title" aria-label="バーチャルオフィス">soichi<span>.</span><small>VIRTUAL CAMPUS / 01</small></a><button class="campus-close" aria-label="バーチャルオフィスを閉じる">EXIT ${door}</button></header>
  <div class="campus-intro"><p class="campus-kicker">SOMEWHERE BETWEEN HUMAN & AI</p><h2 id="campus-title">A SMALL WORLD.<br><em>BIG POSSIBILITIES.</em></h2></div>
  <div class="campus-weather"><span class="campus-orb" aria-hidden="true"></span><div><time class="campus-clock"></time><small class="campus-weather-label"></small></div><div class="campus-time-modes" aria-label="風景の時間帯">${[['auto','日本時間'],['day','昼'],['night','夜']].map(([v,n])=>`<button data-time="${v}" aria-pressed="${v==='auto'}">${n}</button>`).join('')}</div></div>
  <p class="campus-pan-hint">SWIPE TO EXPLORE ↔</p><div class="campus-landscape"><div class="campus-stars" aria-hidden="true"></div><div class="campus-map" role="group" aria-label="5つのオフィス">
  <img class="campus-photo campus-photo-day" src="${assets}metro-day.webp" alt="" draggable="false"><img class="campus-photo campus-photo-night" src="${assets}metro-night.webp" alt="" draggable="false">
  ${offices.map(o=>`<button class="campus-building campus-building--${o.id}" data-office="${o.id}" style="--x:${o.x}%;--y:${o.y}%;--office-color:${o.color}" aria-label="${o.name}の中を覗く"><span class="building-pin" aria-hidden="true">＋</span><span class="building-label"><small>${o.en}</small><strong>${o.name}</strong><span>ENTER ↗</span></span></button>`).join('')}
  </div></div>
  <section class="campus-room" aria-labelledby="room-title" hidden><div class="room-heading"><button class="room-back">← 街に戻る</button><p class="campus-kicker room-kicker"></p><h3 id="room-title" tabindex="-1"></h3><p>小さな仲間たちが、次の可能性をつくっています。</p></div><div class="room-stage"><img class="room-photo" src="${assets}interior-photo.webp" alt="" draggable="false"><img class="room-photo room-photo-night" src="${assets}interior-night-photo.webp" alt="" draggable="false"><div class="room-agents">${[0,1,2,3].map(i=>`<div class="room-agent" data-agent="${i}"><span class="agent-thought"></span><img src="${assets}worker-v2.webp" alt="AIエージェント ${i+1}" draggable="false"><small>SO-${String(i+1).padStart(2,'0')}</small></div>`).join('')}</div></div><div class="room-status"><span class="status-dot"></span><span class="room-activity" aria-live="off"></span><button class="campus-pause" aria-pressed="false">動きを止める Ⅱ</button></div></section>
  <footer class="campus-footer"><span><i></i> A LIVING EXPERIMENT</span><span class="campus-coordinate">TOKYO / DIGITAL SPACE</span></footer>`;
  document.body.append(trigger,dialog);
  // These effects live in the same photograph coordinate system as the hotspots.
  const cityFX=document.createElement('div');cityFX.className='city-fx';cityFX.setAttribute('aria-hidden','true');
  cityFX.innerHTML=`<svg viewBox="0 0 1536 1024" preserveAspectRatio="none"><defs><linearGradient id="car-metal"><stop stop-color="#a6adb3"/><stop offset=".4" stop-color="#eef1ed"/><stop offset="1" stop-color="#647379"/></linearGradient></defs>${Array.from({length:8},(_,i)=>`<g class="city-car car-lane-${i%2}" style="--duration:${13+i*1.7}s;--delay:${-i*4.3}s"><g transform="rotate(9)"><ellipse rx="15" ry="5" cy="3" fill="#000" opacity=".35"/><rect x="-14" y="-5" width="28" height="10" rx="3" fill="${i%3===0?'#303b43':i%3===1?'url(#car-metal)':'#cbb48a'}"/><path d="M-5-4h10v8H-5z" fill="#213946"/><path d="M-5-4h10" stroke="#d6e2e2"/><path class="car-headlight" d="M14-3h3m-3 6h3" stroke="#fff5c6" stroke-width="2"/><path d="M-14-3h-1m1 6h-1" stroke="#e05a44" stroke-width="2"/></g></g>`).join('')}${Array.from({length:12},(_,i)=>`<g class="city-person" style="--duration:${28+i*2.1}s;--delay:${-i*6}s;--person-offset:${i%3*5}px"><ellipse rx="4" ry="1.5" cy="3" fill="#000" opacity=".25"/><path d="M-1 0l-1 4m3-4l1 4" stroke="#22313c" stroke-width="1.3"/><path d="M0-4v5" stroke="${i%3?'#3a4853':'#e7dfce'}" stroke-width="3"/><circle cy="-6" r="1.6" fill="#b3a493"/></g>`).join('')}<g class="city-window-light"><path d="M746 220v34m20-27v32m17 86v29M328 192v12m13-10v12M1187 268v19m14-14v19" stroke="#ffe7ac" stroke-width="4"/></g><g class="city-reflection"><path d="M665 168L700 650" stroke="#d0efff" stroke-width="3" opacity=".4"/><path d="M306 100L338 421" stroke="#f5f9ff" stroke-width="2" opacity=".4"/></g></svg>`;
  dialog.querySelector('.campus-map').append(cityFX);
  const picker=document.createElement('div');picker.className='campus-office-picker';
  picker.innerHTML=`<select aria-label="オフィスを選ぶ"><option value="">EXPLORE THE OFFICES ↗</option>${offices.map(o=>`<option value="${o.id}">${o.name}</option>`).join('')}</select>`;dialog.append(picker);
  const worldPause=document.createElement('button');worldPause.className='campus-world-pause';worldPause.type='button';worldPause.textContent='PAUSE Ⅱ';worldPause.setAttribute('aria-label','街の動きを停止する');dialog.querySelector('.campus-bar').append(worldPause);
  const screens=document.createElement('div');screens.className='room-screens';screens.setAttribute('aria-hidden','true');
  screens.innerHTML=Array.from({length:4},(_,i)=>`<div class="work-screen screen-${i}"><small>SOICHI / WORKSPACE</small><div class="screen-visual"><i></i><i></i><i></i><i></i><i></i></div><b class="screen-task">BUILDING</b><span class="screen-progress"><i></i></span></div>`).join('');dialog.querySelector('.room-stage').append(screens);
  dialog.querySelectorAll('.room-agent').forEach(a=>a.insertAdjacentHTML('beforeend','<span class="agent-keystrokes" aria-hidden="true">···</span><span class="agent-received" hidden>✓ 受取完了</span>'));
  const transferLayer=document.createElement('div');transferLayer.className='agent-transfers';transferLayer.setAttribute('aria-hidden','true');dialog.querySelector('.room-stage').append(transferLayer);
  const map=dialog.querySelector('.campus-map'),room=dialog.querySelector('.campus-room');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let selected=null,mode='auto',timer=null,clockTimer=null,paused=false,oldOverflow='',lastBuilding=null,mapScroll=0;
  const agents=[...dialog.querySelectorAll('.room-agent')];
  const layouts={
    hq:{photos:['interior-photo','interior-night-photo'],seats:[[41,51],[72,51],[36,80],[83,80]],spots:[[50,50],[55,65],[46,88],[65,90]],screens:[[32.5,32.8,7.6,5.9],[61.5,32.8,7.6,5.9],[24,48.2,12.8,8.6],[69.5,48.2,12,8.6]]},
    engineering:{seats:[[41,46],[59,46],[36,66],[64,66]],spots:[[45,60],[55,60],[45,78],[55,90]],screens:[[34.9,26.5,5.8,5.2],[58.65,25.8,6.2,5.6],[23.5,34.4,9.9,10.3,'polygon(0 16%,95% 0,100% 84%,4% 100%)'],[66.9,34.5,9.4,10,'polygon(4% 0,100% 14%,97% 100%,0 83%)']]},
    design:{seats:[[20,65],[85,67],[30,84],[75,84]],spots:[[22,75],[83,75],[45,94],[60,94]],screens:[[37.7,38.3,7.6,6.5],[56,38.3,7.6,6.5],[35.4,47.8,9.8,8.4],[55.9,47.8,9.8,8.4]]},
    agent:{seats:[[43,49],[76,44],[38,76],[79,89]],spots:[[50,57],[85,65],[46,90],[64,94]],screens:[[36.2,23.8,8.4,6.6],[57.7,26.5,10.2,7.4],[24,37.7,13,11],[58.4,43.7,17.7,14.9]]},
    sales:{seats:[[38,52],[60,52],[35,83],[65,83]],spots:[[35,65],[65,65],[45,93],[55,93]],screens:[[27.4,26.6,6.9,5.9],[64.8,26.5,7,6],[18.1,46.2,11.8,9.8],[69.5,46.2,11.8,9.7]]}
  };
  let seats=layouts.hq.seats,sharingSpots=layouts.hq.spots,roomLoad=0,roomReady=false;
  const jobs=agents.map((_,i)=>({phase:'work',progress:i*17,remaining:0,completed:0}));
  const transfers=new Map(),receipts=[0,0,0,0];
  function clearTransfers(){transfers.forEach(t=>{t.animation.cancel();t.node.remove();});transfers.clear();receipts.fill(0);agents.forEach(a=>a.querySelector('.agent-received').hidden=true);}
  function sendDocument(i){
    const locked=new Set([...transfers.values()].map(t=>t.to));
    const to=agents.findIndex((_,j)=>j!==i&&!locked.has(j)&&['work','review','waiting'].includes(jobs[j].phase));
    if(to<0)return false;
    const base=transferLayer.getBoundingClientRect(),fromBox=agents[i].getBoundingClientRect(),toBox=agents[to].getBoundingClientRect();
    const sx=fromBox.left+fromBox.width*.5-base.left,sy=fromBox.top+fromBox.height*.5-base.top;
    const dx=toBox.left+toBox.width*.5-base.left-sx,dy=toBox.top+toBox.height*.5-base.top-sy;
    const node=document.createElement('div');node.className='shared-document';node.style.left=sx+'px';node.style.top=sy+'px';
    node.innerHTML='<svg viewBox="0 0 36 44"><path d="M5 2h18l8 8v31H5z" fill="#fff9eb" stroke="#c6d7cc"/><path d="M23 2v9h8" fill="#dceade"/><path d="M11 19h14M11 25h14M11 31h9" stroke="#476a62" stroke-width="2"/></svg><small>資料を共有</small>';
    transferLayer.append(node);
    const animation=node.animate([{transform:'translate(-50%,-50%) scale(.7)',opacity:0},{transform:'translate(-50%,-50%) scale(1)',opacity:1,offset:.12},{transform:`translate(calc(-50% + ${dx*.5}px),calc(-50% + ${dy*.5-35}px)) scale(1.1)`,opacity:1,offset:.5},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.85)`,opacity:1}],{duration:1600,easing:'ease-in-out',fill:'forwards'});
    transfers.set(i,{to,node,animation});agents[i].querySelector('.agent-thought').textContent=`SO-0${to+1}へ資料を共有`;
    return true;
  }
  const screenEls=[...screens.querySelectorAll('.work-screen')];
  const landscape=dialog.querySelector('.campus-landscape'),roomStage=dialog.querySelector('.room-stage');
  // Cover the viewport without distorting the image or separating its overlay coordinates.
  function fitScenes(){
    if(!dialog.open)return;
    const w=dialog.clientWidth,h=dialog.clientHeight,sceneW=Math.max(w,h*1.5),sceneH=sceneW/1.5;
    for(const el of [map,roomStage]){el.style.width=sceneW+'px';el.style.height=sceneH+'px';el.style.top=(h-sceneH)+'px';}
  }
  new ResizeObserver(fitScenes).observe(dialog);
  const motionOff=()=>paused||reduce.matches||document.body.classList.contains('motion-off');
  let arrivalLayer=null,arrivalAnimations=[];
  function clearArrival(){arrivalAnimations.forEach(a=>a.cancel());arrivalAnimations=[];arrivalLayer?.remove();arrivalLayer=null;}
  function approachOffice(button){
    clearArrival();
    if(motionOff())return Promise.resolve();
    const bounds=map.getBoundingClientRect(),target=button.getBoundingClientRect();
    const x=target.left+target.width/2,y=target.top+target.height/2;
    const layer=document.createElement('div');layer.className='campus-arrival';layer.setAttribute('aria-hidden','true');
    const scene=document.createElement('div');Object.assign(scene.style,{position:'absolute',left:bounds.left+'px',top:bounds.top+'px',width:bounds.width+'px',height:bounds.height+'px',transformOrigin:`${x-bounds.left}px ${y-bounds.top}px`});
    map.querySelectorAll('.campus-photo').forEach(photo=>{const img=photo.cloneNode();img.removeAttribute('class');Object.assign(img.style,{position:'absolute',inset:'0',width:'100%',height:'100%',opacity:getComputedStyle(photo).opacity,filter:getComputedStyle(photo).filter});scene.append(img);});
    layer.append(scene);dialog.append(layer);arrivalLayer=layer;
    const animation=scene.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${dialog.clientWidth/2-x}px,${dialog.clientHeight*.48-y}px) scale(4.2)`}],{duration:1800,easing:'cubic-bezier(.35,0,.75,1)',fill:'forwards'});
    // Start the handoff while the camera is still moving, not at its resting point.
    const handoff=scene.animate([{opacity:1},{opacity:1}],{duration:750});
    arrivalAnimations.push(animation,handoff);
    return handoff.finished.catch(()=>{});
  }
  function revealOffice(){
    if(!arrivalLayer)return;
    if(motionOff()){clearArrival();return;}
    const layer=arrivalLayer;
    const fade=layer.animate([{opacity:1},{opacity:0}],{duration:600,easing:'linear',fill:'forwards'});
    const inside=roomStage.animate([{transform:'scale(1.13)'},{transform:'scale(1)'}],{duration:1000,easing:'cubic-bezier(.16,1,.3,1)'});
    arrivalAnimations.push(fade,inside);
    fade.finished.then(()=>{layer.remove();if(arrivalLayer===layer)arrivalLayer=null;}).catch(()=>{});
  }
  function updateTime(){
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    const hour=Number(parts.find(p=>p.type==='hour').value),minute=parts.find(p=>p.type==='minute').value;
    const period=mode!=='auto'?mode:hour>=7&&hour<17?'day':hour>=5&&hour<19?'dusk':'night';
    dialog.dataset.period=period;
    dialog.querySelector('.campus-clock').textContent=`TOKYO ${String(hour).padStart(2,'0')}:${minute} JST`;
    dialog.querySelector('.campus-weather-label').textContent=(mode==='auto'?'日本時間に連動 / ':'風景プレビュー / ')+({day:'DAYLIGHT',dusk:'GOLDEN HOUR',night:'AFTER HOURS'}[period]);
  }
  function syncMotion(){
    if(motionOff())arrivalAnimations.forEach(a=>{if(a.playState!=='finished')a.finish();});
    dialog.classList.toggle('campus-still',motionOff());
    dialog.classList.toggle('campus-suspended',document.hidden||!dialog.open);
    worldPause.textContent=motionOff()?'PLAY ▷':'PAUSE Ⅱ';worldPause.setAttribute('aria-pressed',String(motionOff()));worldPause.setAttribute('aria-label',motionOff()?'街の動きを再開する':'街の動きを停止する');worldPause.disabled=reduce.matches||document.body.classList.contains('motion-off');
    dialog.querySelector('.campus-pause').textContent=motionOff()?'動きを再開する ▷':'動きを止める Ⅱ';
    dialog.querySelector('.campus-pause').setAttribute('aria-pressed',String(motionOff()));
    dialog.querySelector('.campus-pause').disabled=reduce.matches||document.body.classList.contains('motion-off');
    clearTimeout(timer);
    transfers.forEach(t=>{if(motionOff()||document.hidden||!dialog.open)t.animation.pause();else t.animation.play();});
    if(dialog.open&&selected&&roomReady&&!motionOff()&&!document.hidden)timer=setTimeout(activity,500);
  }
  function activity(){
    if(!selected||!dialog.open||motionOff()||document.hidden)return;
    receipts.forEach((n,i)=>{if(n>0&&--receipts[i]===0)agents[i].querySelector('.agent-received').hidden=true;});
    const receivers=new Set([...transfers.values()].map(t=>t.to));
    jobs.forEach((job,i)=>{
      if(receivers.has(i))return;
      const a=agents[i],screen=screenEls[i];
      if(job.phase==='work'){
        job.progress=Math.min(100,job.progress+3+Math.random()*5);
        a.dataset.state='working';screen.dataset.state='working';
        a.querySelector('.agent-thought').textContent=`${selected.work[job.completed%3]} ${Math.floor(job.progress)}%`;
        if(job.progress===100){job.phase='review';job.remaining=4;a.dataset.state='review';a.querySelector('.agent-thought').textContent='REVIEWING';screen.dataset.state='review';}
      }else if(job.phase==='review'){
        if(--job.remaining<=0){job.phase='deliver';job.remaining=5;a.dataset.state='walking';a.style.left=sharingSpots[i][0]+'%';a.style.top=sharingSpots[i][1]+'%';a.querySelector('.agent-thought').textContent='共有の準備';screen.dataset.state='done';}
      }else if(job.phase==='deliver'){
        if(--job.remaining<=0){job.phase='waiting';a.dataset.state='review';a.querySelector('.agent-thought').textContent='資料を共有する準備完了';}
      }else if(job.phase==='waiting'){
        if(sendDocument(i)){job.phase='share';job.remaining=4;receivers.add(transfers.get(i).to);}
      }else if(job.phase==='share'){
        if(--job.remaining<=0){const t=transfers.get(i);if(t){t.animation.cancel();t.node.remove();agents[t.to].querySelector('.agent-received').hidden=false;receipts[t.to]=6;transfers.delete(i);}job.phase='return';job.remaining=5;job.completed++;a.dataset.state='walking';a.style.left=seats[i][0]+'%';a.style.top=seats[i][1]+'%';a.querySelector('.agent-thought').textContent='共有完了・次の作業へ';}
      }else if(job.phase==='return'){
        if(--job.remaining<=0){job.phase='work';job.progress=0;a.dataset.state='working';}
      }
      screen.style.setProperty('--progress',job.progress+'%');screen.querySelector('.screen-task').textContent=job.phase==='work'?'IN PROGRESS':job.phase==='review'?'REVIEW':'COMPLETE ✓';
    });
    const total=jobs.reduce((sum,j)=>sum+j.completed,0),working=jobs.filter(j=>j.phase==='work').length;
    dialog.querySelector('.room-activity').textContent=`DEMO / ${working} WORKING · ${total} TASKS COMPLETED`;
    timer=setTimeout(activity,500);
  }
  function enterOffice(button){
    clearTransfers();
    const approach=approachOffice(button);
    mapScroll=dialog.scrollTop;
    selected=offices.find(o=>o.id===button.dataset.office);lastBuilding=button;
    const layout=layouts[selected.id],token=++roomLoad;
    seats=layout.seats;sharingSpots=layout.spots;roomReady=false;roomStage.style.visibility='hidden';
    room.setAttribute('aria-busy','true');
    screenEls.forEach((el,i)=>{const [x,y,w,h,clip]=layout.screens[i];Object.assign(el.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%',clipPath:clip||'none'});});
    const photos=layout.photos||[`room-${selected.id}-day`,`room-${selected.id}-night`];
    Promise.all(photos.map(name=>{const img=new Image();img.src=assets+name+'.webp';return img.decode().then(()=>img.src);})).then(async urls=>{
      await approach;
      if(token!==roomLoad||!selected)return;
      roomStage.querySelectorAll('.room-photo').forEach((img,i)=>img.src=urls[i]);
      roomStage.style.visibility='visible';room.removeAttribute('aria-busy');roomReady=true;dialog.querySelector('.room-activity').textContent='4 AGENTS / デモ稼働中';revealOffice();syncMotion();
    }).catch(()=>{if(token===roomLoad){clearArrival();room.removeAttribute('aria-busy');dialog.querySelector('.room-activity').textContent='画像を読み込めませんでした。街に戻って再度お試しください。';}});
    dialog.style.setProperty('--office-color',selected.color);
    dialog.dataset.office=selected.id;
    map.style.transformOrigin=`${selected.x}% ${selected.y}%`;
    room.style.transformOrigin=`${selected.x}% ${selected.y}%`;
    room.hidden=false;map.inert=true;
    dialog.querySelector('.campus-intro').setAttribute('aria-hidden','true');
    dialog.querySelector('#room-title').textContent=selected.name;
    dialog.querySelector('.room-kicker').textContent=selected.en+' / INSIDE THE OFFICE';
    agents.forEach((a,i)=>{Object.assign(jobs[i],{phase:'work',progress:i*19,remaining:0,completed:0});a.style.left=seats[i][0]+'%';a.style.top=seats[i][1]+'%';a.dataset.state='working';a.querySelector('.agent-thought').textContent=selected.work[0];screenEls[i].style.setProperty('--progress',i*19+'%');screenEls[i].dataset.state='working';screenEls[i].querySelector('.screen-task').textContent='IN PROGRESS';});
    dialog.querySelector('.room-activity').textContent='LOADING OFFICE…';
    dialog.classList.add('inside-office');
    fitScenes();room.scrollLeft=Math.max(0,(roomStage.offsetWidth-dialog.clientWidth)/2);
    dialog.scrollTo({top:0,behavior:'instant'});
    dialog.querySelector('.room-back').focus({preventScroll:true});syncMotion();
  }
  function leaveOffice(){
    clearArrival();
    roomLoad++;roomReady=false;
    clearTransfers();
    selected=null;clearTimeout(timer);dialog.classList.remove('inside-office');room.hidden=true;map.inert=false;
    picker.querySelector('select').value='';
    dialog.querySelector('.campus-intro').removeAttribute('aria-hidden');dialog.scrollTo({top:mapScroll,behavior:'instant'});lastBuilding?.focus({preventScroll:true});
  }
  trigger.addEventListener('click',()=>{
    oldOverflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';
    trigger.setAttribute('aria-expanded','true');document.dispatchEvent(new Event('campus:open'));
    updateTime();fitScenes();landscape.scrollLeft=Math.max(0,(map.offsetWidth-dialog.clientWidth)/2);clockTimer=setInterval(updateTime,30000);syncMotion();dialog.querySelector('.campus-close').focus();
  });
  dialog.querySelector('.campus-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('cancel',e=>{if(selected){e.preventDefault();leaveOffice();}});
  dialog.addEventListener('close',()=>{if(selected)leaveOffice();clearTimeout(timer);clearInterval(clockTimer);document.body.style.overflow=oldOverflow;trigger.setAttribute('aria-expanded','false');document.dispatchEvent(new Event('campus:close'));trigger.focus({preventScroll:true});});
  dialog.querySelector('.room-back').addEventListener('click',leaveOffice);
  dialog.querySelectorAll('[data-office]').forEach(b=>b.addEventListener('click',()=>enterOffice(b)));
  dialog.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.time;dialog.querySelectorAll('[data-time]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));updateTime();}));
  dialog.querySelector('.campus-pause').addEventListener('click',()=>{paused=!paused;syncMotion();});
  worldPause.addEventListener('click',()=>{paused=!paused;syncMotion();});
  picker.querySelector('select').addEventListener('change',e=>{const button=dialog.querySelector(`[data-office="${e.target.value}"]`);if(button)enterOffice(button);});
  reduce.addEventListener('change',syncMotion);document.addEventListener('visibilitychange',syncMotion);
  new MutationObserver(syncMotion).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
