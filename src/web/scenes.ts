// The trip scenes (owner-approved preview, task 14j): drawn over the game's own background
// painting (set by CSS, .trip-scene). No people: a plane in the night sky, or a liner at sea.

import type { RouteKind } from '../engine/types.ts';

const DEFS = `<filter id="trip-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="trip-soft"><feGaussianBlur stdDeviation="1.2"/></filter>
<filter id="trip-blur6"><feGaussianBlur stdDeviation="6"/></filter>
<linearGradient id="trip-fus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#dfeceb"/><stop offset=".75" stop-color="#9fbdbb"/><stop offset="1" stop-color="#5f8583"/></linearGradient>
<linearGradient id="trip-belly" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fa3a1"/><stop offset="1" stop-color="#3f6462"/></linearGradient>
<linearGradient id="trip-wing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f1f0"/><stop offset="1" stop-color="#7d9f9d"/></linearGradient>
<linearGradient id="trip-tailg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2fb39a"/><stop offset="1" stop-color="#0f6a5c"/></linearGradient>
<linearGradient id="trip-eng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f7f6"/><stop offset="1" stop-color="#6f8e8c"/></linearGradient>
<linearGradient id="trip-trail" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="trip-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3d44"/><stop offset="1" stop-color="#081c20"/></linearGradient>
<linearGradient id="trip-deckw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#b8cfcc"/></linearGradient>
<linearGradient id="trip-funnel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2574a"/><stop offset=".6" stop-color="#c0392b"/><stop offset="1" stop-color="#7d1f16"/></linearGradient>
<linearGradient id="trip-refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></linearGradient>
<radialGradient id="trip-moonglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e9fff8" stop-opacity=".35"/><stop offset="1" stop-color="#e9fff8" stop-opacity="0"/></radialGradient>`;

const PLANE = `<rect width="440" height="230" fill="#062a30" opacity=".12"/>
<g opacity=".8" filter="url(#trip-blur6)">
<ellipse cx="80" cy="205" rx="120" ry="22" fill="#cfeee6" opacity=".35"/>
<ellipse cx="300" cy="212" rx="160" ry="24" fill="#cfeee6" opacity=".3"/>
<ellipse cx="420" cy="195" rx="70" ry="16" fill="#cfeee6" opacity=".25"/>
</g>
<path d="M8 160 C 90 150, 160 128, 222 112" stroke="url(#trip-trail)" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#trip-soft)"/>
<path d="M14 168 C 96 158, 166 136, 226 120" stroke="url(#trip-trail)" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7" filter="url(#trip-soft)"/>
<g transform="translate(300 98) rotate(-12) scale(1.15)">
<path d="M-6 -2 L-34 -30 L-22 -30 L18 -4 Z" fill="#8fb0ae"/>
<path d="M-86 -4 L-104 -40 L-90 -40 L-66 -6 Z" fill="url(#trip-tailg)"/>
<path d="M-100 -36 L-92 -36" stroke="#f4cf6a" stroke-width="2"/>
<path d="M-84 0 L-104 -10 L-96 -11 L-74 -2 Z" fill="#9fbdbb"/>
<path d="M-96 -6 Q-92 -12 -70 -12 L70 -12 Q96 -12 108 -2 Q110 2 104 5 Q92 10 70 10 L-70 10 Q-90 10 -96 4 Z" fill="url(#trip-fus)"/>
<path d="M-90 4 Q-70 10 -40 10 L70 10 Q92 10 104 5 Q96 13 70 14 L-60 14 Q-84 12 -90 4 Z" fill="url(#trip-belly)" opacity=".8"/>
<path d="M-92 -1 L100 -1" stroke="#2fb39a" stroke-width="2.2"/>
<path d="M-92 2 L100 2" stroke="#f4cf6a" stroke-width="1"/>
<path d="M92 -8 Q101 -7 105 -3 L95 -3 Z" fill="#163e46"/>
<g fill="#ffe08a" filter="url(#trip-glow)">
<circle cx="-64" cy="-5" r="1.6"/><circle cx="-56" cy="-5" r="1.6"/><circle cx="-48" cy="-5" r="1.6"/><circle cx="-40" cy="-5" r="1.6"/>
<circle cx="-32" cy="-5" r="1.6"/><circle cx="-24" cy="-5" r="1.6"/><circle cx="-16" cy="-5" r="1.6"/><circle cx="-8" cy="-5" r="1.6"/>
<circle cx="0" cy="-5" r="1.6"/><circle cx="8" cy="-5" r="1.6"/><circle cx="16" cy="-5" r="1.6"/><circle cx="24" cy="-5" r="1.6"/>
<circle cx="32" cy="-5" r="1.6"/><circle cx="40" cy="-5" r="1.6"/><circle cx="48" cy="-5" r="1.6"/><circle cx="56" cy="-5" r="1.6"/>
<circle cx="64" cy="-5" r="1.6"/><circle cx="72" cy="-5" r="1.6"/>
</g>
<rect x="78" y="-9" width="6" height="12" rx="1.5" fill="none" stroke="#8fb0ae" stroke-width=".8"/>
<path d="M-14 4 L-46 44 L-30 44 L26 6 Z" fill="url(#trip-wing)" stroke="#6f8e8c" stroke-width=".6"/>
<path d="M-44 42 L-50 50 L-40 44 Z" fill="#2fb39a"/>
<g transform="translate(-6 18)">
<rect x="-8" y="-6" width="34" height="13" rx="6.5" fill="url(#trip-eng)"/>
<ellipse cx="26" cy="0.5" rx="3" ry="6" fill="#20343a"/>
<path d="M-8 -2 L-14 0.5 L-8 3 Z" fill="#6f8e8c"/>
</g>
<circle cx="-48" cy="47" r="2.4" fill="#5dff9a" filter="url(#trip-glow)"/>
<circle cx="-104" cy="-40" r="2" fill="#ffffff" filter="url(#trip-glow)"/>
<circle cx="10" cy="-13" r="1.8" fill="#ff5a4a" filter="url(#trip-glow)"/>
</g>
<rect width="440" height="230" fill="url(#trip-moonglow)" opacity=".25"/>`;

