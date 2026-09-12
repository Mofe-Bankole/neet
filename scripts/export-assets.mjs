import { readFile, mkdir, writeFile } from 'node:fs/promises';
const tokens = JSON.parse(await readFile('src/design/tokens.json', 'utf8')).cssVariables;
if (Object.keys(tokens).length < 26)
  throw new Error('Run npm run tokens:export before exporting assets.');
const out = 'public/assets/templates';
await mkdir(out, { recursive: true });
const escape = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
function label(text, x, y, size = 34, color = tokens['--text-primary'], weight = 400) {
  return (
    '<text x="' +
    x +
    '" y="' +
    y +
    '" font-size="' +
    size +
    '" fill="' +
    color +
    '" font-weight="' +
    weight +
    '">' +
    escape(text) +
    '</text>'
  );
}
function words(lines, x, y, size = 88, color = tokens['--text-primary']) {
  return lines.map((line, i) => label(line, x, y + i * size * 1.14, size, color, 700)).join('');
}
function svg(title, content, { light = false, width = 1920, height = 1080 } = {}) {
  const ink = light ? tokens['--text-paper'] : tokens['--text-primary'];
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    width +
    '" height="' +
    height +
    '" viewBox="0 0 ' +
    width +
    ' ' +
    height +
    '" role="img" aria-labelledby="title"><title id="title">' +
    escape(title) +
    '</title><rect width="100%" height="100%" fill="' +
    tokens[light ? '--surface-paper' : '--surface-base'] +
    '"/><g font-family="' +
    escape(tokens['--font-body']) +
    '">' +
    label('.neet', 96, 126, 64, ink, 700) +
    content +
    label(
      'DOTNEET · INDEPENDENT PRODUCT USING NIMIQ',
      96,
      height - 64,
      22,
      light ? tokens['--text-paper-secondary'] : tokens['--text-secondary'],
    ) +
    '</g></svg>'
  );
}
const lime = tokens['--action-primary'],
  muted = tokens['--text-secondary'],
  ink = tokens['--text-paper'],
  paper = tokens['--surface-paper'];
