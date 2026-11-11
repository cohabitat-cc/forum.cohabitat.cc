# Système de Design — Forum Habiter Ensemble (Montréal, Avril 2027)

**Direction artistique :** *Tactile Print Zine & Neighborhood Bulletin — Édition Montréal*  
**Domaine cible :** `forum.cohabitat.cc`  
**Référence :** `RÉF. FHE-2027-MTL` (`45°30′N 73°34′W`)

Ce document définit l'identité visuelle, la typographie, le système de couleurs, les composants tactiles et les interdits stricts du site web du **Forum Habiter Ensemble**. Conçu comme le point de convergence d'organisations d'habitat partagé au Québec (*Lykkå Cohabitation*, *Nomad Coliving*, *Oasis Coliving*, *cohabitat.cc*), le site rejette les codes génériques du web SaaS au profit d'une esthétique d'imprimé citoyen montréalais : papier journal non blanchi, pierre grise calcaire, encres risographiques franches, tampons d'atelier et bordereaux détachables.

---

## 1. Palette de papiers et d'encres (`:root`)

Toutes les couleurs sont définies dans [`style.css`](style.css) sous forme de variables CSS sémantiques évoquant des surfaces physiques d'impression et l'architecture montréalaise :

| Variable CSS | Code Hex | Rôle & Référence matérielle |
| :--- | :--- | :--- |
| `--paper` | `#F3EFE6` | **Fond principal** — Papier journal non blanchi / affiche de rue (*wheatpaste poster paper*), superposé d'un grain SVG subtil (`feTurbulence` à `opacity: 0.26` et alpha `0.16` sur `body::before`). |
| `--paper-secondary` | `#E8E2D5` | **Surface secondaire** — Calcaire gris-beige montréalais vieilli (bandeau technique `.tech-bar`, en-tête collant `.site-header`, colonne de chapitre `.chapter-rail`, encadré `.venue-strip`, panneau `.interest-form`). |
| `--paper-sheet` | `#F8F5EE` | **Feuillet d'imprimerie clair** — Papier clair pour les fiches, champs de saisie, cartes d'ateliers et zones du plan `FIG. 01` (jamais de `#FFFFFF` stérile). |
| `--ink` | `#181816` | **Encre primaire** — Noir charbon risographique dense, inspiré des escaliers en fer forgé du Plateau et de Villeray. Utilisé pour le texte, les filets `1px` et les cadres structurels `2px`. |
| `--ink-muted` | `#4A4843` | **Encre secondaire** — Encre charbon surimprimée pour les légendes, métadonnées secondaires et sous-titres. |
| `--terracotta` | `#C24B32` | **Accent primaire (Terracotta St-Laurent)** — Rouge-brique orangé pour les appels à l'action principaux (`.btn-primary`), l'état actif du sélecteur `FR / EN`, les numéros de chapitre `.chapter-num`, le cœur du plan et les accents typographiques. |
| `--terracotta-dark` / `--terracotta-tint` | `#9E3822` / `#F5E1DC` | **Surimpression et lavis terracotta** — États actifs et survol d'aile du plan `.plan-zone--terracotta`. |
| `--ruelle-green` / `--ruelle-tint` | `#2B5B44` / `#DCE8E1` | **Accent secondaire (Vert Ruelle Verte)** — Vert forêt civique pour les états de survol `.btn-outline:hover`, les encarts de la Journée 2 (*Unconference*) et les ailes vertes du plan `.plan-zone--ruelle`. |
| `--depanneur-yellow` / `--depanneur-tint` | `#E2A83E` / `#F7EBD2` | **Accent tampon / surligneur (Jaune Dépanneur)** — Jaune enseigne peinte à la main pour les tampons inclinés (`.zine-stamp`, `.hero-kicker`, `.dossier-status-stamp`, `.tech-bar strong`, `.venue-strip strong`), les dates clés (`AVRIL 2027`) et l'aile jaune `.plan-zone--yellow`. |

---

## 2. Système typographique

Le système repose sur trois familles complémentaires chargées depuis Google Fonts dans [`index.html`](index.html) :

1. **Titres éditoriaux (`--font-display`) : `'Fraunces'`**
   * Sérif à axe variable (`opsz 9..144`, poids `600`, `700`, `800`, romain et italique) aux courbes expressives et chaleureuses.
   * Appliqué aux titres `h1`–`h3` (`.brand-title`, `.chapter-title`, `.manifesto-quote`, `.hero-subtitle`, `.faq-item summary`) avec échelle fluide `clamp()` combinant `rem` et `vw`.

2. **Corps de texte (`--font-sans`) : `'Public Sans'`**
   * Sans-sérif civique et institutionnel à haute lisibilité (`400`, `500`, `600`, `700`).
   * Utilisé pour les analyses de constats, les biographies des partenaires, les descriptions de chantiers et les réponses de la foire aux questions.

