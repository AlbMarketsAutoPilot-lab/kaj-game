// Makes the wonder posters (task M6; the 4 of the 50-turn map in task M4): one SVG per wonder in assets/wonders/<area id>.svg.
// Each drawing has no sky: it sits on the game's own background painting (like the trip scenes),
// in the same night light (teal, moonlit from the left, warm lights). Run: node scripts/wonders-make.ts
import { mkdirSync, writeFileSync } from 'node:fs';

const W = 900, H = 560;
const f = (n: number) => n.toFixed(1);
type Pt = [number, number];
const pts = (p: Pt[]) => p.map(([x, y]) => `${f(x)} ${f(y)}`).join('L');
const poly = (p: Pt[], fill: string, extra = '') => `<path d="M${pts(p)}Z" fill="${fill}"${extra}/>`;

const DEFS = `<defs>
<radialGradient id="w-glow" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#ffe2a0"/><stop offset=".55" stop-color="#f0a24f"/><stop offset="1" stop-color="#7a3a1e"/></radialGradient>
<radialGradient id="w-halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd890" stop-opacity=".35"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>
<radialGradient id="w-mist" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e8fbf6" stop-opacity=".55"/><stop offset="1" stop-color="#e8fbf6" stop-opacity="0"/></radialGradient>
<linearGradient id="w-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f6a6c"/><stop offset="1" stop-color="#062a30"/></linearGradient>
<filter id="w-soft"><feGaussianBlur stdDeviation="1.4"/></filter>
<filter id="w-blur"><feGaussianBlur stdDeviation="6"/></filter>
</defs>`;

// Little people in front, as on the Colosseum sample.
function people(rnd: () => number, n: number, x0: number, x1: number, y0: number): string {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * 16;
    s += `<g fill="#0c2e31"><circle cx="${f(x)}" cy="${f(y - 13)}" r="2.6"/><rect x="${f(x - 2.4)}" y="${f(y - 10.5)}" width="4.8" height="11" rx="2"/></g>`;
  }
  return s;
}
const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---------- Colosseum (Italy): the owner-approved sample ----------
function colosseum(): string {
  const rnd = seeded(7);
  const out: string[] = [];
  const add = (s: string) => out.push(s);
  add(`<ellipse cx="450" cy="470" rx="380" ry="70" fill="url(#w-halo)"/>`);
  const cx = 450, base = 452, RX = 300, RY = 62;
  const ST = [0, 66, 132, 198, 246]; // storey tops: 3 arcades + attic
  const step = (2 * Math.PI) / 80;
  const P = (rx: number, ry: number, th: number, h: number): Pt => [cx + rx * Math.sin(th), base + ry * Math.cos(th) - h];
  const stone = (th: number, k: number) => {
    const l = 0.55 + 0.4 * Math.cos(th + 0.6) - k * 0.03;
    const c = (a: number, b: number) => Math.round(a + (b - a) * l);
    return `rgb(${c(70, 226)},${c(72, 196)},${c(70, 150)})`;
  };
  // The outer wall: full on the left, broken in steps on the right (as seen from the Forum).
  const hmax = (th: number) => th < 0.3 ? ST[4] : th < 1.0 ? Math.max(0, ST[4] - Math.floor((th - 0.3) / 0.7 * 9) * 27) : 0;
  const ring = (rx: number, ry: number, from: number, to: number, top: (t: number) => number, dark: boolean) => {
    for (let i = Math.floor(from / step); i * step < to; i++) {
      const a = i * step, b = a + step, m = (a + b) / 2;
      if (Math.cos(m) < 0) continue;
      for (let k = 0; k < 4; k++) {
        const h0 = ST[k], h1 = ST[k + 1];
        if (h0 >= top(m)) break;
        const [x0, y0] = P(rx, ry, a, h0), [x1, y1] = P(rx, ry, b, h0), [x2, y2] = P(rx, ry, b, h1), [x3, y3] = P(rx, ry, a, h1);
        const col = stone(m, dark ? k + 6 : k);
        add(poly([[x0, y0], [x1, y1], [x2, y2], [x3, y3]], col, ` stroke="${col}" stroke-width=".6"`));
        const w = x1 - x0, xm = (x0 + x1) / 2, yb = (y0 + y1) / 2;
        if (k < 3) { // an arch with warm light, framed by a half-column
          const ow = w * 0.62, lift = k === 0 ? 0 : 8, hh = (h1 - h0) * 0.74 - lift, by = yb - lift, ty = by - hh + ow / 2;
          add(`<path d="M${f(xm - ow / 2)} ${f(by)}V${f(ty)}A${f(ow / 2)} ${f(ow / 2)} 0 0 1 ${f(xm + ow / 2)} ${f(ty)}V${f(by)}Z" fill="${dark ? '#3b2a20' : 'url(#w-glow)'}"/>`);
          add(`<rect x="${f(x0 - w * 0.06)}" y="${f(yb - (h1 - h0) + 6)}" width="${f(w * 0.12)}" height="${f(h1 - h0 - 6)}" fill="#fff" opacity="${f(0.08 + 0.12 * Math.cos(a + 0.6))}"/>`);
        } else if (i % 2 === 0) { // the attic: small square windows every other bay
          add(`<rect x="${f(xm - w * 0.18)}" y="${f(yb - 34)}" width="${f(w * 0.36)}" height="12" fill="#5a3a26" opacity=".85"/>`);
        }
      }
    }
    for (const h of ST.slice(1)) { // cornices
      const runs: string[] = [];
      let cur = '';
      for (let t = from; t <= to + 1e-6; t += 0.02) {
        if (h > top(t) + 0.1) { if (cur) runs.push(cur); cur = ''; continue; }
        const [x, y] = P(rx, ry, t, h);
        cur += `${cur ? 'L' : 'M'}${f(x)} ${f(y)}`;
      }
      if (cur) runs.push(cur);
      if (runs.length) add(`<path d="${runs.join('')}" fill="none" stroke="#f3e2b8" stroke-opacity=".55" stroke-width="2.4"/>`);
    }
  };
  // The far side of the bowl: its inner face, darker, with tiers and lit corridor openings.
  const ts: number[] = [];
  for (let t = -Math.PI / 2; t >= -1.5 * Math.PI - 1e-6; t -= 0.03) ts.push(t);
  let far = '';
  for (const t of ts) {
    const hh = t > -1.9 ? 165 + (t + 1.9) / 0.33 * 81 : t < -4.4 ? 165 - (-4.4 - t) / 0.31 * 110 : 165;
    const [x, y] = P(RX * 0.97, RY * 0.97, t, hh + (rnd() - 0.5) * 7);
    far += `${far ? 'L' : 'M'}${f(x)} ${f(y)}`;
  }
  add(`<path d="${far}L${f(cx + RX)} ${base}L${f(cx - RX)} ${base}Z" fill="#7d6a52"/>`);
  for (const [r, hgt, op] of [[0.95, 150, 1], [0.86, 120, 0.9], [0.77, 92, 0.8], [0.68, 66, 0.7]]) {
    add(`<path d="M${pts(ts.map((t) => P(RX * r, RY * r, t, hgt)))}" fill="none" stroke="#4e3e2e" stroke-width="3" opacity="${op}"/>`);
    for (let i = 0; i < ts.length; i += 3) {
      const [x, y] = P(RX * r, RY * r, ts[i], hgt - 8);
      add(`<path d="M${f(x - 2.6)} ${f(y + 12)}V${f(y + 3)}a2.6 2.6 0 0 1 5.2 0V${f(y + 12)}Z" fill="#f2a656" opacity="${f(0.55 * op)}"/>`);
    }
  }
  ring(RX * 0.92, RY * 0.92, 0.55, Math.PI / 2, (t) => 132 + (t < 0.9 ? 66 : 0), true); // the inner ring
  const clip: Pt[] = [];
  for (let t = -Math.PI / 2; t <= Math.PI / 2 + 1e-6; t += 0.02) {
    const h = hmax(t);
    const [x, y] = P(RX, RY, t, h > 0 && h < ST[4] ? h + (rnd() - 0.5) * 10 : h);
    clip.push([x, y - 2]);
  }
  clip.push([cx + RX + 5, base + 40], [cx - RX - 5, base + 40]);
  add(`<clipPath id="w-outer"><path d="M${pts(clip)}Z"/></clipPath><g clip-path="url(#w-outer)">`);
  ring(RX, RY, -Math.PI / 2, Math.PI / 2, () => ST[4], false);
  add('</g>');
  const [bx, by] = P(RX, RY, 0.98, 0); // the brick buttress at the broken end
  add(poly([[bx - 6, by], [bx - 10, by - 34], [bx + 14, by - 18], [bx + 18, by]], '#9a6a45'));
  add(`<ellipse cx="450" cy="525" rx="330" ry="22" fill="#ffcf85" opacity=".12"/>`);
  add(people(rnd, 9, 230, 670, 528));
  return out.join('');
}

