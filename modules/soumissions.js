// ══════════════════════════════════════════════════════════════════
// SOUMISSIONS EN LIGNE — lien avec la page publique soumission.sercovier.ca
//  • Onglet « 📥 Soumissions » (admin seulement)
//  • Demandes reçues en temps réel + pastille du nombre de nouvelles
//  • Créer le client et son installateur en un clic, puis le contrat pré-rempli
//  • Prix et textes de la page publique (table soumission_parametres)
// Tout est dans ce fichier : index.html n'a que quelques lignes pour l'appeler.
// ══════════════════════════════════════════════════════════════════

const SOUM = {
  URL_PUBLIQUE: 'https://soumission.sercovier.ca',   // ← adresse de la page publique
  demandes: [], filtre: 'nouvelles', recherche: '', canal: null, contratPour: null,
};
const SOUM_STATUTS = { nouvelle: '🆕 Nouvelle', vue: '👁 Vue', client_cree: '👥 Client créé', contrat_cree: '📋 Contrat créé', archivee: '🗄 Archivée' };
const SOUM_SERVICES = { A: "Proposition d'emplacement", B: "Tracé de l'existant" };
const SOUM_COLONNES = 'id,created_at,statut,service,mode,type_demande,langue,pays,province,client_nom,erabliere,adresse,municipalite,telephone,courriel,lots,adresse_terrain,inst_entreprise,inst_personne,inst_adresse,inst_municipalite,inst_telephone,inst_courriel,entailles,total_min,total_max,donnees,inngeo_client_id,inngeo_installateur_id';

const soumE = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const soumM = n => (+n || 0).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });
const soumNorm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9@.]/g, '');
const soumDate = d => new Date(d).toLocaleString('fr-CA', { dateStyle: 'medium', timeStyle: 'short' });
const soumD = r => (r.donnees && r.donnees.d) || {};
const SOUM_INSTALL = { standard: 'Standard', americaine: "À l'américaine" };
const soumInstall = v => SOUM_INSTALL[v] || v || '';
const soumLangue = r => (r.langue === 'en' ? ' <span class="cb" style="background:#e0f2fe;color:#075985;">EN</span>' : '');
function soumType(r) {
  if (r.mode === 'copie') return '<span class="cb" style="background:#eef2ff;color:#3730a3;">✉ Estimation consultée</span>';
  if (r.type_demande === 'travaux') return '<span class="cb" style="background:#fde2d4;color:#9a3412;">✅ Travaux autorisés</span>';
  return '<span class="cb" style="background:#dcfce7;color:#166534;">📝 Demande de soumission</span>';
}

// ── Données ────────────────────────────────────────────────────────
async function soumCharger(avecMessage) {
  try {
    SOUM.demandes = await SB.get('soumission_demandes', `?select=${SOUM_COLONNES}&order=created_at.desc&limit=500`);
  } catch (e) {
    console.error('soumissions', e);
    if (avecMessage) toast('⚠️ Soumissions : ' + String(e.message || e).slice(0, 90));
    return;
  }
  soumBadge();
  if (curPage === 'soumissions') soumRenderListe();
  if (avecMessage) toast('✓ Soumissions à jour');
}
async function soumMaj(id, champs) {
  await SB.req('PATCH', 'soumission_demandes', champs, `?id=eq.${id}`);
  const r = SOUM.demandes.find(x => x.id === id); if (r) Object.assign(r, champs);
  soumBadge();
  if (curPage === 'soumissions') soumRenderListe();
}
function soumBadge() {
  const n = SOUM.demandes.filter(r => r.statut === 'nouvelle').length;
  document.querySelectorAll('.soum-badge').forEach(b => { b.textContent = n; b.style.display = n ? '' : 'none'; });
}

