# Système de Design — Forum Habiter Ensemble (Montréal, Avril 2027)

**Direction artistique :** *Tactile Print Zine & Neighborhood Bulletin — Édition Montréal*  
**Domaine cible :** `forum.cohabitat.cc`  
**Référence :** `RÉF. FHE-2027-MTL` (`45°30′N 73°34′W`)

Ce document définit l'identité visuelle, la typographie, le système de couleurs, les composants tactiles et les interdits stricts du site web du **Forum Habiter Ensemble**. Conçu comme le point de convergence d'organisations d'habitat partagé au Québec (*Lykkå Cohabitation*, *Nomad Coliving*, *Maillon Vert & Oasis*, *cohabitat.cc*), le site rejette les codes génériques du web SaaS au profit d'une esthétique d'imprimé citoyen montréalais : papier journal non blanchi, pierre grise calcaire, encres risographiques franches, tampons d'atelier et bordereaux détachables.

---

## 1. Palette de papiers et d'encres (`:root`)

Toutes les couleurs sont définies dans [`style.css`](style.css) sous forme de variables CSS sémantiques évoquant des surfaces physiques d'impression et l'architecture montréalaise :

| Variable CSS | Code Hex | Rôle & Référence matérielle |
| :--- | :--- | :--- |
| `--paper` | `#F3EFE6` | **Fond principal** — Papier journal non blanchi / affiche de rue (*wheatpaste poster paper*), superposé d'un grain SVG subtil (`feTurbulence` à `3.5 %` d'opacité sur `body::before`). |
| `--paper-secondary` | `#E8E2D5` | **Surface secondaire** — Calcaire gris-beige montréalais vieilli (cartouche d'en-tête, navigation collante, encadrés de chantier, panneau de formulaire). |
| `--paper-sheet` | `#F8F5EE` | **Feuillet détachable** — Papier d'impression clair pour les fiches, champs de saisie et cartes d'atelier. |
| `--ink` | `#181816` | **Encre primaire** — Noir charbon risographique dense, inspiré des escaliers en fer forgé du Plateau et de Villeray. Utilisé pour le texte, les filets `1px` et les cadres structurels `2px`. |
| `--ink-muted` | `#4A4843` | **Encre secondaire** — Gris plomb typographique pour les légendes, métadonnées secondaires et sous-titres. |
| `--ink-faint` | `#7A756C` | **Encre de construction** — Repères d'impression et filets de coupe discrets. |
| `--terracotta` | `#C24B32` | **Accent primaire (Terracotta St-Laurent)** — Rouge-brique orangé pour les appels à l'action principaux (`.btn-primary`), onglets actifs, tampons urgents et numéros de section. |
| `--ruelle-green` | `#2B5B44` | **Accent secondaire (Vert Ruelle Verte)** — Vert forêt civique pour les badges secondaires, l'état actif de la Journée 2 (*Unconference*) et les repères d'ailes du plan. |
| `--depanneur-yellow` | `#E2A83E` | **Accent tampon / surligneur (Jaune Dépanneur)** — Jaune enseigne peinte à la main pour les avis épinglés, étiquettes de statut et dates clés (`AVRIL 2027`, `ÉDITION FONDATRICE`). |

---

## 2. Système typographique

Le système repose sur trois familles complémentaires chargées depuis Google Fonts :

1. **Titres éditoriaux (`--font-display`) : `'Fraunces'`**
   * Sérif à axe variable (`opsz 9..144`, poids `600`, `700`, `800`, romain et italique) aux courbes expressives et chaleureuses.
   * Appliqué aux titres `H1` à `H3` (`.hero-title`, `.section-title`, `.chantier-card h3`, `.partner-body h3`, `.form-header h2`) pour évoquer un zine littéraire et civique montréalais indépendant.
   * Interlignage serré (`0.96` à `1.22`) et approche négative (`-0.02em` à `-0.025em`).

2. **Corps de texte (`--font-sans`) : `'Public Sans'`**
   * Sans-sérif civique et institutionnel à haute lisibilité (`400`, `500`, `600`, `700`).
   * Utilisé pour les analyses de constats, les biographies des partenaires, les descriptions de chantiers et les réponses de la foire aux questions.

3. **Métadonnées, coordonnées et cotes (`--font-mono`) : `'IBM Plex Mono'`**
   * Monospace technique (`400`, `500`, `600`, `700`), systématiquement composé en capitales avec interlettrage serré (`0.04em` à `0.09em`).
   * Réservé aux coordonnées géographiques (`45°30′N 73°34′W`), cotes de référence (`RÉF. FHE-2027-MTL`), étiquettes de chantiers (`CHANTIER [01]`–`[04]`), horaires (`JOUR 01` / `JOUR 02`) et tampons d'état.

---

## 3. Architecture de mise en page et détails tactiles

### Filets et bordures d'imprimerie
* **Zéro carte SaaS flottante :** Aucun rayon de courbure supérieur à `3px` (`--radius-zine: 2px`).
* **Filets structurels :**
  * `--rule-strong: 2px solid #181816` pour les cadres majeurs (cartouche d'en-tête, boîtes de métadonnées, boutons, plan de concertation, bordereau d'intérêt).
  * `--rule-thin: 1px solid #181816` pour les divisions de grille internes (cellules de constat, lignes d'horaire, accordéons FAQ).
  * `--rule-dashed: 1.5px dashed #181816` pour les coupons détachables, bordures d'encadrés d'évaluation de lieux et séparateurs de formulaire.
* **Ombres franches décalées (*Hard Ink Offset*) :** Les éléments interactifs et encadrés utilisent exclusivement des décalages d'encre nets sans flou (`--shadow-hard: 4px 4px 0px #181816`, `--shadow-hard-sm: 2px 2px 0px #181816`, `--shadow-terracotta: 4px 4px 0px #C24B32`).

### Bordereaux détachables et tampons (`-1deg`)
* **Tampons inclinés (`transform: rotate(-1deg)`) :**
  * `.dossier-status-stamp` (`STATUT : APPEL À MANIFESTATION D'INTÉRÊT OUVERT`) : fond `--depanneur-yellow`, bordure `1.5px dashed #181816`, ombre franche `2px 2px 0 #181816`.
  * `.meta-Highlight` (`AVRIL 2027`) et `.fig-stamp` (`ÉDITION FONDATRICE`) : étiquettes tamponnées inclinées à `-1deg`.
* **Coupons à découper (`1.5px dashed #181816`) :**
  * `.venue-callout` (*Lieux en évaluation — Montréal*) et `.form-sheet` (Section 05 *Fiche de manifestation d'intérêt*) intègrent un bandeau supérieur perforé `✂ BORDEREAU DÉTACHABLE // CONSERVER OU TRANSMETTRE AU COMITÉ`.

### Plan de concertation interactif (`FIG. 01 — Coupe A-A'`)
* Le diagramme architectural `.blueprint-svg` est traité comme une **épreuve risographique encrée sur papier chaud** (`#F3EFE6` / `#E8E2D5`) avec une trame de hachures diagonales SVG (`#riso-hatch`).
* Les quatre ailes thématiques et la plénière centrale réagissent au survol, au focus clavier et à la sélection (`aria-pressed="true"`) avec des aplats d'encre :
  * **Aile Nord (`Zonage & Ville`)** et **Aile Sud (`Droit & Fiducie`)** : `.plan-zone--terracotta` (`#C24B32`).
  * **Aile Ouest (`Capital Patient`)** : `.plan-zone--ruelle` (`#2B5B44`).
  * **Aile Est (`Assurances`)** : `.plan-zone--yellow` (`#E2A83E`).
  * **Plénière Centrale (`Hub de Maillage`)** : `.plan-zone--center` (`#C24B32` / `#181816`).

### Micro-touches montréalaises
* **Motif SVG d'escalier extérieur en colimaçon et corniche de triplex :**
  * Intégré en dessin au trait vectoriel dans le cartouche supérieur (`.mtl-stair-motif`) et dans le colophon du pied de page (`.footer-motif-box`).
* **Commutateur de langue physique (`FR / EN`) :**
  * `.lang-switch` est stylisé comme un sélecteur mécanique à tampon d'encre avec bordure `2px solid #181816`, ombre `2px 2px 0 #181816` et état actif `.lang-btn.active` en aplat `--terracotta` (`#C24B32`).

---

## 4. Interdits stricts (Strict Bans)

Pour préserver l'authenticité éditoriale et éviter toute dérive vers une esthétique générique générée par IA :

1. **Aucun dégradé CSS (`linear-gradient`, `radial-gradient`, `conic-gradient`)** nulle part dans la feuille de style. Les textures passent uniquement par des motifs géométriques SVG ou du bruit papier discret.
2. **Aucune police `Inter`, `Roboto` ou `Arial`** comme police principale.
3. **Aucun bouton en pilule (`border-radius: 9999px`)** : tous les rayons restent compris entre `0px` et `3px`.
4. **Aucune carte blanche flottante (`#FFFFFF`) avec ombre portée floue (`box-shadow: 0 10px 30px rgba(...)`)**.
5. **Aucun émoji Unicode décoratif** dans l'interface ni dans le texte.
6. **Aucune suppression ou altération fonctionnelle** : l'intégralité du contenu bilingue (`FR` / `EN`), des profils partenaires, du diagramme interactif `FIG. 01` et du générateur de fiche d'intérêt (courriel, presse-papiers et formulaire Google Forms) doit demeurer intacte.

