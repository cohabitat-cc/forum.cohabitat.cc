/**
 * Moteur d'infobulles accessibles — Forum Habiter Ensemble
 * Inspiré de l'architecture zero-build WCAG 2.1 AA (1.4.13) de pacte.quebec :
 * - Chargement JSON conditionnel via import.meta.url + cache promesse singleton
 * - Rendu DOM sécurisé (createElement / textContent uniquement)
 * - popover="manual" (couche supérieure native + repli CSS .interest-target)
 * - Bureau : survol (150 ms / 0 ms enchaîné), délai de grâce (200 ms), focus, positionnement borné
 * - Mobile / tactile : suppression de interestfor au runtime, volet inférieur fixe (bottom sheet)
 * - Bilingue FR / EN synchronisé avec l'événement 'forum:langchange'
 */

export const URL_GLOSSAIRE_JSON = new URL('../data/glossaire.json', import.meta.url);

let promesseGlossaire = null;

export function chargerGlossaire() {
  if (!promesseGlossaire) {
    promesseGlossaire = fetch(URL_GLOSSAIRE_JSON)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);
  }
  return promesseGlossaire;
}

export function obtenirIdInfobulle(type, cle) {
  return `${type}-${cle}`;
}

const estTactile = () =>
  (typeof window !== 'undefined' &&
    Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) ||
  (typeof window !== 'undefined' && window.innerWidth <= 780);

const etat = {
  bulleActive: null,
  declencheurActif: null,
  timerOuverture: null,
  timerFermeture: null,
  vientDeFermer: false,
  timerVerrouFocus: null,
  ecouteursGlobauxInstalles: false,
  dictionnaireActif: null,
};

function langueActive() {
  return (typeof document !== 'undefined' && document.documentElement.lang === 'en') ? 'en' : 'fr';
}

function annulerTimers() {
  if (etat.timerOuverture) {
    clearTimeout(etat.timerOuverture);
    etat.timerOuverture = null;
  }
  if (etat.timerFermeture) {
    clearTimeout(etat.timerFermeture);
    etat.timerFermeture = null;
  }
}

function afficherBulle(bulle) {
  if (typeof bulle.showPopover === 'function') {
    try {
      bulle.showPopover();
    } catch {
      /* déjà ouverte ou navigateur sans support complet */
    }
  }
  bulle.classList.add('interest-target', ':popover-open');
}

function masquerBulle(bulle) {
  if (typeof bulle.hidePopover === 'function') {
    try {
      bulle.hidePopover();
    } catch {
      /* déjà fermée */
    }
  }
  bulle.classList.remove('interest-target', ':popover-open');
}

function positionnerInfobulle(declencheur, bulle) {
  if (!declencheur || !bulle) return;

  if (estTactile()) {
    bulle.classList.remove('infobulle-glossaire--js-pos');
    bulle.style.removeProperty('inset-block-start');
    bulle.style.removeProperty('inset-inline-start');
    return;
  }

  bulle.classList.add('infobulle-glossaire--js-pos');

  const rectDecl = declencheur.getBoundingClientRect();
  const rectBulle = bulle.getBoundingClientRect();
  const marge = 10;
  const ecart = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const espaceHaut = rectDecl.top - marge;
  const espaceBas = vh - rectDecl.bottom - marge;

  let top;
  if (espaceHaut >= rectBulle.height + ecart || espaceHaut >= espaceBas) {
    top = rectDecl.top - rectBulle.height - ecart;
  } else {
    top = rectDecl.bottom + ecart;
  }
  top = Math.max(marge, Math.min(top, vh - rectBulle.height - marge));

  let left = rectDecl.left + rectDecl.width / 2 - rectBulle.width / 2;
  left = Math.max(marge, Math.min(left, vw - rectBulle.width - marge));

  bulle.style.insetBlockStart = `${Math.round(top)}px`;
  bulle.style.insetInlineStart = `${Math.round(left)}px`;
}