// ---------- Taj Mahal (India): white marble, onion dome, four minarets, the long pool ----------
function tajMahal(): string {
  const rnd = seeded(11);
  const lit = '#eef4f1', mid = '#cfdcd8', shade = '#9fb5b2';
  const onion = (x: number, y: number, r: number, h: number, fill: string) =>
    `<path d="M${f(x - r * 0.62)} ${f(y)}C${f(x - r * 1.25)} ${f(y - h * 0.35)} ${f(x - r * 0.9)} ${f(y - h * 0.8)} ${f(x)} ${f(y - h)}C${f(x + r * 0.9)} ${f(y - h * 0.8)} ${f(x + r * 1.25)} ${f(y - h * 0.35)} ${f(x + r * 0.62)} ${f(y)}Z" fill="${fill}"/>`
    + `<path d="M${f(x)} ${f(y - h)}V${f(y - h - h * 0.28)}" stroke="#e7c86f" stroke-width="${f(Math.max(1.5, r * 0.05))}"/><circle cx="${f(x)}" cy="${f(y - h - h * 0.08)}" r="${f(Math.max(1.6, r * 0.05))}" fill="#e7c86f"/>`;
  const arch = (x: number, y: number, w: number, h: number, fill: string) => // a pointed arch, foot at y
    `<path d="M${f(x - w / 2)} ${f(y)}V${f(y - h + w * 0.55)}Q${f(x - w / 2)} ${f(y - h + w * 0.12)} ${f(x)} ${f(y - h)}Q${f(x + w / 2)} ${f(y - h + w * 0.12)} ${f(x + w / 2)} ${f(y - h + w * 0.55)}V${f(y)}Z" fill="${fill}"/>`;
  const minaret = (x: number) => {
    let s = poly([[x - 9, 398], [x - 6.5, 175], [x + 6.5, 175], [x + 9, 398]], mid);
    s += poly([[x + 1, 398], [x + 1, 175], [x + 6.5, 175], [x + 9, 398]], shade, ' opacity=".7"');
    for (const y of [330, 262, 200]) s += `<rect x="${f(x - 13)}" y="${y}" width="26" height="6" fill="${lit}"/><rect x="${f(x - 11)}" y="${y + 6}" width="22" height="3" fill="${shade}"/>`;
    s += `<rect x="${f(x - 10)}" y="160" width="20" height="16" fill="${lit}"/><rect x="${f(x - 6)}" y="164" width="4" height="10" fill="#5a4a3a"/><rect x="${f(x + 2)}" y="164" width="4" height="10" fill="#5a4a3a"/>`;
    return s + onion(x, 160, 13, 22, lit);
  };
  const building = () => {
    let s = '';
    s += `<rect x="330" y="232" width="240" height="168" fill="${mid}"/>`;
    s += poly([[330, 232], [356, 232], [356, 400], [330, 400]], shade); // chamfered corners
    s += poly([[544, 232], [570, 232], [570, 400], [544, 400]], shade);
    s += `<rect x="400" y="242" width="100" height="158" fill="${lit}"/>`; // the great iwan
    s += arch(450, 400, 70, 140, '#3d3128') + arch(450, 400, 62, 130, 'url(#w-glow)');
    s += `<rect x="438" y="350" width="24" height="50" fill="#5b3a22"/>`;
    for (const x of [378, 522]) for (const y of [318, 398]) { s += `<rect x="${x - 19}" y="${y - 76}" width="38" height="76" fill="${lit}" opacity=".8"/>` + arch(x, y - 4, 26, 62, x < 450 ? 'url(#w-glow)' : '#6e5a44'); }
    for (const x of [340, 560]) for (const y of [318, 398]) s += arch(x, y - 6, 12, 58, '#4e4136');
    s += `<rect x="326" y="226" width="248" height="8" fill="${lit}"/>`;
    for (let x = 334; x <= 566; x += 16) s += `<rect x="${x}" y="218" width="4" height="9" fill="${lit}"/>`;
    for (const x of [372, 528]) { // the chhatris
      s += `<rect x="${x - 17}" y="200" width="34" height="26" fill="${mid}"/>`;
      for (let i = 0; i < 3; i++) s += `<rect x="${x - 12 + i * 9}" y="205" width="5" height="18" fill="#4e4136"/>`;
      s += onion(x, 200, 20, 30, lit);
    }
    s += `<rect x="402" y="196" width="96" height="36" fill="${mid}"/><rect x="402" y="196" width="48" height="36" fill="${lit}"/>`; // the drum
    s += onion(450, 200, 72, 128, lit); // the great dome, moonlit from the left
    s += `<path d="M450 72C490 92 518 130 516 170C514 186 506 196 494 200L450 200Z" fill="${shade}" opacity=".45"/>`;
    return s;
  };
  let s = `<ellipse cx="450" cy="300" rx="330" ry="210" fill="url(#w-mist)" opacity=".5"/>`;
  s += `<rect x="190" y="398" width="520" height="36" fill="${mid}"/><rect x="190" y="398" width="520" height="5" fill="${lit}"/>`; // the plinth
  for (let x = 200; x < 700; x += 26) s += arch(x + 13, 434, 12, 22, '#7d8f8d');
  s += minaret(222) + minaret(678) + building();
  s += poly([[60, 470], [840, 470], [900, 560], [0, 560]], '#174b4c'); // the garden
  s += poly([[0, 434], [900, 434], [900, 472], [0, 472]], '#1f5b5b');
  s += poly([[416, 434], [484, 434], [520, 560], [380, 560]], 'url(#w-water)'); // the pool
  s += `<clipPath id="w-pool"><path d="M416 434L484 434L520 560L380 560Z"/></clipPath><g clip-path="url(#w-pool)" opacity=".38"><g transform="translate(0 868) scale(1 -1)">${building()}</g></g>`;
  s += `<path d="M450 440V560" stroke="#ffe2a0" stroke-opacity=".25" stroke-width="3"/>`;
  for (let i = 0; i < 6; i++) for (const side of [-1, 1]) { // the cypress rows along the pool
    const x = 450 + side * (60 + i * 26 + i * i * 4), y = 452 + i * 18, h = 30 + i * 9;
    s += `<ellipse cx="${f(x)}" cy="${f(y - h / 2)}" rx="${f(5 + i * 1.6)}" ry="${f(h / 2)}" fill="#0d3a33"/>`;
  }
  return s + people(rnd, 5, 250, 380, 452) + people(rnd, 4, 540, 660, 452);
}

