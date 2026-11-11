/**
 * Forum Habiter Ensemble — script.js
 * - Plan architectural interactif (coupe A-A')
 * - Navigation mobile réactive (aria-expanded + Escape)
 * - Bascule bilingue dynamique (FR / EN)
 * - Validation accessible (:user-invalid / aria-invalid sync / polite live-region)
 * - Génération de fiche d'intérêt (courriel, copie presse-papiers, Google Form)
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

    navMenu.querySelectorAll('.nav-links a, .btn').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 960) {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.setAttribute('hidden', '');
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('hidden', '');
        navToggle.focus();
      }
    });
  }

  /* ==========================================================================
     2. Plan Architectural Interactif (Hero Blueprint)
     ========================================================================== */
  const blueprintStatus = document.getElementById('blueprint-status');
  const planZones = document.querySelectorAll('.plan-zone');

  if (blueprintStatus && planZones.length) {
    const restoreDefaultCaption = () => {
      const lang = document.documentElement.lang || 'fr';
      const fallback = blueprintStatus.getAttribute(`data-${lang}`);
      if (fallback) blueprintStatus.textContent = fallback;
    };

    planZones.forEach((zone) => {
      zone.addEventListener('mouseenter', () => {
        const lang = document.documentElement.lang || 'fr';
        const desc = zone.getAttribute(`data-zone-${lang}`);
        if (desc) blueprintStatus.textContent = desc;
      });
      zone.addEventListener('mouseleave', restoreDefaultCaption);
    });
  }

  document.querySelectorAll('.plan-link[data-track-checkbox]').forEach((link) => {
    link.addEventListener('click', () => {
      const box = document.getElementById(link.dataset.trackCheckbox);
      if (box) box.checked = true;
    });
  });

  /* ==========================================================================
     3. Bascule Bilingue (FR / EN)
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

    document.querySelectorAll('[data-placeholder-fr][data-placeholder-en]').forEach((el) => {
      const placeholder = el.getAttribute(`data-placeholder-${lang}`);
      if (placeholder) el.placeholder = placeholder;
    });

    try {
      localStorage.setItem('forum_lang', lang);
    } catch (e) {
      /* ignore storage restrictions */
    }
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetLang = btn.dataset.lang || 'fr';
      setLanguage(targetLang);
    });
  });

  try {
    const savedLang = localStorage.getItem('forum_lang');
    if (savedLang === 'en' || savedLang === 'fr') {
      setLanguage(savedLang);
    }
  } catch (e) {}

  /* ==========================================================================
     4. Accessibilité du Formulaire & Validation après interaction
     ========================================================================== */
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
     5. Traitement de la Fiche d'Intérêt
     ========================================================================== */
  const interestForm = document.getElementById('interest-form');
  const errorSummary = document.getElementById('form-error-summary');
  const confirmationPanel = document.getElementById('submission-confirmation');
  const summaryBox = document.getElementById('submission-summary');
  const mailtoBtn = document.getElementById('btn-send-email');
  const copyBtn = document.getElementById('btn-copy-summary');

  if (interestForm) {
    interestForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!interestForm.checkValidity()) {
        const firstInvalid = interestForm.querySelector(':invalid');
        if (errorSummary) {
          const currentLang = document.documentElement.lang || 'fr';
          errorSummary.textContent =
            currentLang === 'en'
              ? '[!] Please complete the required fields highlighted below.'
              : '[!] Veuillez compléter les champs requis indiqués ci-dessous.';
          errorSummary.removeAttribute('hidden');
        }
        if (firstInvalid) {
          firstInvalid.setAttribute('aria-invalid', 'true');
          linkError(firstInvalid, true);
          firstInvalid.focus();
        }
        return;
      }

      if (errorSummary) {
        errorSummary.setAttribute('hidden', '');
      }

      const formData = new FormData(interestForm);
      const data = {
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        org: formData.get('organization') || '',
        profile: formData.get('profile') || '',
        interests: formData.getAll('interests'),
        message: formData.get('message') || '',
        submittedAt: new Date().toISOString().slice(0, 10),
      };

      const currentLang = document.documentElement.lang || 'fr';

      const summaryText =
        currentLang === 'en'
          ? `DOSSIER REF. FHE-2027 — FORUM HABITER ENSEMBLE
==================================================
Name         : ${data.name}
Email        : ${data.email}
Organization : ${data.org || 'Not specified'}
Profile      : ${data.profile}
Tracks       : ${data.interests.length ? data.interests.join(' | ') : 'General interest'}
--------------------------------------------------
Notes / Proposal:
${data.message || '(None)'}
Date         : ${data.submittedAt}`
          : `FICHE RÉF. FHE-2027 — FORUM HABITER ENSEMBLE
==================================================
Nom          : ${data.name}
Courriel     : ${data.email}
Organisation : ${data.org || 'Non précisée'}
Profil       : ${data.profile}
Chantiers    : ${data.interests.length ? data.interests.join(' | ') : 'Intérêt général'}
--------------------------------------------------
Attentes / Proposition :
${data.message || '(Aucune note)'}
Date         : ${data.submittedAt}`;

      if (summaryBox) {
        summaryBox.textContent = summaryText;
      }

      const subject = encodeURIComponent(
        `[Forum Habiter Ensemble 2027] Fiche d'intérêt — ${data.name} (${data.org || data.profile})`
      );
      const body = encodeURIComponent(summaryText);
      if (mailtoBtn) {
        mailtoBtn.href = `mailto:joindre@cohabitat.cc?subject=${subject}&body=${body}`;
      }

      if (confirmationPanel) {
        confirmationPanel.removeAttribute('hidden');
        confirmationPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        confirmationPanel.focus?.();
      }
    });
  }

  if (copyBtn && summaryBox) {
    copyBtn.addEventListener('click', async () => {
      const lang = document.documentElement.lang || 'fr';
      try {
        await navigator.clipboard.writeText(summaryBox.textContent || '');
        copyBtn.textContent = lang === 'en' ? 'Copied to clipboard [OK]' : 'Copié dans le presse-papiers [OK]';
      } catch (e) {
        copyBtn.textContent = lang === 'en' ? 'Select text above to copy' : 'Sélectionnez le texte ci-dessus';
      }
    });
  }
})();