export function fermerTout(restaurerFocus = false) {
  annulerTimers();
  const bulle = etat.bulleActive;
  const declencheur = etat.declencheurActif;

  if (!bulle) return;

  const focusDansBulle = bulle.contains(document.activeElement);
  masquerBulle(bulle);

  if (declencheur) {
    declencheur.classList.remove('interest-source');
    declencheur.removeAttribute('aria-describedby');
    declencheur.removeAttribute('aria-details');
  }

  etat.bulleActive = null;
  etat.declencheurActif = null;

  etat.vientDeFermer = true;
  if (etat.timerVerrouFocus) clearTimeout(etat.timerVerrouFocus);
  etat.timerVerrouFocus = setTimeout(() => {
    etat.vientDeFermer = false;
  }, 250);

  if ((restaurerFocus || focusDansBulle) && declencheur) {
    declencheur.focus();
  }
}

function ouvrir(declencheur, bulle) {
  annulerTimers();

  if (etat.bulleActive && etat.bulleActive !== bulle) {
    fermerTout(false);
  }

  etat.bulleActive = bulle;
  etat.declencheurActif = declencheur;

  afficherBulle(bulle);
  declencheur.classList.add('interest-source');

  const contientLien = Boolean(bulle.querySelector('a[href]'));
  if (contientLien) {
    declencheur.setAttribute('aria-details', bulle.id);
    declencheur.removeAttribute('aria-describedby');
  } else {
    declencheur.setAttribute('aria-describedby', bulle.id);
    declencheur.removeAttribute('aria-details');
  }

  positionnerInfobulle(declencheur, bulle);
}

function planifierFermeture() {
  annulerTimers();
  etat.timerFermeture = setTimeout(() => {
    fermerTout(false);
  }, 200);
}

