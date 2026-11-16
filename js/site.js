/* ============ THE KAIZEN AGENCY — SITE JS ============ */
(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

/* Settings come from src/site.config.json (injected by build.mjs as window.KAIZEN). */
var CFG=window.KAIZEN||{};
var FORMSPREE_ENDPOINT=CFG.formspree||'';

/* ---------- OLD #HASH LINKS → REAL PAGES ---------- */
(function(){
  var h=(location.hash||'').replace('#','');
  if(document.documentElement.getAttribute('data-page')==='home'&&/^(about|services|portfolio|blog|contact)$/.test(h)){
    location.replace(h+'/');
  }
})();

/* ---------- CONVERSION TRACKING (GA4 + Meta Pixel + Clarity, whichever are installed) ---------- */
function track(name,params,fbEvent){
  params=params||{};
  try{if(window.gtag)window.gtag('event',name,params);}catch(e){}
  try{if(window.fbq&&fbEvent)window.fbq('track',fbEvent,params);}catch(e){}
  try{if(window.clarity)window.clarity('event',name);}catch(e){}
}
document.addEventListener('click',function(e){
  var a=e.target.closest('a');if(!a)return;
  var href=a.getAttribute('href')||'';
  var where={link_location:a.closest('footer')?'footer':a.closest('.floaties')?'floating_button':a.closest('header,.drawer')?'header':'page'};
  if(href.indexOf('wa.me/')>-1||href.indexOf('api.whatsapp.com')>-1)track('contact_whatsapp',where,'Contact');
  else if(href.indexOf('tel:')===0)track('contact_phone',where,'Contact');
  else if(href.indexOf('mailto:')===0)track('contact_email',where,'Contact');
});

/* ---------- BOOKING (Google Calendar or Calendly popup, other links in a new tab, or fall back to the contact page) ---------- */
var bm=document.getElementById('bookingModal');
function isGoogleBooking(u){return /^https:\/\/(calendar\.google\.com\/calendar\/appointments\/|calendar\.app\.google\/)/.test(u||'');}
function googleEmbedUrl(u){
  if(!/calendar\.google\.com\/calendar\/appointments\//.test(u))return u; /* short links can't take the embed flag */
  return u+(u.indexOf('?')>-1?'&':'?')+'gv=true';
}
function openGoogleBooking(){
  if(!bm){window.open(CFG.booking,'_blank','noopener');return;}
  var fr=document.getElementById('bookingFrame');
  if(!fr.getAttribute('src')){ /* load only on first open */
    fr.addEventListener('load',function(){var l=bm.querySelector('.booking-loading');if(l)l.style.display='none';},{once:true});
    fr.setAttribute('src',googleEmbedUrl(CFG.booking));
  }
  document.getElementById('bookingFallback').setAttribute('href',CFG.booking);
  bm.classList.add('open');document.body.style.overflow='hidden';
  var c=document.getElementById('bookingClose');if(c)c.focus();
}
function closeBooking(){if(bm&&bm.classList.contains('open')){bm.classList.remove('open');document.body.style.overflow='';}}
if(bm){
  document.getElementById('bookingClose').addEventListener('click',closeBooking);
  bm.addEventListener('click',function(e){if(e.target===bm)closeBooking();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeBooking();});
  document.getElementById('bookingFallback').addEventListener('click',function(){track('booking_new_tab',{});});
}
var calendlyLoading=false;
function openCalendly(){
  if(window.Calendly){window.Calendly.initPopupWidget({url:CFG.booking});return;}
  if(calendlyLoading)return;calendlyLoading=true;
  var css=document.createElement('link');css.rel='stylesheet';css.href='https://assets.calendly.com/assets/external/widget.css';document.head.appendChild(css);
  var s=document.createElement('script');s.src='https://assets.calendly.com/assets/external/widget.js';s.async=true;
  s.onload=function(){calendlyLoading=false;window.Calendly.initPopupWidget({url:CFG.booking});};
  s.onerror=function(){calendlyLoading=false;window.open(CFG.booking,'_blank','noopener');};
  document.head.appendChild(s);
}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-book]');if(!b)return;
  track('book_call_click',{link_location:b.closest('header,.drawer')?'header':'page'});
  if(!CFG.booking)return; /* no booking link configured: normal link to the contact page */
  e.preventDefault();
  if(isGoogleBooking(CFG.booking))openGoogleBooking();
  else if(/calendly\.com\//.test(CFG.booking))openCalendly();
  else window.open(CFG.booking,'_blank','noopener');
});
window.addEventListener('message',function(e){
  if(e.origin==='https://calendly.com'&&e.data&&e.data.event==='calendly.event_scheduled'){
    track('schedule_call',{method:'calendly'},'Schedule');
  }
});

