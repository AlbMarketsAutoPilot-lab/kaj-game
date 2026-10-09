// The trip scenes (owner-approved preview, task 14j): drawn over the game's own background
// painting (set by CSS, .trip-scene). No people: a plane in the night sky, a liner at sea, or a
// night train (task 17), or a bus on the steppe (task 18).

import type { RouteKind } from '../engine/types.ts';
import { WONDER_ART } from './countries.ts';

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

// A night train (task 17): a locomotive and two lit carriages on a rail embankment, with steam.
const CARRIAGE = (x: number) => `<g transform="translate(${x} 0)">
<rect x="0" y="-34" width="92" height="30" rx="5" fill="url(#trip-car)"/>
<rect x="0" y="-36" width="92" height="5" rx="2.5" fill="#1d3d44"/>
<g fill="#ffe08a" filter="url(#trip-glow)">
<rect x="8" y="-27" width="12" height="9" rx="1.5"/><rect x="26" y="-27" width="12" height="9" rx="1.5"/>
<rect x="44" y="-27" width="12" height="9" rx="1.5"/><rect x="62" y="-27" width="12" height="9" rx="1.5"/>
</g>
<path d="M0 -12 H92" stroke="#f4cf6a" stroke-width="1.4"/>
<circle cx="16" cy="-2" r="5" fill="#1a1a1a" stroke="#5f8583" stroke-width="1.2"/><circle cx="76" cy="-2" r="5" fill="#1a1a1a" stroke="#5f8583" stroke-width="1.2"/>
</g>`;

const TRAIN = `<rect width="440" height="230" fill="#062a30" opacity=".12"/>
<path d="M0 182 Q110 168 220 174 T440 170 V230 H0 Z" fill="#0b2f2a" opacity=".85"/>
<path d="M0 202 H440" stroke="#4d3a2c" stroke-width="7"/>
<g stroke="#2a1f17" stroke-width="3">${Array.from({ length: 23 }, (_, i) => `<path d="M${i * 20 + 4} 198 V206"/>`).join('')}</g>
<path d="M0 199 H440" stroke="#b9c9c7" stroke-width="1.6"/>
<g transform="translate(24 195) scale(1.3)">
${CARRIAGE(0)}${CARRIAGE(98)}
<g transform="translate(196 0)">
<rect x="0" y="-30" width="96" height="26" rx="5" fill="url(#trip-loco)"/>
<rect x="58" y="-50" width="38" height="46" rx="4" fill="url(#trip-loco)"/>
<rect x="64" y="-44" width="12" height="11" rx="1.5" fill="#ffe08a" filter="url(#trip-glow)"/>
<rect x="56" y="-53" width="42" height="5" rx="2" fill="#1d3d44"/>
<rect x="18" y="-46" width="10" height="16" rx="2" fill="#1d3d44"/>
<path d="M96 -12 L108 -2 L96 -2 Z" fill="#c0392b"/>
<circle cx="96" cy="-22" r="3.2" fill="#fff6c8" filter="url(#trip-glow)"/>
<path d="M0 -12 H96" stroke="#f4cf6a" stroke-width="1.4"/>
<circle cx="16" cy="-2" r="5" fill="#1a1a1a" stroke="#5f8583" stroke-width="1.2"/><circle cx="44" cy="-2" r="7" fill="#1a1a1a" stroke="#5f8583" stroke-width="1.2"/><circle cx="74" cy="-2" r="7" fill="#1a1a1a" stroke="#5f8583" stroke-width="1.2"/>
<path d="M16 -2 H74" stroke="#9fbdbb" stroke-width="1.6"/>
</g>
</g>
<g fill="#e9fff8" filter="url(#trip-blur6)">
<ellipse cx="304" cy="122" rx="14" ry="9" opacity=".45"/><ellipse cx="276" cy="106" rx="20" ry="11" opacity=".35"/>
<ellipse cx="238" cy="94" rx="26" ry="13" opacity=".25"/><ellipse cx="192" cy="86" rx="30" ry="14" opacity=".15"/>
</g>
<path d="M320 186 Q380 182 440 178" stroke="#fff6c8" stroke-width="10" opacity=".12" filter="url(#trip-blur6)"/>
<rect width="440" height="230" fill="url(#trip-moonglow)" opacity=".25"/>`;

