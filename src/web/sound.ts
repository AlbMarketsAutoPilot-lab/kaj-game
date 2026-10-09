// Sounds (task 14C): one short sound per event, a 15-second loop under the timed questions and
// quiet background music. The files (assets/sounds) are put into the page by the build as data
// URIs; a missing one stays silent. The 🔊 button turns everything on or off, kept on the device.

export type SoundName = 'tap' | 'walk' | 'plane' | 'ship' | 'train' | 'right' | 'wrong' | 'card-good' | 'card-bad'
  | 'coins' | 'citizenship' | 'milestone' | 'win';

const FILES: Record<string, string> = (window as unknown as { KAJ_SOUNDS?: Record<string, string> }).KAJ_SOUNDS ?? {};
const OFF_KEY = 'kaj-sound-off';
// Music is normal on the start screen and quiet during the game (owner's request).
const MUSIC_VOLUME = { menu: 0.5, game: 0.12 };

let off = (() => { try { return localStorage.getItem(OFF_KEY) === '1'; } catch { return false; } })();
let music: HTMLAudioElement | null = null;
let musicLevel: keyof typeof MUSIC_VOLUME = 'menu';
let timer: HTMLAudioElement | null = null;

function audio(name: string): HTMLAudioElement | null {
  return FILES[name] ? new Audio(FILES[name]) : null;
}

// Browsers block sound until the first tap, so the music (re)starts from a tap.
function startMusic(): void {
  if (off) return;
  music ??= audio('music');
  if (!music) return;
  music.loop = true;
  music.volume = MUSIC_VOLUME[musicLevel];
  if (music.paused) music.play().catch(() => { /* waits for the next tap */ });
}

export function play(name: SoundName): void {
  if (off) return;
  audio(name)?.play().catch(() => { /* blocked or unsupported: stay silent */ });
}

export function setMusic(level: keyof typeof MUSIC_VOLUME): void {
  musicLevel = level;
  if (music) music.volume = MUSIC_VOLUME[level];
}

// The 15-second loop under a timed question (quiz, test, challenge).
export function startTimer(): void {
  stopTimer();
  if (off) return;
  timer = audio('timer');
  timer?.play().catch(() => { /* stay silent */ });
}

export function stopTimer(): void {
  timer?.pause();
  timer = null;
}

export const soundOn = () => !off;

export function toggleSound(): void {
  off = !off;
  try { localStorage.setItem(OFF_KEY, off ? '1' : '0'); } catch { /* not kept */ }
  if (off) {
    music?.pause();
    stopTimer();
  } else {
    startMusic();
  }
}

// Every button tap clicks, and the first tap starts the music.
document.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest?.('button')) play('tap');
  startMusic();
}, true);