/* ---------- THEME ---------- */
var root=document.documentElement;
try{var saved=localStorage.getItem('dk-theme');if(saved)root.setAttribute('data-theme',saved);}catch(e){}
function toggleTheme(){var d=root.getAttribute('data-theme')==='dark';root.setAttribute('data-theme',d?'light':'dark');try{localStorage.setItem('dk-theme',d?'light':'dark');}catch(e){}}
$$('.theme-toggle').forEach(function(b){b.addEventListener('click',toggleTheme)});

/* ---------- HEADER SCROLL ---------- */
var header=$('header');
function onScroll(){if(header)header.classList.toggle('scrolled',window.scrollY>20);}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- MOBILE DRAWER ---------- */
var drawer=$('#drawer'),burger=$('#burger');
function setDrawer(o){if(!drawer)return;drawer.classList.toggle('open',o);if(burger)burger.classList.toggle('open',o);document.body.style.overflow=o?'hidden':'';}
if(burger)burger.addEventListener('click',function(){setDrawer(!drawer.classList.contains('open'))});
var dc=$('#drawerClose');if(dc)dc.addEventListener('click',function(){setDrawer(false)});

/* ---------- PAGES ---------- */
/* Each page is now its own HTML file (built by build.mjs), so links are normal links. */
function startPage(){runReveal();runCounters();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startPage);else startPage();

/* ---------- REVEAL ---------- */
var io;
function runReveal(){
  var els=$$('.reveal:not(.in)');
  if(!('IntersectionObserver'in window)){els.forEach(function(el){el.classList.add('in')});return;}
  if(!io)io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el){io.observe(el)});
}

/* ---------- COUNTERS ---------- */
function fmt(n,dec){return dec?n.toFixed(dec):Math.round(n).toLocaleString('en-IN');}
function animateCount(el){
  if(el.dataset.done)return;el.dataset.done='1';
  var target=parseFloat(el.dataset.target),dec=parseInt(el.dataset.dec||'0',10),pre=el.dataset.pre||'',suf=el.dataset.suf||'',dur=1500,t0=null;
  function step(t){if(!t0)t0=t;var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3);el.firstChild.nodeValue=pre+fmt(target*e,dec)+suf;if(p<1)requestAnimationFrame(step);else el.firstChild.nodeValue=pre+fmt(target,dec)+suf;}
  if(!el.firstChild)el.appendChild(document.createTextNode(''));
  requestAnimationFrame(step);
}
var cio;
function runCounters(){
  var els=$$('.count:not([data-done])');
  if(!('IntersectionObserver'in window)){els.forEach(animateCount);return;}
  if(!cio)cio=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){animateCount(x.target);cio.unobserve(x.target);}})},{threshold:.4});
  els.forEach(function(el){cio.observe(el)});
}

