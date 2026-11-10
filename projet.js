import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cfg=window.CREATIX_SUPABASE;
const sb=cfg?.url&&cfg?.publishableKey?createClient(cfg.url,cfg.publishableKey):null;
const root=document.querySelector('#project-root'),lb=document.querySelector('#lightbox'),lbImg=lb.querySelector('img');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IC={store:'<path d="M6 3.5v17l14-8.5z"/>',code:'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'};
const icon=l=>/play|store|apk|télécharg/i.test(l)?IC.store:/github|code|source/i.test(l)?IC.code:IC.globe;
const STEPS=['Idée','En développement','Bientôt fini','Terminé'];
const statusClass=s=>{s=String(s||'').toLowerCase();return s.includes('bientôt')?'status-soon':s.includes('termin')?'status-done':s.includes('pause')?'status-paused':'status-progress';};
const fail=msg=>{root.innerHTML=`<div class="p-card" style="margin-top:40px"><h2>${msg}</h2><p><a class="p-link" href="index.html#projets">Retour aux projets</a></p></div>`;};

async function init(){
  const id=root.dataset.projectId || new URLSearchParams(location.search).get('id');
  if(!sb||!id)return fail('Projet introuvable');
  const{data,error}=await sb.from('projects').select('*').eq('visible',true).order('sort_order',{ascending:true});
  if(error||!data?.length)return fail('Projet introuvable');
  const i=data.findIndex(p=>p.id===id);
  if(i<0)return fail('Projet introuvable');
  render(data[i],data[i-1],data[i+1]);
}

function render(p,prev,next){
  document.title=`${p.name} — Creatix Studio`;
  const shots=Array.isArray(p.screenshots)&&p.screenshots.length?p.screenshots:(p.image?[p.image]:[]);
  const links=(Array.isArray(p.links)?p.links:[]).filter(l=>{try{return/^https?:$/.test(new URL(l.url).protocol);}catch{return false;}});
  const step=p.status==='En pause'?1:Math.max(1,STEPS.indexOf(p.status));
  const pager=(q,label)=>q?`<a href="projet.html?id=${encodeURIComponent(q.id)}"><small>${label}</small><strong>${esc(q.name)}</strong></a>`:'<span></span>';
  root.innerHTML=`
  <section class="p-hero">
    <div class="p-logo" data-tilt>${p.logo?`<img src="${esc(p.logo)}" alt="Logo ${esc(p.name)}">`:`<span>${esc((p.name||'?')[0])}</span>`}</div>
    <div class="p-intro">
      <span class="project-type">${esc(p.type)}</span>
      <h1>${esc(p.name)}</h1>
      <span class="project-status ${statusClass(p.status)}">${esc(p.status)}</span>
      <p class="p-desc">${esc(p.description)}</p>
      ${links.length?`<div class="p-links">${links.map(l=>`<a class="p-link" href="${esc(new URL(l.url).href)}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true">${icon(l.label||'')}</svg>${esc(l.label||'Voir le projet')}</a>`).join('')}</div>`:''}
    </div>
  </section>
  ${shots.length?`<section class="p-showcase" aria-label="Captures d'écran">
    <div class="cf-stage"><div class="cf-track">${shots.map((u,k)=>`<figure class="cf-item"><img src="${esc(u)}" alt="Capture ${k+1} de ${esc(p.name)}" draggable="false"></figure>`).join('')}</div></div>
    ${shots.length>1?`<div class="cf-controls"><button class="cf-btn" data-dir="-1" aria-label="Précédente">‹</button><div class="cf-dots">${shots.map((_,k)=>`<button class="cf-dot" data-go="${k}" aria-label="Capture ${k+1}"></button>`).join('')}</div><button class="cf-btn" data-dir="1" aria-label="Suivante">›</button></div>`:''}
  </section>`:''}
  <section class="p-info">
    <div class="p-card"><h2>À propos</h2><p>${esc(p.details||p.description)}</p></div>
    <div class="p-card"><h2>Avancement</h2><ol class="steps">${STEPS.map((s,k)=>`<li class="${k<step?'done':k===step?'now':''}">${s}${k===step&&p.status==='En pause'?' (en pause)':''}</li>`).join('')}</ol></div>
  </section>
  <nav class="p-pager" aria-label="Autres projets">${pager(prev,'Projet précédent')}${pager(next,'Projet suivant')}</nav>`;
  if(shots.length)coverflow(shots);
}

function coverflow(shots){
  const stage=root.querySelector('.cf-stage'),track=stage.querySelector('.cf-track');
  const items=[...stage.querySelectorAll('.cf-item')],dots=[...root.querySelectorAll('.cf-dot')];
  let cur=0,sx=null,moved=false;
  const layout=()=>{
    const w=stage.clientWidth,gap=Math.min(260,w*(w<640?.36:.3)),rot=w<640?30:40;
    items.forEach((el,i)=>{const d=i-cur,a=Math.abs(d);
      el.style.transform=`translateX(calc(-50% + ${d*gap}px)) translateZ(${-a*150}px) rotateY(${-Math.sign(d)*Math.min(a,1)*rot}deg) scale(${a?.88:1})`;
      el.style.opacity=a>2?0:1-a*.3;el.style.zIndex=10-a;el.style.pointerEvents=a>2?'none':'auto';});
    dots.forEach((x,i)=>x.classList.toggle('on',i===cur));
  };
  const go=n=>{cur=Math.max(0,Math.min(items.length-1,n));layout();};
  layout();addEventListener('resize',layout);
  root.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>go(cur+Number(b.dataset.dir))));
  dots.forEach(d=>d.addEventListener('click',()=>go(Number(d.dataset.go))));
  items.forEach((el,i)=>el.addEventListener('click',()=>{if(moved){moved=false;return;}i===cur?openLightbox(shots[i]):go(i);}));
  stage.addEventListener('pointerdown',e=>{sx=e.clientX;});
  addEventListener('pointerup',e=>{if(sx==null)return;const dx=e.clientX-sx;sx=null;moved=Math.abs(dx)>40;if(moved)go(cur+(dx<0?1:-1));});
  addEventListener('keydown',e=>{if(lb.classList.contains('open'))return;if(e.key==='ArrowRight')go(cur+1);if(e.key==='ArrowLeft')go(cur-1);});
}
function openLightbox(url){lbImg.src=url;lb.classList.add('open');lb.setAttribute('aria-hidden','false');}
function closeLightbox(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');}
lb.addEventListener('click',closeLightbox);
addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox();});
init();