// ── Liste ─────────────────────────────────────────────────────────
function renderSoumissions() { soumRenderListe(); }
function soumRenderListe() {
  const tous = SOUM.demandes;
  const filtres = {
    nouvelles: r => r.statut === 'nouvelle',
    actives: r => r.statut !== 'archivee',
    travaux: r => r.type_demande === 'travaux' && r.statut !== 'archivee',
    archivees: r => r.statut === 'archivee',
    toutes: () => true,
  };
  const q = soumNorm(SOUM.recherche);
  const liste = tous.filter(filtres[SOUM.filtre] || filtres.toutes)
    .filter(r => !q || soumNorm([r.client_nom, r.erabliere, r.courriel, r.municipalite, r.inst_entreprise].join(' ')).includes(q));

  const nb = f => tous.filter(filtres[f]).length;
  document.getElementById('sb-sel').innerHTML = `
    <div class="sc"><div class="sc-l">Nouvelles</div><div class="sc-v">${nb('nouvelles')}</div></div>
    <div class="sc"><div class="sc-l">Travaux autorisés</div><div class="sc-v">${nb('travaux')}</div></div>
    <div class="sc"><div class="sc-l">Actives</div><div class="sc-v">${nb('actives')}</div></div>
    <div class="sc"><div class="sc-l">Total reçues</div><div class="sc-v">${tous.length}</div></div>`;
  const chip = (f, t) => `<button class="chip ${SOUM.filtre === f ? 'on' : ''}" onclick="SOUM.filtre='${f}';soumRenderListe()">${t}</button>`;
  document.getElementById('fr-sel').innerHTML =
    chip('nouvelles', '🆕 Nouvelles') + chip('actives', '📂 Actives') + chip('travaux', '✅ Travaux autorisés') + chip('archivees', '🗄 Archivées') + chip('toutes', 'Toutes') +
    `<input class="srch" id="q-sel" placeholder="🔍 Client, érablière, courriel…" value="${soumE(SOUM.recherche)}" oninput="SOUM.recherche=this.value;soumRenderListe();setTimeout(()=>{const i=document.getElementById('q-sel');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length);}},0)">`;

  document.getElementById('tb-sel').innerHTML = liste.length ? liste.map(r => `
    <tr style="cursor:pointer;${r.statut === 'nouvelle' ? 'font-weight:600;' : ''}" onclick="soumOuvrir('${r.id}')">
      <td style="white-space:nowrap;">${soumDate(r.created_at)}</td>
      <td>${soumType(r)}</td>
      <td>${SOUM_SERVICES[r.service] || r.service}</td>
      <td><strong>${soumE(r.client_nom) || '—'}</strong>${r.erabliere ? `<div style="font-size:.7rem;color:var(--sub);">${soumE(r.erabliere)}</div>` : ''}</td>
      <td>${soumE(r.municipalite) || '—'}${r.province ? ` · <strong>${soumE(r.province)}</strong>` : ''}${soumLangue(r)}</td>
      <td>${soumE(r.inst_entreprise) || '—'}</td>
      <td style="text-align:right;">${(+r.entailles || 0).toLocaleString('fr-CA')}</td>
      <td style="white-space:nowrap;">${soumM(r.total_min)} – ${soumM(r.total_max)}</td>
      <td style="white-space:nowrap;">${SOUM_STATUTS[r.statut] || r.statut}</td>
    </tr>`).join('')
    : `<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--sub);">Aucune demande ${SOUM.filtre === 'nouvelles' ? 'nouvelle' : ''} pour l'instant.</td></tr>`;
}

