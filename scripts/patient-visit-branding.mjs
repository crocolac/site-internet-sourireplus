import { readFileSync } from 'node:fs';

const oldPdfBrand = `      ctx.fillStyle = '#263d55';
      ctx.font = '400 21px Arial, sans-serif';
      ctx.fillText('Clinique', 80, 59);
      ctx.font = '400 43px Georgia, serif';
      ctx.fillText('SourirePlus', 80, 106);
      ctx.fillStyle = '#687c90';
      ctx.font = '500 15px Arial, sans-serif';
      ctx.fillText('PLUS QU’UN SOURIRE, UNE CONFIANCE DURABLE', 82, 132);`;

const centeredPdfBrand = `      const clinicLogo = document.getElementById('visitClinicLogo');
      if (!clinicLogo || !clinicLogo.complete || !clinicLogo.naturalWidth)
        throw new Error('Le logo de la clinique n’est pas prêt.');
      const logoHeight = 104;
      const logoWidth = logoHeight * clinicLogo.naturalWidth / clinicLogo.naturalHeight;
      ctx.save();
      ctx.drawImage(clinicLogo, 330 - logoWidth / 2, 18, logoWidth, logoHeight);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#526477';
      ctx.font = '400 17px Arial, sans-serif';
      ctx.fillText('Votre ressenti face à la réalité,', 330, 139);
      ctx.fillText('notre expertise pour votre tranquillité.', 330, 160);
      ctx.restore();
      ctx.fillStyle = '#687c90';`;

const newPdfBrand = `      const clinicLogo = document.getElementById('visitClinicLogo');
      if (!clinicLogo || !clinicLogo.complete || !clinicLogo.naturalWidth)
        throw new Error('Le logo de la clinique n’est pas prêt.');
      const logoHeight = 120;
      const logoWidth = logoHeight * clinicLogo.naturalWidth / clinicLogo.naturalHeight;
      ctx.save();
      ctx.drawImage(clinicLogo, 80, 25, logoWidth, logoHeight);
      ctx.strokeStyle = '#c7cbce';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(228, 43); ctx.lineTo(228, 130); ctx.stroke();
      ctx.textAlign = 'left';
      ctx.fillStyle = '#424a52';
      ctx.font = '400 30px Arial, sans-serif';
      ctx.fillText('Votre ressenti, la réalité,', 254, 76);
      ctx.fillText('notre expertise, la sérénité', 254, 116);
      ctx.restore();
      ctx.fillStyle = '#687c90';`;

const logoReady = `        const reportLogo = document.getElementById('visitClinicLogo');
        if (!reportLogo) throw new Error('Le logo de la clinique est indisponible.');
        await reportLogo.decode();
        if (!reportLogo.naturalWidth || !reportLogo.naturalHeight)
          throw new Error('Le logo de la clinique est invalide.');`;

const brandingCss = `
  <style id="visit-branding-css">
    .topbar { align-items: center; }
    .clinic-identity {
      display: flex; flex-direction: row; align-items: center;
      flex: 1 1 auto; min-width: 0; gap: 26px; text-align: left;
    }
    .clinic-identity .brand {
      display: block; flex: 0 0 auto; line-height: 0; letter-spacing: 0;
    }
    .clinic-brand-logo { display: block; width: 128px; height: auto; max-width: 100%; }
    .clinic-maxim {
      margin: 0; min-width: 0; padding: 10px 0 10px 26px;
      border-left: 1px solid #c7cbce; color: #424a52;
      font-size: clamp(1.05rem, 2vw, 1.5rem); line-height: 1.6;
      font-weight: 400; letter-spacing: 0;
    }
    .clinic-maxim span { display: block; }
    .topbar .top-note { flex: 0 1 330px; text-align: center; line-height: 1.65; }
    .topbar .top-note strong { display: block; font-weight: 750; }
    @media (max-width: 820px) {
      .topbar { flex-direction: column; align-items: stretch; gap: 18px; }
      .clinic-identity { flex: none; width: 100%; }
      .clinic-brand-logo { width: 118px; }
      .clinic-maxim { font-size: clamp(1rem, 2.9vw, 1.3rem); }
      .topbar .top-note { flex: none; max-width: 100%; }
    }
    @media (max-width: 540px) {
      .clinic-identity { gap: 14px; }
      .clinic-brand-logo { width: 88px; }
      .clinic-maxim { padding-left: 14px; font-size: clamp(.9rem, 3.3vw, 1.08rem); }
    }
    @media print {
      .topbar { display: flex !important; flex-direction: row; break-inside: avoid; }
      .clinic-identity { flex: 1 1 auto; width: auto; }
      .clinic-brand-logo { width: 100px; }
      .clinic-maxim { font-size: 15px; }
      .topbar .top-note { flex: 0 1 250px; font-size: 11px; }
    }
  </style>`;

function replaceOnce(source, before, after, label) {
  if (source.includes(after) && !source.includes(before)) return source;
  if (source.split(before).length !== 2)
    throw new Error('Structure inattendue (' + label + ') : aucune publication.');
  return source.replace(before, after);
}

/** Original PNG on the left, selectable HTML maxim / common PDF masthead on the right. */
export function brandPatientVisit(source, logoBytes = readFileSync(
  new URL('../public/images/logo-sourireplus-original.png', import.meta.url)
)) {
  if (!Buffer.isBuffer(logoBytes) || logoBytes.length < 24 ||
      logoBytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')
    throw new Error('Le fichier original du logo doit être une image PNG.');
  const width = logoBytes.readUInt32BE(16);
  const height = logoBytes.readUInt32BE(20);
  if (!width || !height) throw new Error('Dimensions du logo invalides.');
  const dataUri = 'data:image/png;base64,' + logoBytes.toString('base64');
  const header = `    <header class="topbar">
      <div class="clinic-identity">
        <a class="brand" href="#" id="brandLink" aria-label="Revenir au début">
          <img class="clinic-brand-logo" id="visitClinicLogo" src="${dataUri}" width="${width}" height="${height}" alt="Sourire Plus — Clinique dentaire — Neuchâtel" decoding="async" fetchpriority="high">
        </a>
        <p class="clinic-maxim"><span>Votre ressenti, la réalité,</span><span>notre expertise, la sérénité</span></p>
      </div>
      <span class="top-note"><strong>La Méthode SourirePlus</strong>Ressenti · Évaluation clinique · Repères de vie · Objectif</span>
    </header>`;
  const headers = source.match(/    <header class="topbar">[\s\S]*?    <\/header>/g);
  if (!headers || headers.length !== 1)
    throw new Error('En-tête du bilan introuvable ou ambigu.');
  let result = source.replace(headers[0], header);
  result = result.replace(/\n  <style id="visit-branding-css">[\s\S]*?<\/style>/g, '');
  result = replaceOnce(result, '\n</head>', brandingCss + '\n</head>', 'style');
  const previousPdfBrand = result.includes(centeredPdfBrand) ? centeredPdfBrand : oldPdfBrand;
  result = replaceOnce(result, previousPdfBrand, newPdfBrand, 'logo du rapport');
  const fontsReady = '        if (document.fonts && document.fonts.ready) await document.fonts.ready;';
  result = replaceOnce(result, fontsReady + '\n        const pages = [',
    fontsReady + '\n' + logoReady + '\n        const pages = [', 'chargement du logo');
  const summary = /    function createSummaryReportPage\([\s\S]*?(?=    function textBytes\()/;
  if (!source.match(summary) || source.match(summary)[0] !== result.match(summary)?.[0])
    throw new Error('La synthèse à trois notes a changé.');
  return result;
}
