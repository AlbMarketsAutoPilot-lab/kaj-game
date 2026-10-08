// Event cards (rulebook section 10, docs/engine.md task 11). Reviewed by the owner on
// docs/cards.md (made by `node scripts/cards-review.ts`). Since task 12 there are no cards on
// trips (a travel turn may have a challenge instead): the 21 plane and ship cards were rewritten
// as country cards for the walking part of the game (c13–c33, same strengths).
// - points: the change in points (never below 0 in the game);
// - loseTurn: the turn is lost;
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
  // Task 12: rewritten from the plane and ship cards (same strengths).
  { id: 'c13', deck: 'country', points: 1, text: 'A farmer invites you to pick fresh fruit from her trees.' },
  { id: 'c14', deck: 'country', points: 1, text: 'You climb a hill and get a great view of the whole valley.' },
  { id: 'c15', deck: 'country', points: 1, text: 'A friendly walker on the road tells you the best places to visit.' },
  { id: 'c16', deck: 'country', points: 1, text: 'A café owner gives you a free lunch for your stories.' },
  { id: 'c17', deck: 'country', points: 1, text: 'Wild horses run next to the path you are walking on.' },
  { id: 'c18', deck: 'country', points: 1, text: 'A shepherd teaches you how to call the sheep home.' },
  { id: 'c19', deck: 'country', points: 1, text: 'You see a rainbow over the mountains and take a great photo.' },
  { id: 'c20', deck: 'country', points: -1, text: 'You trip on a stone and spill juice on your map. You buy a new one.' },
  { id: 'c21', deck: 'country', points: -1, text: 'Your headphones break on a long walk.' },
  { id: 'c22', deck: 'country', points: -1, text: 'Your bag is too heavy, so you pay to send some things home.' },
  { id: 'c23', deck: 'country', points: -1, text: 'Too much sun! You buy a hat and sun cream.' },
  { id: 'c24', deck: 'country', points: -1, text: 'The wind blows your hat into a river.' },
  { id: 'c25', deck: 'country', points: -1, text: 'A noisy night in a cheap hotel. You pay for a quieter room.' },
  { id: 'c26', deck: 'country', points: 2, text: 'The town gives you a travel badge for walking so far.' },
  { id: 'c27', deck: 'country', points: 2, text: 'You help a village after a storm. The mayor thanks you.' },
  { id: 'c28', deck: 'country', points: -2, text: 'You lose your suitcase at the bus station and buy new clothes.' },
  { id: 'c29', deck: 'country', points: -2, text: 'Monkeys steal your lunch, and the only café is expensive.' },
  { id: 'c30', deck: 'country', points: 0, loseTurn: true, text: 'Thick fog on the road. You wait a day until you can see the path.' },
  { id: 'c31', deck: 'country', points: 0, loseTurn: true, text: 'Strong winds close the mountain road for a day.' },
  { id: 'c32', deck: 'country', points: 0, loseTurn: true, text: 'Your shoes need repairs. You wait one day at the shoemaker.' },
  { id: 'c33', deck: 'country', points: -5, text: 'A sneaky thief takes part of your money before the police chase him away.' },

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
