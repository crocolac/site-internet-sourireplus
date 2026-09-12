    function makeReportPage(kicker, title, subtitle, pageNumber) {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1131;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Le dessin du rapport est indisponible.');
      ctx.fillStyle = pageNumber === 4 ? '#f6f6f4' : '#ffffff';
      ctx.fillRect(0, 0, 1600, 1131);
      // The three-note summary retains its original body, background and layout.
      if (pageNumber === 4) criteria.forEach((c, i) => {
        ctx.fillStyle = c.color;
        ctx.fillRect(i * 1600 / criteria.length, 0, Math.ceil(1600 / criteria.length), 12);
      });
      ctx.fillStyle = '#263d55';
      ctx.font = '400 21px Arial, sans-serif';
      ctx.fillText('Clinique', 80, 59);
      ctx.font = '400 43px Georgia, serif';
      ctx.fillText('SourirePlus', 80, 106);
      ctx.fillStyle = '#687c90';
      ctx.font = '500 15px Arial, sans-serif';
      ctx.fillText('PLUS QU’UN SOURIRE, UNE CONFIANCE DURABLE', 82, 132);
      ctx.textAlign = 'right';
      ctx.font = '600 18px Arial, sans-serif';
      ctx.fillText('LA MÉTHODE SOURIREPLUS', 1520, 77);
      ctx.font = '400 17px Arial, sans-serif';
      ctx.fillText(pageNumber + ' / 4', 1520, 108);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#6e7178';
      ctx.font = '700 17px Arial, sans-serif';
      ctx.fillText(kicker.toUpperCase(), 80, 177);
      ctx.fillStyle = '#101114';
      ctx.font = '700 50px Arial, sans-serif';
      drawWrappedText(ctx, title, 80, 235, 1440, 56, 1);
      ctx.fillStyle = '#66727d';
      ctx.font = '400 23px Arial, sans-serif';
      drawWrappedText(ctx, subtitle, 80, 281, 1440, 31, 2);
      ctx.strokeStyle = '#e1e6ea';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(80, 1064); ctx.lineTo(1520, 1064); ctx.stroke();
      ctx.font = '400 17px Arial, sans-serif';
      ctx.fillStyle = '#6e7178';
      ctx.fillText('Patient : ' + state.age + ' ans', 80, 1097);
      ctx.textAlign = 'right';
      ctx.fillText('Objectif clinique estimé - Méthode SourirePlus', 1520, 1097);
      ctx.textAlign = 'left';
      return {canvas: canvas, ctx: ctx};
    }

    // Editorial display bands only: these are NOT clinical severity thresholds.
    function patientReportGap(patient, clinical) {
      if (!Number.isFinite(patient) || !Number.isFinite(clinical))
        return {fill:'#f3f5f7', ink:'#5b6976', title:'Ressenti non renseigné', note:'Le dialogue permet de préciser votre perception.'};
      const gap = Math.abs(patient - clinical);
      const note = gap <= 1 ? 'Vos deux regards sont proches.'
        : patient > clinical ? 'Votre perception est plus favorable que le constat.'
        : 'Le constat est plus favorable que votre perception.';
      return gap <= 1 ? {fill:'#edf5ef', ink:'#426f52', title:'Des regards proches', note:note}
        : gap <= 3 ? {fill:'#fcf4e7', ink:'#876426', title:'Un écart à expliquer', note:note}
        : {fill:'#fbecee', ink:'#99545e', title:'Un décalage marqué', note:note};
    }

    function patientReportEffect(clinical, objective) {
      if (!Number.isFinite(clinical) || !Number.isFinite(objective))
        return {fill:'#f3f5f7', ink:'#5b6976', title:'Objectif à préciser', note:'L’objectif n’est pas encore renseigné.'};
      const delta = objective - clinical;
      if (delta === 0) return {fill:'#f3f5f7', ink:'#5b6976', title:'Préserver la situation', note:'Un objectif de maintien pour ce critère.'};
      if (delta < 0) return {fill:'#f3f5f7', ink:'#5b6976', title:'Un objectif ajusté', note:'Une évolution à expliquer avec le praticien.'};
      const label = delta <= 2 ? 'légère' : delta <= 4 ? 'modérée' : 'importante';
      return {fill:delta <= 2 ? '#f0f6fc' : delta <= 4 ? '#e5effb' : '#d6e6f9', ink:'#315f91',
        title:'Amélioration ' + label + ' attendue', note:'Un objectif estimé de +' + delta + ' point' + (delta === 1 ? '' : 's') + ' sur 10.'};
    }

    function patientReportMiniTrack(ctx, x, y, width, value, color, outline) {
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineWidth = 2; ctx.strokeStyle = '#c8d1d8';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + width, y); ctx.stroke();
      if (Number.isFinite(value)) {
        ctx.beginPath(); ctx.arc(x + width * Math.max(0, Math.min(10, value)) / 10, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = outline ? '#ffffff' : color; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
      }
      ctx.restore();
    }

    function patientReportRow(ctx, criterion, y, message, firstLabel, firstValue, secondLabel, secondValue, effect) {
      reportRoundRect(ctx, 80, y, 1440, 88, 16, message.fill);
      ctx.fillStyle = '#263d55'; ctx.font = '700 24px Arial, sans-serif';
      ctx.fillText(criterion.name, 112, y + 51);
      ctx.fillStyle = message.ink; ctx.font = '600 22px Arial, sans-serif';
      ctx.fillText(message.title, 425, y + 34);
      ctx.fillStyle = '#546572'; ctx.font = '400 18px Arial, sans-serif';
      drawWrappedText(ctx, message.note, 425, y + 59, 490, 22, 2);
      ctx.fillStyle = '#5e6e7b'; ctx.font = '400 17px Arial, sans-serif';
      ctx.fillText(firstLabel, 970, y + 33);
      ctx.fillText(secondLabel, 970, y + 64);
      patientReportMiniTrack(ctx, 1165, y + 27, 205, firstValue, '#66849b', true);
      patientReportMiniTrack(ctx, 1165, y + 58, 205, secondValue, effect ? '#426e9f' : '#627583', false);
      ctx.textAlign = 'right'; ctx.font = '400 18px Arial, sans-serif';
      ctx.fillText(Number.isFinite(firstValue) ? firstValue + '/10' : '—', 1487, y + 33);
      ctx.fillText(Number.isFinite(secondValue) ? secondValue + '/10' : '—', 1487, y + 64);
      ctx.textAlign = 'left';
    }

    function createComparisonReportPage() {
      const page = makeReportPage('1 - Ressenti et évaluation clinique',
        'Deux regards sur la situation actuelle',
        'Un écart n’est pas une erreur : il indique simplement ce qu’il faut expliquer ou examiner ensemble.', 1);
      const ctx = page.ctx;
      const labels = [ ['#edf5ef','Regards proches'], ['#fcf4e7','Écart à expliquer'], ['#fbecee','Décalage marqué'] ];
      labels.forEach((entry, index) => {
        const x = 80 + index * 270;
        reportRoundRect(ctx, x, 312, 18, 18, 5, entry[0]);
        ctx.fillStyle = '#657584'; ctx.font = '400 17px Arial, sans-serif';
        ctx.fillText(entry[1], x + 29, 327);
      });
      criteria.forEach((c, i) => patientReportRow(ctx, c, 352 + i * 108,
        patientReportGap(state.patient[c.id], state.clinician[c.id]),
        'Votre ressenti', state.patient[c.id], 'Observation clinique', state.clinician[c.id], false));
      ctx.fillStyle = '#66727d'; ctx.font = '400 18px Arial, sans-serif';
      ctx.fillText('La couleur décrit le décalage, pas l’état de santé. Les notes vont de 0 (très mauvais) à 10 (excellent).', 80, 1020);
      return page.canvas;
    }

    function drawPopulationReportChart(ctx, x0, y0, width, height, visibleCriteria) {
      reportRoundRect(ctx, x0, y0, width, height, 20, '#fafcfe');
      const margin = {left:66, right:32, top:78, bottom:65};
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;
      const xMax = state.age > 80 ? 100 : 80;
      const x = age => x0 + margin.left + (age - 10) / (xMax - 10) * innerW;
      const y = value => y0 + margin.top + innerH * (1 - value / 100);
      ctx.fillStyle = '#687b8b'; ctx.font = '400 17px Arial, sans-serif';
      ctx.fillText('Population concernée (%) · repères du modèle', x0 + 27, y0 + 34);
      [0, 50, 100].forEach(value => {
        ctx.strokeStyle = '#e5ebf0'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x(10), y(value)); ctx.lineTo(x(xMax), y(value)); ctx.stroke();
        ctx.textAlign = 'right'; ctx.fillStyle = '#7b8994';
        ctx.fillText(String(value), x(10) - 14, y(value) + 6);
      });
      const ages = xMax === 100 ? [10, 20, 40, 60, 80, 100] : [10, 20, 40, 60, 80];
      ctx.textAlign = 'center';
      ages.forEach(age => ctx.fillText(String(age), x(age), y0 + height - 35));
      ctx.font = '400 15px Arial, sans-serif';
      ctx.fillText('Âge (années)', x0 + width / 2, y0 + height - 11);
      if (xMax > 80) {
        ctx.fillStyle = '#f0f2f4'; ctx.fillRect(x(80), y(100), x(100) - x(80), innerH);
        ctx.fillStyle = '#73808c'; ctx.font = '400 14px Arial, sans-serif';
        ctx.fillText('Hors du modèle', (x(80) + x(100)) / 2, y(100) + 32);
      }
      const ids = new Set(visibleCriteria.map(c => c.id));
      // Use the existing reference points and interpolation, without extrapolation.
      const ordered = referenceSeries.slice().sort((a,b) => Number(ids.has(a.id)) - Number(ids.has(b.id)));
      ordered.forEach(series => {
        const active = ids.has(series.id);
        ctx.save(); ctx.strokeStyle = colorById[series.id]; ctx.globalAlpha = active ? .75 : .12;
        ctx.lineWidth = active ? 3.5 : 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
        series.points.forEach((point,i) => { if (i === 0) ctx.moveTo(x(point[0]), y(point[1])); else ctx.lineTo(x(point[0]), y(point[1])); });
        ctx.stroke(); ctx.restore();
      });
      ctx.save(); ctx.strokeStyle = '#7d8b99'; ctx.lineWidth = 1.5; ctx.setLineDash([5,7]);
      ctx.beginPath(); ctx.moveTo(x(state.age), y(100)); ctx.lineTo(x(state.age), y(0)); ctx.stroke(); ctx.restore();
      ordered.filter(s => ids.has(s.id)).forEach(series => {
        const value = interpolateSeries(series.points, state.age);
        if (value === null) return;
        ctx.beginPath(); ctx.arc(x(state.age), y(value), 6, 0, Math.PI * 2);
        ctx.fillStyle = colorById[series.id]; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#ffffff'; ctx.stroke();
      });
      const labelX = Math.max(x0 + 24, Math.min(x(state.age) - 79, x0 + width - 182));
      reportRoundRect(ctx, labelX, y0 + 42, 158, 28, 14, '#e9eff5');
      ctx.fillStyle = '#34536e'; ctx.font = '600 16px Arial, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Votre âge : ' + state.age + ' ans', labelX + 79, y0 + 62);
      ctx.textAlign = 'left';
    }

    function createPopulationReportPage() {
      const page = makeReportPage('2 - Repères de vie', 'Votre solution à ' + state.age + ' ans',
        'Des repères à votre âge, distincts de votre évaluation personnelle.', 2);
      const ctx = page.ctx;
      const changed = solutionCriteria();
      const visible = changed.length ? changed : criteria;
      reportRoundRect(ctx, 80, 322, 1440, 62, 16, '#f1f6fb');
      ctx.fillStyle = '#395873'; ctx.font = '600 22px Arial, sans-serif';
      ctx.fillText(changed.length ? 'La proposition fait évoluer ' + changed.length + ' critère' + (changed.length > 1 ? 's.' : '.')
        : 'La proposition conserve les objectifs actuels.', 107, 361);
      drawPopulationReportChart(ctx, 80, 410, 965, 550, visible);
      ctx.fillStyle = '#263d55'; ctx.font = '700 23px Arial, sans-serif';
      ctx.fillText('Vos repères en un regard', 1080, 436);
      visible.forEach((c, i) => {
        const y = 456 + i * 79;
        const series = referenceSeries.find(item => item.id === c.id);
        const value = series ? interpolateSeries(series.points, state.age) : null;
        reportRoundRect(ctx, 1080, y, 440, 65, 12, c.color + '0d');
        ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(1100, y + 23, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2e4559'; ctx.font = '600 20px Arial, sans-serif';
        ctx.fillText(c.name, 1117, y + 29);
        ctx.textAlign = 'right'; ctx.fillStyle = c.color; ctx.font = '700 24px Arial, sans-serif';
        ctx.fillText(value === null ? '—' : Math.round(value) + ' %', 1497, y + 29);
        ctx.textAlign = 'left'; ctx.fillStyle = '#637786'; ctx.font = '400 16px Arial, sans-serif';
        ctx.fillText(value === null ? 'Pas de valeur au-delà de 80 ans.' : 'Repère indicatif du modèle à ' + state.age + ' ans.', 1117, y + 51);
      });
      ctx.fillStyle = '#687b8b'; ctx.font = '400 16px Arial, sans-serif';
      ctx.fillText('Les autres courbes restent visibles en arrière-plan.', 80, 987);
      ctx.font = '400 18px Arial, sans-serif';
      ctx.fillText('Ces pourcentages sont des repères du modèle : ni une note personnelle, ni une probabilité individuelle.', 80, 1020);
      return page.canvas;
    }

    function createTreatmentReportPage() {
      const page = makeReportPage('3 - Avant et après le traitement', 'L’effet attendu de la solution',
        'Pour chaque critère, la situation actuelle est comparée à l’objectif estimé après traitement.', 3);
      const ctx = page.ctx;
      ctx.fillStyle = '#637786'; ctx.font = '400 17px Arial, sans-serif';
      ctx.fillText('Bleu plus soutenu : amélioration envisagée plus importante. Fond neutre : maintien ou objectif ajusté.', 80, 327);
      criteria.forEach((c, i) => patientReportRow(ctx, c, 352 + i * 108,
        patientReportEffect(state.clinician[c.id], state.objective[c.id]),
        'Situation actuelle', state.clinician[c.id], 'Objectif envisagé', state.objective[c.id], true));
      ctx.fillStyle = '#66727d'; ctx.font = '400 18px Arial, sans-serif';
      ctx.fillText('Il s’agit d’une amélioration estimée, pas d’une garantie de résultat. Les notes vont de 0 à 10.', 80, 1020);
      return page.canvas;
    }