// ── Fiche d'une demande ──────────────────────────────────────────
function soumChamp(l, v) { return `<div class="cdf"><div class="cdf-l">${l}</div><div class="cdf-v">${soumE(v) || '—'}</div></div>`; }
async function soumOuvrir(id) {
  const r = SOUM.demandes.find(x => x.id === id);
  if (!r) { toast('⚠️ Demande introuvable'); return; }
  const d = soumD(r), t = (r.donnees && r.donnees.totaux) || {}, types = (r.donnees && r.donnees.typesChoisis) || [];
  const cli = r.inngeo_client_id ? (DB.clients || []).find(c => +c.id === +r.inngeo_client_id) : null;
  const ins = r.inngeo_installateur_id ? (DB.installateurs || []).find(i => +i.id === +r.inngeo_installateur_id) : null;

  document.getElementById('m-sel-t').innerHTML = `${soumType(r)} ${soumE(r.client_nom)} — ${SOUM_SERVICES[r.service]}`;
  document.getElementById('m-sel-body').innerHTML = `
    <div style="font-size:.8rem;color:var(--sub);margin-bottom:.8rem;">Reçue le ${soumDate(r.created_at)} · ${SOUM_STATUTS[r.statut] || r.statut}
      ${cli ? ` · Client : <a href="#" onclick="closeModal('m-sel');goPage('clients');ouvrirFicheClient(${cli.id});return false;" style="color:var(--amber);">${soumE(cli.nom)}</a>` : ''}
      ${ins ? ` · Installateur : <strong>${soumE(ins.nom)}</strong>` : ''}</div>
    <div class="cd-sec"><div class="cd-sec-t">👤 Client</div><div class="cdg">
      ${soumChamp('Nom', r.client_nom)}${soumChamp("Érablière", r.erabliere)}${soumChamp('Adresse', [r.adresse, r.municipalite].filter(Boolean).join(', '))}
      ${soumChamp('Province / État, pays', regionTexte(r.pays, r.province))}${soumChamp('Langue du client', r.langue === 'en' ? 'Anglais' : 'Français')}
      ${soumChamp('Téléphone', r.telephone)}${soumChamp('Courriel', r.courriel)}${soumChamp('Lot(s) / cadastre', r.lots)}</div></div>
    ${r.inst_entreprise ? `<div class="cd-sec"><div class="cd-sec-t">🔧 Installateur</div><div class="cdg">
      ${soumChamp('Entreprise', r.inst_entreprise)}${soumChamp('Personne répondante', r.inst_personne)}${soumChamp('Adresse', [r.inst_adresse, r.inst_municipalite].filter(Boolean).join(', '))}
      ${soumChamp('Téléphone', r.inst_telephone)}${soumChamp('Courriel', r.inst_courriel)}</div></div>` : ''}
    <div class="cd-sec"><div class="cd-sec-t">💲 Estimation</div><div class="cdg">
      ${soumChamp('Entailles', (+r.entailles || 0).toLocaleString('fr-CA'))}
      ${soumChamp('Service', soumM(t.min) + ' – ' + soumM(t.max))}
      ${t.dep ? soumChamp('Déplacement', `${soumM(t.dep)} (${t.km} km aller · ${r.adresse_terrain || 'adresse du terrain non fournie'})`) : ''}
      ${t.abo ? soumChamp('Abonnement innGéo (prorata)', soumM(t.abo)) : ''}
      <div class="cdf calc-f"><div class="cdf-l">Total estimé</div><div class="cdf-v">${soumM(r.total_min)} – ${soumM(r.total_max)} + taxes</div></div></div></div>
    <div class="cd-sec"><div class="cd-sec-t">📋 Questionnaire</div><div class="cdg">
      ${soumChamp('Types de ligne', types.join(', '))}
      ${r.service === 'B'
        ? soumChamp('Relevé fait par', [d.releveSercovier && 'Sercovier-innGéo', d.releveClient && 'Client'].filter(Boolean).join(' + '))
        : soumChamp("Type d'installation", soumInstall(d.install)) + soumChamp('Distance entre maîtres-lignes', (d.distAutre || d.dist) ? `${d.distAutre || d.dist} pi${d.tolerance ? ' (tolérance ' + d.tolerance + ' pi)' : ''}` : '')
          + soumChamp('Hauteur de croisière', (d.hautAutre || d.haut) ? (d.hautAutre || d.haut) + ' pi' : '') + soumChamp('Enfouissement possible', d.enfouir ? 'Oui' : 'Non')}
      ${soumChamp('Abonnement innGéo demandé', d.abo ? 'Oui' : 'Non')}
      ${soumChamp('Date souhaitée', d.date)}</div>
      ${d.notes ? `<div class="fblock" style="margin-top:.8rem;"><div class="fblock-t">Notes du client</div>${soumE(d.notes).replace(/\n/g, '<br>')}</div>` : ''}</div>
    ${r.type_demande === 'travaux' ? `<div class="cd-sec"><div class="cd-sec-t">✍️ Signature</div>
      <div>Signé par <strong>${soumE(d.nomSign)}</strong> le ${soumE((r.donnees && r.donnees.date) || '')}</div>
      <div id="sel-sig" style="margin-top:.6rem;color:var(--sub);font-size:.8rem;">Chargement de la signature…</div></div>` : ''}`;

  const etape = !r.inngeo_client_id
    ? `<button class="btn btn-p" onclick="soumFormClient('${r.id}')">👥 Créer le client${r.inst_entreprise ? ' + installateur' : ''}</button>`
    : `<button class="btn btn-p" onclick="soumCreerContrat('${r.id}')">📋 Créer le contrat pré-rempli</button>`;
  document.getElementById('m-sel-pied').innerHTML = `
    <button class="btn btn-d btn-sm" onclick="soumSupprimer('${r.id}')">🗑 Supprimer</button>
    <button class="btn btn-m btn-sm" onclick="soumMaj('${r.id}',{statut:'${r.statut === 'archivee' ? 'vue' : 'archivee'}'});closeModal('m-sel')">${r.statut === 'archivee' ? '↩ Désarchiver' : '🗄 Archiver'}</button>
    ${r.courriel ? `<a class="btn btn-m btn-sm" href="mailto:${soumE(r.courriel)}?subject=${encodeURIComponent('Votre demande — ' + SOUM_SERVICES[r.service] + ' — Sercovier-innGéo')}">✉ Répondre</a>` : ''}
    <span style="flex:1"></span>${etape}`;
  openModal('m-sel');

  if (r.statut === 'nouvelle') soumMaj(r.id, { statut: 'vue' }).catch(() => {});
  if (r.type_demande === 'travaux') {
    try {
      const s = await SB.get('soumission_demandes', `?id=eq.${r.id}&select=signature`);
      const img = s && s[0] && s[0].signature;
      const z = document.getElementById('sel-sig');
      if (z) z.innerHTML = img ? `<img src="${img}" alt="Signature" style="max-width:320px;width:100%;border:1px solid var(--border);border-radius:8px;background:#fff;">` : 'Aucune image de signature.';
    } catch (e) { const z = document.getElementById('sel-sig'); if (z) z.textContent = 'Signature non disponible.'; }
  }
}
async function soumSupprimer(id) {
  if (!confirm('Supprimer définitivement cette demande?')) return;
  try {
    await SB.req('DELETE', 'soumission_demandes', null, `?id=eq.${id}`);
    SOUM.demandes = SOUM.demandes.filter(x => x.id !== id);
    closeModal('m-sel'); soumBadge(); soumRenderListe(); toast('🗑 Demande supprimée');
  } catch (e) { toast('⚠️ ' + String(e.message || e).slice(0, 90)); }
}