/* ---------- FAQ ---------- */
$$('.faq-q').forEach(function(q){q.addEventListener('click',function(){
  var it=q.closest('.faq-item'),a=$('.faq-a',it),open=it.classList.contains('open');
  $$('.faq-item',q.closest('.faq')).forEach(function(o){o.classList.remove('open');$('.faq-a',o).style.maxHeight=null;});
  if(!open){it.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
});});

/* ---------- PORTFOLIO FILTER ---------- */
$$('.filter-bar').forEach(function(bar){
  bar.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    $$('button',bar).forEach(function(x){x.classList.remove('active')});b.classList.add('active');
    var f=b.dataset.filter;
    $$('.port',bar.parentNode).forEach(function(p){
      var show=f==='all'||p.dataset.cat===f;p.style.display=show?'':'none';
    });
  });
});

/* ---------- ROI CALCULATOR ---------- */
var improve={realestate:.34,ecommerce:.38,education:.32,healthcare:.30,saas:.42,local:.36,hospitality:.33,finance:.31};
function rupee(n){return '₹'+Math.round(n).toLocaleString('en-IN');}
function calc(){
  var budgetEl=$('#c-budget'),cplEl=$('#c-cpl'),indEl=$('#c-industry');if(!budgetEl)return;
  var budget=+budgetEl.value,cpl=+cplEl.value,imp=improve[indEl.value]||.34;
  $('#c-budget-v').textContent=rupee(budget);
  $('#c-cpl-v').textContent=rupee(cpl);
  var curLeads=budget/cpl,newCpl=cpl*(1-imp),newLeads=budget/newCpl,extra=newLeads-curLeads,annual=budget*imp*12;
  $('#r-leads').textContent=Math.round(newLeads).toLocaleString('en-IN');
  $('#r-cur').textContent=Math.round(curLeads).toLocaleString('en-IN');
  $('#r-cpl').textContent=rupee(newCpl);
  $('#r-extra').textContent='+'+Math.round(extra).toLocaleString('en-IN');
  $('#r-red').textContent=Math.round(imp*100)+'%';
  $('#r-save').textContent=rupee(annual);
}
$$('#c-budget,#c-cpl,#c-industry').forEach(function(el){el&&el.addEventListener('input',calc)});
calc();

/* ---------- HERO CHAT SIMULATION ---------- */
var heroSeq=[
  {t:'bot',d:'Cost-per-lead too high? Let\u2019s fix that.'},
  {t:'user',d:'Yeah \u2014 ₹840 per lead on Meta and climbing.'},
  {t:'typing'},
  {t:'bot',d:'Found it. Broad targeting + 1 creative. Let\u2019s run a Kaizen test loop.'},
  {t:'metric'},
  {t:'bot',d:'3 weeks later: CPL down, leads up. Same budget.'}
];
function playHeroChat(){
  var box=$('#heroChat');if(!box)return;box.innerHTML='';
  var i=0;
  function next(){
    if(i>=heroSeq.length){setTimeout(function(){i=0;box.innerHTML='';next();},4200);return;}
    var s=heroSeq[i++];
    if(s.t==='typing'){
      var ty=document.createElement('div');ty.className='typing';ty.innerHTML='<span></span><span></span><span></span>';box.appendChild(ty);box.scrollTop=box.scrollHeight;
      setTimeout(function(){box.removeChild(ty);next();},1100);return;
    }
    var el=document.createElement('div');
    if(s.t==='metric'){el.className='bubble metric';el.innerHTML='<div class="mi"><div class="v down">₹512</div><div class="k">Cost / lead</div></div><div class="mi"><div class="v up">+63%</div><div class="k">More leads</div></div><div class="mi"><div class="v up">4.8x</div><div class="k">ROAS</div></div>';}
    else{el.className='bubble '+s.t;el.textContent=s.d;}
    box.appendChild(el);box.scrollTop=box.scrollHeight;
    setTimeout(next,s.t==='metric'?1600:1300);
  }
  next();
}
window.addEventListener('load',playHeroChat);

