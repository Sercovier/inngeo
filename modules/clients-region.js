// ══════════════════════════════════════════════════════════════════
// PAYS ET PROVINCE / ÉTAT DES CLIENTS
//  Champs ajoutés dans « Nouveau client », « Modifier le client » et la fiche client.
//  Données : colonnes ig_clients.pays (CA, US) et ig_clients.province (QC, ON, VT…).
//  Listes : modules/regions.js (copie identique de celle de la page publique).
// ══════════════════════════════════════════════════════════════════

// Les deux listes déroulantes. prefix = 'cli' (fenêtre client) ou 'fc' (fiche client).
function regionChamps(prefix, pays, province) {
  const p = REGIONS[pays] ? pays : 'CA';
  return `<div class="fr2" id="${prefix}-region">
    <div class="fg"><div class="fl">Pays</div>
      <select class="fsel" id="${prefix}-pays" onchange="regionMajPays('${prefix}')">${Object.keys(REGIONS).map(c => `<option value="${c}" ${c === p ? 'selected' : ''}>${nomPays(c, 'fr')}</option>`).join('')}</select></div>
    <div class="fg"><div class="fl" id="${prefix}-prov-l">${REGIONS[p].regionFr}</div>
      <select class="fsel" id="${prefix}-prov"><option value="">— Non précisé —</option>${optionsRegions(p, province || '', 'fr')}</select></div>
  </div>`;
}
// Changement de pays : on recharge la liste des provinces / États
function regionMajPays(prefix) {
  const p = gv(prefix + '-pays');
  document.getElementById(prefix + '-prov').innerHTML = '<option value="">— Non précisé —</option>' + optionsRegions(p, '', 'fr');
  document.getElementById(prefix + '-prov-l').textContent = REGIONS[p].regionFr;
}
// Valeurs à enregistrer
function regionLire(prefix) {
  if (!document.getElementById(prefix + '-pays')) return {};
  return { pays: gv(prefix + '-pays') || null, province: gv(prefix + '-prov') || null };
}
// Remplace les champs existants (ou l'emplacement vide) par des champs pré-remplis
function regionRemplir(prefix, pays, province) {
  const z = document.getElementById(prefix + '-region');
  if (z) z.outerHTML = regionChamps(prefix, pays, province);
}
// Texte lisible : « Québec, Canada »
function regionTexte(pays, province) {
  return [nomRegion(pays, province, 'fr'), province || pays ? nomPays(pays || 'CA', 'fr') : ''].filter(Boolean).join(', ');
}