// ---------- Mount Fuji (Japan): the snow cone, with the red five-storey Chureito pagoda ----------
function fuji(): string {
  const rnd = seeded(5);
  let s = `<ellipse cx="460" cy="250" rx="320" ry="180" fill="url(#w-mist)" opacity=".35"/>`;
  s += `<path d="M40 470Q300 330 398 150L420 144L440 152L462 145L486 151L506 152Q610 330 860 470Z" fill="#3c6f7c"/>`;
  s += `<path d="M452 146L506 152Q610 330 860 470L560 470Q520 320 452 146Z" fill="#244f5a" opacity=".85"/>`; // the shaded side
  s += `<path d="M398 150L420 144L440 152L462 145L486 151L506 152Q540 215 572 262L556 252L540 270L522 250L505 276L490 254L470 282L452 256L433 280L418 255L400 274L386 252L370 268L356 258Q380 210 398 150Z" fill="#eef7f6"/>`;
  s += `<path d="M462 145L486 151L506 152Q540 215 572 262L556 252L540 270L522 250L505 276L490 254L470 282Q470 210 462 145Z" fill="#b4d0d4"/>`;
  for (let i = 0; i < 9; i++) { const x = 380 + i * 22; s += `<path d="M${x} ${262 + (i % 2) * 10}L${x + 6 + rnd() * 10} ${300 + rnd() * 40}" stroke="#eef7f6" stroke-width="2" opacity=".5"/>`; }
  s += `<path d="M0 470Q200 410 450 440T900 430V560H0Z" fill="#123f3f"/>`; // the wooded hills
  for (let i = 0; i < 60; i++) { const x = rnd() * 900, y = 430 + rnd() * 40; s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(10 + rnd() * 12)}" ry="${f(8 + rnd() * 6)}" fill="#0e3534"/>`; }
  // The pagoda: five roofs with turned-up eaves, red walls, warm windows.
  const px = 230;
  let base = 500;
  for (let i = 0; i < 5; i++) {
    const w = 96 - i * 12, h = 30 - i * 2;
    s += `<rect x="${f(px - w / 2 + 10)}" y="${f(base - h)}" width="${f(w - 20)}" height="${f(h)}" fill="#b8352a"/><rect x="${f(px)}" y="${f(base - h)}" width="${f(w / 2 - 10)}" height="${f(h)}" fill="#7d2219"/>`;
    s += `<rect x="${f(px - 7)}" y="${f(base - h + 6)}" width="14" height="${f(h - 10)}" fill="url(#w-glow)"/>`;
    const rw = w / 2 + 18, ry = base - h;
    s += `<path d="M${f(px - rw - 6)} ${f(ry - 6)}Q${f(px - rw + 10)} ${f(ry + 2)} ${f(px - w / 2 + 6)} ${f(ry - 6)}L${f(px)} ${f(ry - 20)}L${f(px + w / 2 - 6)} ${f(ry - 6)}Q${f(px + rw - 10)} ${f(ry + 2)} ${f(px + rw + 6)} ${f(ry - 6)}L${f(px + rw - 4)} ${f(ry + 2)}L${f(px - rw + 4)} ${f(ry + 2)}Z" fill="#20302f"/>`;
    base = ry - 14;
  }
  s += `<path d="M${px} ${base + 2}V${base - 40}" stroke="#c9a457" stroke-width="3"/>`;
  for (let i = 0; i < 6; i++) s += `<circle cx="${px}" cy="${base - 6 - i * 6}" r="${f(4 - i * 0.4)}" fill="#c9a457"/>`;
  for (const [cx0, cy0, n] of [[90, 470, 40], [370, 500, 30], [700, 480, 40], [830, 500, 30]] as const) { // cherry blossom
    for (let i = 0; i < n; i++) s += `<circle cx="${f(cx0 + (rnd() - 0.5) * 120)}" cy="${f(cy0 + (rnd() - 0.5) * 50)}" r="${f(5 + rnd() * 9)}" fill="${rnd() < 0.5 ? '#f3b9cf' : '#e597b3'}" opacity=".85"/>`;
  }
  return s;
}

