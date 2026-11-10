(()=>{
  const header=document.querySelector('.site-header');
  const onScroll=()=>header?.classList.toggle('is-scrolled',window.scrollY>12);
  onScroll();
  addEventListener('scroll',onScroll,{passive:true});

  // Le délai d'apparition ne sert qu'à la première entrée : on le retire ensuite pour que les survols restent instantanés.
  document.addEventListener('transitionend',e=>{
    const t=e.target;
    if(e.propertyName==='opacity'&&t.classList?.contains('reveal'))t.style.setProperty('--reveal-delay','0ms');
  });

  // Lien de navigation actif selon la section visible.
  const links=[...document.querySelectorAll('.main-nav a[href^="#"]:not(.nav-contact)')];
  if('IntersectionObserver'in window&&links.length){
    const byId=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      links.forEach(l=>l.classList.remove('active'));
      byId.get(entry.target.id)?.classList.add('active');
    }),{rootMargin:'-45% 0px -50% 0px'});
    byId.forEach((_,id)=>{const s=document.getElementById(id);if(s)io.observe(s);});
  }
})();

// v10 — inclinaison 3D au survol et navigation vers les pages projet
(()=>{
  const open=card=>{const id=card.dataset.projectId;if(!id||card.hidden)return;document.body.classList.add('page-leave');setTimeout(()=>{location.href=`projet.html?id=${encodeURIComponent(id)}`;},320);};
  document.addEventListener('click',e=>{const c=e.target.closest('.project-card');if(!c)return;e.preventDefault();e.stopPropagation();open(c);},true);
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList?.contains('project-card')){e.preventDefault();e.stopPropagation();open(e.target);}},true);
  addEventListener('pageshow',()=>document.body.classList.remove('page-leave'));
})();