3. **Métadonnées, coordonnées et cotes (`--font-mono`) : `'IBM Plex Mono'`**
   * Monospace technique (`400`, `500`, `600`, `700`), composé en capitales avec interlettrage serré (`0.03em` à `0.08em`).
   * Réservé aux coordonnées géographiques (`45°30′N 73°34′W`), cotes de référence (`RÉF. FHE-2027-MTL`), étiquettes de chantiers (`[01]`–`[04]`), horaires (`JOUR 01` / `JOUR 02`) et tampons d'état.

---

## 3. Architecture de mise en page et détails tactiles

### Filets et bordures d'imprimerie
* **Zéro carte SaaS flottante :** Aucun rayon de courbure supérieur à `3px` (`--radius-zine: 2px`).
* **Filets structurels :**
  * `--rule-strong: 2px solid #181816` pour les cadres majeurs (`.shell`, `.site-header`, `.hero`, `.chapter`, `.btn`, `.blueprint-svg-wrap`).
  * `--rule-thin: 1px solid #181816` pour les divisions de grille internes (`.tech-bar`, `.matrix-cell`, `.faq-item`, `.tag-cloud li`).
  * `--rule-dashed: 1.5px dashed #181816` pour les encarts détachables (`.venue-strip`), séparateurs de formulaire (`.interest-form`, `.form-footer`, `.submission-panel`) et motifs de frise (`.mtl-stair-motif`).
* **Ombres franches décalées (*Hard Ink Offset*) :** Les boutons, tampons et cadres interactifs utilisent des ombres dures sans flou (`2px 2px 0 var(--ink)`, `3px 3px 0 var(--ink)`, `4px 4px 0 var(--ink)`).

### Tampons inclinés (`-1deg`) et fiches détachables
* **Tampons inclinés (`transform: rotate(-1deg)`) :**
  * `.zine-stamp`, `.hero-kicker`, `.chapter-num`, `.tech-bar strong` (`45°30′N 73°34′W`, `AVRIL 2027`), `.venue-strip strong` et `.dossier-status-stamp` (`STATUT : APPEL À MANIFESTATION D'INTÉRÊT OUVERT`).
* **Fiches & avis à bordure pointillée (`1.5px dashed #181816`) :**
  * `.venue-strip` (*Lieux en évaluation — Montréal*) dans la section 03 et le dossier `.interest-form` / `.submission-panel` dans la section 05 (*Fiche d'intérêt & de partenariat*).

### Plan de concertation interactif (`FIG. 01 — Coupe A-A'`)
* Le diagramme architectural `.blueprint-svg` est traité comme une **épreuve risographique encrée sur papier chaud** (`#F3EFE6` / `#E8E2D5`) avec une trame de hachures diagonales SVG (`#riso-hatch`).
* Les quatre ailes thématiques réagissent au survol et au focus clavier avec des lavis d'encre dédiés :
  * **Aile 01 (`[01] ZONAGE & VILLE`)** : `.plan-zone--terracotta` (`#C24B32` / `--terracotta-tint`).
  * **Aile 02 (`[02] CAPITAL PATIENT`)** et **Aile 04 (`[04] ASSURANCES`)** : `.plan-zone--ruelle` (`#2B5B44` / `--ruelle-tint`).
  * **Aile 03 (`[03] DROIT & FIDUCIE`)** : `.plan-zone--yellow` (`#E2A83E` / `--depanneur-tint`).
  * **Cour commune centrale (`FORUM OUVERT`)** : applat terracotta `#C24B32` avec ombre franche charbon `#181816`.

### Micro-touches montréalaises
* **Motif SVG d'escalier extérieur en colimaçon et corniche de triplex :**
  * Intégré en dessin au trait vectoriel dans l'en-tête (`.mtl-stair-motif`) et dans le colophon du pied de page (`.footer-motif-box`).
* **Commutateur de langue physique (`FR / EN`) :**
  * `.lang-switch` est stylisé comme un sélecteur mécanique à tampon d'encre avec bordure `2px solid #181816`, ombre `2px 2px 0 #181816` et état actif `.lang-btn[aria-pressed="true"]` en aplat `--terracotta`.

---

## 4. Interdits stricts (Strict Bans)

Pour préserver l'authenticité éditoriale et éviter toute dérive vers une esthétique générique générée par IA :

1. **Aucun dégradé CSS (`linear-gradient`, `radial-gradient`, `conic-gradient`)** dans la feuille de style.
2. **Aucune police `Inter`, `Roboto` ou `Arial`** comme police principale.
3. **Aucun bouton en pilule (`border-radius: 9999px`)** : tous les rayons restent compris entre `0px` et `3px`.
4. **Aucune carte blanche flottante (`#FFFFFF`) avec ombre portée floue (`box-shadow` floutée)**.
5. **Aucun émoji Unicode décoratif** dans l'interface ni dans le texte.
6. **Aucune suppression ou altération fonctionnelle** : l'intégralité du contenu bilingue (`FR` / `EN`), des profils partenaires, du diagramme interactif `FIG. 01` et du générateur de fiche d'intérêt (courriel, presse-papiers et formulaire Google Forms) demeure intacte.