const templates = {
  '01-title-slide.svg': svg(
    'Dotneet presentation title template',
    words(['Get paid.', 'Keep the proof.'], 96, 370, 132) +
      label('A home for useful contributions, paid in NIM.', 102, 758, 42, muted),
  ),
  '02-problem-slide.svg': svg(
    'Problem slide template',
    label('THE PROBLEM', 100, 256, 28, lime) +
      words(['Good work gets lost', 'in the conversation.'], 96, 410, 102) +
      label('Testing. Translation. Feedback. Documentation.', 102, 738, 42, muted) +
      label('Recognition should remain inspectable after the chat moves on.', 102, 812, 34, muted),
  ),
  '03-solution-slide.svg': svg(
    'Solution slide template',
    words(['Make the contribution', 'a record you can share.'], 96, 300, 86) +
      ['Claim a .neet name', 'Pay and acknowledge', 'Choose what to publish']
        .map(
          (s, i) =>
            '<line x1="' +
            (96 + i * 600) +
            '" x2="' +
            (600 + i * 600) +
            '" y1="580" y2="580" stroke="' +
            muted +
            '"/>' +
            label('0' + (i + 1), 96 + i * 600, 645, 28, lime) +
            label(s, 96 + i * 600, 738, 36),
        )
        .join(''),
  ),
  '04-demo-slide.svg': svg(
    'Product demonstration slide template',
    words(['Show the real flow.'], 96, 280, 86) +
      '<rect x="96" y="366" width="1130" height="520" rx="14" fill="' +
      tokens['--surface-panel'] +
      '" stroke="' +
      tokens['--border-control'] +
      '"/>' +
      label('Insert a real device capture here.', 170, 616, 42, muted) +
      label('Keep network and status labels visible.', 170, 680, 30, muted) +
      label('1. Payment approval', 1320, 448, 34) +
      label('2. Signature approval', 1320, 552, 34) +
      label('3. Publication choice', 1320, 656, 34) +
      label('No device evidence supplied in this template.', 1320, 830, 22, muted),
  ),
  '05-evidence-slide.svg': svg(
    'Illustrative evidence slide template',
    label('ILLUSTRATIVE SAMPLE · NO PAYMENT WAS SENT', 96, 246, 26, ink) +
      words(['Open the record.'], 96, 384, 106, ink) +
      '<rect x="1020" y="280" width="780" height="560" rx="14" fill="white" stroke="#B6BFCC"/>' +
      label('ada.neet · fictional contributor', 1080, 382, 44, ink, 700) +
      label('Mobile usability testing', 1080, 468, 34, ink) +
      label('Acknowledged by mika.neet · fictional', 1080, 542, 28, ink) +
      label('50.00 NIM · example amount', 1080, 662, 44, ink) +
      label('No signature or transaction has been verified.', 1080, 760, 26, ink) +
      label('Inspect the issuer, statement,', 100, 590, 40, ink) +
      label('payment and supporting context.', 100, 652, 40, ink) +
      label('Add measured results only when available.', 100, 782, 28, ink),
    { light: true },
  ),
  '06-roadmap-slide.svg': svg(
    'Eight day proposed roadmap slide template',
    label('PROPOSED EIGHT-DAY SPRINT · SOLO DEVELOPER', 96, 254, 28, lime) +
      words(['Finish the reliable flow.'], 96, 402, 98) +
      [
        ['DAYS 1–2', 'Wallet control + ownership'],
        ['DAYS 3–5', 'Payment + signed receipts'],
        ['DAYS 6–8', 'Device checks + demo evidence'],
      ]
        .map(([a, b], i) => label(a, 96 + i * 600, 632, 28, lime) + label(b, 96 + i * 600, 716, 34))
        .join('') +
      label('Release only after device and real-network checks pass.', 96, 892, 30, muted),
  ),
  '07-closing-slide.svg': svg(
    'Closing slide and video end frame template',
    words(['Build something useful.', 'Keep the acknowledgment.'], 96, 394, 100) +
      label('Get paid. Keep the proof.', 100, 722, 44, lime) +
      label('Insert the authorized demo URL or QR code at export.', 100, 844, 30, muted),
  ),
  '08-social-announcement.svg': svg(
    'Social announcement template',
    words(['Your work', 'deserves', 'a record.'], 72, 352, 112) +
      label('Get paid. Keep the proof.', 76, 830, 34, lime) +
      label('Template · add a working demo link', 76, 920, 26, muted),
    { width: 1080, height: 1080 },
  ),
  '09-video-opening.svg': svg(
    'Demo video opening frame template',
    label('PRODUCT DEMONSTRATION', 96, 266, 28, lime) +
      words(['One contribution.', 'Two wallet approvals.'], 96, 420, 110) +
      label('Follow the payment, acknowledgment and publication choice.', 100, 790, 36, muted),
  ),
  '10-video-closing.svg': svg(
    'Demo video closing frame template',
    words(['Get paid.', 'Keep the proof.'], 96, 410, 132) +
      label('Inspect the demo. Try a contribution.', 100, 780, 44, lime) +
      label('Insert your authorized submission URL.', 100, 866, 30, muted),
  ),
};
for (const [name, data] of Object.entries(templates)) await writeFile(out + '/' + name, data);
await mkdir('public/assets/brand', { recursive: true });
await writeFile(
  'public/assets/brand/dotneet-wordmark.svg',
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="160" viewBox="0 0 400 160" role="img" aria-labelledby="title"><title id="title">Dotneet wordmark</title><rect width="400" height="160" rx="14" fill="' +
    tokens['--surface-base'] +
    '"/><text x="34" y="112" font-family="' +
    escape(tokens['--font-body']) +
    '" font-size="112" font-weight="700" letter-spacing="-7" fill="' +
    paper +
    '"><tspan fill="' +
    lime +
    '">.</tspan>neet</text></svg>',
);
console.log('Exported 10 reusable SVG layouts and one wordmark from shared tokens.');
