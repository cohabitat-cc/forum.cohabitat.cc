import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL_GLOSSAIRE_JSON, obtenirIdInfobulle } from '../js/infobulles.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML_PAGES = [
  'index.html',
  'professionnels.html',
  'communautes.html',
  'programme-et-coalition.html',
];

const glossairePath = fileURLToPath(URL_GLOSSAIRE_JSON);
const glossaire = JSON.parse(fs.readFileSync(glossairePath, 'utf8'));
const cssContent = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');

test('data/glossaire.json existe et respecte le schéma bilingue', () => {
  const cles = Object.keys(glossaire);
  assert.ok(cles.length >= 5, 'Le glossaire doit contenir au moins 5 termes.');

  for (const [cle, entree] of Object.entries(glossaire)) {
    assert.match(cle, /^[a-z0-9-]+$/, `Clé invalide (kebab-case sans accents requis) : ${cle}`);
    assert.ok(typeof entree.termeFr === 'string' && entree.termeFr.trim().length >= 3, `termeFr manquant pour ${cle}`);
    assert.ok(typeof entree.equivalentEn === 'string' && entree.equivalentEn.trim().length >= 3, `equivalentEn manquant pour ${cle}`);
    assert.ok(typeof entree.definitionFr === 'string' && entree.definitionFr.trim().length >= 25, `definitionFr trop courte pour ${cle}`);
    assert.ok(typeof entree.definitionEn === 'string' && entree.definitionEn.trim().length >= 25, `definitionEn trop courte pour ${cle}`);
  }
});

function extraireBoutonsGlossaire(html) {
  const boutons = [];
  const regex = /<button\b([^>]*\bclass=["'][^"']*\bterme-glossaire\b[^"']*["'][^>]*)>([\s\S]*?)<\/button>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    boutons.push({ attrs: m[1], texte: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(), index: m.index });
  }
  return boutons;
}

test('Cohérence HTML <-> JSON, attributs obligatoires et longueur des libellés', () => {
  let totalDeclencheurs = 0;

  for (const page of HTML_PAGES) {
    const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
    const boutons = extraireBoutonsGlossaire(html);
    totalDeclencheurs += boutons.length;

    for (const btn of boutons) {
      assert.match(btn.attrs, /\btype=["']button["']/i, `${page}: type="button" manquant sur "${btn.texte}"`);

      const dataTermeMatch = btn.attrs.match(/\bdata-terme=["']([^"']+)["']/i);
      assert.ok(dataTermeMatch, `${page}: data-terme manquant sur "${btn.texte}"`);
      const cle = dataTermeMatch[1];
      assert.ok(Object.hasOwn(glossaire, cle), `${page}: clé inconnue dans glossaire.json : "${cle}"`);

      const interestForMatch = btn.attrs.match(/\binterestfor=["']([^"']+)["']/i);
      assert.ok(interestForMatch, `${page}: interestfor manquant sur "${btn.texte}"`);
      assert.equal(
        interestForMatch[1],
        obtenirIdInfobulle('glossaire', cle),
        `${page}: interestfor incohérent pour "${cle}"`
      );

      assert.doesNotMatch(btn.attrs, /\btitle=/i, `${page}: attribut title interdit sur "${btn.texte}"`);
      assert.doesNotMatch(btn.attrs, /\baria-describedby=/i, `${page}: aria-describedby statique interdit sur "${btn.texte}"`);
      assert.doesNotMatch(btn.attrs, /\baria-details=/i, `${page}: aria-details statique interdit sur "${btn.texte}"`);

      assert.ok(
        btn.texte.length > 0 && btn.texte.length <= 45,
        `${page}: libellé "${btn.texte}" (${btn.texte.length} car.) doit faire <= 45 caractères`
      );
    }

    // Aucune imbrication interactive invalide (<button> dans <a>, <label> ou <button>)
    const interactiveContainers = [
      /<a\b[^>]*>(?:(?!<\/a>)[\s\S])*?<button\b[^>]*class=["'][^"']*\bterme-glossaire\b/i,
      /<label\b[^>]*>(?:(?!<\/label>)[\s\S])*?<button\b[^>]*class=["'][^"']*\bterme-glossaire\b/i,
      /<button\b(?![^>]*\bterme-glossaire\b)[^>]*>(?:(?!<\/button>)[\s\S])*?<button\b[^>]*class=["'][^"']*\bterme-glossaire\b/i,
    ];
    for (const pat of interactiveContainers) {
      assert.doesNotMatch(html, pat, `${page}: déclencheur <button> imbriqué dans un élément interactif interdit`);
    }
  }

  assert.ok(totalDeclencheurs >= 6, 'Au moins 6 déclencheurs de glossaire doivent être présents dans les pages HTML.');
});

test('Règles CSS critiques des infobulles accessibles présentes dans style.css', () => {
  assert.match(cssContent, /\.terme-glossaire\b/, 'Sélecteur .terme-glossaire manquant');
  assert.match(cssContent, /padding:\s*0;/, 'padding: 0 requis sur les déclencheurs en ligne');
  assert.match(cssContent, /text-decoration-line:\s*underline;/, 'Soulignement explicite requis sur .terme-glossaire');
  assert.match(cssContent, /\.infobulle-glossaire\b/, 'Sélecteur .infobulle-glossaire manquant');
  assert.match(cssContent, /transition-behavior:\s*allow-discrete;/, 'transition-behavior: allow-discrete requis');
  assert.match(cssContent, /@starting-style\b/, '@starting-style requis pour les transitions top-layer');
  assert.match(cssContent, /@media\s*\(forced-colors:\s*active\)/, 'Support forced-colors requis');
  assert.match(cssContent, /@media\s+print\b/, 'Support print requis pour masquer les infobulles');
});
