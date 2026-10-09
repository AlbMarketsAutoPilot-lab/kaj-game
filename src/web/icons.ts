// The 4 profile icons (owner-approved preview, after task 14g): shaded SVG drawings that look 3D,
// one colour per profile, with a white border (owner's request) and a soft shadow. The drawings sit once in the page; every icon is a <use> of them.

import type { Profile } from '../engine/types.ts';
import { svg } from './maps.ts';

const DEFS = `<filter id="kaj-shadow" x="-30%" y="-30%" width="160%" height="170%">
<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="grow"/>
<feFlood flood-color="#fff"/>
<feComposite in2="grow" operator="in" result="border"/>
<feDropShadow in="border" dx="0" dy="5" stdDeviation="4" flood-color="#000" flood-opacity=".45" result="lifted"/>
<feMerge><feMergeNode in="lifted"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<linearGradient id="kaj-dTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#4fb3f2"/></linearGradient>
<linearGradient id="kaj-dL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f8fe0"/><stop offset="1" stop-color="#0b4fa8"/></linearGradient>
<linearGradient id="kaj-dR" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c6fcc"/><stop offset="1" stop-color="#06357a"/></linearGradient>
<linearGradient id="kaj-dM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cc0ff"/><stop offset="1" stop-color="#1360c0"/></linearGradient>
<linearGradient id="kaj-bBody" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff6b5e"/><stop offset=".55" stop-color="#e0352b"/><stop offset="1" stop-color="#9e1a14"/></linearGradient>
<linearGradient id="kaj-bPocket" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f04a3f"/><stop offset="1" stop-color="#a51e17"/></linearGradient>
<linearGradient id="kaj-bTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a7e"/><stop offset="1" stop-color="#d22e24"/></linearGradient>
<linearGradient id="kaj-lLid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9edf0"/><stop offset="1" stop-color="#8d969d"/></linearGradient>
<linearGradient id="kaj-lScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4a55"/><stop offset=".5" stop-color="#1b252c"/><stop offset="1" stop-color="#0d1418"/></linearGradient>
<linearGradient id="kaj-lBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dee2"/><stop offset="1" stop-color="#7b848b"/></linearGradient>
<linearGradient id="kaj-sBody" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9783f"/><stop offset=".5" stop-color="#8a5226"/><stop offset="1" stop-color="#5a3216"/></linearGradient>
<linearGradient id="kaj-sTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4945a"/><stop offset="1" stop-color="#9a5e2e"/></linearGradient>
<linearGradient id="kaj-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#e2b04a"/><stop offset="1" stop-color="#9c6d17"/></linearGradient>
<radialGradient id="kaj-shine" cx=".3" cy=".25" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<symbol id="kaj-luxury" viewBox="0 0 128 128">
<g filter="url(#kaj-shadow)">
<polygon points="34,30 94,30 116,54 12,54" fill="url(#kaj-dTop)"/>
<polygon points="12,54 64,116 40,54" fill="url(#kaj-dL)"/>
<polygon points="40,54 64,116 88,54" fill="url(#kaj-dM)"/>
<polygon points="88,54 64,116 116,54" fill="url(#kaj-dR)"/>
<polygon points="34,30 52,30 40,54 12,54" fill="#d9f3ff" opacity=".85"/>
<polygon points="52,30 76,30 88,54 40,54" fill="#8fd3ff"/>
<polygon points="76,30 94,30 116,54 88,54" fill="#3f9ee8"/>
<polyline points="12,54 116,54" stroke="#e6f7ff" stroke-width="1.5" fill="none" opacity=".8"/>
<polygon points="34,30 94,30 116,54 64,116 12,54" fill="none" stroke="#0a3d80" stroke-width="2" stroke-linejoin="round"/>
<polygon points="44,36 58,36 50,48 30,48" fill="#fff" opacity=".7"/>
<circle cx="96" cy="26" r="3" fill="#fff"/><path d="M96 16v20M86 26h20" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>
</g>
</symbol>
<symbol id="kaj-backpacker" viewBox="0 0 128 128">
<g filter="url(#kaj-shadow)">
<path d="M46 26 Q64 8 82 26" fill="none" stroke="#7a1410" stroke-width="7" stroke-linecap="round"/>
<rect x="26" y="26" width="76" height="90" rx="22" fill="url(#kaj-bBody)"/>
<path d="M26 52 Q26 26 52 26 H76 Q102 26 102 52 V56 H26 Z" fill="url(#kaj-bTop)"/>
<path d="M28 56 H100" stroke="#7a1410" stroke-width="3"/>
<rect x="38" y="66" width="52" height="38" rx="12" fill="url(#kaj-bPocket)" stroke="#7a1410" stroke-width="2"/>
<path d="M42 76 H86" stroke="#ffd36b" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 5"/>
<rect x="58" y="70" width="12" height="7" rx="2" fill="url(#kaj-gold)"/>
<rect x="20" y="64" width="10" height="34" rx="5" fill="#8f1a14"/>
<rect x="98" y="64" width="10" height="34" rx="5" fill="#6e120d"/>
<rect x="30" y="34" width="20" height="60" rx="10" fill="url(#kaj-shine)"/>
</g>
</symbol>
<symbol id="kaj-nomad" viewBox="0 0 128 128">
<g filter="url(#kaj-shadow)">
<path d="M28 22 H100 Q106 22 106 28 V82 H22 V28 Q22 22 28 22 Z" fill="url(#kaj-lLid)"/>
<rect x="29" y="29" width="70" height="47" rx="3" fill="url(#kaj-lScreen)"/>
<path d="M29 29 L70 29 L40 76 L29 76 Z" fill="#fff" opacity=".08"/>
<circle cx="64" cy="52" r="10" fill="none" stroke="#6fe3c8" stroke-width="2"/>
<path d="M54 52 H74 M64 42 Q58 52 64 62 Q70 52 64 42" fill="none" stroke="#6fe3c8" stroke-width="1.6"/>
<path d="M10 86 H118 L110 100 Q108 104 102 104 H26 Q20 104 18 100 Z" fill="url(#kaj-lBase)"/>
<path d="M10 86 H118" stroke="#f4f7f9" stroke-width="2"/>
<rect x="52" y="88" width="24" height="4" rx="2" fill="#6d767d"/>
</g>
</symbol>
<symbol id="kaj-business" viewBox="0 0 128 128">
<g filter="url(#kaj-shadow)">
<path d="M48 36 V24 Q48 18 54 18 H74 Q80 18 80 24 V36" fill="none" stroke="#3a210c" stroke-width="7"/>
<rect x="14" y="34" width="100" height="78" rx="12" fill="url(#kaj-sBody)"/>
<path d="M14 46 Q14 34 26 34 H102 Q114 34 114 46 V58 H14 Z" fill="url(#kaj-sTop)"/>
<path d="M14 58 H114" stroke="#4a2810" stroke-width="3"/>
<rect x="38" y="34" width="8" height="78" fill="#4a2810" opacity=".55"/>
<rect x="82" y="34" width="8" height="78" fill="#4a2810" opacity=".55"/>
<rect x="54" y="52" width="20" height="13" rx="3" fill="url(#kaj-gold)" stroke="#7a5310" stroke-width="1.5"/>
<rect x="20" y="40" width="40" height="30" rx="10" fill="url(#kaj-shine)"/>
</g>
</symbol>`;

export const PROFILE_COLOUR: Record<Profile, string> = {
  nomad: '#9aa5ad',
  backpacker: '#e0352b',
  business: '#b0703a',
  luxury: '#2f8fe0',
};

// Puts the drawings in the page (once).
export function installIcons(): void {
  if (document.getElementById('kaj-icons')) return;
  document.body.insertAdjacentHTML('afterbegin', `<svg id="kaj-icons" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${DEFS}</defs></svg>`);
}

// The icon inside a map or drawing, in a box of `size` centred on (x, y).
export function iconUse(profile: Profile, x: number, y: number, size: number): SVGElement {
  return svg('use', { href: `#kaj-${profile}`, x: x - size / 2, y: y - size / 2, width: size, height: size });
}

// The icon in text (an inline SVG the size of the text around it, see .picon in style.css).
export function iconEl(profile: Profile): SVGSVGElement {
  const s = svg('svg', { class: 'picon', viewBox: '0 0 128 128' }) as SVGSVGElement;
  s.append(svg('use', { href: `#kaj-${profile}` }));
  return s;
}
