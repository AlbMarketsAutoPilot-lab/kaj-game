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

  // ---------- Backpacker cards (helpers; not drawn since step 2.6, kept by the owner as a lever for step 2.7) ----------
  { id: 'b1', title: '🚚 A free ride', deck: 'backpacker', points: 2, text: 'A truck driver takes you further down the road for free.' },
  { id: 'b2', title: '🎟️ A friend pays the bus', deck: 'backpacker', points: 2, text: 'A friend you met on the road pays your next bus ticket.' },
  { id: 'b3', title: '🌾 A week on a farm', deck: 'backpacker', points: 2, text: 'You work a week on a farm and get free food and a bed.' },
  { id: 'b4', title: '🛏️ A free night', deck: 'backpacker', points: 1, text: 'A hostel gives you a free night for fixing their sign.' },
  { id: 'b5', title: '🍝 Shared dinner', deck: 'backpacker', points: 1, text: 'Other backpackers share their dinner with you.' },
  { id: 'b6', title: '🗺️ Free walking tour', deck: 'backpacker', points: 1, text: 'You find a free walking tour of the old town.' },
  { id: 'b7', title: '📘 Guidebook sold', deck: 'backpacker', points: 1, text: 'You sell your old guidebook to another traveller.' },
  { id: 'b8', title: '🚲 A borrowed bike', deck: 'backpacker', points: 1, text: 'A local lends you a bike for the day.' },
];
