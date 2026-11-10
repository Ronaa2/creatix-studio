import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const config = await fs.readFile(path.join(ROOT, 'supabase-config.js'), 'utf8');
const url = config.match(/url:\s*'([^']+)'/)?.[1];
const key = config.match(/publishableKey:\s*'([^']+)'/)?.[1];
if (!url || !key) throw new Error('Configuration Supabase introuvable dans supabase-config.js');

const endpoint = new URL('/rest/v1/projects', url);
endpoint.searchParams.set('select', 'id,name,type,description,details,status,visible,image,screenshots,links,sort_order,updated_at');
endpoint.searchParams.set('visible', 'eq.true');
endpoint.searchParams.set('order', 'sort_order.asc');
const response = await fetch(endpoint, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
if (!response.ok) throw new Error(`Lecture Supabase impossible (${response.status}) : ${await response.text()}`);
const projects = await response.json();
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain = value => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const validUrl = value => { try { const u = new URL(value); return ['http:','https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
const files = [];
const urls = ['https://creatix-studio.fr/'];
for (const p of projects) {
  if (!p.id || !/^[a-zA-Z0-9_-]+$/.test(p.id)) continue;
  const slug = encodeURIComponent(p.id);
  const canonical = `https://creatix-studio.fr/projets/${slug}/`;
  const shots = Array.isArray(p.screenshots) && p.screenshots.length ? p.screenshots : (p.image ? [p.image] : []);
  const links = (Array.isArray(p.links) ? p.links : []).map(x => ({label: plain(x.label), url: validUrl(x.url)})).filter(x => x.label && x.url);
  const description = plain(p.description || p.details || `${p.name} — projet Creatix Studio`).slice(0, 300);
  const image = validUrl(shots[0]) || 'https://creatix-studio.fr/assets/logo-creatix.png';
  const structured = {
    '@context':'https://schema.org', '@type':'CreativeWork', name:p.name, description,
    url:canonical, image, creator:{'@type':'Organization',name:'Creatix Studio',url:'https://creatix-studio.fr/'}
  };
  const gallery = shots.map((u,i) => validUrl(u) ? `<figure class="seo-shot"><img src="${esc(validUrl(u))}" alt="Capture ${i+1} du projet ${esc(p.name)}" loading="lazy"></figure>` : '').join('');
  const buttons = links.map(l => `<a class="p-link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`).join('');
  const html = `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.name)} — Creatix Studio</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="article"><meta property="og:site_name" content="Creatix Studio">
<meta property="og:title" content="${esc(p.name)} — Creatix Studio"><meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}"><meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.name)} — Creatix Studio">
<meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(image)}">
<link rel="icon" href="../../assets/favicon.png"><link rel="stylesheet" href="../../styles.css">
<link rel="stylesheet" href="../../refine.css?v=13"><link rel="stylesheet" href="../../project.css">
<script type="application/ld+json">${JSON.stringify(structured).replace(/</g,'\\u003c')}</script>
<style>.seo-content{max-width:1000px;margin:2rem auto;padding:1.5rem;color:inherit}.seo-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:1rem;margin-top:2rem}.seo-shot{margin:0;padding:10px;border-radius:18px;background:rgba(255,255,255,.06)}.seo-shot img{display:block;width:100%;height:auto;max-height:720px;object-fit:contain;border-radius:12px}.seo-links{display:flex;flex-wrap:wrap;gap:.75rem;margin:1.5rem 0}.seo-content h1{font-size:clamp(2rem,5vw,4rem)}.seo-back{display:inline-block;margin:1rem 0;color:inherit}</style>
</head><body class="project-page"><header class="site-header"><a class="brand" href="../../index.html"><img class="brand-logo" src="../../assets/logo-creatix.png" alt="Creatix Studio"></a><a class="back-link" href="../../index.html#projets">← Tous les projets</a></header>
<main id="project-root" class="project-main" data-project-id="${esc(p.id)}">
<section class="seo-content"><span class="project-type">${esc(p.type || 'PROJET DIGITAL')}</span><h1>${esc(p.name)}</h1><p>${esc(description)}</p><p><strong>Statut :</strong> ${esc(p.status || 'En développement')}</p>
${p.details ? `<section><h2>À propos de ${esc(p.name)}</h2><p>${esc(p.details)}</p></section>` : ''}
${buttons ? `<nav class="seo-links" aria-label="Liens du projet">${buttons}</nav>` : ''}
${gallery ? `<section><h2>Captures d'écran de ${esc(p.name)}</h2><div class="seo-gallery">${gallery}</div></section>` : ''}
<p><a class="seo-back" href="../../index.html#projets">← Retour à tous les projets</a></p></section></main>
<script src="../../supabase-config.js"></script><script type="module" src="../../projet.js"></script>
</body></html>`;
  const out = path.join(ROOT, 'projets', p.id, 'index.html');
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, html, 'utf8');
  files.push(out); urls.push(canonical);
}
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}\n</urlset>\n`;
await fs.writeFile(path.join(ROOT,'sitemap.xml'), xml, 'utf8');
console.log(`SEO généré : ${projects.length} projet(s), ${files.length} page(s) statique(s), sitemap.xml mis à jour.`);