// ---------- Pyramids of Giza (Egypt): the three pyramids and the Sphinx ----------
function pyramids(): string {
  const rnd = seeded(3);
  const pyramid = (apex: Pt, l: Pt, m: Pt, r: Pt, cap = false) => {
    let s = poly([apex, l, m], '#d9be86') + poly([apex, m, r], '#8a6f4c');
    for (let k = 1; k < 14; k++) { // the stone courses
      const t = k / 14, a: Pt = [apex[0] + (l[0] - apex[0]) * t, apex[1] + (l[1] - apex[1]) * t], b: Pt = [apex[0] + (m[0] - apex[0]) * t, apex[1] + (m[1] - apex[1]) * t], c: Pt = [apex[0] + (r[0] - apex[0]) * t, apex[1] + (r[1] - apex[1]) * t];
      s += `<path d="M${pts([a, b, c])}" fill="none" stroke="#5e4a30" stroke-opacity=".25" stroke-width="1.2"/>`;
    }
    if (cap) { const t = 0.18; const a: Pt = [apex[0] + (l[0] - apex[0]) * t, apex[1] + (l[1] - apex[1]) * t], b: Pt = [apex[0] + (m[0] - apex[0]) * t, apex[1] + (m[1] - apex[1]) * t], c: Pt = [apex[0] + (r[0] - apex[0]) * t, apex[1] + (r[1] - apex[1]) * t]; s += poly([apex, a, b], '#efdcae') + poly([apex, b, c], '#a88c62'); }
    return s;
  };
  let s = `<ellipse cx="450" cy="420" rx="430" ry="90" fill="url(#w-halo)"/>`;
  s += pyramid([795, 292], [722, 402], [790, 412], [866, 398]); // Menkaure
  s += pyramid([292, 168], [120, 428], [300, 446], [462, 420], true); // Khafre, with its casing cap
  s += pyramid([566, 150], [372, 450], [590, 470], [806, 432]); // Khufu
  s += `<path d="M0 452Q220 420 450 470T900 440V560H0Z" fill="#b99a66" opacity=".55"/><path d="M0 492Q300 470 520 500T900 486V560H0Z" fill="#7e6748"/>`;
  // The Sphinx, lying in front: body, paws, the head with its headdress.
  s += `<path d="M150 514L156 488Q170 476 214 478L262 474L270 452Q272 436 286 434L300 434Q312 438 312 452L312 470L318 486L346 490L352 514Z" fill="#c4a674"/>`;
  s += `<path d="M268 456Q268 432 290 428Q312 432 312 456L304 470L276 470Z" fill="#a98b5c"/><rect x="284" y="446" width="14" height="18" rx="3" fill="#d9be86"/>`;
  s += `<path d="M312 486L360 494L360 514L318 514Z" fill="#b39463"/><path d="M150 514L156 488L180 482L180 514Z" fill="#9f8256"/>`;
  return s + people(rnd, 7, 380, 760, 520);
}

// ---------- Chichén Itzá (Mexico): El Castillo, nine terraces, the stair and the temple ----------
function chichenItza(): string {
  const rnd = seeded(9);
  let s = `<ellipse cx="450" cy="380" rx="360" ry="170" fill="url(#w-halo)"/>`;
  const levels = 9, bottom = 470, top = 222, hgt = (bottom - top) / levels;
  for (let i = 0; i < levels; i++) {
    const w = 460 - i * 33, y1 = bottom - i * hgt, y0 = y1 - hgt, x0 = 450 - w / 2, x1 = 450 + w / 2, d = w * 0.22;
    s += poly([[x1, y1], [x1 + d, y1 - d * 0.28], [x1 + d, y0 - d * 0.28], [x1, y0]], '#6f6a58'); // the side in shadow
    s += `<rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(hgt)}" fill="#c9c2a5"/><rect x="${f(x0)}" y="${f(y0)}" width="${f(w)}" height="${f(hgt * 0.38)}" fill="#ddd6bb"/>`;
    s += `<path d="M${f(x0)} ${f(y1)}H${f(x1)}" stroke="#5b5646" stroke-width="2"/>`;
    for (let x = x0 + 14; x < x1 - 8; x += 22) s += `<rect x="${f(x)}" y="${f(y0 + hgt * 0.45)}" width="9" height="${f(hgt * 0.4)}" fill="#a39c80"/>`;
  }
  // The great stair (front), with its balustrades and the serpent heads at the foot.
  s += poly([[410, bottom], [490, bottom], [482, top], [418, top]], '#e3dcc2');
  for (let k = 0; k <= 46; k++) { const y = bottom - k * (bottom - top) / 46; s += `<path d="M${f(410 + k * 8 / 46)} ${f(y)}H${f(490 - k * 8 / 46)}" stroke="#8b8570" stroke-width="1.3"/>`; }
  s += poly([[402, bottom], [412, bottom], [420, top], [414, top]], '#8b8570') + poly([[488, bottom], [498, bottom], [486, top], [480, top]], '#8b8570');
  s += `<path d="M390 470h24v-14h-18z" fill="#9b947b"/><path d="M486 470h24l-6 -14h-18z" fill="#9b947b"/>`;
  // The temple on top, its three doors lit.
  s += poly([[510, 222], [530, 216], [530, 160], [510, 166]], '#6f6a58');
  s += `<rect x="390" y="166" width="120" height="56" fill="#cfc8ab"/><rect x="386" y="158" width="128" height="12" fill="#e1dabf"/>`;
  s += `<rect x="438" y="182" width="24" height="40" fill="url(#w-glow)"/><rect x="404" y="186" width="18" height="36" fill="url(#w-glow)"/><rect x="478" y="186" width="18" height="36" fill="url(#w-glow)"/>`;
  s += `<rect x="447" y="182" width="6" height="40" fill="#cfc8ab"/>`;
  for (const [x0, x1] of [[0, 300], [600, 900]]) { // the jungle
    for (let i = 0; i < 45; i++) s += `<circle cx="${f(x0 + rnd() * (x1 - x0))}" cy="${f(430 + rnd() * 60)}" r="${f(16 + rnd() * 18)}" fill="${rnd() < 0.5 ? '#103b34' : '#0c302b'}"/>`;
  }
  s += `<path d="M0 480Q450 460 900 480V560H0Z" fill="#2a5a4f"/>`;
  return s + people(rnd, 8, 260, 640, 500);
}

