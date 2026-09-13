import { readFileSync } from 'node:fs';

const oldPdfBrand = `      ctx.fillStyle = '#263d55';
      ctx.font = '400 21px Arial, sans-serif';
      ctx.fillText('Clinique', 80, 59);
      ctx.font = '400 43px Georgia, serif';
      ctx.fillText('SourirePlus', 80, 106);
      ctx.fillStyle = '#687c90';
      ctx.font = '500 15px Arial, sans-serif';
      ctx.fillText('PLUS QU’UN SOURIRE, UNE CONFIANCE DURABLE', 82, 132);`;

const newPdfBrand = `      const clinicLogo = document.getElementById('visitClinicLogo');
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

const logoReady = `        const reportLogo = document.getElementById('visitClinicLogo');
        if (!reportLogo) throw new Error('Le logo de la clinique est indisponible.');
        await reportLogo.decode();
        if (!reportLogo.naturalWidth || !reportLogo.naturalHeight)
          throw new Error('Le logo de la clinique est invalide.');`;

const brandingCss = `
  <style id="visit-branding-css">
    .topbar { align-items: center; }
    .clinic-identity {
      display: flex; flex-direction: column; align-items: center;
      flex: 0 1 420px; gap: 12px; text-align: center;
    }
    .clinic-identity .brand { display: block; line-height: 0; letter-spacing: 0; }
    .clinic-brand-logo { display: block; width: 128px; height: auto; max-width: 100%; }
    .clinic-maxim {
      margin: 0; color: #526477; font-size: .96rem; line-height: 1.55;
      font-weight: 450; letter-spacing: 0;
    }
    .clinic-maxim span { display: block; }
    .topbar .top-note { text-align: center; line-height: 1.65; }
    .topbar .top-note strong { display: block; font-weight: 750; }
    @media (max-width: 820px) {
      .topbar { flex-direction: column; align-items: center; gap: 18px; }
      .clinic-identity { flex: none; width: 100%; }
      .clinic-brand-logo { width: 118px; }
      .clinic-maxim { font-size: .9rem; }
      .topbar .top-note { max-width: 100%; }
    }
  </style>`;

function replaceOnce(source, before, after, label) {
  if (source.includes(after) && !source.includes(before)) return source;
  if (source.split(before).length !== 2)
    throw new Error('Structure inattendue (' + label + ') : aucune publication.');
  return source.replace(before, after);
}

/** Only changes the visit header and the common PDF masthead. */
export function brandPatientVisit(source, logoBytes = readFileSync(
  new URL('../public/images/logo-sourireplus-original.png', import.meta.url)
)) {
  if (!Buffer.isBuffer(logoBytes) || logoBytes.length < 24 ||
      logoBytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')
    throw new Error('Le fichier original du logo doit être une image PNG.');
  const width = logoBytes.readUInt32BE(16);
  const height = logoBytes.readUInt32BE(20);
  if (!width || !height) throw new Error('Dimensions du logo invalides.');

  // Embed the existing original image unchanged. No remote request, image
  // recreation or cross-origin canvas dependency is introduced into the visit.
  const dataUri = 'data:image/png;base64,' + logoBytes.toString('base64');
  const header = `    <header class="topbar">
      <div class="clinic-identity">
        <a class="brand" href="#" id="brandLink" aria-label="Revenir au début">
          <img class="clinic-brand-logo" id="visitClinicLogo" src="${dataUri}" width="${width}" height="${height}" alt="Sourire Plus — Clinique dentaire — Neuchâtel" decoding="async" fetchpriority="high">
        </a>
        <p class="clinic-maxim"><span>Votre ressenti face à la réalité,</span><span>notre expertise pour votre tranquillité.</span></p>
      </div>
      <span class="top-note"><strong>La Méthode SourirePlus</strong>Ressenti · Évaluation clinique · Repères de vie · Objectif</span>
    </header>`;
  const headers = source.match(/    <header class="topbar">[\s\S]*?    <\/header>/g);
  if (!headers || headers.length !== 1)
    throw new Error('En-tête du bilan introuvable ou ambigu.');
  let result = source.replace(headers[0], header);
  result = result.replace(/\n  <style id="visit-branding-css">[\s\S]*?<\/style>/g, '');
  result = replaceOnce(result, '\n</head>', brandingCss + '\n</head>', 'style');
  result = replaceOnce(result, oldPdfBrand, newPdfBrand, 'logo du rapport');
  const fontsReady = '        if (document.fonts && document.fonts.ready) await document.fonts.ready;';
  result = replaceOnce(result, fontsReady + '\n        const pages = [',
    fontsReady + '\n' + logoReady + '\n        const pages = [', 'chargement du logo');

  const summary = /    function createSummaryReportPage\([\s\S]*?(?=    function textBytes\()/;
  if (!source.match(summary) || source.match(summary)[0] !== result.match(summary)?.[0])
    throw new Error('La synthèse à trois notes a changé.');
  return result;
}
