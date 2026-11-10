import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.CREATIX_SUPABASE;
const supabase = createClient(cfg.url, cfg.publishableKey);
const ADMIN_ID = cfg.adminUserId;
const BUCKET = 'portfolio-media';
const loginPanel = document.querySelector('#login-panel');
const workspace = document.querySelector('#admin-workspace');
const loginFeedback = document.querySelector('#login-feedback');
const feedback = document.querySelector('#feedback');
const identityFeedback = document.querySelector('#identity-feedback');
let projects = [];
let settings = { profile_image: '', banner_image: '' };
const pendingLogos = new Map();
const pendingScreenshots = new Map();
const pendingPreviews = new Map();
let saving = false;

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const setMessage = (el, message, isError=false) => { el.textContent = message; el.classList.toggle('error', isError); };
const showWorkspace = user => { loginPanel.hidden = true; workspace.hidden = false; document.querySelector('#admin-session-email').textContent = user.email || 'Administrateur'; };
const showLogin = () => { workspace.hidden = true; loginPanel.hidden = false; };
function normalizeLinks(value) {
  if (Array.isArray(value)) return value.filter(x => x && x.label && x.url).map(x => ({label:String(x.label).trim(),url:String(x.url).trim()}));
  return [];
}
function linksToText(links) { return normalizeLinks(links).map(x => `${x.label} | ${x.url}`).join('\n'); }
function parseLinks(text) {
  return String(text || '').split('\n').map(line => line.trim()).filter(Boolean).map((line, i) => {
    const parts = line.split('|');
    if (parts.length < 2) throw new Error(`Lien ${i+1} : utilise le format « Nom | https://adresse.fr ».`);
    const label = parts.shift().trim(), url = parts.join('|').trim();
    let parsed;
    try { parsed = new URL(url); } catch { throw new Error(`Lien ${i+1} : adresse URL invalide.`); }
    if (!label || !['https:','http:'].includes(parsed.protocol)) throw new Error(`Lien ${i+1} : ajoute un nom et une adresse http(s).`);
    return { label, url: parsed.href };
  });
}
function showSession(user) { showWorkspace(user); }
async function loadProjects() {
  setMessage(feedback, 'Chargement des projets…');
  const { data, error } = await supabase.from('projects').select('*').order('sort_order', { ascending:true });
  if (error) { setMessage(feedback, `Erreur de chargement : ${error.message}`, true); return; }
  projects = data || [];
  render();
  setMessage(feedback, `${projects.length} projet(s) chargé(s). Pense à enregistrer tes modifications.`);
}
async function loadSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id','main').maybeSingle();
  if (error) { setMessage(identityFeedback, `Erreur de chargement : ${error.message}`, true); return; }
  settings = data || { profile_image:'', banner_image:'' };
  document.querySelector('#profile-preview').src = settings.profile_image || 'assets/logo-creatix.png';
  const banner = document.querySelector('#banner-preview');
  banner.src = settings.banner_image || '';
  banner.hidden = !settings.banner_image;
}
function getShots(project) { return Array.isArray(project.screenshots) && project.screenshots.length ? project.screenshots : (project.image ? [project.image] : []); }
function render() {
  const root = document.querySelector('#project-list');
  root.innerHTML = '';
  document.querySelector('#project-count').textContent = `${projects.length} projet${projects.length > 1 ? 's' : ''}`;
  if (!projects.length) { root.innerHTML = '<div class="empty-state">Aucun projet. Ajoute ta première réalisation.</div>'; return; }
  projects.forEach((project, index) => {
    const card = document.createElement('article');
    card.className = 'admin-project'; card.dataset.index = index;
    const shots = getShots(project);
    const previews = (pendingPreviews.get(project.id) || []).map((url, i) => ({url, pending:true, index:i}));
    const allShots = [...shots.map((url, i) => ({url, pending:false, index:i})), ...previews];
    card.innerHTML = `
      <div class="admin-project-head"><div><strong>${esc(project.name || 'Nouveau projet')}</strong><span class="admin-project-subtitle">${esc(project.status || 'En développement')}</span></div><span class="admin-id">${esc(project.id)}</span></div>
      <details class="project-editor" open>
        <summary>Informations du projet <span>Modifier le contenu, le statut et les liens</span></summary>
        <div class="admin-fields">
          <div class="admin-field"><label>Nom du projet</label><input data-key="name" maxlength="80" value="${esc(project.name)}"></div>
          <div class="admin-field"><label>Catégorie / type</label><input data-key="type" maxlength="60" value="${esc(project.type)}"></div>
          <div class="admin-field full"><label>Description courte — affichée sur la carte</label><textarea data-key="description" maxlength="240">${esc(project.description)}</textarea></div>
          <div class="admin-field full"><label>Présentation détaillée — affichée à l'ouverture</label><textarea data-key="details" maxlength="3000">${esc(project.details || '')}</textarea></div>
          <div class="admin-field"><label>Statut</label><select data-key="status">${['Bientôt fini','En développement','Terminé','En pause'].map(s => `<option value="${s}" ${project.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
          <div class="admin-field"><label>Ordre d'affichage</label><input data-key="sort_order" type="number" min="0" step="1" value="${Number(project.sort_order)||0}"></div>
          <div class="admin-field full"><label class="admin-check"><input type="checkbox" data-key="visible" ${project.visible ? 'checked' : ''}> Publier ce projet sur le portfolio</label></div>
          <div class="admin-field full links-editor"><label>Liens du projet</label><textarea data-links placeholder="Site officiel | https://exemple.fr\nGoogle Play | https://play.google.com/store/apps/details?id=...\nGitHub | https://github.com/...">${esc(linksToText(project.links))}</textarea><small class="admin-hint">Un lien par ligne, au format : Nom du bouton | https://adresse.fr. Les boutons apparaîtront sur la page du projet.</small><div class="link-chips">${['Google Play','App Store','Site officiel','GitHub'].map(n => `<button type="button" class="chip" data-chip="${n}">+ ${n}</button>`).join('')}</div></div>
          <div class="admin-field full logo-field"><label>Logo du projet</label><div class="logo-row"><img class="logo-preview" src="${esc(project.logo || 'assets/favicon.png')}" alt="Logo du projet"><input data-logo type="file" accept="image/png,image/jpeg,image/webp"></div><small class="admin-hint">Idéal : 512 × 512 px, carré (PNG ou WebP). Affiché sur la page du projet.</small></div>
          <div class="admin-field full"><label>Captures d'écran du projet</label><p class="admin-hint">Idéal : portrait 1080 × 2340 px (9:19,5) pour un téléphone, ou 1920 × 1080 px en paysage. PNG, JPG ou WebP · 10 Mo max. La 1re capture sert de couverture de la carte et de visuel d'accueil (si ce projet est dans les 3 premiers publiés).</p><input data-screenshots type="file" accept="image/png,image/jpeg,image/webp" multiple><div class="screenshot-previews">${allShots.map(shot => `<div class="screenshot-thumb ${shot.pending?'is-pending':''}"><img src="${esc(shot.url)}" alt="Aperçu de capture" loading="lazy"><button type="button" data-remove-shot="${shot.index}" data-pending="${shot.pending}" aria-label="Retirer cette capture">×</button>${shot.pending?'<small>À envoyer</small>':''}</div>`).join('')}</div><small class="admin-hint">${shots.length} capture(s) enregistrée(s)${previews.length ? ` · ${previews.length} nouvelle(s) en attente` : ''}</small></div>
        </div>
      </details>
      <div class="admin-project-actions"><button class="admin-button danger" data-action="delete" type="button">Supprimer le projet</button></div>`;
    root.appendChild(card); const lf = pendingLogos.get(project.id); if (lf) card.querySelector('.logo-preview').src = URL.createObjectURL(lf);
  });
}
function collect() {
  document.querySelectorAll('.admin-project').forEach(card => {
    const project = projects[Number(card.dataset.index)]; if (!project) return;
    card.querySelectorAll('[data-key]').forEach(input => {
      project[input.dataset.key] = input.type === 'checkbox' ? input.checked : input.dataset.key === 'sort_order' ? Number(input.value)||0 : input.value;
    });
    project._linksText = card.querySelector('[data-links]')?.value || '';
  });
}
function safeId() { return `projet-${crypto.randomUUID().slice(0,8)}`; }
function ext(file) { return ({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'})[file.type]; }
async function uploadImage(file, path) {
  if (!file || !ext(file)) throw new Error('Format non accepté. Utilise PNG, JPG ou WebP.');
  if (file.size > 10*1024*1024) throw new Error(`${file.name} dépasse la limite de 10 Mo.`);
  const fullPath = `${path}/${crypto.randomUUID()}.${ext(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(fullPath, file, { cacheControl:'3600', upsert:false, contentType:file.type });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(fullPath).data.publicUrl;
}
function setSaving(value) {
  saving = value;
  document.querySelector('#save-all').disabled = value;
  document.querySelector('#add-project').disabled = value;
  document.querySelector('#save-all').textContent = value ? 'Enregistrement…' : 'Enregistrer et publier';
}
document.querySelector('#login-form').addEventListener('submit', async event => {
  event.preventDefault(); const form = event.currentTarget;
  setMessage(loginFeedback, 'Connexion en cours…');
  const { data, error } = await supabase.auth.signInWithPassword({ email:form.elements.email.value.trim(), password:form.elements.password.value });
  if (error) { setMessage(loginFeedback, `Connexion impossible : ${error.message}`, true); return; }
  if (data.user.id !== ADMIN_ID) { await supabase.auth.signOut(); setMessage(loginFeedback, 'Ce compte ne possède pas les droits administrateur.', true); return; }
  form.reset(); setMessage(loginFeedback, ''); showSession(data.user); await Promise.all([loadProjects(),loadSettings()]);
});
document.querySelector('#logout-button').addEventListener('click', async () => { await supabase.auth.signOut(); projects=[]; pendingScreenshots.clear(); pendingPreviews.clear(); showLogin(); setMessage(loginFeedback,'Vous êtes déconnecté.'); });
supabase.auth.onAuthStateChange((_event, session) => { if (!session) showLogin(); });
document.querySelector('#project-list').addEventListener('change', event => {
  if (!event.target.matches('[data-screenshots]')) return;
  collect();
  const card = event.target.closest('.admin-project'), project = projects[Number(card.dataset.index)]; if (!project) return;
  const files = Array.from(event.target.files || []);
  const invalid = files.find(file => !ext(file) || file.size > 10*1024*1024);
  if (invalid) { setMessage(feedback, `${invalid.name} : format invalide ou fichier supérieur à 10 Mo.`, true); event.target.value=''; return; }
  const existing = pendingScreenshots.get(project.id) || [];
  const next = [...existing, ...files]; pendingScreenshots.set(project.id, next);
  const urls = next.map(file => URL.createObjectURL(file));
  (pendingPreviews.get(project.id)||[]).forEach(URL.revokeObjectURL);
  pendingPreviews.set(project.id, urls);
  render();
});
document.querySelector('#project-list').addEventListener('click', async event => {
  const remove = event.target.closest('[data-remove-shot]');
  if (remove) {
    const card = remove.closest('.admin-project'), project = projects[Number(card.dataset.index)];
    if (remove.dataset.pending === 'true') {
      const idx = Number(remove.dataset.removeShot), files = pendingScreenshots.get(project.id)||[];
      files.splice(idx,1); pendingScreenshots.set(project.id,files);
      const urls = pendingPreviews.get(project.id)||[]; if(urls[idx]) URL.revokeObjectURL(urls[idx]);
      pendingPreviews.set(project.id,files.map(file=>URL.createObjectURL(file)));
    } else {
      const shots = getShots(project); shots.splice(Number(remove.dataset.removeShot),1); project.screenshots=shots; project.image=shots[0]||'';
    }
    render(); return;
  }
  const button = event.target.closest('[data-action="delete"]'); if (!button) return;
  const card = button.closest('.admin-project'), project = projects[Number(card.dataset.index)];
  if (!project || !confirm(`Supprimer « ${project.name} » du portfolio ?`)) return;
  const { error } = await supabase.from('projects').delete().eq('id',project.id);
  if (error) { setMessage(feedback,`Suppression impossible : ${error.message}`,true); return; }
  pendingScreenshots.delete(project.id); (pendingPreviews.get(project.id)||[]).forEach(URL.revokeObjectURL); pendingPreviews.delete(project.id);
  await loadProjects(); setMessage(feedback,'Projet supprimé.');
});
document.querySelector('#add-project').addEventListener('click', () => {
  if (saving) return; collect();
  const project = {id:safeId(),name:'Nouveau projet',type:'PROJET DIGITAL',description:'Présente ce projet en quelques mots.',details:'Ajoute ici la présentation détaillée.',status:'En développement',visible:true,image:'',screenshots:[],links:[],logo:'',sort_order:projects.length+1};
  projects.push(project); render();
  const last = document.querySelector('#project-list').lastElementChild; last.scrollIntoView({behavior:'smooth',block:'center'}); last.querySelector('[data-key="name"]')?.focus();
});
document.querySelector('#save-all').addEventListener('click', async () => {
  if (saving) return; collect(); setSaving(true); setMessage(feedback,'Vérification des champs…');
  try {
    for (const project of projects) project.links = parseLinks(project._linksText ?? linksToText(project.links));
    const uploads = projects.map(async project => {
      const lf = pendingLogos.get(project.id); if (lf) project.logo = await uploadImage(lf, `projects/${project.id}/logo`);
      const files = pendingScreenshots.get(project.id)||[];
      if (!files.length) return;
      const shots = getShots(project).slice();
      for (const file of files) shots.push(await uploadImage(file,`projects/${project.id}`));
      project.screenshots=shots; project.image=shots[0]||'';
    });
    setMessage(feedback,'Envoi des images vers Supabase Storage…'); await Promise.all(uploads);
    const rows = projects.map((project,index)=>({id:String(project.id),name:String(project.name||''),type:String(project.type||''),description:String(project.description||''),details:String(project.details||''),status:String(project.status||'En développement'),visible:Boolean(project.visible),image:String(project.image||''),screenshots:getShots(project),links:normalizeLinks(project.links),logo:String(project.logo||''),sort_order:Number(project.sort_order??index)}));
    const {error} = await supabase.from('projects').upsert(rows,{onConflict:'id'}); if(error) throw error;
    pendingScreenshots.clear(); pendingLogos.clear(); pendingPreviews.forEach(urls=>urls.forEach(URL.revokeObjectURL)); pendingPreviews.clear();
    await loadProjects(); setMessage(feedback,'Tout est enregistré et publié ! Les liens et captures sont visibles sur le site.');
  } catch(error) { setMessage(feedback,`Enregistrement impossible : ${error.message}`,true); }
  finally { setSaving(false); }
});
async function saveStudioImage(kind) {
  const input=document.querySelector(kind==='profile'?'#profile-upload':'#banner-upload'),file=input.files?.[0];
  if(!file){setMessage(identityFeedback,'Choisis une image avant de continuer.',true);return;}
  setMessage(identityFeedback,'Envoi de l’image vers Supabase Storage…');
  try { const url=await uploadImage(file,`studio/${kind}`);const next={...settings,[kind==='profile'?'profile_image':'banner_image']:url};const {error}=await supabase.from('site_settings').upsert({id:'main',...next},{onConflict:'id'});if(error)throw error;settings=next;await loadSettings();input.value='';setMessage(identityFeedback,'Image enregistrée et publiée.'); }
  catch(error){setMessage(identityFeedback,`Envoi impossible : ${error.message}`,true);}
}
document.querySelector('#upload-profile').addEventListener('click',()=>saveStudioImage('profile'));
document.querySelector('#upload-banner').addEventListener('click',()=>saveStudioImage('banner'));
document.querySelector('#profile-upload').addEventListener('change',event=>{const file=event.target.files?.[0];if(file)document.querySelector('#profile-preview').src=URL.createObjectURL(file);});
document.querySelector('#banner-upload').addEventListener('change',event=>{const file=event.target.files?.[0];if(file){const image=document.querySelector('#banner-preview');image.src=URL.createObjectURL(file);image.hidden=false;}});
async function checkSession(){const {data:{session}}=await supabase.auth.getSession();if(session?.user?.id===ADMIN_ID){showSession(session.user);await Promise.all([loadProjects(),loadSettings()]);}else{if(session)await supabase.auth.signOut();showLogin();}}
await checkSession();

document.querySelector('#project-list').addEventListener('change', event => {
  if (!event.target.matches('[data-logo]')) return;
  const card = event.target.closest('.admin-project'), project = projects[Number(card.dataset.index)], file = event.target.files?.[0];
  if (!project || !file) return;
  if (!ext(file) || file.size > 10*1024*1024) { setMessage(feedback, `${file.name} : format invalide ou fichier supérieur à 10 Mo.`, true); event.target.value=''; return; }
  pendingLogos.set(project.id, file);
  card.querySelector('.logo-preview').src = URL.createObjectURL(file);
});
document.querySelector('#project-list').addEventListener('click', event => {
  const chip = event.target.closest('[data-chip]'); if (!chip) return;
  const area = chip.closest('.links-editor').querySelector('[data-links]');
  area.value = (area.value.trim() ? area.value.trimEnd() + '\n' : '') + `${chip.dataset.chip} | https://`; area.focus();
});