const SHIP = `<rect width="440" height="230" fill="#062a30" opacity=".1"/>
<path d="M40 150 L120 230 L10 230 Z" fill="#e9fff8" opacity=".08" filter="url(#trip-blur6)"/>
<g transform="translate(220 176) scale(.92)">
<g fill="#d9efe9" opacity=".35" filter="url(#trip-blur6)">
<ellipse cx="-30" cy="-92" rx="20" ry="9"/><ellipse cx="-62" cy="-104" rx="26" ry="11"/><ellipse cx="-100" cy="-112" rx="30" ry="12"/>
</g>
<path d="M-36 -78 L-30 -50 L-8 -50 L-4 -78 Z" fill="url(#trip-funnel)"/>
<rect x="-36" y="-80" width="32" height="6" rx="1" fill="#1a1a1a"/>
<path d="M14 -72 L18 -50 L38 -50 L42 -72 Z" fill="url(#trip-funnel)"/>
<rect x="14" y="-74" width="28" height="6" rx="1" fill="#1a1a1a"/>
<path d="M-80 -50 H96 V-36 H-80 Z" fill="url(#trip-deckw)"/>
<path d="M-100 -36 H120 V-20 H-100 Z" fill="url(#trip-deckw)"/>
<rect x="70" y="-62" width="22" height="12" rx="2" fill="#e8f1ef"/>
<rect x="73" y="-59" width="16" height="4" fill="#163e46"/>
<g fill="#ffe08a" filter="url(#trip-glow)">
<rect x="-74" y="-46" width="5" height="4" rx="1"/><rect x="-62" y="-46" width="5" height="4" rx="1"/><rect x="-50" y="-46" width="5" height="4" rx="1"/>
<rect x="-2" y="-46" width="5" height="4" rx="1"/><rect x="50" y="-46" width="5" height="4" rx="1"/><rect x="62" y="-46" width="5" height="4" rx="1"/>
<rect x="-94" y="-31" width="5" height="4" rx="1"/><rect x="-82" y="-31" width="5" height="4" rx="1"/><rect x="-70" y="-31" width="5" height="4" rx="1"/><rect x="-58" y="-31" width="5" height="4" rx="1"/>
<rect x="-46" y="-31" width="5" height="4" rx="1"/><rect x="-22" y="-31" width="5" height="4" rx="1"/><rect x="-10" y="-31" width="5" height="4" rx="1"/><rect x="2" y="-31" width="5" height="4" rx="1"/>
<rect x="26" y="-31" width="5" height="4" rx="1"/><rect x="38" y="-31" width="5" height="4" rx="1"/><rect x="62" y="-31" width="5" height="4" rx="1"/><rect x="86" y="-31" width="5" height="4" rx="1"/><rect x="98" y="-31" width="5" height="4" rx="1"/>
</g>
<path d="M-140 -20 H150 Q146 -4 132 12 H-118 Q-134 0 -140 -20 Z" fill="url(#trip-hull)"/>
<path d="M-140 -20 H150" stroke="#f4f7f6" stroke-width="2"/>
<path d="M-124 4 H136" stroke="#c0392b" stroke-width="3"/>
<g fill="#ffd98a" filter="url(#trip-glow)">
<circle cx="-110" cy="-10" r="1.8"/><circle cx="-94" cy="-10" r="1.8"/><circle cx="-78" cy="-10" r="1.8"/><circle cx="-62" cy="-10" r="1.8"/><circle cx="-46" cy="-10" r="1.8"/>
<circle cx="-30" cy="-10" r="1.8"/><circle cx="-14" cy="-10" r="1.8"/><circle cx="2" cy="-10" r="1.8"/><circle cx="18" cy="-10" r="1.8"/><circle cx="34" cy="-10" r="1.8"/>
<circle cx="50" cy="-10" r="1.8"/><circle cx="66" cy="-10" r="1.8"/><circle cx="82" cy="-10" r="1.8"/><circle cx="98" cy="-10" r="1.8"/><circle cx="114" cy="-10" r="1.8"/>
</g>
<path d="M110 -36 L114 -86" stroke="#d9e7e5" stroke-width="2"/>
<circle cx="114" cy="-88" r="2.4" fill="#fff" filter="url(#trip-glow)"/>
<path d="M-120 -20 L-124 -60" stroke="#d9e7e5" stroke-width="1.6"/>
<path d="M-124 -60 L114 -86" stroke="#d9e7e5" stroke-width=".6" opacity=".7"/>
<ellipse cx="6" cy="30" rx="120" ry="16" fill="url(#trip-refl)" opacity=".55" filter="url(#trip-blur6)"/>
<path d="M132 12 Q160 16 176 26" stroke="#e9fff8" stroke-width="2" fill="none" opacity=".8"/>
<path d="M-118 12 Q-170 18 -220 22" stroke="#e9fff8" stroke-width="1.6" fill="none" opacity=".5"/>
<path d="M-110 18 Q-160 26 -230 34" stroke="#e9fff8" stroke-width="1.2" fill="none" opacity=".35"/>
<ellipse cx="0" cy="13" rx="168" ry="7" fill="#1d6a6e" opacity=".9" filter="url(#trip-soft)"/>
<path d="M-150 6 Q-120 2 -90 6 T-30 6 T30 6 T90 6 T150 6" stroke="#bfeee2" stroke-width="1.2" fill="none" opacity=".6"/>
</g>`;

// The scene for a plane ('airport') or ship ('port') trip.
export function tripScene(kind: RouteKind): HTMLElement {
  const box = document.createElement('div');
  box.className = `trip-scene ${kind === 'airport' ? 'plane' : 'ship'}`;
  box.innerHTML = `<svg viewBox="0 0 440 230" aria-hidden="true"><defs>${DEFS}</defs>${kind === 'airport' ? PLANE : SHIP}</svg>`;
  return box;
}