// A bus at dusk on the steppe (task 18): hills, two yurts, a road, the bus with lit windows, dust.
const BUS = `<rect width="440" height="230" fill="#062a30" opacity=".12"/>
<path d="M0 150 Q80 120 170 138 T340 128 T440 140 V230 H0 Z" fill="#1d4a3a" opacity=".75"/>
<path d="M0 170 Q120 158 240 166 T440 160 V230 H0 Z" fill="#0b2f2a" opacity=".9"/>
<g transform="translate(330 150)" opacity=".85">
<path d="M0 0 H22 V-9 Q11 -20 0 -9 Z" fill="#f1e6c4"/><path d="M8 0 V-6 H14 V0 Z" fill="#9a6b44"/>
<path d="M30 2 H46 V-5 Q38 -13 30 -5 Z" fill="#e9dcb5"/>
</g>
<path d="M0 204 H440" stroke="#3b4a4f" stroke-width="22"/>
<path d="M0 204 H440" stroke="#f4f1de" stroke-width="1.6" stroke-dasharray="14 12" opacity=".7"/>
<g fill="#e9dcb5" filter="url(#trip-blur6)">
<ellipse cx="96" cy="190" rx="22" ry="8" opacity=".35"/><ellipse cx="60" cy="184" rx="28" ry="10" opacity=".25"/><ellipse cx="20" cy="178" rx="30" ry="11" opacity=".15"/>
</g>
<g transform="translate(116 200) scale(1.25)">
<rect x="0" y="-52" width="150" height="46" rx="8" fill="url(#trip-bus)"/>
<rect x="0" y="-52" width="150" height="7" rx="3.5" fill="#f4cf6a"/>
<g fill="#ffe08a" filter="url(#trip-glow)">
<rect x="10" y="-40" width="20" height="14" rx="2"/><rect x="36" y="-40" width="20" height="14" rx="2"/>
<rect x="62" y="-40" width="20" height="14" rx="2"/><rect x="88" y="-40" width="20" height="14" rx="2"/>
</g>
<rect x="116" y="-40" width="28" height="18" rx="3" fill="#163e46"/>
<rect x="114" y="-24" width="8" height="18" rx="1" fill="#163e46" opacity=".6"/>
<path d="M0 -18 H150" stroke="#c0392b" stroke-width="3"/>
<circle cx="146" cy="-12" r="3" fill="#fff6c8" filter="url(#trip-glow)"/>
<rect x="-2" y="-12" width="4" height="5" fill="#ff5a4a"/>
<circle cx="30" cy="-4" r="9" fill="#1a1a1a" stroke="#5f8583" stroke-width="2"/><circle cx="30" cy="-4" r="3" fill="#9fbdbb"/>
<circle cx="120" cy="-4" r="9" fill="#1a1a1a" stroke="#5f8583" stroke-width="2"/><circle cx="120" cy="-4" r="3" fill="#9fbdbb"/>
</g>
<path d="M310 196 Q380 192 440 188" stroke="#fff6c8" stroke-width="12" opacity=".12" filter="url(#trip-blur6)"/>
<rect width="440" height="230" fill="url(#trip-moonglow)" opacity=".25"/>`;

const TRAIN_DEFS = `<linearGradient id="trip-bus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2d65c"/><stop offset="1" stop-color="#c79a22"/></linearGradient>
<linearGradient id="trip-car" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2fb39a"/><stop offset="1" stop-color="#0f6a5c"/></linearGradient>
<linearGradient id="trip-loco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2574a"/><stop offset="1" stop-color="#7d1f16"/></linearGradient>`;

const SCENES: Record<RouteKind, { className: string; art: string }> = {
  airport: { className: 'plane', art: PLANE },
  port: { className: 'ship', art: SHIP },
  station: { className: 'train', art: TRAIN },
  bus: { className: 'bus', art: BUS },
};

// The scene for a plane ('airport'), ship ('port'), train ('station') or bus trip.
export function tripScene(kind: RouteKind): HTMLElement {
  const box = document.createElement('div');
  box.className = `trip-scene ${SCENES[kind].className}`;
  box.innerHTML = `<svg viewBox="0 0 440 230" aria-hidden="true"><defs>${DEFS}${TRAIN_DEFS}</defs>${SCENES[kind].art}</svg>`;
  return box;
}

// The wonder posters (task M6, owner-approved drawings in assets/wonders/, inlined by the build):
// drawn over the background painting, like the trip scenes.
const WONDERS: Record<string, string> = (window as unknown as { KAJ_WONDERS?: Record<string, string> }).KAJ_WONDERS ?? {};

// A wonder without a drawing yet (the 4 new ones of the 50-turn map, task M4) shows only the
// background painting.
export function wonderScene(area: string): HTMLElement {
  const box = document.createElement('div');
  box.className = 'wonder-scene';
  box.innerHTML = WONDERS[WONDER_ART[area] ?? area] ?? '';
  return box;
}
