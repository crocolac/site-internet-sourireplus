/* Présentation du rapport PDF uniquement — 12 septembre 2026.
 * Partage les données et utilitaires du script classique de visite/index.html.
 * Ne modifie ni les réponses, ni les calculs, ni les écrans de consultation,
 * ni makeReportPage / createSummaryReportPage (titres et dernière page).
 */

// Seuils de présentation sur l'échelle 0–10, non seuils diagnostiques.
function reportGapStyle(patient, clinical) {
  if (!Number.isFinite(patient) || !Number.isFinite(clinical)) {
    return { fill: '#f0f2f4', ink: '#53616d', label: 'Ressenti à préciser', detail: 'Aucun décalage calculé sans deux notes.' };
  }
  const gap = Math.abs(patient - clinical);
  const detail = gap === 0 ? 'Votre ressenti rejoint le constat clinique.'
    : clinical > patient ? 'Le constat est plus favorable que votre ressenti.'
    : 'Le constat est moins favorable que votre ressenti.';
  if (gap <= 1) return { fill: '#eaf5ee', ink: '#38634a', label: 'Regards proches', detail: detail };
  if (gap <= 3) return { fill: '#fff3df', ink: '#805d22', label: 'Un écart à éclaircir', detail: detail };
  return { fill: '#fbeae8', ink: '#8b4842', label: 'Un décalage important', detail: detail };
}

function reportGainStyle(clinical, objective) {
  if (!Number.isFinite(clinical) || !Number.isFinite(objective)) {
    return { fill: '#f0f2f4', ink: '#53616d', label: 'Objectif à préciser', detail: 'La comparaison sera possible avec deux notes.' };
  }
  const delta = objective - clinical;
  const points = Math.abs(delta) + ' point' + (Math.abs(delta) === 1 ? '' : 's') + ' sur 10';
  if (delta < 0) return { fill: '#fff3df', ink: '#805d22', label: 'Objectif inférieur au constat', detail: 'Évolution estimée : −' + points + '.' };
  if (delta === 0) return { fill: '#f0f2f4', ink: '#53616d', label: 'À préserver', detail: 'Maintien du niveau actuel dans la projection.' };
  const detail = 'Gain estimé : +' + points + '.';
  if (delta <= 2) return { fill: '#eff5fd', ink: '#365f8d', label: 'Amélioration attendue', detail: detail };
  if (delta <= 4) return { fill: '#e2edfc', ink: '#305988', label: 'Amélioration nette attendue', detail: detail };
  return { fill: '#d3e4fa', ink: '#284f7d', label: 'Amélioration importante attendue', detail: detail };
}

function reportDetailScore(value) {
  return Number.isFinite(value) ? value + '/10' : 'Non renseigné';
}

