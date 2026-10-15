// ══════════════════════════════════════════════════════════════════
// MENU DES ONGLETS — flèche ▾ dans la barre du haut
//  • Ouvre la liste de tous les onglets visibles (selon le rôle) : un clic et on y est.
//  • L'onglet actif est toujours ramené dans la partie visible de la barre.
//  Sur cellulaire (menu ☰), la flèche est cachée : le menu ☰ fait déjà ce travail.
// ══════════════════════════════════════════════════════════════════
(function () {
  const css = document.createElement('style');
  css.textContent = `
    #onglets-btn{flex-shrink:0;height:34px;min-width:34px;border-radius:var(--r6,6px);border:1px solid rgba(255,255,255,.18);
      background:rgba(255,255,255,.07);color:var(--gold,#f0a830);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;}
    #onglets-btn:hover,#onglets-btn.on{background:rgba(212,120,10,.25);}
    #onglets-menu{left:auto;right:auto;min-width:240px;max-height:75vh;overflow-y:auto;padding:.6rem;}
    #onglets-menu .yr-item{margin-bottom:.15rem;}
    @media(max-width:700px){#onglets-btn{display:none;}}`;
  document.head.appendChild(css);

  const nav = document.querySelector('.nav'), scroll = document.querySelector('.nav-scroll');
  if (!nav || !scroll) return;

  // Bouton ▾ juste après les onglets
  const btn = document.createElement('button');
  btn.id = 'onglets-btn'; btn.type = 'button'; btn.title = 'Tous les onglets'; btn.textContent = '▾';
  scroll.after(btn);

  // Menu déroulant (même style que le choix d'année)
  const menu = document.createElement('div');
  menu.id = 'onglets-menu'; menu.className = 'yr-popup';
  document.body.appendChild(menu);

  const visibles = () => [...document.querySelectorAll('.nav-scroll .ntab')].filter(t => t.style.display !== 'none' && getComputedStyle(t).display !== 'none');
  function ouvrir() {
    menu.innerHTML = '<h4 style="margin-bottom:.5rem;">📑 Aller à…</h4>' + visibles().map((t, i) =>
      `<div class="yr-item ${t.classList.contains('act') ? 'cur' : ''}" data-i="${i}"><span>${t.innerHTML}</span></div>`).join('');
    const r = btn.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(r.left - 120, window.innerWidth - 260)) + 'px';
    menu.style.top = (r.bottom + 8) + 'px';
    menu.style.display = 'block'; btn.classList.add('on');
    document.addEventListener('click', dehors, true);
  }
  function fermer() { menu.style.display = 'none'; btn.classList.remove('on'); document.removeEventListener('click', dehors, true); }
  function dehors(e) { if (!menu.contains(e.target) && e.target !== btn) fermer(); }

  btn.addEventListener('click', () => (menu.style.display === 'block' ? fermer() : ouvrir()));
  menu.addEventListener('click', e => {
    const item = e.target.closest('.yr-item'); if (!item) return;
    const t = visibles()[+item.dataset.i]; fermer();
    if (t) t.click();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.style.display === 'block') fermer(); });

  // Ramène l'onglet actif dans la partie visible de la barre
  function montrerActif() {
    const a = document.querySelector('.nav-scroll .ntab.act'); if (!a) return;
    const z = scroll.getBoundingClientRect(), r = a.getBoundingClientRect();
    if (r.left < z.left || r.right > z.right) scroll.scrollBy({ left: r.left - z.left - (z.width - r.width) / 2, behavior: 'smooth' });
  }
  new MutationObserver(() => setTimeout(montrerActif, 30))
    .observe(scroll, { subtree: true, attributes: true, attributeFilter: ['class'] });
})();