// ── Créer le client (+ installateur) ─────────────────────────────
function soumTrouverClients(r) {
  const nom = soumNorm(r.erabliere || r.client_nom), mail = soumNorm(r.courriel);
  return (DB.clients || []).filter(c => (mail && soumNorm(c.email) === mail) || (nom && (soumNorm(c.nom) === nom || soumNorm(c.contact) === soumNorm(r.client_nom))));
}
function soumTrouverInstall(r) {
  const nom = soumNorm(r.inst_entreprise), mail = soumNorm(r.inst_courriel);
  return (DB.installateurs || []).filter(i => (nom && soumNorm(i.nom) === nom) || (mail && soumNorm(i.email) === mail));
}
function soumFormClient(id) {
  const r = SOUM.demandes.find(x => x.id === id); if (!r) return;
  const d = soumD(r), t = (r.donnees && r.donnees.totaux) || {};
  const memes = soumTrouverClients(r), memesIns = r.inst_entreprise ? soumTrouverInstall(r) : [];
  const notes = `Soumission en ligne du ${new Date(r.created_at).toLocaleDateString('fr-CA')} — ${SOUM_SERVICES[r.service]} — ${(+r.entailles || 0).toLocaleString('fr-CA')} entailles — estimé ${soumM(r.total_min)} à ${soumM(r.total_max)}`;
  const champ = (id2, l, v, cls = 'fg') => `<div class="${cls}"><div class="fl">${l}</div><input class="fi" id="${id2}" value="${soumE(v)}"></div>`;

  document.getElementById('m-sel-t').textContent = 'Créer le client dans innGéo';
  document.getElementById('m-sel-body').innerHTML = `
    <div class="fblock" style="margin-bottom:.8rem;"><div class="fblock-t">👥 Client</div>
      <div class="fg" style="margin-bottom:.6rem;"><div class="fl">Action</div><select class="fsel" id="sc-choix">
        <option value="new">➕ Créer un nouveau client</option>
        ${memes.map(c => `<option value="${c.id}" ${memes.length ? 'selected' : ''}>🔗 Mettre à jour le client existant : ${soumE(c.nom)}${c.email ? ' (' + soumE(c.email) + ')' : ''}</option>`).join('')}
      </select>${memes.length ? '<div style="font-size:.72rem;color:var(--amber);margin-top:.25rem;">⚠ Un client semblable existe déjà — vérifie avant de créer un doublon.</div>' : ''}</div>
      <div class="fr2">${champ('sc-nom', "Nom de l'entreprise", r.erabliere || r.client_nom)}${champ('sc-contact', 'Nom du contact', r.client_nom)}</div>
      <div class="fr2" style="margin-top:.5rem;">${champ('sc-email', 'Courriel', r.courriel)}${champ('sc-tel', 'Téléphone', r.telephone)}</div>
      <div style="margin-top:.5rem;">${champ('sc-adr', 'Adresse', [r.adresse, r.municipalite].filter(Boolean).join(', '))}</div>
      <div style="margin-top:.5rem;">${regionChamps('sc', r.pays, r.province)}</div>
      <div style="margin-top:.5rem;">${champ('sc-lot', '# de lot(s)', r.lots)}</div>
      <div style="margin-top:.5rem;">${champ('sc-notes', 'Notes', notes)}</div>
    </div>
    ${r.inst_entreprise ? `<div class="fblock"><div class="fblock-t">🔧 Installateur</div>
      <div class="fg" style="margin-bottom:.6rem;"><div class="fl">Action</div><select class="fsel" id="si-choix" onchange="document.getElementById('si-champs').style.display=this.value==='new'?'':'none'">
        ${memesIns.map(i => `<option value="${i.id}">🔗 Lier à l'installateur existant : ${soumE(i.nom)}</option>`).join('')}
        <option value="new" ${memesIns.length ? '' : 'selected'}>➕ Créer l'installateur « ${soumE(r.inst_entreprise)} »</option>
        <option value="none">— Ne pas lier d'installateur —</option>
        ${(DB.installateurs || []).filter(i => !memesIns.includes(i)).sort((a, b) => (a.nom || '').localeCompare(b.nom || '')).map(i => `<option value="${i.id}">Autre : ${soumE(i.nom)}</option>`).join('')}
      </select></div>
      <div id="si-champs" style="${memesIns.length ? 'display:none;' : ''}">
        <div class="fr2">${champ('si-nom', 'Nom de compagnie', r.inst_entreprise)}${champ('si-contact', 'Contact', r.inst_personne)}</div>
        <div class="fr2" style="margin-top:.5rem;">${champ('si-email', 'Courriel', r.inst_courriel)}${champ('si-tel', 'Téléphone', r.inst_telephone)}</div>
        <div style="margin-top:.5rem;">${champ('si-adr', 'Adresse', [r.inst_adresse, r.inst_municipalite].filter(Boolean).join(', '))}</div>
      </div></div>` : ''}`;
  document.getElementById('m-sel-pied').innerHTML = `<button class="btn btn-m" onclick="soumOuvrir('${r.id}')">← Retour</button><span style="flex:1"></span>
    <button class="btn btn-p" id="sc-ok" onclick="soumCreerClient('${r.id}')">✓ Enregistrer dans innGéo</button>`;
}
async function soumCreerClient(id) {
  const r = SOUM.demandes.find(x => x.id === id); if (!r) return;
  const btn = document.getElementById('sc-ok'); if (btn) { btn.disabled = true; btn.textContent = 'Création…'; }
  try {
    // 1. Installateur
    let insId = null;
    const choixIns = (document.getElementById('si-choix') || {}).value;
    if (choixIns === 'new') {
      if (!gv('si-nom')) { toast('⚠️ Nom de l\'installateur requis'); if (btn) btn.disabled = false; return; }
      const o = { id: PK(), annee_id: curYear, nom: gv('si-nom'), dossier: null, contact: gv('si-contact'), tel: gv('si-tel'), email: gv('si-email'), adresse: gv('si-adr'), notes: 'Créé depuis une soumission en ligne', onedrive: '', voir_infos_client: false };
      await dbAdd('ig_installateurs', 'installateurs', o); insId = o.id;
    } else if (choixIns && choixIns !== 'none') insId = +choixIns;

    // 2. Client
    let cliId;
    const choix = gv('sc-choix');
    const champs = { nom: gv('sc-nom'), contact: gv('sc-contact'), email: gv('sc-email'), tel: gv('sc-tel'), adresse: gv('sc-adr'), lot: gv('sc-lot'), notes: gv('sc-notes'), ...regionLire('sc') };
    if (!champs.nom) { toast('⚠️ Nom du client requis'); if (btn) btn.disabled = false; return; }
    if (choix === 'new') {
      const o = { id: PK() + 7, annee_id: curYear, ...champs, installateur_id: insId };
      await dbAdd('ig_clients', 'clients', o); cliId = o.id;
    } else {
      cliId = +choix;
      const ex = (DB.clients || []).find(c => +c.id === cliId) || {};
      const maj = {};
      Object.entries(champs).forEach(([k, v]) => { if (k === 'notes') maj.notes = [ex.notes, v].filter(Boolean).join(' | '); else if (v && !ex[k]) maj[k] = v; });
      if (insId) maj.installateur_id = insId;
      await dbUpdate('ig_clients', 'clients', cliId, maj);
    }

    // 3. Demande marquée
    await soumMaj(r.id, { statut: 'client_cree', inngeo_client_id: cliId, inngeo_installateur_id: insId });
    if (typeof renderClients === 'function' && curPage === 'clients') renderClients();
    toast(`✓ Client créé${insId ? ' et installateur lié' : ''}`);
    soumOuvrir(r.id);
  } catch (e) {
    toast('⚠️ ' + String(e.message || e).slice(0, 100));
    if (btn) { btn.disabled = false; btn.textContent = '✓ Réessayer'; }
  }
}