function obtenirFocusables(racine = document) {
  return [...racine.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((el) => el.offsetParent !== null && !el.closest('.infobulle-glossaire'));
}

function remplirContenuBulle(bulle, entree, lang) {
  bulle.textContent = '';

  const btnFermer = document.createElement('button');
  btnFermer.type = 'button';
  btnFermer.className = 'infobulle-glossaire__fermer';
  btnFermer.setAttribute('aria-label', lang === 'en' ? 'Close definition' : 'Fermer la définition');
  btnFermer.textContent = '×';
  btnFermer.addEventListener('click', (e) => {
    e.stopPropagation();
    fermerTout(true);
  });
  bulle.append(btnFermer);

  const entete = document.createElement('div');
  entete.className = 'infobulle-glossaire__entete';

  const titre = document.createElement('strong');
  titre.className = 'infobulle-glossaire__terme';
  titre.textContent = lang === 'en' ? (entree.equivalentEn || entree.termeFr) : entree.termeFr;
  entete.append(titre);

  const equiv = lang === 'en' ? entree.termeFr : entree.equivalentEn;
  if (equiv && equiv.toLowerCase() !== titre.textContent.toLowerCase()) {
    const badgeEquiv = document.createElement('span');
    badgeEquiv.className = 'infobulle-glossaire__equiv';
    badgeEquiv.textContent = lang === 'en' ? `FR : ${equiv}` : `EN : ${equiv}`;
    entete.append(badgeEquiv);
  }

  const def = document.createElement('p');
  def.className = 'infobulle-glossaire__def';
  def.textContent = lang === 'en'
    ? (entree.definitionEn || entree.definitionFr || entree.definition || '')
    : (entree.definitionFr || entree.definition || '');

  bulle.append(entete, def);
}

function assurerBulle(cle, entree) {
  const id = obtenirIdInfobulle('glossaire', cle);
  let bulle = document.getElementById(id);

  if (!bulle) {
    bulle = document.createElement('div');
    bulle.id = id;
    bulle.setAttribute('popover', 'manual');
    bulle.setAttribute('role', 'tooltip');
    bulle.className = 'infobulle-glossaire';
    bulle.dataset.cle = cle;

    bulle.addEventListener('pointerenter', () => {
      if (!estTactile()) annulerTimers();
    });
    bulle.addEventListener('pointerleave', () => {
      if (!estTactile()) planifierFermeture();
    });
    bulle.addEventListener('focusin', () => {
      if (!estTactile()) annulerTimers();
    });
    bulle.addEventListener('focusout', (e) => {
      if (estTactile()) return;
      if (!bulle.contains(e.relatedTarget) && e.relatedTarget !== etat.declencheurActif) {
        planifierFermeture();
      }
    });

    document.body.append(bulle);
  }

  remplirContenuBulle(bulle, entree, langueActive());
  return bulle;
}

function installerEcouteursGlobaux() {
  if (etat.ecouteursGlobauxInstalles || typeof document === 'undefined') return;
  etat.ecouteursGlobauxInstalles = true;

  document.addEventListener('keydown', (e) => {
    if (!etat.bulleActive) return;

    if (e.key === 'Escape') {
      e.stopPropagation();
      fermerTout(true);
      return;
    }

    if (e.key === 'Tab') {
      const liens = [...etat.bulleActive.querySelectorAll('a[href]')];
      if (!liens.length) return;

      if (!e.shiftKey && document.activeElement === etat.declencheurActif) {
        e.preventDefault();
        liens[0].focus();
      } else if (e.shiftKey && document.activeElement === liens[0]) {
        e.preventDefault();
        etat.declencheurActif?.focus();
      } else if (!e.shiftKey && document.activeElement === liens[liens.length - 1]) {
        e.preventDefault();
        const decl = etat.declencheurActif;
        fermerTout(false);
        const focusables = obtenirFocusables();
        const idx = focusables.indexOf(decl);
        if (idx >= 0 && focusables[idx + 1]) {
          focusables[idx + 1].focus();
        }
      }
    }
  });

  document.addEventListener('pointerdown', (e) => {
    if (!etat.bulleActive) return;
    const cible = e.target;
    if (etat.bulleActive.contains(cible) || etat.declencheurActif?.contains(cible)) {
      return;
    }
    fermerTout(false);
  });

  const repositionner = () => {
    if (etat.bulleActive && etat.declencheurActif) {
      positionnerInfobulle(etat.declencheurActif, etat.bulleActive);
    }
  };

  window.addEventListener('scroll', repositionner, { capture: true, passive: true });
  window.addEventListener('resize', repositionner, { passive: true });

  document.addEventListener('forum:langchange', () => {
    fermerTout(false);
    if (etat.dictionnaireActif) {
      initialiserGlossaire(document, etat.dictionnaireActif);
    }
  });
}

function lierDeclencheur(btn, bulle) {
  if (btn.dataset.infobulleLiee === 'true') return;
  btn.dataset.infobulleLiee = 'true';

  if (estTactile()) {
    btn.removeAttribute('interestfor');
  }

  btn.addEventListener('pointerenter', (e) => {
    if (estTactile() || e.pointerType === 'touch') return;
    annulerTimers();
    const delai = etat.bulleActive ? 0 : 150;
    etat.timerOuverture = setTimeout(() => {
      ouvrir(btn, bulle);
    }, delai);
  });

  btn.addEventListener('pointerleave', (e) => {
    if (estTactile() || e.pointerType === 'touch') return;
    planifierFermeture();
  });

  btn.addEventListener('focusin', () => {
    if (estTactile() || etat.vientDeFermer) return;
    ouvrir(btn, bulle);
  });

  btn.addEventListener('focusout', (e) => {
    if (estTactile()) return;
    if (!bulle.contains(e.relatedTarget)) {
      planifierFermeture();
    }
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (etat.bulleActive === bulle && etat.declencheurActif === btn) {
      fermerTout(false);
    } else {
      ouvrir(btn, bulle);
    }
  });
}

export async function initialiserGlossaire(racine = document, dictionnaireGlossaire = null) {
  if (!racine) return;

  const declencheurs = [...racine.querySelectorAll('.terme-glossaire[data-terme]')];
  if (!declencheurs.length) return;

  const dict = dictionnaireGlossaire || (await chargerGlossaire());
  if (!dict) return;

  etat.dictionnaireActif = dict;
  installerEcouteursGlobaux();

  const bullesParCle = new Map();
  for (const btn of declencheurs) {
    const cle = btn.dataset.terme;
    const entree = dict[cle];
    if (!entree) continue;

    let bulle = bullesParCle.get(cle);
    if (!bulle) {
      bulle = assurerBulle(cle, entree);
      bullesParCle.set(cle, bulle);
    }
    lierDeclencheur(btn, bulle);
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const demarrer = () => initialiserGlossaire(document);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
}
