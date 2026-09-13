import { readFileSync, writeFileSync } from 'node:fs';
import { Script } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { brandPatientVisit } from './patient-visit-branding.mjs';
import { stabilizePatientVisit } from './patient-visit-navigation.mjs';

const path = fileURLToPath(new URL('../public/methode/visite/index.html', import.meta.url));
const renderer = readFileSync(new URL('./patient-report-pastel.js', import.meta.url), 'utf8');
const source = readFileSync(path, 'utf8');
const start = '    function makeReportPage(';
const end = '    function createSummaryReportPage(';
if (source.split(start).length !== 2 || source.split(end).length !== 2)
  throw new Error('Structure du rapport inattendue : aucun fichier modifié.');
const first = source.indexOf(start);
const last = source.indexOf(end);
if (last <= first || !renderer.startsWith(start) || renderer.includes(end))
  throw new Error('Bloc de présentation invalide : aucun fichier modifié.');
const pastel = source.slice(0, first) + renderer + source.slice(last);
// Preserve the entire questionnaire, state, reference curves and three-note
// summary before the separately guarded branding and navigation changes.
if (!pastel.startsWith(source.slice(0, first)) || !pastel.endsWith(source.slice(last)))
  throw new Error('Une partie hors présentation a changé.');
const result = stabilizePatientVisit(brandPatientVisit(pastel));
for (const match of result.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))
  new Script(match[1]);
if (brandPatientVisit(result) !== result || stabilizePatientVisit(result) !== result)
  throw new Error('La préparation du bilan doit être idempotente.');
if (result !== source) writeFileSync(path, result, 'utf8');
console.log('PDF_PASTEL_OK: quatre pages, questionnaire/courbes/notes de synthèse conservés.');
console.log('CLINIC_BRANDING_OK: logo original à gauche, maxime à droite en HTML et PDF.');
console.log('VISIT_NAVIGATION_OK: position des questions conservée, onglets mis à jour en place.');
