/**
 * Forum Habiter Ensemble — script.js
 * Intègre les meilleures pratiques de Modern Web Guidance :
 * - Validation accessible conforme (:user-invalid / aria-invalid sync / polite live-region)
 * - Navigation mobile réactive avec aria-expanded
 * - Bascule bilingue dynamique (FR / EN)
 * - Gestionnaire de soumission de formulaire d'intérêt avec récapitulatif & transmission
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. Navigation Mobile
     ========================================================================== */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      if (isExpanded) {
        navMenu.setAttribute('hidden', '');
      } else {
        navMenu.removeAttribute('hidden');
      }
    });

    // Fermer le menu lors d'un clic sur un lien
    navMenu.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 920) {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.setAttribute('hidden', '');
        }
      });
    });

    // Fermer le menu avec Escape et redonner le focus au bouton
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('hidden', '');
        navToggle.focus();
      }
    });
  }

  /* ==========================================================================
     2. Bascule Bilingue (FR / EN)
     ========================================================================== */
  const langButtons = document.querySelectorAll('.lang-btn');
  const i18nElements = document.querySelectorAll('[data-fr][data-en]');

  function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.title =
      lang === 'en'
        ? 'Living Together Forum — Coliving, Shared Housing, and Intentional Communities (Montreal, April 2027)'
        : 'Forum Habiter Ensemble — Coliving, habitat partagé et communautés intentionnelles (Montréal, Avril 2027)';

    langButtons.forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.setAttribute('aria-pressed', String(isActive));
    });

    i18nElements.forEach((el) => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        el.innerHTML = text;
      }
    });

    // Mettre à jour placeholders et aria-labels traduisibles
    document.querySelectorAll('[data-placeholder-fr][data-placeholder-en]').forEach((el) => {
      const placeholder = el.getAttribute(`data-placeholder-${lang}`);
      if (placeholder) el.placeholder = placeholder;
    });

    try {
      localStorage.setItem('forum_lang', lang);
    } catch (e) {
      /* ignore quota or private mode */
    }
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetLang = btn.dataset.lang || 'fr';
      setLanguage(targetLang);
    });
  });

  // Restaurer la langue préférée si existante
  try {
    const savedLang = localStorage.getItem('forum_lang');
    if (savedLang === 'en' || savedLang === 'fr') {
      setLanguage(savedLang);
    }
  } catch (e) {}

  /* ==========================================================================
     3. Modern Web Guidance : Accessibilité du Formulaire & Validation
     ========================================================================== */

  // Région live polie pour annonce des erreurs au lecteur d'écran
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.classList.add('visually-hidden');
  document.body.append(announcer);

  let announceTimer;
  let announcedField;

  const spokenText = (node) => {
    const copy = node.cloneNode(true);
    copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    copy.querySelectorAll('[role="img"][aria-label]').forEach((n) =>
      n.replaceWith(`${n.getAttribute('aria-label')}: `)
    );
    return copy.textContent.replace(/\s+/g, ' ').trim();
  };

  const linkError = (el, shown) => {
    const errorId = el.dataset.error;
    if (!errorId) return;
    const ids = (el.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== errorId);
    if (shown) ids.push(errorId);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  };

  const announceError = (el) => {
    const error = document.getElementById(el.dataset.error);
    if (!error) return;
    const label = el.labels?.[0] ? `${spokenText(el.labels[0])}: ` : '';
    clearTimeout(announceTimer);
    announcer.textContent = '';
    announcedField = el;
    announceTimer = setTimeout(() => {
      announcer.textContent = label + spokenText(error);
    }, 500);
  };

  const flagged = new WeakSet();
  const announced = new WeakSet();

  const syncAria = (el, announce = false) => {
    if (!el || !el.matches?.('input, select, textarea')) return;

    // Détection via :user-invalid ou fallback de validité
    let isInvalid = false;
    try {
      isInvalid = el.matches(':user-invalid');
    } catch (e) {
      isInvalid = !el.validity.valid;
    }

    if (isInvalid) {
      if (announce && !announced.has(el)) {
        announceError(el);
        announced.add(el);
      }
      el.setAttribute('aria-invalid', 'true');
      linkError(el, true);
      flagged.add(el);
    } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
      el.setAttribute('aria-invalid', 'false');
      linkError(el, false);
      flagged.delete(el);
      announced.delete(el);
      if (announcedField === el) {
        clearTimeout(announceTimer);
        announcer.textContent = '';
      }
    }
  };

  // Initialisation à aria-invalid="false"
  document.querySelectorAll('input, select, textarea').forEach((el) => {
    if (!el.hasAttribute('aria-invalid')) {
      el.setAttribute('aria-invalid', 'false');
    }
  });

  document.addEventListener('blur', (e) => syncAria(e.target, true), true);
  document.addEventListener('input', (e) => {
    if (e.target.hasAttribute?.('aria-invalid')) syncAria(e.target);
  });
  document.addEventListener('change', (e) => syncAria(e.target, true), true);
  document.addEventListener(
    'invalid',
    (e) => {
      announced.add(e.target);
      syncAria(e.target);
    },
    true
  );
  document.addEventListener(
    'reset',
    (e) => {
      setTimeout(() => {
        if (e.target && e.target.elements) {
          [...e.target.elements].forEach((el) => syncAria(el));
        }
      });
    },
    true
  );

  /* ==========================================================================
     4. Soumission du Formulaire d'Intérêt
     ========================================================================== */
  const interestForm = document.getElementById('interest-form');
  const errorSummary = document.getElementById('form-error-summary');
  const confirmationPanel = document.getElementById('submission-confirmation');
  const summaryBox = document.getElementById('submission-summary');
  const mailtoBtn = document.getElementById('btn-send-email');
  const googleFormBtn = document.getElementById('btn-open-gform');

  if (interestForm) {
    interestForm.addEventListener('submit', (event) => {
      event.preventDefault();

      // Vérification native des contraintes
      if (!interestForm.checkValidity()) {
        const firstInvalid = interestForm.querySelector(':invalid');
        if (errorSummary) {
          const currentLang = document.documentElement.lang || 'fr';
          errorSummary.textContent =
            currentLang === 'en'
              ? 'Please correct the highlighted fields before submitting.'
              : 'Veuillez corriger les champs en surbrillance avant de soumettre.';
          errorSummary.removeAttribute('hidden');
          errorSummary.focus();
        }
        if (firstInvalid) {
          firstInvalid.focus();
          syncAria(firstInvalid, true);
        }
        return;
      }

      // Masquer le résumé d'erreur si valide
      if (errorSummary) {
        errorSummary.setAttribute('hidden', '');
      }

      // Extraction des données du formulaire
      const formData = new FormData(interestForm);
      const data = {
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        org: formData.get('organization') || '',
        profile: formData.get('profile') || '',
        interests: formData.getAll('interests'),
        message: formData.get('message') || '',
        submittedAt: new Date().toLocaleString(),
      };

      const currentLang = document.documentElement.lang || 'fr';

      // Construction du résumé texte
      const summaryText =
        currentLang === 'en'
          ? `Interest Declaration — Forum Habiter Ensemble
--------------------------------------------------
Name: ${data.name}
Email: ${data.email}
Organization: ${data.org || 'Not specified'}
Profile: ${data.profile || 'General'}
Areas of Interest: ${data.interests.length ? data.interests.join(', ') : 'All topics'}
Message / Intent:
${data.message || '(None provided)'}
Timestamp: ${data.submittedAt}`
          : `Manifestation d'intérêt — Forum Habiter Ensemble
--------------------------------------------------
Nom : ${data.name}
Courriel : ${data.email}
Organisation : ${data.org || 'Non précisée'}
Profil : ${data.profile || 'Général'}
Intérêts / Axes : ${data.interests.length ? data.interests.join(', ') : 'Tous les axes'}
Message / Intention :
${data.message || '(Aucun message)'}
Date : ${data.submittedAt}`;

      if (summaryBox) {
        summaryBox.textContent = summaryText;
      }

      // Préparation du lien mailto avec encodage URI
      const subject = encodeURIComponent(
        `[Forum Habiter Ensemble] Intérêt de ${data.name} (${data.org || data.profile})`
      );
      const body = encodeURIComponent(summaryText);
      if (mailtoBtn) {
        mailtoBtn.href = `mailto:joindre@cohabitat.cc?subject=${subject}&body=${body}`;
      }

      // Lien vers le formulaire Google officiel
      const gformUrl =
        'https://docs.google.com/forms/d/e/1FAIpQLSeCC7mERRTYUYdhuAnY_ibB_ZfhlLiTbYmZ530u58NxoYLm1Q/viewform';
      if (googleFormBtn) {
        googleFormBtn.href = gformUrl;
      }

      // Afficher le panneau de confirmation
      if (confirmationPanel) {
        confirmationPanel.removeAttribute('hidden');
        confirmationPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        confirmationPanel.focus?.();
      }

      // Désactiver le bouton de soumission pour éviter les doubles clics
      const submitBtn = interestForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent =
          currentLang === 'en' ? 'Interest Registered ✓' : 'Intérêt Enregistré ✓';
      }
    });
  }
})();