/* ---------- AI CHAT WIDGET ---------- */
var cw=$('#chatWidget');
function cwToggle(o){if(cw)cw.classList.toggle('open',o)}
var cwBtn=$('#aiFloat');if(cwBtn)cwBtn.addEventListener('click',function(){cwToggle(!cw.classList.contains('open'))});
var cwClose=$('#cwClose');if(cwClose)cwClose.addEventListener('click',function(){cwToggle(false)});
$$('.cw-quick button').forEach(function(b){b.addEventListener('click',function(){
  var body=$('#cwBody');
  var u=document.createElement('div');u.className='bubble user';u.textContent=b.textContent;body.appendChild(u);
  var ty=document.createElement('div');ty.className='typing';ty.innerHTML='<span></span><span></span><span></span>';body.appendChild(ty);body.scrollTop=body.scrollHeight;
  setTimeout(function(){
    body.removeChild(ty);
    var r=document.createElement('div');r.className='bubble bot';
    r.textContent='Great question. The fastest path is a free 20-minute strategy call \u2014 shall I book you in?';
    body.appendChild(r);body.scrollTop=body.scrollHeight;
  },1200);
});});

/* ---------- EXIT INTENT ---------- */
var modal=$('#exitModal'),shown=false;
function showModal(){if(shown||!modal)return;try{if(sessionStorage.getItem('dk-exit'))return;}catch(e){}shown=true;modal.classList.add('open');try{sessionStorage.setItem('dk-exit','1');}catch(e){}}
function hideModal(){if(modal)modal.classList.remove('open')}
document.addEventListener('mouseout',function(e){if(!e.relatedTarget&&e.clientY<=0)showModal();});
setTimeout(function(){if(!shown)/*idle fallback disabled*/0;},1);
var mc=$('#modalClose'),mo=$('#modalOverlayBg');
if(mc)mc.addEventListener('click',hideModal);
if(modal)modal.addEventListener('click',function(e){if(e.target===modal)hideModal();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){hideModal();cwToggle(false);setDrawer(false);}});

/* ---------- FORMS ---------- */
$$('form[data-ok]').forEach(function(f){
  var okId=f.getAttribute('data-ok');
  var ok=$('#'+okId);
  var err=$('#'+okId.replace(/Ok$/,'Err'));
  var btn=f.querySelector('button[type="submit"]');
  var btnHtml=btn?btn.innerHTML:'';

  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(err)err.classList.remove('show');

    /* honeypot: bots fill every field, humans never see this one */
    var hp=f.querySelector('[name="_gotcha"]');
    if(hp&&hp.value){
      if(ok)ok.classList.add('show');
      f.reset();
      if(f.closest('.modal'))setTimeout(hideModal,1400);
      return;
    }

    if(!FORMSPREE_ENDPOINT||FORMSPREE_ENDPOINT.indexOf('YOUR_FORM_ID')>-1){
      console.warn('[forms] FORMSPREE_ENDPOINT is not configured in js/site.js — submission not sent.');
      if(ok)ok.classList.add('show');
      f.reset();
      if(f.closest('.modal'))setTimeout(hideModal,1400);
      return;
    }

    var data=new FormData(f);
    data.set('_subject','New lead — '+(f.getAttribute('data-source')||'The Kaizen Agency website'));

    if(btn){btn.disabled=true;btn.innerHTML='Sending…';}
    fetch(FORMSPREE_ENDPOINT,{method:'POST',body:data,headers:{'Accept':'application/json'}})
      .then(function(res){
        if(!res.ok)throw new Error('Request failed');
        var src=f.getAttribute('data-source')||'website';
        if(/newsletter/i.test(src))track('sign_up',{method:'newsletter'},'Subscribe');
        else track('generate_lead',{form_name:src},'Lead');
        if(ok)ok.classList.add('show');
        f.reset();
        if(f.closest('.modal'))setTimeout(hideModal,1400);
      })
      .catch(function(){
        if(err)err.classList.add('show');
      })
      .finally(function(){
        if(btn){btn.disabled=false;btn.innerHTML=btnHtml;}
      });
  });
});

/* ---------- YEAR ---------- */
$$('.yr').forEach(function(y){y.textContent=new Date().getFullYear()});
})();