// ── Créer le contrat pré-rempli (fenêtre « Nouveau contrat » d'innGéo) ──
function soumCreerContrat(id) {
  const r = SOUM.demandes.find(x => x.id === id); if (!r || !r.inngeo_client_id) return;
  const d = soumD(r), t = (r.donnees && r.donnees.totaux) || {}, types = (r.donnees && r.donnees.typesChoisis) || [];
  closeModal('m-sel');
  goPage('contrats');
  newCntForCli(+r.inngeo_client_id);
  sv('cnt-ent', +r.entailles || 0);
  sv('cnt-lots', r.lots || '');
  if (r.inngeo_installateur_id) sv('cnt-installateur', r.inngeo_installateur_id);
  if (t.dep && t.km) sv('cnt-km', t.km);
  sv('cnt-stat', r.type_demande === 'travaux' ? 'attente_debut' : 'attente_ok');
  sv('cnt-details', `${SOUM_SERVICES[r.service]} — soumission en ligne du ${new Date(r.created_at).toLocaleDateString('fr-CA')}${r.adresse_terrain ? ' — terrain : ' + r.adresse_terrain : ''}`);
  sv('cnt-directives', [
    types.length ? 'Lignes : ' + types.join(', ') : '',
    r.service === 'B' ? 'Relevé : ' + [d.releveSercovier && 'Sercovier-innGéo', d.releveClient && 'Client'].filter(Boolean).join(' + ') : '',
    d.install ? 'Installation : ' + soumInstall(d.install) : '',
    r.langue === 'en' ? 'Client anglophone — communiquer en anglais' : '',
    (d.distAutre || d.dist) ? `Distance maîtres-lignes : ${d.distAutre || d.dist} pi${d.tolerance ? ' (tolérance ' + d.tolerance + ' pi)' : ''}` : '',
    (d.hautAutre || d.haut) ? 'Hauteur de croisière : ' + (d.hautAutre || d.haut) + ' pi' : '',
    r.service === 'A' ? 'Enfouissement possible : ' + (d.enfouir ? 'oui' : 'non') : '',
    d.abo ? 'Client intéressé par l\'abonnement innGéo' : '',
    d.date ? 'Date souhaitée : ' + d.date : '',
    d.notes ? 'Notes du client : ' + d.notes : '',
  ].filter(Boolean).join('\n'));
  try { recalcCnt(); } catch (e) {}
  SOUM.contratPour = r.id; // marqué « Contrat créé » quand tu cliques Enregistrer
  toast('📋 Contrat pré-rempli — vérifie et clique Enregistrer');
}
// Quand le contrat est enregistré : la demande passe à « Contrat créé ».
(function () {
  const saveOrig = window.saveCnt, fermerOrig = window.fermerCnt;
  if (typeof saveOrig === 'function') window.saveCnt = async function () {
    const id = SOUM.contratPour; SOUM.contratPour = null;
    await saveOrig.apply(this, arguments);
    if (id) soumMaj(id, { statut: 'contrat_cree' }).catch(() => {});
  };
  if (typeof fermerOrig === 'function') window.fermerCnt = async function () { SOUM.contratPour = null; return fermerOrig.apply(this, arguments); };
})();

