# Présentation du rapport patient — 12 septembre 2026

Le PDF est dessiné dans la page autonome `public/methode/visite/index.html`.
À chaque `npm run build`, `prepare-patient-report.mjs` injecte le bloc de rendu de
`patient-report-pastel.js` avant l’export Next.js. Pour travailler sur le HTML
sans build, lancer d’abord `node scripts/prepare-patient-report.mjs`.

Le questionnaire, les scores, les points des courbes, l’interpolation, la page
finale des trois moyennes et l’assemblage/téléchargement PDF restent dans le
fichier d’origine. Le script arrête le build si les limites du bloc changent.
Le nom de la clinique et sa maxime remplacent l’ancien symbole dans l’en-tête.

## Couleurs éditoriales (pas des seuils médicaux)

Écart absolu ressenti/clinique : 0–1 vert pâle, 2–3 ambre pâle, 4–10 rose pâle.
Une réponse inconnue reste neutre et n’est pas convertie en zéro.
Le texte explicite le sens de l’écart. Vert signifie accord, pas bonne santé.

Objectif moins clinique : 0 neutre (maintien), 1–2 bleu très léger,
3–4 bleu léger, 5–10 bleu plus soutenu. Une baisse reste neutre et porte
la mention « objectif ajusté », jamais « amélioration ». Ce sont des objectifs,
pas des garanties. Les curseurs fins et les notes restent visibles à droite.

La page des repères conserve les points du modèle. Les autres courbes sont
atténuées. Aucune valeur n’est extrapolée au-delà de 80 ans.

## Contrôles

Rendu Chromium des quatre pages avec données fictives et six cas limites :
âges 10, 80, 81 et 100 ans, réponses inconnues, scores 0/10 et 10/10,
maintien, progression et baisse d’objectif. Aucune erreur de dessin ni
sortie des marges détectée. Les courbes de référence restent inchangées.

Le déploiement vérifie que le HTML patient servi en HTTPS est identique au
fichier exporté avant de déclarer `PATIENT_REPORT_PASTEL_LIVE_OK`.
