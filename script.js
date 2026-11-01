const menuButton=document.querySelector('.menu-toggle'),navigation=document.querySelector('.main-nav');
menuButton?.addEventListener('click',()=>{const open=navigation.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');});
navigation?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{navigation.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');}));
const year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();
const STORAGE_KEY='creatix_portfolio_projects_v1';
const DEFAULT_PROJECTS=[
{id:'timood',name:'Timood',type:'APPLICATION MOBILE',description:"Une expérience mobile centrée sur le suivi et l'expression de l'humeur.",details:"Timood explore une façon simple et visuelle de suivre son humeur au fil du temps. Le projet met l'accent sur une interface accessible, des interactions intuitives et une expérience mobile agréable.",status:'Bientôt fini',visible:true,image:'assets/projects/timood.png'},
{id:'spingo',name:'SpinGO',type:'APPLICATION MOBILE',description:'Une roue interactive pensée autour du jeu et du partage.',details:'SpinGO transforme une roue de tirage en une expérience ludique et personnalisable. Le projet rassemble des mécaniques de jeu, des récompenses et des options de partage.',status:'Bientôt fini',visible:true,image:'assets/projects/spingo.png'},
{id:'homespace',name:'HomeSpace',type:'PLATEFORME FAMILIALE',description:'Un espace numérique pour organiser et partager la vie de famille.',details:'HomeSpace imagine un espace commun pour centraliser les échanges, les tâches, les albums et les informations utiles à la vie familiale.',status:'En développement',visible:true,image:'assets/projects/homespace.png'},
{id:'waterly',name:'Waterly',type:'APPLICATION MOBILE',description:"Un compagnon de suivi d'hydratation au quotidien.",details:"Waterly accompagne le suivi de l'hydratation avec des objectifs, des statistiques et une interface visuelle pensée pour encourager une routine régulière.",status:'En développement',visible:true,image:'assets/projects/waterly.png'}];
function readProjects(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(Array.isArray(saved))return saved;}catch(e){}return DEFAULT_PROJECTS;}
function paintStatus(element,status){
 element.classList.remove('status-progress','status-soon','status-done','status-paused');
 const key=String(status||'').toLowerCase();
 if(key.includes('bientôt')) element.classList.add('status-soon');
 else if(key.includes('termin')) element.classList.add('status-done');
 else if(key.includes('pause')) element.classList.add('status-paused');
 else element.classList.add('status-progress');
}
function syncPortfolio(){
 const projects=readProjects(),grid=document.querySelector('.projects-grid');if(!grid)return;
 document.querySelectorAll('[data-project-id]').forEach(card=>{
  const item=projects.find(p=>p.id===card.dataset.projectId);if(!item){card.hidden=true;return;}
  card.hidden=!item.visible;card.dataset.projectDetails=item.details||'';
  const title=card.querySelector('h3'),type=card.querySelector('.project-type'),desc=card.querySelector('.project-info p'),status=card.querySelector('[data-status]'),img=card.querySelector('.project-screenshot');
  if(title)title.textContent=item.name;if(type)type.textContent=item.type;if(desc)desc.textContent=item.description;if(status){status.textContent=item.status;paintStatus(status,item.status);}
  if(img&&item.image){img.src=item.image;img.hidden=false;}
 });
 projects.forEach(item=>{
  if(grid.querySelector(`[data-project-id="${CSS.escape(item.id)}"]`))return;
  const card=document.createElement('article');card.className='project-card reveal is-visible';card.dataset.projectId=item.id;card.dataset.projectDetails=item.details||'';card.hidden=!item.visible;
  const visual=document.createElement('div');visual.className='project-visual visual-homespace';
  const img=document.createElement('img');img.className='project-screenshot';img.alt=`Aperçu de ${item.name}`;img.src=item.image||'';if(!item.image)img.hidden=true;img.onerror=()=>img.hidden=true;
  const label=document.createElement('span');label.className='visual-label';label.textContent='PROJET CREATIX STUDIO';visual.append(img,label);
  const info=document.createElement('div');info.className='project-info';const content=document.createElement('div');
  const type=document.createElement('span');type.className='project-type';type.textContent=item.type;
  const title=document.createElement('h3');title.textContent=item.name;
  const status=document.createElement('span');status.className='project-status';status.dataset.status='';status.textContent=item.status;
  const desc=document.createElement('p');desc.textContent=item.description;content.append(type,title,status,desc);info.append(content);card.append(visual,info);grid.append(card);
 });
}
syncPortfolio();window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY)syncPortfolio();});
const revealTargets=document.querySelectorAll('.hero-copy,.hero-art,.section-heading,.expertise-card,.project-card,.studio-symbol,.studio-copy,.closing-card');
revealTargets.forEach((el,i)=>{el.classList.add('reveal');if(el.matches('.expertise-card,.project-card'))el.style.setProperty('--reveal-delay',`${(i%4)*85}ms`);});
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -45px 0px'});revealTargets.forEach(el=>observer.observe(el));}else revealTargets.forEach(el=>el.classList.add('is-visible'));
const modal=document.querySelector('#project-modal'),modalVisual=document.querySelector('#modal-visual');
function openProject(card){
 const item=readProjects().find(p=>p.id===card.dataset.projectId);if(!item)return;
 document.querySelector('#modal-type').textContent=item.type||'PROJET DIGITAL';document.querySelector('#modal-title').textContent=item.name||'Projet Creatix';
 document.querySelector('#modal-status').textContent=item.status||'En développement';paintStatus(document.querySelector('#modal-status'),item.status||'En développement');document.querySelector('#modal-description').textContent=item.description||'';
 document.querySelector('#modal-detail').textContent=item.details||'Les détails de ce projet seront bientôt disponibles.';
 modalVisual.replaceChildren();if(item.image){const img=document.createElement('img');img.src=item.image;img.alt=`Aperçu de ${item.name}`;img.onerror=()=>img.remove();modalVisual.append(img);}
 modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');modal.querySelector('.modal-close').focus();
}
function closeProject(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
const grid=document.querySelector('.projects-grid');
grid?.addEventListener('click',e=>{const card=e.target.closest('.project-card');if(card&&!card.hidden)openProject(card);});
grid?.querySelectorAll('.project-card').forEach(card=>{card.tabIndex=0;card.setAttribute('role','button');});
grid?.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('project-card')){e.preventDefault();openProject(e.target);}});
modal?.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeProject));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open'))closeProject();});

// Le formulaire prépare un e-mail adressé à Creatix Studio.
document.querySelector('#contact-form')?.addEventListener('submit',event=>{
 event.preventDefault();
 const form=event.currentTarget;
 if(!form.reportValidity()) return;
 const name=form.elements.name.value.trim();
 const sender=form.elements.email.value.trim();
 const subject=form.elements.subject.value.trim();
 const message=form.elements.message.value.trim();
 const body=`Nom : ${name}\\nE-mail : ${sender}\\n\\n${message}`;
 const url=`mailto:ronaapages@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
 document.querySelector('#contact-form-note').textContent="Votre application de messagerie va s'ouvrir. Vérifiez le message puis envoyez-le.";
 window.location.href=url;
});
