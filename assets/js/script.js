// Helpers
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Measure nav height for spacer/progress
const topNav = $('#topNav');
function setNavHeight(){
  const h = topNav?.offsetHeight || 68;
  document.documentElement.style.setProperty('--navH', h+'px');
}
window.addEventListener('load', setNavHeight);
addEventListener('resize', setNavHeight);

// Progress below nav
const progress = $('#progress');
const setProgress = ()=>{ const h=document.documentElement; const scrolled=h.scrollTop/(h.scrollHeight-h.clientHeight); progress.style.width=(scrolled*100).toFixed(2)+'%' };
document.addEventListener('scroll', setProgress, {passive:true}); setProgress();

// Reveal
const io=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target)} }) },{threshold:.18});
$$('.reveal').forEach(el=>io.observe(el));

// Theme
const root=document.documentElement, themeToggle=$('#themeToggle'), themeIcon=$('#themeIcon'), saved=localStorage.getItem('theme');
if(saved) root.setAttribute('data-theme', saved);
const setThemeIcon=()=>{ 
  const dark=root.getAttribute('data-theme')!=='light'; 
  if (themeIcon) {
    if (dark) {
      themeIcon.className = 'fas fa-moon';
    } else {
      themeIcon.className = 'fas fa-sun';
    }
  }
};
setThemeIcon();
themeToggle?.addEventListener('click',()=>{const light=root.getAttribute('data-theme')==='light';root.setAttribute('data-theme',light?'dark':'light');localStorage.setItem('theme',light?'dark':'light');setThemeIcon()});

// ===== Typing effect =====
const typingTarget = document.getElementById("typing");
const roles = ["VLSI Engineer"];

let idx = 0, char = 0, del = false;

function typeLoop() {
  if (!typingTarget) return;

  const word = roles[idx % roles.length];

  if (!del) {
    typingTarget.textContent = word.slice(0, ++char);
    if (char === word.length) {
      del = true;
      setTimeout(typeLoop, 1200); // pause before deleting
      return;
    }
  } else {
    typingTarget.textContent = word.slice(0, --char);
    if (char === 0) {
      del = false;
      idx++;
    }
  }
  setTimeout(typeLoop, del ? 50 : 90); // speed control
}
typeLoop();

// Mobile FAB quick menu + theme
const mobileFab=$('#mobileFab'), fabPanel=$('#fabPanel'), fabTheme=$('#fabTheme');
const toggleFab=(state)=>{const open=state ?? !fabPanel.classList.contains('open');fabPanel.classList.toggle('open',open);mobileFab.setAttribute('aria-expanded',open?'true':'false')};
mobileFab?.addEventListener('click',()=>toggleFab());
document.addEventListener('click',e=>{ if(!fabPanel.contains(e.target)&&e.target!==mobileFab&&!mobileFab.contains(e.target)){ fabPanel.classList.remove('open'); mobileFab.setAttribute('aria-expanded','false') } },{passive:true});
fabPanel?.addEventListener('click',e=>{ if(e.target.matches('a')) toggleFab(false) });
fabTheme?.addEventListener('click',()=>{const light=root.getAttribute('data-theme')==='light';root.setAttribute('data-theme',light?'dark':'light');localStorage.setItem('theme',light?'dark':'light');});

// Buttons ripple
document.addEventListener('click',e=>{
  const btn=e.target.closest('.btn'); if(!btn) return;
  const r=document.createElement('span'); r.className='ripple';
  const rect=btn.getBoundingClientRect(); r.style.left=(e.clientX-rect.left)+'px'; r.style.top=(e.clientY-rect.top)+'px';
  btn.appendChild(r); setTimeout(()=>r.remove(),900)
});

// Email copy to clipboard + toast
const toastEl=$('#toast');
function showToast(msg){ toastEl.textContent=msg; toastEl.classList.add('show'); clearTimeout(showToast._t); showToast._t=setTimeout(()=>toastEl.classList.remove('show'),2200) }
document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-copy]'); if(!el) return;
  e.preventDefault(); const text=el.getAttribute('data-copy')||el.textContent.trim();
  try{ await navigator.clipboard.writeText(text); showToast('Copied: '+text) }catch{ showToast('Copy failed') }
  if(el.tagName.toLowerCase()==='a' && el.href.startsWith('mailto:')) location.href=el.href;
});