// ── Prix et textes de la page publique ───────────────────────────
// Les valeurs d'origine viennent de js/config.js de la page publique ;
// celles enregistrées ici (soumission_parametres) les remplacent.
const SOUM_NOMS = {
  TARIFS: 'Prix', parEntailleMin: 'Estimation minimum ($ / entaille)', parEntailleMax: 'Estimation maximum ($ / entaille)',
  km: 'Déplacement ($ / km, aller et retour)', abonnement: 'Abonnement innGéo ($ / année)',
  BASE: 'Point de départ des déplacements', adresse: 'Adresse', recherche: 'Adresse utilisée pour la recherche', coord: 'Coordonnées GPS de repli (latitude, longitude)',
  ENTREPRISE: 'Entreprise', nom: 'Nom', equipe: 'Signature des messages', tel: 'Téléphone', courriel: 'Courriel', facebook: 'Lien Facebook', site: 'Site web',
  SERVICES: 'Réglages des services', A: "Proposition d'emplacement", B: "Tracé de l'existant",
  sous: 'Sous-titre', resume: "Description (page d'accueil)", tag: "Prix affiché (page d'accueil)", deplacement: 'Frais de déplacement applicables',
  tarifs: 'Tableau des tarifs', note: 'Note sous les tarifs', objet: 'Conditions — Objet', tarification: 'Conditions — Tarification',
  TEXTES: 'Textes de la page publique', fr: '🇫🇷 Français', en: '🇬🇧 English', bande: "Bandeau sous l'en-tête",
  services: 'Services', typesLigne: 'Types de ligne (1 à 5)', conditions: 'Conditions générales (titre | texte)',
  inclusBase: 'Inclus — service de base', inclusAbo: 'Inclus — avec abonnement',
};
// Les groupes affichés viennent de config.js de la page publique : un ajout là-bas apparaît ici tout seul.
function soumFusion(a, b) {
  if (Array.isArray(b) || typeof b !== 'object' || b === null) return b === undefined ? a : b;
  const o = { ...(a || {}) }; for (const k in b) o[k] = soumFusion(o[k], b[k]); return o;
}
function soumChampParam(chemin, cle, val) {
  const id = chemin.join('.'), lbl = SOUM_NOMS[cle] || cle;
  const ligne = (inp, aide) => `<div class="fg" style="margin:.45rem 0;"><div class="fl">${lbl}</div>${inp}${aide ? `<div style="font-size:.68rem;color:var(--sub);">${aide}</div>` : ''}</div>`;
  const paires = a => Array.isArray(a) && a.length && a.every(x => Array.isArray(x) && x.length === 2);
  const nombres = a => Array.isArray(a) && a.length && a.every(x => typeof x === 'number');
  if (typeof val === 'number') return ligne(`<input class="fi" type="number" step="any" data-sp="${id}" data-st="n" value="${val}">`);
  if (typeof val === 'boolean') return `<label style="display:flex;gap:.4rem;align-items:center;margin:.45rem 0;font-size:.85rem;"><input type="checkbox" data-sp="${id}" data-st="b" ${val ? 'checked' : ''}> ${lbl}</label>`;
  if (typeof val === 'string') return val.length > 70 ? ligne(`<textarea class="fi" rows="3" data-sp="${id}" data-st="s">${soumE(val)}</textarea>`) : ligne(`<input class="fi" data-sp="${id}" data-st="s" value="${soumE(val)}">`);
  if (nombres(val)) return ligne(`<input class="fi" data-sp="${id}" data-st="ln" value="${val.join(', ')}">`, 'ex. 45.8697, -71.8170');
  if (paires(val)) return ligne(`<textarea class="fi" rows="${val.length + 1}" data-sp="${id}" data-st="lp">${soumE(val.map(x => x.join(' | ')).join('\n'))}</textarea>`, 'Une ligne par élément : partie 1 | partie 2');
  if (Array.isArray(val)) return ligne(`<textarea class="fi" rows="${val.length + 1}" data-sp="${id}" data-st="ls">${soumE(val.join('\n'))}</textarea>`, 'Une ligne par élément');
  if (val && typeof val === 'object') return `<div class="fblock" style="margin:.6rem 0;"><div class="fblock-t">${lbl}</div>${Object.entries(val).map(([k, x]) => soumChampParam([...chemin, k], k, x)).join('')}</div>`;
  return '';
}
function soumLireParams() {
  const o = {};
  document.querySelectorAll('[data-sp]').forEach(el => {
    const ch = el.dataset.sp.split('.'), t = el.dataset.st; let v;
    if (t === 'n') v = parseFloat(el.value) || 0;
    else if (t === 'b') v = el.checked;
    else if (t === 's') v = el.value;
    else if (t === 'ln') v = el.value.split(',').map(x => parseFloat(x)).filter(x => !isNaN(x));
    else if (t === 'ls') v = el.value.split('\n').map(x => x.trim()).filter(Boolean);
    else if (t === 'lp') v = el.value.split('\n').filter(x => x.trim()).map(x => { const i = x.indexOf('|'); return i < 0 ? [x.trim(), ''] : [x.slice(0, i).trim(), x.slice(i + 1).trim()]; });
    let cur = o; ch.slice(0, -1).forEach(k => (cur = cur[k] = cur[k] || {})); cur[ch[ch.length - 1]] = v;
  });
  return o;
}
async function soumRenderParams() {
  const z = document.getElementById('sel-param');
  z.innerHTML = '<div style="color:var(--sub);">Chargement…</div>';
  let defauts;
  try {
    const txt = await (await fetch(SOUM.URL_PUBLIQUE + '/js/config.js', { cache: 'no-store' })).text();
    defauts = new Function(txt + '\n;return lireParametres();')();
  } catch (e) {
    z.innerHTML = `<div class="fblock">⚠️ Impossible de lire la page publique (${soumE(SOUM.URL_PUBLIQUE)}). Vérifie qu'elle est en ligne.</div>`;
    return;
  }
  let enreg = {};
  try { const r = await SB.get('soumission_parametres', '?id=eq.1&select=donnees,modifie_le'); enreg = (r[0] && r[0].donnees) || {}; SOUM.modifieLe = r[0] && r[0].modifie_le; } catch (e) {}
  const actuels = soumFusion(defauts, enreg);
  z.innerHTML = `
    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.6rem;">
      <div style="flex:1;font-size:.8rem;color:var(--sub);">Ces valeurs s'affichent sur <a href="${SOUM.URL_PUBLIQUE}" target="_blank" style="color:var(--amber);">${soumE(SOUM.URL_PUBLIQUE.replace('https://', ''))}</a> environ 30 secondes après l'enregistrement.${SOUM.modifieLe && Object.keys(enreg).length ? ' Dernière modification : ' + soumDate(SOUM.modifieLe) + '.' : ''}</div>
      <button class="btn btn-m btn-sm" onclick="soumRetablirParams()">↺ Valeurs d'origine</button>
      <button class="btn btn-p btn-sm" onclick="soumSauverParams()">💾 Enregistrer</button></div>
    ${Object.keys(defauts).map(g => soumChampParam([g], g, actuels[g])).join('')}
    <div style="display:flex;justify-content:flex-end;margin:1rem 0 2rem;"><button class="btn btn-p" onclick="soumSauverParams()">💾 Enregistrer</button></div>`;
}
async function soumSauverParams() {
  try {
    await SB.req('POST', 'soumission_parametres', { id: 1, donnees: soumLireParams(), modifie_le: new Date().toISOString() }, '?on_conflict=id', 'resolution=merge-duplicates,return=minimal');
    toast('✓ Prix et textes enregistrés — visibles sur la page publique sous peu');
  } catch (e) { toast('⚠️ ' + String(e.message || e).slice(0, 100)); }
}
async function soumRetablirParams() {
  if (!confirm("Remettre tous les prix et textes de la page publique aux valeurs d'origine?")) return;
  try {
    await SB.req('POST', 'soumission_parametres', { id: 1, donnees: {}, modifie_le: new Date().toISOString() }, '?on_conflict=id', 'resolution=merge-duplicates,return=minimal');
    toast("✓ Valeurs d'origine rétablies"); soumRenderParams();
  } catch (e) { toast('⚠️ ' + String(e.message || e).slice(0, 100)); }
}