// ---------- Machu Picchu (Peru): Huayna Picchu over the stone town and its terraces ----------
function machuPicchu(): string {
  const rnd = seeded(13);
  let s = '';
  s += `<path d="M0 420L90 300L170 330L250 250L330 380L380 420Z" fill="#244f58" opacity=".85"/><path d="M620 420L700 260L780 300L860 220L900 260V420Z" fill="#244f58" opacity=".85"/>`;
  s += `<path d="M420 470C460 330 500 190 560 130C602 138 612 210 640 300C664 380 710 440 780 470Z" fill="#1d5547"/>`; // Huayna Picchu
  s += `<path d="M560 130C602 138 612 210 640 300C664 380 710 440 780 470L640 470C620 360 600 240 560 130Z" fill="#123d33"/>`;
  s += `<path d="M560 130C530 160 505 220 486 300" stroke="#5f9a84" stroke-width="3" fill="none" opacity=".6"/>`;
  for (let i = 0; i < 6; i++) s += `<path d="M${f(552 - i * 4)} ${150 + i * 14}h${f(18 + i * 3)}" stroke="#7aa996" stroke-width="1.5" opacity=".5"/>`; // the summit terraces
  s += `<ellipse cx="560" cy="430" rx="220" ry="40" fill="url(#w-mist)" filter="url(#w-blur)"/><ellipse cx="150" cy="400" rx="180" ry="30" fill="url(#w-mist)" filter="url(#w-blur)"/>`;
  s += `<path d="M120 560L180 440Q300 410 450 418T760 430L820 560Z" fill="#2f6b52"/>`; // the saddle with the town
  for (let i = 0; i < 9; i++) { // the farming terraces on the left slope
    const y = 448 + i * 13;
    s += `<path d="M${180 - i * 7} ${y}Q${260} ${y - 8} ${330 + i * 4} ${y + 2}" stroke="#b8b5a0" stroke-width="2.5" fill="none"/><path d="M${180 - i * 7} ${y + 2}Q${260} ${y - 6} ${330 + i * 4} ${y + 4}" stroke="#4f8d63" stroke-width="7" fill="none" opacity=".6"/>`;
  }
  s += `<path d="M370 452Q500 440 640 452L630 476Q500 466 380 478Z" fill="#6aa772"/>`; // the main square
  const house = (x: number, y: number, w: number, h: number) => { // a roofless stone house with a gable
    const g = h * 0.55;
    return poly([[x, y], [x + w, y], [x + w, y - h], [x + w / 2, y - h - g], [x, y - h]], '#b3b1a1') + poly([[x + w * 0.55, y], [x + w, y], [x + w, y - h], [x + w * 0.55, y - h - g * 0.9]], '#7f7d70')
      + `<path d="M${f(x + w * 0.2)} ${f(y - h * 0.3)}l3 -${f(h * 0.35)}h${f(w * 0.12)}l3 ${f(h * 0.35)}z" fill="#3e3a33"/>`;
  };
  for (let i = 0; i < 9; i++) s += house(340 + i * 34 + rnd() * 6, 448 - (i % 3) * 4, 24 + rnd() * 10, 14 + rnd() * 8);
  for (let i = 0; i < 7; i++) s += house(390 + i * 40 + rnd() * 6, 500 + (i % 2) * 8, 26 + rnd() * 10, 14 + rnd() * 8);
  for (let i = 0; i < 4; i++) s += house(230 + i * 30, 432 + i * 3, 22, 12);
  s += `<ellipse cx="520" cy="476" rx="160" ry="14" fill="url(#w-halo)"/>`;
  return s + people(rnd, 5, 420, 600, 470);
}

// ---------- Milford Sound (New Zealand): Mitre Peak rising from the fjord ----------
function milfordSound(): string {
  const rnd = seeded(17);
  const land = () => {
    let s = '';
    s += `<path d="M0 440L0 330L70 270L150 240L210 300L280 360L330 440Z" fill="#1f4650"/>`; // left mass
    s += `<path d="M560 440L620 300L700 240L780 230L860 280L900 300V440Z" fill="#1a3e48"/>`; // right mass
    s += `<path d="M300 440L360 300L400 200L430 120L452 86L470 130L500 220L540 330L590 440Z" fill="#3a6773"/>`; // Mitre Peak
    s += `<path d="M452 86L470 130L500 220L540 330L590 440L480 440L470 300L462 160Z" fill="#203f4a"/>`;
    s += `<path d="M430 120L452 86L462 160L448 140L440 170L432 150L420 180Z" fill="#e8f4f3" opacity=".9"/>`;
    s += `<path d="M380 250L404 216L398 270M412 196L420 180L416 236" stroke="#d9ecea" stroke-width="2.5" opacity=".6" fill="none"/>`;
    return s;
  };
  let s = land();
  s += `<path d="M700 300C702 340 698 380 704 440" stroke="#eaf8f6" stroke-width="5" opacity=".85" fill="none"/><ellipse cx="704" cy="438" rx="26" ry="9" fill="url(#w-mist)"/>`; // Stirling Falls
  s += `<rect x="0" y="440" width="900" height="120" fill="url(#w-water)"/>`;
  s += `<g opacity=".35" transform="translate(0 880) scale(1 -1)">${land()}</g>`;
  s += `<rect x="0" y="440" width="900" height="120" fill="#0b3a40" opacity=".35"/>`;
  for (let i = 0; i < 14; i++) { const y = 452 + i * 7, x = 140 + rnd() * 80; s += `<path d="M${f(x)} ${y}h${f(30 + rnd() * 60)}" stroke="#f2f0dc" stroke-width="1.6" opacity="${f(0.5 - i * 0.03)}"/>`; } // moonlight on the water
  // A small cruise boat with warm windows.
  s += `<path d="M560 490h120l-12 14h-98z" fill="#e9eeec"/><rect x="580" y="478" width="70" height="12" fill="#d5dedc"/><rect x="598" y="470" width="34" height="8" fill="#c2cdca"/>`;
  for (let i = 0; i < 6; i++) s += `<rect x="${585 + i * 11}" y="481" width="6" height="5" fill="#ffd27a"/>`;
  s += `<path d="M560 506h120" stroke="#ffd27a" stroke-opacity=".35" stroke-width="2"/>`;
  return s;
}

