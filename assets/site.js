(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  let manualOff = false;
  let motionOff = reduced.matches;
  // HPデザイン / smooth-scroll-base: source defaults, lerp 0.125 (time normalized internally).
  const lenis = typeof Lenis !== 'undefined' && document.querySelector('.hero,.agency-hero') ? new Lenis({lerp:0.125,smoothWheel:true,syncTouch:false,respectReducedMotion:true,anchors:true}) : null;
  let campusOpen = false;
  document.addEventListener('campus:open',()=>{campusOpen=true;lenis?.stop();});
  document.addEventListener('campus:close',()=>{campusOpen=false;lenis?.start();});
  const toggle = document.querySelector('.motion-toggle');
  const pullEl = document.querySelector('[data-pull]');
  const hero = document.querySelector('.hero,.agency-hero');
  const stage = document.querySelector('.hero-stage,.agency-stage');
  const layers = [...document.querySelectorAll('[data-parallax]')];
  const marquees = [...document.querySelectorAll('[data-marquee]')];
  const pull = {x:0,vx:0,sx:0,down:false,id:null,hist:[],clientX:0,clientY:0,axis:null};
  // drag-inertia-pull: library starting values, not Joe-approved tuning for this page.
  const params = {limit:140,resist:0.8,response:460,zeta:0.62,velTransfer:0.8};
  const rubber = raw => Math.sign(raw)*params.limit*(1-1/(Math.abs(raw)*params.resist/params.limit+1));
  const rubberInv = x => {const d=Math.min(Math.abs(x),params.limit*.999);return Math.sign(x)*(params.limit/params.resist)*(d/(params.limit-d));};
  function finishPull(e) {
    if(e && e.pointerId!==pull.id)return;
    if(!pull.down)return;
    pull.down=false;
    if(pullEl.hasPointerCapture(pull.id))pullEl.releasePointerCapture(pull.id);
    const hist=pull.hist;
    if(e?.type!=='pointercancel' && hist.length>1){
      const first=hist[0],last=hist.at(-1),dt=(last.t-first.t)/1000;
      pull.vx=dt>.001 && performance.now()-last.t<100 ? (last.x-first.x)/dt*params.velTransfer : 0;
    } else pull.vx=0;
    pullEl.classList.remove('dragging');
    pull.id=null;
  }
  if(pullEl){
    pullEl.addEventListener('pointerdown',e=>{
      if(motionOff || e.button!==0 || pull.down)return;
      pull.down=true;pull.id=e.pointerId;pull.vx=0;
      pull.sx=e.clientX-rubberInv(pull.x);pull.clientX=e.clientX;pull.clientY=e.clientY;
      pull.axis=null;pull.hist=[{x:pull.x,t:performance.now()}];
      pullEl.setPointerCapture(e.pointerId);pullEl.classList.add('dragging');
    });
    pullEl.addEventListener('pointermove',e=>{
      if(!pull.down || e.pointerId!==pull.id)return;
      const dx=e.clientX-pull.clientX,dy=e.clientY-pull.clientY;
      if(!pull.axis && Math.max(Math.abs(dx),Math.abs(dy))>7)pull.axis=Math.abs(dx)>Math.abs(dy)?'x':'y';
      if(pull.axis==='y' && e.pointerType==='touch'){finishPull(e);return;}
      pull.x=rubber(e.clientX-pull.sx);
      pull.hist.push({x:pull.x,t:performance.now()});
      pull.hist=pull.hist.filter(v=>performance.now()-v.t<100).slice(-8);
    });
    pullEl.addEventListener('pointerup',finishPull);
    pullEl.addEventListener('pointercancel',finishPull);
    pullEl.addEventListener('lostpointercapture',finishPull);
    pullEl.addEventListener('dragstart',e=>e.preventDefault());
  }
  const updateMotion = () => {
    motionOff=manualOff || reduced.matches;
    document.body.classList.toggle('motion-off',motionOff);
    toggle.setAttribute('aria-pressed',String(motionOff));
    toggle.setAttribute('aria-label',motionOff?'動きを有効にする':'動きを停止する');
    toggle.querySelector('span').textContent=motionOff?'OFF':'ON';
    toggle.disabled=reduced.matches;
    if(reduced.matches)toggle.setAttribute('aria-label','端末の設定により動きを停止中');
    if(lenis)lenis.options.smoothWheel=!motionOff;
    if(motionOff){finishPull();pull.x=pull.vx=0;layers.forEach(l=>l.style.transform='');marquees.forEach(l=>l.style.transform='');if(pullEl)pullEl.style.transform='';if(stage)stage.style.setProperty('--photo-shift','0px');}
  };
  toggle.addEventListener('click',()=>{manualOff=!manualOff;updateMotion();});
  reduced.addEventListener('change',updateMotion);updateMotion();
  let previous=0;
  function frame(now){
    const dt=Math.min(now-previous || 16.67,33);previous=now;
    if(!document.hidden){
      if(lenis)lenis.raf(now);
      if(!motionOff && !campusOpen){
        if(pullEl){
          if(!pull.down && (Math.abs(pull.x)>.015 || Math.abs(pull.vx)>.015)){
            // Substeps keep the return spring stable after slow frames.
            const steps=Math.ceil(dt/8),s=dt/steps/1000,w=2*Math.PI/(params.response/1000);
            for(let i=0;i<steps;i++){pull.vx+=(-2*params.zeta*w*pull.vx-w*w*pull.x)*s;pull.x+=pull.vx*s;}
          } else if(!pull.down) pull.x=pull.vx=0;
          pullEl.style.transform=`translate3d(${pull.x.toFixed(2)}px,0,0) rotate(${(pull.x*.08).toFixed(2)}deg)`;
        }
        if(hero){
          const box=hero.getBoundingClientRect();
          if(scrollY<hero.offsetHeight+innerHeight){
            const scroll=Math.max(0,scrollY),amp=coarse.matches?90:180;
            const p=Math.min(scroll/box.height,1);
            layers.forEach(l=>l.style.transform=`translate3d(0,${(p*amp*Number(l.dataset.parallax)).toFixed(2)}px,0) rotate(${(p*14).toFixed(2)}deg)`);
            if(stage)stage.style.setProperty('--photo-shift',`${(p*amp*.5).toFixed(2)}px`);
          }
        }
        marquees.forEach(el=>{const rect=el.parentElement.getBoundingClientRect();if(rect.top<innerHeight && rect.bottom>0)el.style.transform=`translate3d(${-Math.max(0,innerHeight-rect.top)*.16}px,0,0)`;});
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  const clock=document.querySelector('[data-tokyo-time]');
  if(clock){const tick=()=>{clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit'}).format(new Date())+' JST';};tick();setInterval(tick,60000);}
  const menu=document.querySelector('#menu'),opener=document.querySelector('.menu-toggle');
  const closeMenu=()=>{menu.close();};
  opener.addEventListener('click',()=>{menu.showModal();opener.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';lenis?.stop();});
  menu.querySelector('.menu-close').addEventListener('click',closeMenu);
  menu.addEventListener('close',()=>{opener.setAttribute('aria-expanded','false');document.body.style.overflow='';lenis?.start();opener.focus();});
  const cards=[...document.querySelectorAll('.talent-directory .talent-card')];
  if(cards.length){
    let filter='ALL';const input=document.querySelector('#talent-search');
    const applyFilter=()=>{let count=0;const query=input.value.trim().normalize('NFKC').toLowerCase();cards.forEach(c=>{const show=(filter==='ALL' || c.dataset.category.split('|').includes(filter))&&c.dataset.name.normalize('NFKC').toLowerCase().includes(query);c.hidden=!show;if(show)count++;});document.querySelector('.result-count').textContent=`${count} TALENT${count===1?'':'S'}`;document.querySelector('.no-results').hidden=count!==0;};
    document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));applyFilter();}));
    input.addEventListener('input',applyFilter);
  }
  const form=document.querySelector('#contact-form');
  if(form){
    const hint=new URLSearchParams(location.search).get('talent');
    if(hint)form.elements.message.value=hint.slice(0,5000);
    const review=document.querySelector('#form-review');
    form.addEventListener('submit',e=>{
      e.preventDefault();if(!form.reportValidity())return;
      const labels={name:'お名前',email:'メールアドレス',company:'会社名',subject:'ご相談の種類',message:'お問い合わせ内容'};
      const list=review.querySelector('dl');list.replaceChildren();
      Object.entries(labels).forEach(([key,label])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=form.elements[key].value || '未入力';list.append(dt,dd);});
      review.hidden=false;review.focus();review.scrollIntoView({behavior:motionOff?'instant':'smooth',block:'center'});
    });
    review.querySelector('.edit-form').addEventListener('click',()=>{review.hidden=true;form.elements.name.focus();});
    form.addEventListener('input',()=>{review.hidden=true;});
  }
})();