// Back to top
const toTop=$('#toTop'); const onScrollTop=()=>{ toTop.classList.toggle('show', window.scrollY>700) };
document.addEventListener('scroll', onScrollTop, {passive:true}); onScrollTop();
toTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:prefersReduced?'auto':'smooth'}));

// Cursor + background parallax (desktop)
const cursor=$('#cursor'), bgVideo=$('#bgVideo');
let cx=innerWidth/2, cy=innerHeight/2, tx=cx, ty=cy;
const loop=()=>{ cx+=(tx-cx)*.14; cy+=(ty-cy)*.14; if(cursor) cursor.style.transform=`translate(${cx}px,${cy}px)`;
  if(bgVideo){ const dx=(cx-innerWidth/2)*.04, dy=(cy-innerHeight/2)*.04; bgVideo.style.transform=`translate(-50%,-50%) translate(${dx}px,${dy}px) scale(1.12)` }
  requestAnimationFrame(loop)
};
if(!prefersReduced && matchMedia('(pointer:fine)').matches){ requestAnimationFrame(loop); addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY},{passive:true}) }

// Parallax (hero only)
const parEls=$$('[data-parallax]'); let ticking=false;
const runParallax=()=>{ const vhMid=scrollY+innerHeight*.5; parEls.forEach(el=>{ const speed=parseFloat(el.dataset.parallax||'0.03'); const rect=el.getBoundingClientRect(); const elMid=scrollY+rect.top+rect.height*.5; const delta=(elMid-vhMid)*speed; const dy=Math.max(-24,Math.min(24,-delta)); el.style.transform=`translate3d(0,${dy.toFixed(1)}px,0)` }); ticking=false };
const onScrollPar=()=>{ if(!ticking){ ticking=true; requestAnimationFrame(runParallax) } };
if(!prefersReduced && parEls.length){ document.addEventListener('scroll',onScrollPar,{passive:true}); addEventListener('resize',runParallax); runParallax() }

// Tilt effect for cards (lightweight)
const tilts=$$('.card.tilt');
if(matchMedia('(pointer:fine)').matches){
  tilts.forEach(card=>{
    let raf=0; const onMove=e=>{
      const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width; const y=(e.clientY-r.top)/r.height;
      if(!raf) raf=requestAnimationFrame(()=>{ const rx=(.5-y)*8, ry=(x-.5)*10; card.style.transform=`rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`; raf=0 })
    };
    const reset=()=>card.style.transform='';
    card.addEventListener('mousemove',onMove); card.addEventListener('mouseleave',reset)
  });
}

// Nav scroll spy + indicator
const navLinks=$$('#navlinks a'), navIndicator=$('#navIndicator'), sections=$$('#home,#profile,#experience,#skills,#projects,#education,#contact');
function updateActive(){
  const y=scrollY+parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navH'))+60;
  let current=sections[0].id;
  sections.forEach(s=>{ const top=s.getBoundingClientRect().top+scrollY; if(y>=top) current=s.id });
  navLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+current));
  const active=$$('#navlinks a.active')[0]; if(active){ const r=active.getBoundingClientRect(), c=$('#navlinks').getBoundingClientRect(); navIndicator.style.width=r.width+'px'; navIndicator.style.transform=`translateX(${r.left-c.left}px)` }
}
document.addEventListener('scroll',updateActive,{passive:true}); addEventListener('resize',()=>{ setNavHeight(); updateActive(); }); updateActive();

// Hover highlight that follows cursor (for pop)
const popEls = $$('.panel, .card, .tl-card, .contact-item');
if(matchMedia('(pointer:fine)').matches){
  popEls.forEach(el=>{
    let raf=0;
    const move=e=>{
      const r=el.getBoundingClientRect(); const x=((e.clientX-r.left)/r.width*100).toFixed(2)+'%'; const y=((e.clientY-r.top)/r.height*100).toFixed(2)+'%';
      if(!raf) raf=requestAnimationFrame(()=>{ el.style.setProperty('--hx',x); el.style.setProperty('--hy',y); raf=0 })
    };
    el.addEventListener('mousemove',move);
    el.addEventListener('mouseleave',()=>{ el.style.removeProperty('--hx'); el.style.removeProperty('--hy') });
  });
}

// Background video ready + reduced motion
bgVideo?.addEventListener('loadeddata',()=>bgVideo.classList.add('ready'));
if(prefersReduced){ try{bgVideo.pause()}catch{} bgVideo?.removeAttribute('autoplay') }

// Footer year
$('#year').textContent=new Date().getFullYear();