// ---------- The 50-turn map (task M4, owner-approved names) ----------

// The Parthenon (Greece): the temple on the Acropolis rock, floodlit gold, Athens below.
function parthenon(): string {
  const rnd = seeded(19);
  const lit = '#efd59e', mid = '#d2b47a', shade = '#8e7450', dark = '#5e4a32';
  let s = `<ellipse cx="450" cy="300" rx="340" ry="170" fill="url(#w-halo)"/>`;
  // The Acropolis rock, with the city's lights at its foot.
  s += `<path d="M0 560V470Q90 440 160 420L210 372Q260 360 330 362L600 360Q680 362 720 380L760 420Q840 440 900 452V560Z" fill="#3c5552"/>`;
  s += `<path d="M600 360Q680 362 720 380L760 420Q840 440 900 452V560H620Q660 470 600 360Z" fill="#26403f"/>`;
  s += `<path d="M210 372Q260 360 330 362L600 360Q680 362 720 380" stroke="#c9a46a" stroke-opacity=".35" stroke-width="3" fill="none"/>`;
  for (let i = 0; i < 90; i++) { const x = rnd() * 900, y = 495 + rnd() * 60; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + rnd() * 1.6)}" fill="${rnd() < 0.7 ? '#ffd27a' : '#fff3d0'}" opacity="${f(0.5 + rnd() * 0.5)}"/>`; }
  // The side colonnade, going back to the right (seen from the north-west corner).
  s += poly([[600, 352], [716, 330], [716, 338], [600, 362]], mid);
  for (let i = 1; i <= 7; i++) { const x = 600 + i * 15, y = 352 - i * 2.9; s += `<rect x="${f(x - 4)}" y="${f(y - 104 + i * 1.5)}" width="8" height="${f(104 - i * 1.5)}" fill="${i % 2 ? shade : mid}"/>`; }
  s += poly([[600, 222], [716, 214], [716, 232], [600, 244]], shade); // the side entablature
  s += poly([[600, 222], [716, 214], [716, 206], [600, 212]], dark, ' opacity=".7"');
  // The steps and the front: eight columns, the light glowing between them.
  for (let k = 0; k < 3; k++) s += `<rect x="${280 - k * 8}" y="${360 + k * 7}" width="${f(330 + k * 16)}" height="7" fill="${k % 2 ? mid : lit}"/>`;
  s += `<rect x="300" y="244" width="300" height="116" fill="url(#w-glow)" opacity=".75"/>`;
  s += `<rect x="300" y="244" width="300" height="116" fill="#3b2a20" opacity=".35"/>`;
  for (let i = 0; i < 8; i++) {
    const x = 304 + i * 41.5, w = 24;
    s += `<rect x="${f(x)}" y="244" width="${w}" height="116" fill="${lit}"/><rect x="${f(x + w * 0.6)}" y="244" width="${f(w * 0.4)}" height="116" fill="${mid}"/>`;
    for (let k = 1; k < 4; k++) s += `<path d="M${f(x + k * 6)} 248V358" stroke="${shade}" stroke-opacity=".45" stroke-width="1"/>`;
    s += `<rect x="${f(x - 3)}" y="238" width="${w + 6}" height="7" fill="${lit}"/>`; // the capital
  }
  s += `<rect x="294" y="222" width="312" height="16" fill="${mid}"/><rect x="294" y="212" width="312" height="10" fill="${lit}"/>`;
  for (let x = 300; x < 600; x += 13) s += `<rect x="${x}" y="214" width="5" height="7" fill="${shade}"/>`; // the triglyphs
  // The pediment, its right corner broken off.
  s += `<path d="M288 212L450 170L560 196L572 204L582 200L612 212Z" fill="${lit}"/><path d="M304 208L450 178L552 202L566 207L574 204L596 208Z" fill="${shade}" opacity=".55"/>`;
  s += `<path d="M450 170L560 196" stroke="#fff6dc" stroke-opacity=".5" stroke-width="2"/>`;
  // Olive trees on the slope.
  for (const [x, y] of [[110, 440], [170, 425], [760, 438], [830, 450], [250, 470], [690, 470]] as const) {
    s += `<path d="M${x} ${y}v14" stroke="#1b2a26" stroke-width="3"/>`;
    for (let i = 0; i < 5; i++) s += `<ellipse cx="${f(x + (rnd() - 0.5) * 26)}" cy="${f(y - 6 + (rnd() - 0.5) * 12)}" rx="${f(10 + rnd() * 6)}" ry="${f(7 + rnd() * 4)}" fill="#22423b"/>`;
  }
  return s + people(rnd, 6, 320, 600, 376);
}