// ── Fenêtre (créée une seule fois) ──────────────────────────────
(function () {
  const m = document.createElement('div');
  m.className = 'ov hid'; m.id = 'm-sel';
  m.innerHTML = `<div class="modal modal-lg"><div class="mh"><h3 id="m-sel-t">Demande</h3><button class="mx" onclick="closeModal('m-sel')">✕</button></div>
    <div class="mc" id="m-sel-body"></div><div class="mf" id="m-sel-pied" style="flex-wrap:wrap;gap:.4rem;"></div></div>`;
  document.body.appendChild(m);
})();

// ── Démarrage : après la connexion de l'admin ───────────────────
document.addEventListener('serco-user-change', async () => {
  if (curRole !== 'admin') return;
  await soumCharger(false);
  // Temps réel : nouvelle demande → pastille + message
  try {
    if (SOUM.canal) SBAUTH.removeChannel(SOUM.canal);
    SOUM.canal = SBAUTH.channel('soumissions-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'soumission_demandes' }, p => {
        toast('📥 Nouvelle demande de soumission : ' + ((p.new && p.new.client_nom) || ''));
        soumCharger(false);
      })
      .subscribe();
  } catch (e) { console.error('soumissions temps réel', e); }
  // Lien « Voir dans innGéo » du courriel : ?demande=<id>
  const id = new URLSearchParams(location.search).get('demande');
  if (id) {
    history.replaceState(null, '', location.pathname);
    goPage('soumissions');
    soumOuvrir(id);
  }
});
