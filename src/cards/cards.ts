// Event cards (rulebook section 10, docs/engine.md task 11). Reviewed by the owner on
// docs/cards.md (made by `node scripts/cards-review.ts`).
// - points: the change in points (never below 0 in the game);
// - loseTurn: in an area the turn is lost; on a trip the plane or ship is one turn late;
// - area: a country card that is only drawn in that area.
import type { EventCard } from '../engine/types.ts';

export const CARDS: readonly EventCard[] = [
  // ---------- country cards: anywhere ----------
  { id: 'c1', deck: 'country', points: 1, text: 'A street musician teaches you a local song.' },
  { id: 'c2', deck: 'country', points: 1, text: 'A family invites you to dinner and shows you old photos of their town.' },
  { id: 'c3', deck: 'country', points: 1, text: 'You find a shortcut on an old map in the market.' },
  { id: 'c4', deck: 'country', points: 1, text: 'You help a lost tourist find the museum. They thank you with a postcard.' },
  { id: 'c5', deck: 'country', points: -1, text: 'Rain all day! Your shoes are soaked and you buy new socks.' },
  { id: 'c6', deck: 'country', points: -1, text: 'You forgot your water bottle and must buy a new one.' },
  { id: 'c7', deck: 'country', points: -1, text: 'Your phone battery dies and you pay for a charger.' },
  { id: 'c8', deck: 'country', points: 2, text: 'A local newspaper writes a story about your journey.' },
  { id: 'c9', deck: 'country', points: -2, text: 'Your backpack strap breaks. A new bag costs extra.' },
  { id: 'c10', deck: 'country', points: 0, loseTurn: true, text: 'A big festival fills every street. You stay and watch the parade.' },
  { id: 'c11', deck: 'country', points: 5, text: 'A museum hires you for a day to guide visitors from your country.' },
  { id: 'c12', deck: 'country', points: -5, text: 'You leave your wallet on a bench and never see it again.' },

  // ---------- country cards: one area only ----------
  { id: 'a1', deck: 'country', area: 'egypt', points: 5, text: 'You find a treasure near the pyramids of Egypt and give it to the museum. They reward you.' },
  { id: 'a2', deck: 'country', area: 'italy', points: 1, text: 'You throw a coin in a fountain in Rome. A friendly guide gives you a free tour.' },
  { id: 'a3', deck: 'country', area: 'india', points: 1, text: 'You watch the sunrise at the Taj Mahal with no crowds.' },
  { id: 'a4', deck: 'country', area: 'japan', points: 2, text: 'You ride the bullet train in Japan and arrive early everywhere.' },
  { id: 'a5', deck: 'country', area: 'mexico', points: 1, text: 'You climb a pyramid at Chichén Itzá and hear its echo clap back.' },
  { id: 'a6', deck: 'country', area: 'peru-bolivia', points: 0, loseTurn: true, text: 'The mountains are high. You rest a day to get used to the thin air.' },
  { id: 'a7', deck: 'country', area: 'new-zealand', points: 1, text: 'You walk through the hobbit village used in the films.' },
  { id: 'a8', deck: 'country', area: 'iceland', points: -1, text: 'A volcano puffs ash. Your bus tour is cancelled.' },
  { id: 'a9', deck: 'country', area: 'france', points: 1, text: 'A baker in Paris gives you a warm croissant for free.' },
  { id: 'a10', deck: 'country', area: 'brazil-north', points: -1, text: 'Mosquitoes in the Amazon! You buy a net and some cream.' },
  { id: 'a11', deck: 'country', area: 'scandinavia', points: 2, text: 'You see the northern lights dance across the sky.' },
  { id: 'a12', deck: 'country', area: 'china-east', points: 1, text: 'You walk along the Great Wall on a clear day.' },

  // ---------- plane cards ----------
  { id: 'p1', deck: 'plane', points: 1, text: 'The pilot invites you to see the cockpit.' },
  { id: 'p2', deck: 'plane', points: 1, text: 'You get a window seat and a great view of the clouds.' },
  { id: 'p3', deck: 'plane', points: 1, text: 'Your neighbour on the plane tells you the best places to visit.' },
  { id: 'p4', deck: 'plane', points: 1, text: 'You get a free meal upgrade.' },
  { id: 'p5', deck: 'plane', points: -1, text: 'Bumpy air! You spill juice on your map and buy a new one.' },
  { id: 'p6', deck: 'plane', points: -1, text: 'Your headphones break during the flight.' },
  { id: 'p7', deck: 'plane', points: -1, text: 'You pay extra for a bag that is too heavy.' },
  { id: 'p8', deck: 'plane', points: 2, text: 'The airline gives you bonus miles for flying with them.' },
  { id: 'p9', deck: 'plane', points: -2, text: 'Your suitcase goes to the wrong city. You buy new clothes.' },
  { id: 'p10', deck: 'plane', points: 0, loseTurn: true, text: 'Thick fog at the airport. Your flight lands one turn late.' },

  // ---------- ship cards ----------
  { id: 's1', deck: 'ship', points: 1, text: 'Dolphins swim next to the ship.' },
  { id: 's2', deck: 'ship', points: 1, text: 'The captain teaches you how to tie sailor knots.' },
  { id: 's3', deck: 'ship', points: 1, text: 'You see a whale jump out of the water.' },
  { id: 's4', deck: 'ship', points: -1, text: 'Big waves! You feel seasick and buy medicine.' },
  { id: 's5', deck: 'ship', points: -1, text: 'Your hat flies into the sea.' },
  { id: 's6', deck: 'ship', points: -1, text: 'You pay for a cabin with a window after a noisy night.' },
  { id: 's7', deck: 'ship', points: 2, text: 'You help the crew in a storm. The captain thanks you.' },
  { id: 's8', deck: 'ship', points: -2, text: 'Seagulls steal your lunch, and the ship café is expensive.' },
  { id: 's9', deck: 'ship', points: 0, loseTurn: true, text: 'Strong winds! The ship arrives one turn late.' },
  { id: 's10', deck: 'ship', points: 0, loseTurn: true, text: 'The engine needs repairs. The ship waits one turn at sea.' },
  { id: 's11', deck: 'ship', points: -5, text: 'Pirates! They take part of your money before the navy chases them away.' },

  // ---------- Backpacker cards (helpers, only for the Backpacker, in an area) ----------
  { id: 'b1', deck: 'backpacker', points: 2, text: 'A truck driver takes you further down the road for free.' },
  { id: 'b2', deck: 'backpacker', points: 2, text: 'A friend you met on the road pays your next bus ticket.' },
  { id: 'b3', deck: 'backpacker', points: 2, text: 'You work a week on a farm and get free food and a bed.' },
  { id: 'b4', deck: 'backpacker', points: 1, text: 'A hostel gives you a free night for fixing their sign.' },
  { id: 'b5', deck: 'backpacker', points: 1, text: 'Other backpackers share their dinner with you.' },
  { id: 'b6', deck: 'backpacker', points: 1, text: 'You find a free walking tour of the old town.' },
  { id: 'b7', deck: 'backpacker', points: 1, text: 'You sell your old guidebook to another traveller.' },
  { id: 'b8', deck: 'backpacker', points: 1, text: 'A local lends you a bike for the day.' },
];
