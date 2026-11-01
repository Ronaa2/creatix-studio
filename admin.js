const KEY='creatix_portfolio_projects_v1';
const defaults=[
{id:'timood',name:'Timood',type:'APPLICATION MOBILE',description:"Une expérience mobile centrée sur le suivi et l'expression de l'humeur.",details:"Timood explore une façon simple et visuelle de suivre son humeur au fil du temps. Le projet met l'accent sur une interface accessible, des interactions intuitives et une expérience mobile agréable.",status:'Bientôt fini',visible:true,image:'assets/projects/timood.png'},
{id:'spingo',name:'SpinGO',type:'APPLICATION MOBILE',description:'Une roue interactive pensée autour du jeu et du partage.',details:'SpinGO transforme une roue de tirage en une expérience ludique et personnalisable. Le projet rassemble des mécaniques de jeu, des récompenses et des options de partage.',status:'Bientôt fini',visible:true,image:'assets/projects/spingo.png'},
{id:'homespace',name:'HomeSpace',type:'PLATEFORME FAMILIALE',description:'Un espace numérique pour organiser et partager la vie de famille.',details:'HomeSpace imagine un espace commun pour centraliser les échanges, les tâches, les albums et les informations utiles à la vie familiale.',status:'En développement',visible:true,image:'assets/projects/homespace.png'},
{id:'waterly',name:'Waterly',type:'APPLICATION MOBILE',description:"Un compagnon de suivi d'hydratation au quotidien.",details:"Waterly accompagne le suivi de l'hydratation avec des objectifs, des statistiques et une interface visuelle pensée pour encourager une routine régulière.",status:'En développement',visible:true,image:'assets/projects/waterly.png'}];
let projects=load();
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(x))return x;}catch(e){}return structuredClone(defaults);}
function safeId(){return 'projet-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){
 const root=document.querySelector('#project-list');root.innerHTML='';document.querySelector('#project-count').textContent=`${projects.length} projet${projects.length>1?'s':''}`;
 if(!projects.length){root.innerHTML='<div class="empty-state">Aucun projet. Ajoutez votre première réalisation.</div>';return;}
 projects.forEach((p,i)=>{const el=document.createElement('article');el.className='admin-project';el.dataset.index=i;
 el.innerHTML=`<div class="admin-project-head"><strong>${esc(p.name||'Nouveau projet')}</strong><span class="admin-id">${esc(p.id)}</span></div><div class="admin-fields">
 <div class="admin-field"><label>Nom du projet</label><input data-key="name" value="${esc(p.name)}"></div><div class="admin-field"><label>Catégorie / type</label><input data-key="type" value="${esc(p.type)}"></div>
 <div class="admin-field full"><label>Description courte (sur la carte)</label><textarea data-key="description">${esc(p.description)}</textarea></div>
 <div class="admin-field full"><label>Détails du projet (dans la fenêtre au clic)</label><textarea data-key="details">${esc(p.details||'')}</textarea></div>
 <div class="admin-field"><label>Statut</label><select data-key="status">${['Bientôt fini','En développement','Terminé','En pause'].map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
 <div class="admin-field"><label>Image (chemin du fichier)</label><input data-key="image" value="${esc(p.image||'')}"></div>
 <div class="admin-field full"><label class="admin-check"><input type="checkbox" data-key="visible" ${p.visible?'checked':''}> Afficher ce projet sur le portfolio</label></div></div>
 <div class="admin-project-actions"><button class="admin-button danger" data-action="delete">Supprimer le projet</button></div>`;root.appendChild(el);});
}
function collect(){document.querySelectorAll('.admin-project').forEach(card=>{const p=projects[Number(card.dataset.index)];card.querySelectorAll('[data-key]').forEach(input=>p[input.dataset.key]=input.type==='checkbox'?input.checked:input.value);});}
function save(){collect();localStorage.setItem(KEY,JSON.stringify(projects));document.querySelector('#feedback').textContent='Modifications enregistrées dans ce navigateur.';render();}
document.querySelector('#project-list').addEventListener('click',e=>{const b=e.target.closest('[data-action="delete"]');if(!b)return;const card=b.closest('.admin-project'),i=Number(card.dataset.index);if(confirm(`Supprimer « ${projects[i].name} » du portfolio ?`)){projects.splice(i,1);render();}});
document.querySelector('#add-project').addEventListener('click',()=>{collect();projects.push({id:safeId(),name:'Nouveau projet',type:'PROJET DIGITAL',description:'Présentez ce projet en quelques mots.',details:'Ajoutez ici la présentation détaillée de ce projet.',status:'En développement',visible:true,image:''});render();document.querySelector('#project-list').lastElementChild.scrollIntoView({behavior:'smooth',block:'center'});});
document.querySelector('#save-all').addEventListener('click',save);
document.querySelector('#reset-projects').addEventListener('click',()=>{if(confirm('Restaurer les quatre projets et leurs statuts initiaux ?')){projects=structuredClone(defaults);localStorage.removeItem(KEY);render();document.querySelector('#feedback').textContent='Valeurs initiales restaurées.';}});
render();
