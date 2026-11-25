// The 100-turn map's facts sorted by country (version 2.0, step 2.12 part J4, owner-approved plan).
// For each 50-turn area split on the 100-turn map: the 100-turn area of each of its facts, in order.
// A fact about several parts goes to each, joined with "+"; "-" means no area (a fact that repeats
// another one in the same 100-turn area). Areas that are the same place on both maps keep all their facts.
// Sorted by Claude, fact by fact, by the country each fact is about.

export const SORT_100: Readonly<Record<string, readonly string[]>> = {
  // ---------- Europe ----------
  'uk-ireland': ['uk', 'uk', 'ireland', 'uk', 'uk', 'uk', 'uk', 'uk', 'uk', 'ireland', 'uk', 'ireland'],
  benelux: ['netherlands', 'netherlands', 'belgium-luxembourg', 'belgium-luxembourg', 'netherlands', 'netherlands', 'netherlands', 'netherlands', 'belgium-luxembourg', 'belgium-luxembourg', 'netherlands', 'netherlands'],
  alps: ['switzerland', 'austria', 'switzerland', 'switzerland', 'switzerland', 'switzerland', 'austria', 'austria', 'switzerland', 'austria', 'switzerland', 'switzerland'],
  scandinavia: ['norway+sweden+denmark', 'denmark', 'norway', 'norway', 'denmark', 'sweden', 'denmark', 'norway+sweden', 'sweden', 'norway', 'sweden', 'denmark'],
  'czechia-slovakia-hungary': ['hungary', 'hungary', 'czechia', 'czechia', 'hungary', 'hungary', 'slovakia', 'czechia', 'czechia', 'hungary', 'slovakia', 'hungary'],
  'belarus-ukraine-moldova': ['ukraine', 'ukraine', 'ukraine', 'moldova', 'ukraine', 'belarus', 'ukraine', 'ukraine', 'ukraine', 'belarus', 'ukraine', 'moldova'],
  'western-balkans': ['slovenia-croatia', 'slovenia-croatia', 'slovenia-croatia', 'slovenia-croatia', 'serbia-kosovo-macedonia', 'bosnia-montenegro', 'bosnia-montenegro', 'serbia-kosovo-macedonia', 'slovenia-croatia', 'slovenia-croatia', 'serbia-kosovo-macedonia', 'albania'],
  'romania-bulgaria': ['romania', 'bulgaria', 'romania', 'bulgaria', 'bulgaria', 'romania', 'romania', 'romania', 'bulgaria', 'bulgaria', 'romania', 'romania'],
  // ---------- Asia ----------
  'saudi-yemen': ['saudi-arabia+yemen', 'saudi-arabia+yemen', 'saudi-arabia', 'yemen', 'yemen', 'yemen', 'saudi-arabia', 'saudi-arabia', 'saudi-arabia', 'yemen', 'saudi-arabia+yemen', 'yemen'],
  'gulf-states': ['gulf-states', 'gulf-states+oman', 'gulf-states+oman', 'oman', 'gulf-states', 'gulf-states', 'gulf-states', 'gulf-states', 'gulf-states', 'gulf-states', 'gulf-states', 'gulf-states'],
  'central-asia': ['uzbekistan', 'uzbekistan', 'turkmenistan', 'kyrgyzstan-tajikistan', 'kyrgyzstan-tajikistan', 'kyrgyzstan-tajikistan', 'turkmenistan', 'uzbekistan', 'turkmenistan', 'kyrgyzstan-tajikistan', 'uzbekistan', 'kyrgyzstan-tajikistan'],
  'pakistan-afghanistan': ['pakistan', 'pakistan', 'pakistan', 'pakistan', 'pakistan', 'afghanistan', 'afghanistan', 'afghanistan', 'pakistan', 'pakistan', 'pakistan', 'pakistan+afghanistan'],
  india: ['india', 'india', 'india', 'india', 'india', 'sri-lanka', 'sri-lanka', 'india', 'india', 'india', 'india', 'india'],
  'cambodia-laos-vietnam': ['cambodia', 'vietnam', 'cambodia+laos+vietnam', 'laos', 'vietnam', 'vietnam', 'cambodia', 'laos', 'vietnam', 'laos', 'vietnam', 'cambodia'],
  'maritime-asia': ['indonesia', 'indonesia', 'indonesia', 'indonesia', 'indonesia', 'indonesia', 'philippines', 'philippines', 'philippines', 'papua-new-guinea', 'indonesia', 'indonesia'],
  // ---------- Africa ----------
  'tunisia-libya': ['tunisia+libya', 'tunisia', 'tunisia', 'tunisia', 'tunisia+libya', 'libya', 'libya', 'tunisia', 'libya', 'libya', 'tunisia', 'libya'],
  'sahel-west': ['mali-burkina', 'mali-burkina', 'mali-burkina', 'mauritania+mali-burkina', 'mali-burkina', 'mauritania', 'mauritania', 'mali-burkina', 'mauritania+mali-burkina', 'mali-burkina', 'mali-burkina', 'mauritania'],
  'west-coast': ['guinea-sierra-leone-liberia', 'senegal', 'senegal', 'senegal', 'senegal+guinea-sierra-leone-liberia', 'senegal', 'senegal', 'senegal', 'guinea-sierra-leone-liberia', 'guinea-sierra-leone-liberia', 'guinea-sierra-leone-liberia', 'senegal+guinea-sierra-leone-liberia'],
  // Fact 8 (Ganvié) repeats fact 4 in the same area: left out.
  'gulf-of-guinea': ['ghana-togo-benin', 'cote-divoire', 'ghana-togo-benin', 'ghana-togo-benin', 'cote-divoire+ghana-togo-benin', 'cote-divoire', 'ghana-togo-benin', '-', 'ghana-togo-benin', 'ghana-togo-benin', 'cote-divoire', 'ghana-togo-benin'],
  sudan: ['sudan', 'sudan', 'south-sudan', 'sudan', 'sudan', 'south-sudan', 'south-sudan', 'sudan', 'sudan', 'south-sudan', 'south-sudan', 'sudan'],
  'horn-of-africa': ['ethiopia', 'ethiopia', 'ethiopia', 'ethiopia', 'ethiopia', 'ethiopia', 'ethiopia', 'somalia', 'eritrea-djibouti', 'ethiopia+eritrea-djibouti', 'eritrea-djibouti', 'ethiopia'],
  'central-africa': ['congo', 'gabon+congo', 'congo', 'cameroon', 'cameroon', 'gabon', 'gabon', 'congo', 'gabon', 'central-african-republic', 'cameroon', 'congo'],
  'kenya-uganda': ['kenya', 'kenya+uganda-rwanda-burundi', 'kenya', 'kenya+uganda-rwanda-burundi', 'kenya', 'uganda-rwanda-burundi', 'uganda-rwanda-burundi', 'kenya', 'kenya', 'kenya', 'uganda-rwanda-burundi', 'kenya'],
  tanzania: ['tanzania', 'tanzania', 'tanzania', 'uganda-rwanda-burundi', 'uganda-rwanda-burundi', 'tanzania', 'tanzania', 'tanzania', 'tanzania', 'tanzania', 'tanzania+uganda-rwanda-burundi', 'uganda-rwanda-burundi'],
  'angola-namibia': ['namibia', 'namibia', 'namibia', 'namibia', 'namibia', 'namibia', 'namibia', 'angola', 'angola', 'angola', 'angola', 'namibia'],
  zambezi: ['zambia-malawi-zimbabwe', 'zambia-malawi-zimbabwe', 'zambia-malawi-zimbabwe', 'zambia-malawi-zimbabwe+mozambique', 'zambia-malawi-zimbabwe', 'zambia-malawi-zimbabwe', 'zambia-malawi-zimbabwe', 'mozambique', 'mozambique', 'zambia-malawi-zimbabwe', 'zambia-malawi-zimbabwe', 'zambia-malawi-zimbabwe'],
  'south-africa': ['south-africa', 'south-africa', 'botswana', 'south-africa', 'south-africa', 'south-africa', 'botswana', 'south-africa', 'south-africa', 'south-africa', 'south-africa', 'south-africa'],
  // ---------- the Americas ----------
  'central-america': ['costa-rica-panama', 'guatemala-belize', 'costa-rica-panama', 'guatemala-belize', 'caribbean', 'caribbean', 'caribbean', 'caribbean', 'caribbean', 'guatemala-belize', 'nicaragua', 'caribbean'],
  'uruguay-paraguay': ['uruguay', 'uruguay', 'uruguay', 'paraguay', 'uruguay+paraguay', 'uruguay', 'uruguay', 'paraguay', 'paraguay', 'uruguay', 'paraguay', 'paraguay'],
};