// Petra (Jordan): the Treasury carved in rose rock at the end of the Siq, with "Petra by Night" candles.
function petra(): string {
  const rnd = seeded(23);
  const lit = '#dc9a7c', mid = '#b9765e', shade = '#7d4a3c', dark = '#4d2a24';
  let s = '';
  // The cliff around the facade, and the dark canyon walls on both sides.
  s += `<path d="M150 560V0H750V560Z" fill="#8a5446"/>`;
  for (let i = 0; i < 14; i++) s += `<path d="M150 ${f(30 + i * 38 + rnd() * 10)}Q450 ${f(20 + i * 38 + rnd() * 20)} 750 ${f(36 + i * 38 + rnd() * 10)}" stroke="#a7685a" stroke-opacity=".35" stroke-width="${f(3 + rnd() * 4)}" fill="none"/>`;
  s += `<ellipse cx="450" cy="330" rx="260" ry="230" fill="url(#w-halo)"/>`;
  // Lower storey: six columns under a pediment, the door glowing.
  s += `<rect x="270" y="320" width="360" height="170" fill="${mid}"/>`;
  s += `<rect x="420" y="372" width="60" height="118" fill="url(#w-glow)"/><rect x="420" y="372" width="60" height="10" fill="${shade}"/>`;
  for (const x of [282, 334, 386, 494, 546, 598]) { s += `<rect x="${x}" y="336" width="20" height="154" fill="${lit}"/><rect x="${x + 12}" y="336" width="8" height="154" fill="${mid}"/><rect x="${x - 4}" y="328" width="28" height="10" fill="${lit}"/>`; }
  s += `<rect x="262" y="306" width="376" height="22" fill="${lit}"/><rect x="262" y="320" width="376" height="5" fill="${shade}"/>`;
  s += `<path d="M370 306L450 270L530 306Z" fill="${lit}"/><path d="M386 302L450 280L514 302Z" fill="${shade}" opacity=".5"/>`;
  // Upper storey: the round kiosk (tholos) with its urn, between two half-pediments.
  s += `<rect x="290" y="210" width="320" height="60" fill="${shade}" opacity=".6"/>`;
  s += `<path d="M290 214L350 186L350 214Z" fill="${lit}"/><path d="M610 214L550 186L550 214Z" fill="${lit}"/>`;
  for (const x of [296, 330, 556, 590]) s += `<rect x="${x}" y="214" width="14" height="92" fill="${lit}"/>`;
  s += `<rect x="404" y="176" width="92" height="130" fill="${mid}"/>`;
  for (const x of [404, 432, 460, 482]) s += `<rect x="${x}" y="176" width="13" height="130" fill="${lit}"/>`;
  s += `<rect x="398" y="166" width="104" height="12" fill="${lit}"/><path d="M402 166Q450 128 498 166Z" fill="${mid}"/>`;
  s += `<path d="M440 130Q450 112 460 130L456 142H444Z" fill="${lit}"/><rect x="446" y="142" width="8" height="10" fill="${lit}"/>`; // the urn
  s += `<rect x="350" y="236" width="40" height="70" fill="${dark}" opacity=".55"/><rect x="510" y="236" width="40" height="70" fill="${dark}" opacity=".55"/>`;
  // The dark walls of the Siq framing the view.
  s += `<path d="M0 0H200Q170 120 190 260Q160 400 210 560H0Z" fill="#2a1a18"/><path d="M900 0H700Q740 140 712 280Q750 420 690 560H900Z" fill="#2a1a18"/>`;
  s += `<path d="M200 0Q170 120 190 260Q160 400 210 560" stroke="#7d4a3c" stroke-width="3" fill="none" opacity=".6"/><path d="M700 0Q740 140 712 280Q750 420 690 560" stroke="#7d4a3c" stroke-width="3" fill="none" opacity=".6"/>`;
  // The sandy floor with rows of candles.
  s += `<path d="M150 490H750L800 560H100Z" fill="#a8775e"/>`;
  for (let r = 0; r < 4; r++) for (let i = 0; i < 18 + r * 4; i++) {
    const t = (i + 0.5) / (18 + r * 4), x = 220 - r * 40 + t * (460 + r * 80), y = 500 + r * 15;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(5 + r)}" fill="#ffcf85" opacity=".25"/><rect x="${f(x - 2 - r * 0.5)}" y="${f(y - 3 - r)}" width="${f(4 + r)}" height="${f(5 + r)}" rx="1" fill="#ffe2a0"/>`;
  }
  return s + people(rnd, 6, 300, 600, 486);
}

// Angkor Wat (Cambodia): the five lotus-bud towers over the galleries, mirrored in the pond, sugar palms.
function angkorWat(): string {
  const rnd = seeded(29);
  const lit = '#b9b08d', mid = '#968d6c', shade = '#5f5a46';
  const tower = (x: number, base: number, w: number, h: number) => { // a lotus-bud tower: stacked tiers
    let s = '';
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = i / n, ww = w * (1 - t * 0.78) * (i === 0 ? 1.1 : 1), y = base - h * t, hh = h / n + 1;
      s += `<path d="M${f(x - ww / 2)} ${f(y)}Q${f(x - ww / 2 - 4)} ${f(y - hh * 0.6)} ${f(x - ww / 2 + 3)} ${f(y - hh)}H${f(x + ww / 2 - 3)}Q${f(x + ww / 2 + 4)} ${f(y - hh * 0.6)} ${f(x + ww / 2)} ${f(y)}Z" fill="${i % 2 ? mid : lit}"/>`;
      s += `<path d="M${f(x + ww * 0.1)} ${f(y)}V${f(y - hh)}H${f(x + ww / 2 - 3)}Q${f(x + ww / 2 + 4)} ${f(y - hh * 0.6)} ${f(x + ww / 2)} ${f(y)}Z" fill="${shade}" opacity=".45"/>`;
    }
    return s + `<path d="M${f(x)} ${f(base - h)}L${f(x - 4)} ${f(base - h + 6)}L${f(x + 4)} ${f(base - h + 6)}Z" fill="${lit}"/>`;
  };
  const temple = () => {
    let s = '';
    s += tower(250, 360, 54, 120) + tower(650, 360, 54, 120); // the far corner towers
    s += `<rect x="160" y="330" width="580" height="40" fill="${mid}"/><rect x="160" y="326" width="580" height="6" fill="${lit}"/>`;
    s += tower(330, 330, 64, 150) + tower(570, 330, 64, 150); // the near corner towers
    s += tower(450, 300, 86, 210); // the central tower
    s += `<rect x="90" y="370" width="720" height="44" fill="${lit}"/><rect x="90" y="366" width="720" height="6" fill="#d3cba7"/>`; // the outer gallery
    for (let x = 100; x < 800; x += 18) s += `<rect x="${x}" y="380" width="8" height="30" fill="${x > 420 && x < 480 ? 'url(#w-glow)' : shade}"/>`;
    s += `<path d="M410 414V380Q450 352 490 380V414Z" fill="url(#w-glow)"/>`; // the lit entrance
    return s;
  };
  let s = `<ellipse cx="450" cy="270" rx="320" ry="190" fill="url(#w-mist)" opacity=".4"/>` + temple();
  s += `<rect x="0" y="414" width="900" height="16" fill="#2f5a4a"/>`;
  s += `<rect x="0" y="430" width="900" height="130" fill="url(#w-water)"/>`;
  s += `<clipPath id="w-pond"><rect x="0" y="430" width="900" height="130"/></clipPath><g clip-path="url(#w-pond)" opacity=".35"><g transform="translate(0 844) scale(1 -1)">${temple()}</g></g>`;
  for (let i = 0; i < 10; i++) s += `<path d="M${f(380 + rnd() * 60)} ${448 + i * 10}h${f(40 + rnd() * 60)}" stroke="#ffe2a0" stroke-opacity="${f(0.3 - i * 0.02)}" stroke-width="1.5"/>`;
  // Sugar palms on both sides: thin trunks with round crowns of fronds.
  for (const [x, y, h] of [[40, 430, 190], [92, 432, 150], [800, 432, 170], [858, 430, 210], [140, 434, 110]] as const) {
    s += `<path d="M${x} ${y}Q${x + 6} ${y - h / 2} ${x + 2} ${y - h}" stroke="#0e2b27" stroke-width="4" fill="none"/>`;
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, r = 26; s += `<path d="M${x + 2} ${y - h}l${f(Math.cos(a) * r)} ${f(Math.sin(a) * r * 0.7)}" stroke="#0e2b27" stroke-width="5" stroke-linecap="round"/>`; }
  }
  for (let i = 0; i < 4; i++) s += `<ellipse cx="${f(240 + i * 150 + rnd() * 30)}" cy="${f(470 + rnd() * 50)}" rx="10" ry="4" fill="#e597b3" opacity=".75"/>`; // lotus flowers
  return s + people(rnd, 6, 260, 640, 426);
}