function drawReportTrack(ctx, x, y, width, patient, clinical, objective) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#aeb9c3';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.stroke();
  ctx.fillStyle = '#68747f';
  ctx.font = '400 14px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('0', x - 3, y + 26);
  ctx.textAlign = 'right';
  ctx.fillText('10', x + width + 5, y + 26);
  if (Number.isFinite(patient)) {
    ctx.beginPath();
    ctx.arc(x + width * Math.max(0, Math.min(10, patient)) / 10, y - 7, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#557895';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (Number.isFinite(clinical)) {
    ctx.save();
    ctx.translate(x + width * Math.max(0, Math.min(10, clinical)) / 10, y + 7);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#606c77';
    ctx.fillRect(-3.5, -3.5, 7, 7);
    ctx.restore();
  }
  if (Number.isFinite(objective)) {
    ctx.beginPath();
    ctx.arc(x + width * Math.max(0, Math.min(10, objective)) / 10, y - 7, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#547fa8';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawReportResultRow(ctx, criterion, y, style, patient, clinical, objective, treatment) {
  ctx.save();
  reportRoundRect(ctx, 80, y, 1440, 92, 18, style.fill);
  ctx.fillStyle = criterion.color;
  ctx.beginPath();
  ctx.arc(111, y + 46, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#20272f';
  ctx.font = '700 24px Arial, sans-serif';
  ctx.fillText(criterion.name, 134, y + 53);
  ctx.fillStyle = style.ink;
  ctx.font = '700 21px Arial, sans-serif';
  ctx.fillText(style.label, 465, y + 38);
  ctx.fillStyle = '#525f6a';
  ctx.font = '400 17px Arial, sans-serif';
  drawWrappedText(ctx, style.detail, 465, y + 66, 510, 20, 1);
  drawReportTrack(ctx, 1020, y + 43, 185, treatment ? null : patient, clinical, treatment ? objective : null);
  ctx.fillStyle = '#526574';
  ctx.font = '400 17px Arial, sans-serif';
  const patientValue = patient === 'unknown' ? 'Je ne sais pas' : reportDetailScore(patient);
  ctx.fillText(treatment ? 'Clinique ' + reportDetailScore(clinical) : 'Ressenti ' + patientValue, 1250, y + 36);
  ctx.fillStyle = '#52606d';
  ctx.fillText(treatment ? 'Objectif ' + reportDetailScore(objective) : 'Clinique ' + reportDetailScore(clinical), 1250, y + 63);
  ctx.restore();
}

function createComparisonReportPage() {
  const page = makeReportPage(
    '1 - Ressenti et évaluation clinique',
    'Deux regards sur la situation actuelle',
    'Un écart n’est pas une erreur : il indique simplement ce qu’il faut expliquer ou examiner ensemble.',
    1
  );
  const ctx = page.ctx;
  criteria.forEach((criterion, index) => {
    const patient = state.patient[criterion.id];
    const clinical = state.clinician[criterion.id];
    drawReportResultRow(ctx, criterion, 330 + index * 113, reportGapStyle(patient, clinical), patient, clinical, null, false);
  });
  ctx.fillStyle = '#606b76';
  ctx.font = '400 17px Arial, sans-serif';
  ctx.fillText('La couleur décrit le décalage entre les deux regards, pas l’état de santé.', 80, 1030);
  ctx.textAlign = 'right';
  ctx.fillText('Détail : ○ ressenti · ◆ clinique · notes sur 10', 1520, 1030);
  ctx.textAlign = 'left';
  return page.canvas;
}

function drawPopulationReportChart(ctx, x0, y0, width, height, visibleCriteria) {
  ctx.save();
  reportRoundRect(ctx, x0, y0, width, height, 20, '#ffffff');
  const margin = {left: 64, right: 38, top: 82, bottom: 84};
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const xMax = state.age > 80 ? 100 : 80;
  const x = age => x0 + margin.left + ((age - 10) / (xMax - 10)) * innerW;
  const y = value => y0 + margin.top + innerH - value / 100 * innerH;
  const ids = new Set(visibleCriteria.map(item => item.id));
  ctx.textAlign = 'left';
  ctx.fillStyle = '#626c77';
  ctx.font = '400 17px Arial, sans-serif';
  ctx.fillText('Population concernée (%)', x0 + 26, y0 + 34);
  [0, 50, 100].forEach(value => {
    ctx.strokeStyle = '#edf0f3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x(10), y(value));
    ctx.lineTo(x(xMax), y(value));
    ctx.stroke();
    ctx.fillStyle = '#727c86';
    ctx.font = '400 15px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(value), x(10) - 13, y(value) + 5);
  });
  const ages = xMax === 80 ? [10, 30, 50, 70, 80] : [10, 30, 50, 70, 80, 100];
  ages.forEach(age => {
    ctx.fillStyle = '#727c86';
    ctx.textAlign = 'center';
    ctx.fillText(String(age), x(age), y0 + height - 57);
  });
  ctx.textAlign = 'right';
  ctx.fillText('Âge (ans)', x0 + width - 24, y0 + 34);
  const markerAge = Math.max(10, Math.min(state.age, xMax));
  const bandLeft = Math.max(x(10), x(markerAge) - 10);
  ctx.fillStyle = '#eff3f7';
  ctx.fillRect(bandLeft, y0 + margin.top, Math.max(0, Math.min(20, x(xMax) - bandLeft)), innerH);
  ctx.strokeStyle = '#5c6d7b';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 7]);
  ctx.beginPath();
  ctx.moveTo(x(markerAge), y0 + margin.top - 6);
  ctx.lineTo(x(markerAge), y0 + height - margin.bottom);
  ctx.stroke();
  ctx.setLineDash([]);
  // Les autres domaines restent présents, mais en arrière-plan.
  const ordered = referenceSeries.slice().sort((a, b) => Number(ids.has(a.id)) - Number(ids.has(b.id)));
  ordered.forEach(series => {
    const active = ids.has(series.id);
    ctx.strokeStyle = colorById[series.id];
    ctx.lineWidth = active ? 4 : 2;
    ctx.globalAlpha = active ? .8 : .15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    series.points.filter(point => point[0] <= xMax).forEach((point, index) => {
      if (index === 0) ctx.moveTo(x(point[0]), y(point[1]));
      else ctx.lineTo(x(point[0]), y(point[1]));
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
    const value = interpolateSeries(series.points, state.age);
    if (active && value !== null) {
      ctx.beginPath();
      ctx.arc(x(state.age), y(value), 6, 0, Math.PI * 2);
      ctx.fillStyle = colorById[series.id];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
  const labelLeft = Math.max(x(10), Math.min(x(markerAge) - 54, x(xMax) - 108));
  reportRoundRect(ctx, labelLeft, y0 + 42, 108, 30, 15, '#334c62');
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 16px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.age + ' ans', labelLeft + 54, y0 + 63);
  // Légende compacte : tous les noms restent lisibles, même sans traitement.
  criteria.forEach((criterion, index) => {
    const lx = x0 + 28 + index * (width - 44) / 6;
    ctx.fillStyle = criterion.color;
    ctx.globalAlpha = ids.has(criterion.id) ? .8 : .35;
    ctx.fillRect(lx, y0 + height - 30, 14, 3);
    ctx.globalAlpha = 1;
    ctx.fillStyle = ids.has(criterion.id) ? '#505c68' : '#77818a';
    ctx.font = '400 15px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(criterion.name, lx + 21, y0 + height - 24);
  });
  ctx.restore();
}

function createPopulationReportPage() {
  const page = makeReportPage(
    '2 - Repères de vie',
    'Votre solution à ' + state.age + ' ans',
    'Les courbes montrent à quel point les prises en charge proposées sont fréquentes au même âge.',
    2
  );
  const ctx = page.ctx;
  const changed = solutionCriteria();
  let chartTop = 478;
  if (!changed.length) {
    reportRoundRect(ctx, 80, 330, 1440, 112, 18, '#ffffff');
    ctx.fillStyle = '#293846';
    ctx.font = '700 24px Arial, sans-serif';
    ctx.fillText('Aucun changement de note proposé', 106, 373);
    ctx.fillStyle = '#63707b';
    ctx.font = '400 19px Arial, sans-serif';
    ctx.fillText('Les six courbes restent visibles comme repères généraux liés à l’âge.', 106, 409);
  } else {
    const columns = Math.min(3, changed.length);
    const cardWidth = (1440 - (columns - 1) * 18) / columns;
    const rows = Math.ceil(changed.length / columns);
    changed.forEach((criterion, index) => {
      const left = 80 + (index % columns) * (cardWidth + 18);
      const top = 330 + Math.floor(index / columns) * 126;
      const series = referenceSeries.find(item => item.id === criterion.id);
      const value = series ? interpolateSeries(series.points, state.age) : null;
      reportRoundRect(ctx, left, top, cardWidth, 110, 18, '#ffffff');
      ctx.fillStyle = criterion.color;
      ctx.beginPath();
      ctx.arc(left + 26, top + 29, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#29323b';
      ctx.font = '700 22px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(criterion.name, left + 42, top + 37);
      ctx.fillStyle = '#66727d';
      ctx.font = '400 17px Arial, sans-serif';
      ctx.fillText(value === null ? 'Repère disponible jusqu’à 80 ans' : 'Repère de population à votre âge', left + 24, top + 80);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#31485c';
      ctx.font = '700 34px Arial, sans-serif';
      ctx.fillText(value === null ? '—' : '≈ ' + Math.round(value) + ' %', left + cardWidth - 24, top + 82);
      ctx.textAlign = 'left';
    });
    chartTop = 330 + rows * 126 + 16;
  }
  drawPopulationReportChart(ctx, 80, chartTop, 1440, 1000 - chartTop, changed.length ? changed : criteria);
  ctx.fillStyle = '#606b76';
  ctx.font = '400 17px Arial, sans-serif';
  ctx.fillText('Repères du modèle SourirePlus : population concernée, et non votre note personnelle.', 80, 1030);
  return page.canvas;
}

function createTreatmentReportPage() {
  const page = makeReportPage(
    '3 - Avant et après le traitement',
    'L’effet attendu de la solution',
    'Pour chaque critère, la situation actuelle est comparée à l’objectif estimé après traitement.',
    3
  );
  const ctx = page.ctx;
  criteria.forEach((criterion, index) => {
    const clinical = state.clinician[criterion.id];
    const objective = state.objective[criterion.id];
    drawReportResultRow(ctx, criterion, 330 + index * 113, reportGainStyle(clinical, objective), null, clinical, objective, true);
  });
  ctx.fillStyle = '#606b76';
  ctx.font = '400 17px Arial, sans-serif';
  ctx.fillText('Le bleu indique l’amélioration estimée. Il ne garantit pas le résultat du traitement.', 80, 1030);
  ctx.textAlign = 'right';
  ctx.fillText('Détail : ◆ clinique · ● objectif · notes sur 10', 1520, 1030);
  ctx.textAlign = 'left';
  return page.canvas;
}
