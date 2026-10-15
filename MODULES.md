# innGéo — code ajouté (dossier `modules/`)

Chaque fonction ajoutée a **son propre fichier** dans `modules/`. `index.html` ne fait que les charger, avec quelques lignes d'appel. Pour améliorer une fonction, on modifie seulement son fichier.

| Fichier | Rôle |
|---|---|
| `modules/regions.js` | Listes des pays, provinces (Canada) et États (États-Unis), en français et en anglais. **Copie identique** de `public/js/regions.js` de la page de soumission. |
| `modules/clients-region.js` | Champs Pays + Province / État dans « Nouveau client », « Modifier le client » et la fiche client. |
| `modules/menu-onglets.js` | Flèche ▾ dans la barre du haut : liste de tous les onglets visibles. Ramène aussi l'onglet actif dans la partie visible de la barre. |
| `modules/soumissions.js` | Onglet 📥 Soumissions : demandes en temps réel, création du client et de l'installateur, contrat pré-rempli, prix et textes (FR/EN) de la page publique. |

## Lignes ajoutées dans `index.html`
1. Bas de page : chargement des 4 modules (`?v=11`).
2. Barre du haut et menu cellulaire : bouton « 📥 Soumissions », avec une pastille du nombre de nouvelles demandes.
3. Page `page-soumissions` (ids `*-sel`), juste avant `page-parametres`.
4. `goPage()` : page réservée à l'admin, qui appelle `renderSoumissions()`.
5. `applyPerms()` : l'onglet est caché aux employés et aux installateurs.
6. `appliquerOrdrePages()` : Soumissions reste juste avant ⚙️ Paramètres.
7. Fenêtre client : emplacement `<div id="cli-region">`. `newClient()`, `editCli()` et `saveCli()` appellent `regionRemplir` / `regionLire`.
8. Fiche client : `regionChamps('fc', …)` sous l'adresse. `saveFicheClient()` appelle `regionLire('fc')`.
9. Service worker passé en version 11.

## `service-worker.js`
Cache `inngeo-v11`, avec les 4 fichiers `modules/` ajoutés à la liste.

## Données (Supabase) — créées par `schema.sql` du projet sercovier-soumission
- `ig_clients.pays` (CA, US) et `ig_clients.province` (QC, ON, VT…) : nouvelles colonnes.
- `soumission_demandes` : demandes reçues, avec `langue`, `pays` et `province`.
- `soumission_parametres` : prix et textes de la page publique.
- Les deux tables `soumission_` sont réservées aux comptes `admin` de `ig_roles`.