// Mount Kilimanjaro (Tanzania): the flat snowy top of Kibo over the savanna, acacias and elephants.
function kilimanjaro(): string {
  const rnd = seeded(31);
  let s = `<ellipse cx="450" cy="250" rx="380" ry="170" fill="url(#w-mist)" opacity=".35"/>`;
  s += `<path d="M0 430Q160 360 300 250Q350 196 380 182L560 176Q600 186 650 240Q760 350 900 410V470H0Z" fill="#3f6a74"/>`; // Kibo
  s += `<path d="M470 178L560 176Q600 186 650 240Q760 350 900 410V470H620Q560 300 470 178Z" fill="#284e58" opacity=".85"/>`;
  s += `<path d="M380 182L560 176Q590 184 612 208L596 204L584 224L566 206L552 230L534 210L516 236L500 212L482 238L466 214L448 236L432 212L414 232L400 208L384 226L362 206Q370 190 380 182Z" fill="#eef7f6"/>`; // the snow
  s += `<path d="M500 178L560 176Q590 184 612 208L596 204L584 224L566 206L552 230L534 210L516 236L500 212Z" fill="#b4d0d4"/>`;
  s += `<path d="M640 280L700 300L690 316L660 304Z" fill="#dfeeee" opacity=".7"/><path d="M290 270L320 258L314 276Z" fill="#dfeeee" opacity=".6"/>`; // glaciers
  s += `<path d="M120 400Q190 350 240 330Q270 320 300 336Q340 360 380 400Z" fill="#335c64"/>`; // Mawenzi's shoulder
  s += `<ellipse cx="450" cy="380" rx="420" ry="26" fill="url(#w-mist)" filter="url(#w-blur)"/>`;
  s += `<path d="M0 440Q300 410 520 430T900 420V560H0Z" fill="#3f5236"/><path d="M0 480Q260 460 480 482T900 470V560H0Z" fill="#2c3d27"/>`; // the savanna
  for (let i = 0; i < 70; i++) { const x = rnd() * 900, y = 446 + rnd() * 100; s += `<path d="M${f(x)} ${f(y)}l2 -7l2 7" stroke="#6d8253" stroke-width="1" fill="none" opacity=".6"/>`; }
  const acacia = (x: number, y: number, k: number) => // an umbrella thorn tree
    `<path d="M${x} ${y}L${x + 3 * k} ${y - 34 * k}M${x + 2 * k} ${y - 22 * k}L${x - 14 * k} ${y - 36 * k}M${x + 3 * k} ${y - 30 * k}L${x + 18 * k} ${y - 40 * k}" stroke="#14231c" stroke-width="${f(3 * k)}" fill="none"/>`
    + `<ellipse cx="${x + 2 * k}" cy="${f(y - 40 * k)}" rx="${f(42 * k)}" ry="${f(9 * k)}" fill="#14231c"/>`;
  s += acacia(120, 500, 1.6) + acacia(700, 488, 1.2) + acacia(820, 506, 1.8) + acacia(330, 470, 0.8);
  const elephant = (x: number, y: number, k: number) => // a walking elephant, facing left
    `<g fill="#1a2620" transform="translate(${x} ${y}) scale(${k})"><path d="M0 -30Q4 -46 24 -48Q46 -50 58 -36Q64 -26 60 -14L58 0H50L48 -12H22L20 0H12L10 -14Q2 -14 -4 -8L-6 4L-12 4L-10 -10Q-12 -22 0 -30Z"/><path d="M14 -40Q6 -44 4 -32Q10 -26 18 -30Z" fill="#26352d"/></g>`;
  s += elephant(430, 512, 1.1) + elephant(500, 516, 0.9) + elephant(560, 518, 0.55);
  return s;
}

// The wonders by area id: the 30-turn map's (src/maps/map30.ts) and the 4 new ones of the 50-turn map
// (src/maps/map50.ts; its Peru uses the Machu Picchu drawing of peru-bolivia).
const WONDERS: Record<string, () => string> = {
  italy: colosseum,
  india: tajMahal,
  japan: fuji,
  egypt: pyramids,
  mexico: chichenItza,
  'peru-bolivia': machuPicchu,
  'new-zealand': milfordSound,
  greece: parthenon,
  jordan: petra,
  'cambodia-laos-vietnam': angkorWat,
  tanzania: kilimanjaro,
};

const dir = new URL('../assets/wonders/', import.meta.url);
mkdirSync(dir, { recursive: true });
for (const [id, draw] of Object.entries(WONDERS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">${DEFS}${draw()}</svg>`;
  writeFileSync(new URL(`${id}.svg`, dir), svg);
  console.log(`${id}: ${Math.round(svg.length / 1024)} KB`);
}