// The same for the 2 test-only geography facts of each split 50-turn area (src/facts/geo-exam.ts, step 2.3).
export const EXAM_SORT_100: Readonly<Record<string, readonly string[]>> = {
  'uk-ireland': ['ireland', 'uk+ireland'],
  benelux: ['netherlands', 'netherlands'],
  alps: ['switzerland', 'austria'],
  scandinavia: ['norway', 'denmark'],
  'czechia-slovakia-hungary': ['czechia', 'hungary'],
  'belarus-ukraine-moldova': ['ukraine', 'moldova'],
  'western-balkans': ['slovenia-croatia+bosnia-montenegro+albania', 'slovenia-croatia'],
  'romania-bulgaria': ['romania', 'bulgaria'],
  'saudi-yemen': ['saudi-arabia', 'yemen'],
  'gulf-states': ['oman', 'gulf-states+oman'],
  'central-asia': ['turkmenistan', 'uzbekistan+kyrgyzstan-tajikistan'],
  'pakistan-afghanistan': ['afghanistan', 'pakistan'],
  india: ['india', 'india'],
  'cambodia-laos-vietnam': ['vietnam', 'vietnam'],
  'maritime-asia': ['indonesia+papua-new-guinea', 'indonesia'],
  'tunisia-libya': ['tunisia', 'tunisia'],
  'sahel-west': ['mali-burkina', 'mauritania+mali-burkina'],
  'west-coast': ['senegal', 'guinea-sierra-leone-liberia'],
  'gulf-of-guinea': ['ghana-togo-benin', 'ghana-togo-benin'],
  sudan: ['sudan', 'sudan'],
  'horn-of-africa': ['ethiopia', 'ethiopia'],
  'central-africa': ['gabon', 'gabon'],
  'kenya-uganda': ['kenya+uganda-rwanda-burundi', 'kenya'],
  tanzania: ['tanzania', 'uganda-rwanda-burundi'],
  'angola-namibia': ['namibia', 'angola+namibia'],
  zambezi: ['zambia-malawi-zimbabwe', 'zambia-malawi-zimbabwe+mozambique'],
  'south-africa': ['botswana', 'south-africa'],
  'central-america': ['guatemala-belize+honduras-el-salvador+nicaragua+costa-rica-panama', 'guatemala-belize'],
  'uruguay-paraguay': ['paraguay', 'uruguay'],
};
