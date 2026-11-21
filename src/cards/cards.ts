// Event cards (rulebook section 10, docs/engine.md task 11). Reviewed by the owner on
// docs/cards.md (made by `node scripts/cards-review.ts`). Since task 12 there are no cards on
// trips (a travel turn may have a challenge instead): the 21 plane and ship cards were rewritten
// as country cards for the walking part of the game (c13–c33, same strengths).
// - points: the change in points (never below 0 in the game);
// - loseTurn: the turn is lost;
// - area: a country card that is only drawn in that area (none since step 2.8);
// - title: the news headline (owner's request, task 14k), written by Claude for the owner to check.
// Step 2.8 (owner): the country cards are news about the country the player stands in. {country}, {capital} and
// {currency} are filled in when the card is drawn (src/engine/engine.ts, newsCard); `big` is the text used in a
// part of a big country, which never names the capital.
import type { EventCard } from '../engine/types.ts';

export const CARDS: readonly EventCard[] = [
  // ---------- country cards: anywhere ----------
  { id: 'c1', title: '🏛️ Free museum week', deck: 'country', points: 1, text: '{capital} opens its national museum for free this week. You spend the day learning the history of {country}.', big: 'Museums across {country} open for free this week. You spend the day learning the history of the country.' },
  { id: 'c2', title: '💵 Good exchange rate', deck: 'country', points: 1, text: 'The {currency} falls against other currencies. Visitors to {country} get more for their money today.' },
  { id: 'c3', title: '🎶 Free concerts', deck: 'country', points: 1, text: '{capital} holds a free open-air music festival this weekend. You dance with the locals until late.', big: 'Towns across {country} hold free open-air concerts this weekend. You dance with the locals until late.' },
  { id: 'c4', title: '🌳 Parks open for free', deck: 'country', points: 1, text: 'The national parks of {country} are free for one week. You hike with a ranger as your guide.' },
  { id: 'c5', title: '🌧️ Heavy rain warning', deck: 'country', points: -1, text: 'Weather services in {country} warn of heavy rain all day. You buy a raincoat at the market.' },
  { id: 'c6', title: '🔌 Power cut', deck: 'country', points: -1, text: 'A power cut hits {capital} for several hours. You pay a café to charge your phone.', big: 'A power cut hits parts of {country} for several hours. You pay a café to charge your phone.' },
  { id: 'c7', title: '🚧 Main road closed', deck: 'country', points: -1, text: 'Roadworks close a main road in {country}. The detour costs you an extra fare.' },
  { id: 'c8', title: '📰 On the front page', deck: 'country', points: 2, text: 'A newspaper in {capital} asks visitors what they love about {country}. Your answer makes the front page.', big: 'A national newspaper asks visitors what they love about {country}. Your answer makes the front page.' },
  { id: 'c9', title: '💱 Prices jump', deck: 'country', points: -2, text: 'The {currency} jumps overnight. Prices in {country} go up for visitors.' },
  { id: 'c10', title: '🎉 National holiday', deck: 'country', points: 0, loseTurn: true, text: 'Today is a national holiday in {country}. Shops, offices and ticket desks are closed.' },
  { id: 'c11', title: '🎟️ Guides wanted', deck: 'country', points: 5, text: 'The national museum in {capital} expects record crowds and hires visitors as guides. You are paid well.', big: 'Museums in {country} expect record crowds and hire visitors as guides for a day. You are paid well.' },
  { id: 'c12', title: '🚨 Pickpocket warning', deck: 'country', points: -5, text: 'Police in {capital} warn of pickpockets on crowded buses. Too late: your wallet is gone.', big: 'Police in {country} warn of pickpockets on crowded buses. Too late: your wallet is gone.' },
  // Task 12: rewritten from the plane and ship cards (same strengths).
  { id: 'c13', title: '🍲 National food fair', deck: 'country', points: 1, text: 'The yearly food fair opens in {capital}. Farmers from all over {country} give free tastings.', big: 'A national food fair opens. Farmers from all over {country} give free tastings.' },
  { id: 'c14', title: '🗣️ Free language classes', deck: 'country', points: 1, text: 'Libraries in {country} offer visitors free language classes. You learn enough to bargain at the market.' },
  { id: 'c15', title: '🚌 Free buses today', deck: 'country', points: 1, text: 'Buses in {capital} are free today to keep cars out of the centre. You see the whole city for nothing.', big: 'Local buses in {country} are free today to keep cars off the roads. You ride across town for nothing.' },
  { id: 'c16', title: '☀️ A week of clear skies', deck: 'country', points: 1, text: 'Forecasters promise a week of sunshine over {country}. Perfect days for walking and sightseeing.' },
  { id: 'c17', title: '📸 Photo of the month', deck: 'country', points: 1, text: 'The tourist board of {country} picks the best visitor photo of the month. Yours wins a prize.' },
  { id: 'c18', title: '⚽ The home team wins', deck: 'country', points: 1, text: 'The national football team of {country} wins a big match. Strangers buy you dinner to celebrate.' },
  { id: 'c19', title: '🎓 Students give free tours', deck: 'country', points: 1, text: 'History students in {capital} run free walking tours to practise for their guide exams.', big: 'History students in {country} run free walking tours to practise for their guide exams.' },
  { id: 'c20', title: '🏷️ New visitor tax', deck: 'country', points: -1, text: '{capital} starts a new tax for visitors today. You pay it at your hotel.', big: 'Cities in {country} start a new tax for visitors today. You pay it at your hotel.' },
  { id: 'c21', title: '🏧 Cash machines empty', deck: 'country', points: -1, text: 'Cash machines in {country} run out of money for the weekend. You pay a high fee to change money.' },
  { id: 'c22', title: '🌡️ Hottest day of the year', deck: 'country', points: -1, text: 'It is the hottest day of the year in {country}. Cold water sells out and the last bottles cost double.' },
  { id: 'c23', title: '🎫 Ticket prices go up', deck: 'country', points: -1, text: 'Museums and sights in {country} raise their ticket prices for visitors from today.' },
  { id: 'c24', title: '🌬️ Storm warning', deck: 'country', points: -1, text: 'A storm sweeps across {country}. Your umbrella breaks and you buy a new one.' },
  { id: 'c25', title: '🚕 Taxi prices up', deck: 'country', points: -1, text: 'Taxi drivers in {capital} raise their prices for the holiday season.', big: 'Taxi drivers in {country} raise their prices for the holiday season.' },
  { id: 'c26', title: '🎥 On national TV', deck: 'country', points: 2, text: 'National TV in {country} films a programme about travellers. They pay you for an interview.' },
  { id: 'c27', title: '🤝 Volunteers after the storm', deck: 'country', points: 2, text: 'A storm damages a village in {country}. You join the volunteers, and the mayor thanks you with a free stay.' },
  { id: 'c28', title: '🏨 Hotels full', deck: 'country', points: -2, text: 'A big trade fair fills every hotel in {capital}. The only free room costs twice the usual price.', big: 'A big trade fair fills the hotels in {country}. The only free room costs twice the usual price.' },
  { id: 'c29', title: '🧳 Luggage mix-up', deck: 'country', points: -2, text: 'A computer fault mixes up luggage at bus stations across {country}. You buy clothes while you wait for yours.' },
  { id: 'c30', title: '🌫️ Fog closes the roads', deck: 'country', points: 0, loseTurn: true, text: 'Thick fog covers {country}. Police close the roads until it lifts.' },
  { id: 'c31', title: '🚆 Transport strike', deck: 'country', points: 0, loseTurn: true, text: 'Strike in {capital}: buses and trains stop for a day. Nobody leaves the city.', big: 'Strike across {country}: buses and trains stop for a day. Nobody travels.' },
  { id: 'c32', title: '🏃 Marathon day', deck: 'country', points: 0, loseTurn: true, text: 'The {capital} marathon closes the city centre all day. You cannot get through until the runners finish.', big: 'A city marathon in {country} closes the roads all day. You cannot get through until the runners finish.' },
  { id: 'c33', title: '⛽ Fuel shortage', deck: 'country', points: -5, text: 'A fuel shortage hits {country}. Buses run half their routes, and private drivers charge five times the price.' },

  // Step 2.8 (owner, option 1): the 12 old own-area cards (a1–a12) are general cards now, with the same points.
  { id: 'c34', title: '🏆 Visitor of the year', deck: 'country', points: 5, text: 'The tourist board of {country} names you its visitor of the year. The prize is a free week of travel.' },
  { id: 'c35', title: '🥾 A new walking trail', deck: 'country', points: 1, text: 'A new long-distance walking trail opens in {country}. You walk the first part with the park rangers.' },
  { id: 'c36', title: '🎭 Theatre in the streets', deck: 'country', points: 1, text: '{capital} opens its yearly theatre festival with free shows in the streets.', big: 'Towns across {country} open their theatre festivals with free shows in the streets.' },
  { id: 'c37', title: '🏅 World champions', deck: 'country', points: 2, text: 'Athletes from {country} win a world title. You join the free party to welcome them home.' },
  { id: 'c38', title: '🧺 Market of the year', deck: 'country', points: 1, text: 'The biggest market of the year opens in {capital}. Traders give visitors free samples.', big: 'The biggest market of the year opens in {country}. Traders give visitors free samples.' },
  { id: 'c39', title: '🌊 Rivers flood the roads', deck: 'country', points: 0, loseTurn: true, text: 'Rivers in {country} burst their banks after heavy rain. The roads are closed for a day.' },
  { id: 'c40', title: '🌱 Tree-planting day', deck: 'country', points: 1, text: '{country} holds its national tree-planting day. You help plant a forest, and the village feeds you.' },
  { id: 'c41', title: '🚦 Holiday traffic jams', deck: 'country', points: -1, text: 'A holiday weekend starts in {country}, and every road out of town is jammed. Your bus ticket costs more.' },
  { id: 'c42', title: '🚌 Half-price tickets', deck: 'country', points: 1, text: 'Bus companies in {country} sell half-price tickets this week to bring back visitors.' },
  { id: 'c43', title: '📶 Internet down', deck: 'country', points: -1, text: 'A cable fault cuts the internet across {country} for a day. You pay for calls to change your bookings.' },
  { id: 'c44', title: '🏛️ A new World Heritage site', deck: 'country', points: 2, text: 'UNESCO adds a site in {country} to the World Heritage List. Free tours celebrate the news.' },
  { id: 'c45', title: '🎆 The city’s birthday', deck: 'country', points: 1, text: '{capital} celebrates its birthday with free fireworks over the old town.', big: 'A city in {country} celebrates its birthday with free fireworks over the old town.' },

  // ---------- Kris Ann's cards (step 2.11, owner-approved texts and pictures) ----------
  // Drawn only by Kris Ann, instead of a news card, none twice in a game; shown to every player as a picture popup,
  // also when Kris Ann is a robot. Each reminds of one rule. points: 30-turn game; points50: the 50-turn game.
  { id: 'k1', title: '🧠 Good at quizzes', deck: 'krisann', points: 2, text: '“Travelling for free with a quiz?” asks Dad. “Then answer correctly, or you lose the turn! After 3 wrong answers in the same place, you must pay anyway, or go home.” Kris Ann is good at quizzes!' },
  { id: 'k2', title: '📸 A wonder!', deck: 'krisann', points: 1, text: '“Our first visit to a wonder gives 1 point more,” says Dad. “But if someone owns its guided tours, we pay them 1 point to go in. Lucky us, nobody does!” Kris Ann takes plenty of pictures of the wonder.' },
  { id: 'k3', title: '🌍 One more area to go', deck: 'krisann', points: 1, text: 'Dad counts on his fingers: “Visit every area of a continent and it gives you a bonus, once.” Kris Ann marks the missing areas on her map.' },
  { id: 'k4', title: '🌠 Exploring is good', deck: 'krisann', points: 0, points50: 1, text: '“Why explore?” asks Kris Ann. “Because every new area gives 1 point,” says Dad, “and the first step on a new continent gives 2 more. Places we have already visited give 0.” Exploring is not bad after all!' },
  { id: 'k5', title: '🛂 Visa required', deck: 'krisann', points: 0, text: '“Stop!” says Dad. “This country needs a visa! Answer correctly 2 of 3 questions about the country, pay the 2-point visa, and you can enter.” Kris Ann thinks a bit, then changes direction!' },
  { id: 'k6', title: '🏢 Not for sale', deck: 'krisann', points: -1, text: 'Dad explains to Kris Ann: “A business 🏢 earns points when others use it. At the end, it still counts what you paid for it: 2 points + 0 business or 0 points + 2 business = 2 points. Whoever owns the most businesses gets +1 more.” Kris Ann can’t own one, and she sulks.' },
  { id: 'k7', title: '🎲 Too fast!', deck: 'krisann', points: -1, text: 'On a long trip Kris Ann accepts a challenge! Dad explains: “A right answer gives 1 point, a wrong one takes 1 away.” Kris Ann answers before he finishes, and gets it wrong.' },
  { id: 'k8', title: '⏰ The missed plane', deck: 'krisann', points: -2, points50: -1, text: 'Dad explains to Kris Ann: “The free quiz trip is slower. Paying costs more, but we get there faster.” Kris Ann can’t decide, and the plane leaves without them.' },
];
