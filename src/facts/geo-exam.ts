import { f, type FactBatch } from './types.ts';

// Geography facts for the citizenship test only (version 2.0, step 2.3, owner: B): 2 per 50-turn area,
// about rivers, mountains, deserts, seas and climate. Not asked in the airline quiz. The 30-turn map
// takes them through the area each one lies in, at most 3 per area.
// Drafted by Claude, to be checked by the owner (review page: docs/facts/geo-exam.md).
export const GEO_EXAM_50: FactBatch = {
  // ---------- Europe ----------
  spain: [
    f('The Meseta, a high, flat plateau, covers most of the middle of Spain. Madrid stands on it.', 'What covers most of the middle of Spain?', 'A high, flat plateau', 'A rainforest'),
    f('The Ebro, the longest river that flows only through Spain, reaches the Mediterranean Sea.', 'The Ebro river flows into which sea?', 'The Mediterranean Sea', 'The North Sea'),
  ],
  portugal: [
    f('The Tagus, the longest river of Spain and Portugal, reaches the Atlantic Ocean at Lisbon.', 'Which river reaches the sea at Lisbon?', 'The Tagus', 'The Rhine'),
    f("Portugal's highest mountain, Mount Pico, is a volcano on the Azores islands.", "Portugal's highest mountain is on which islands?", 'The Azores', 'The Balearic Islands'),
  ],
  france: [
    f('The Loire is the longest river in France. It flows west into the Atlantic Ocean.', 'Which is the longest river in France?', 'The Loire', 'The Thames'),
    f('The Dune of Pilat, near Bordeaux, is the tallest sand dune in Europe.', 'The tallest sand dune in Europe is in…', 'France', 'Norway'),
  ],
  'uk-ireland': [
    f('The Shannon is the longest river in Ireland.', "Which is Ireland's longest river?", 'The Shannon', 'The Seine'),
    f('A warm sea current, the Gulf Stream, gives Britain and Ireland milder winters than other places as far north.', 'Which warm sea current gives Britain and Ireland mild winters?', 'The Gulf Stream', 'The Humboldt Current'),
  ],
  germany: [
    f("The Zugspitze in the Alps is Germany's highest mountain.", "Which is Germany's highest mountain?", 'The Zugspitze', 'The Matterhorn'),
    f('The Rhine flows north through Germany and reaches the North Sea in the Netherlands.', 'The Rhine reaches the sea in which country?', 'The Netherlands', 'Italy'),
  ],
  benelux: [
    f('The Dutch have pumped water out of lakes and the sea to make new land, called polders.', 'Land the Dutch have taken from the water is called…', 'polders', 'fjords'),
    f('The highest hill in the European part of the Netherlands, the Vaalserberg, is only about 320 metres high.', 'About how high is the highest hill in the European Netherlands?', 'About 320 metres', 'About 3,200 metres'),
  ],
  alps: [
    f('Both the Rhine and the Rhône rivers begin high in the Swiss Alps.', 'The Rhine and the Rhône both begin in…', 'the Swiss Alps', 'the Pyrenees'),
    f("The Grossglockner is Austria's highest mountain.", "Which is Austria's highest mountain?", 'The Grossglockner', 'Mont Blanc'),
  ],
  italy: [
    f("The Po is Italy's longest river. It flows east into the Adriatic Sea.", "Which is Italy's longest river?", 'The Po', 'The Danube'),
    f('The Apennine Mountains run down the whole length of Italy, like a backbone.', 'Which mountains run down the length of Italy?', 'The Apennines', 'The Urals'),
  ],
  scandinavia: [
    f("The Sognefjord is Norway's longest and deepest fjord.", "Which is Norway's longest fjord?", 'The Sognefjord', 'Loch Ness'),
    f('Denmark is made of the Jutland peninsula and hundreds of islands.', 'Apart from the Jutland peninsula, Denmark is made of hundreds of…', 'islands', 'volcanoes'),
  ],
  finland: [
    f("Lake Saimaa is Finland's largest lake.", "Which is Finland's largest lake?", 'Lake Saimaa', 'Lake Balaton'),
    f("Finland's land is still slowly rising, because the heavy ice that covered it in the Ice Age has melted.", "Why is Finland's land still slowly rising?", 'The heavy Ice Age ice melted', 'Volcanoes push it up'),
  ],
  iceland: [
    f('Gullfoss is one of the most famous waterfalls in Iceland.', 'Gullfoss in Iceland is a famous…', 'waterfall', 'volcano'),
    f('Surtsey, an island off the south coast of Iceland, was born from a volcano under the sea in 1963.', 'The island of Surtsey was made by…', 'a volcano eruption', 'people'),
  ],
  poland: [
    f("Poland's northern coast lies on the Baltic Sea.", "Poland's coast is on which sea?", 'The Baltic Sea', 'The Black Sea'),
    f('The Błędów Desert in southern Poland is an area of sand sometimes called the "Polish Sahara".', 'The Błędów Desert in Poland is made of…', 'sand', 'ice'),
  ],
  'czechia-slovakia-hungary': [
    f('The Vltava river flows through Prague, the capital of Czechia.', 'Which river flows through Prague?', 'The Vltava', 'The Thames'),
    f('The Great Hungarian Plain, flat grassland called the puszta, covers about half of Hungary.', 'The puszta in Hungary is…', 'flat grassland', 'a mountain range'),
  ],
  baltics: [
    f("Estonia has more than 2,000 islands. Saaremaa is the biggest.", "Which is Estonia's biggest island?", 'Saaremaa', 'Sicily'),
    f('The Daugava river flows through Riga, the capital of Latvia, into the Baltic Sea.', 'Which river flows through Riga?', 'The Daugava', 'The Volga'),
  ],
  'belarus-ukraine-moldova': [
    f('The Dnieper river flows through Kyiv, the capital of Ukraine, and into the Black Sea.', 'Which river flows through Kyiv?', 'The Dnieper', 'The Rhine'),
    f('Moldova lies mostly between two rivers, the Prut and the Dniester.', 'Moldova lies mostly between the Prut and the…', 'Dniester', 'Loire'),
  ],
  'western-balkans': [
    f('The Dinaric Alps run along the Adriatic coast of the Balkans.', 'The Dinaric Alps run along which sea?', 'The Adriatic Sea', 'The Baltic Sea'),
    f("Croatia's coast has more than 1,000 islands.", "Croatia's coast has more than 1,000…", 'islands', 'volcanoes'),
  ],
  'romania-bulgaria': [
    f('Where the Danube meets the Black Sea in Romania, it forms the Danube Delta, one of the largest wetlands in Europe.', 'Where the Danube meets the sea in Romania, it forms a…', 'delta', 'glacier'),
    f('The Balkan Mountains cross Bulgaria from west to east. The whole Balkan Peninsula is named after them.', 'The Balkan Peninsula is named after mountains in…', 'Bulgaria', 'Spain'),
  ],
  greece: [
    f("Crete is Greece's largest island.", "Which is Greece's largest island?", 'Crete', 'Corsica'),
    f('Greece has a Mediterranean climate: hot, dry summers and mild, wet winters.', 'Summers in Greece are usually…', 'hot and dry', 'cold and snowy'),
  ],
  'russia-west': [
    f('The Volga, the longest river in Europe, flows into the Caspian Sea.', 'The Volga flows into which sea?', 'The Caspian Sea', 'The Baltic Sea'),
    f('Lake Ladoga, near Saint Petersburg, is the largest lake in Europe.', 'Lake Ladoga, the largest lake in Europe, is near which city?', 'Saint Petersburg', 'Moscow'),
  ],
  'russia-east': [
    f('The West Siberian Plain is one of the largest flat lowlands in the world.', 'The West Siberian Plain is…', 'very flat', 'very mountainous'),
    f('The Vasyugan Swamp in Siberia is one of the largest swamps in the world.', 'The Vasyugan in Siberia is one of the largest… in the world.', 'swamps', 'deserts'),
  ],
  'russia-far-east': [
    f('Klyuchevskaya Sopka on Kamchatka is the highest active volcano in Asia.', 'The highest active volcano in Asia is on…', 'Kamchatka', 'Java'),
    f('In winter, much of the Sea of Okhotsk, east of Siberia, freezes over.', 'In winter, much of the Sea of Okhotsk…', 'freezes over', 'dries up'),
  ],
  // ---------- Asia ----------
  turkey: [
    f('The Bosphorus, a narrow strait in Istanbul, links the Black Sea with the Sea of Marmara.', 'The Bosphorus links the Sea of Marmara with the…', 'Black Sea', 'Red Sea'),
    f('The Tigris and the Euphrates rivers both begin in the mountains of eastern Turkey.', 'The Tigris and Euphrates rivers begin in…', 'Turkey', 'Egypt'),
  ],
  caucasus: [
    f('Mount Kazbek, one of the highest mountains in Georgia, is an old volcano.', 'Mount Kazbek in Georgia is an old…', 'volcano', 'pyramid'),
    f('Lake Sevan in Armenia is one of the largest high-mountain lakes in the world.', 'Lake Sevan is in…', 'Armenia', 'Spain'),
  ],
  levant: [
    f('The Jordan River flows south into the Dead Sea.', 'Which river flows into the Dead Sea?', 'The Jordan', 'The Nile'),
    f('Mount Hermon, on the border of Lebanon and Syria, is often covered in snow in winter.', 'In winter, the top of Mount Hermon is often covered in…', 'snow', 'sand'),
  ],
  jordan: [
    f('More than three quarters of Jordan is desert.', 'About how much of Jordan is desert?', 'More than three quarters', 'About one tenth'),
    f('The Jordan Valley lies in a rift, a long crack in the Earth\'s crust that continues south to East Africa.', 'The rift of the Jordan Valley continues south to…', 'East Africa', 'Greenland'),
  ],
  iraq: [
    f('Baghdad, the capital of Iraq, lies on the Tigris river.', 'Baghdad lies on which river?', 'The Tigris', 'The Nile'),
    f('Summers in Iraq are very hot: in Baghdad the afternoon temperature is often about 45 °C.', 'Summers in Baghdad are…', 'very hot', 'cold and rainy'),
  ],
  'saudi-yemen': [
    f('Saudi Arabia is the largest country on the Arabian Peninsula.', 'Which is the largest country on the Arabian Peninsula?', 'Saudi Arabia', 'Yemen'),
    f('The highest mountain of the Arabian Peninsula, Jabal an-Nabi Shu\'ayb, is in Yemen.', 'The highest mountain of the Arabian Peninsula is in…', 'Yemen', 'Kuwait'),
  ],
  'gulf-states': [
    f('The Strait of Hormuz, next to Oman, is the narrow way out of the Persian Gulf to the ocean.', 'The narrow sea passage out of the Persian Gulf is the Strait of…', 'Hormuz', 'Gibraltar'),
    f('The Hajar Mountains, the highest mountains in eastern Arabia, are in Oman and the United Arab Emirates.', 'The Hajar Mountains are in Oman and…', 'the United Arab Emirates', 'Morocco'),
  ],
  iran: [
    f('Satellites have measured some of the hottest ground on Earth in the Lut Desert of Iran.', 'The Lut Desert in Iran is famous for some of the… on Earth.', 'hottest ground', 'coldest ground'),
    f('The Zagros Mountains run along the west of Iran.', 'The Zagros Mountains are in…', 'Iran', 'Chile'),
  ],
  kazakhstan: [
    f('Much of Kazakhstan is steppe: huge, dry, flat grassland.', 'The steppe of Kazakhstan is…', 'dry grassland', 'rainforest'),
    f('The Irtysh river flows from China through Kazakhstan into Russia.', 'The Irtysh flows from China through Kazakhstan into…', 'Russia', 'India'),
  ],
  'central-asia': [
    f('The Karakum Desert covers most of Turkmenistan.', 'Most of Turkmenistan is covered by…', 'the Karakum Desert', 'rainforest'),
    f('The green Fergana Valley is shared by Uzbekistan, Kyrgyzstan and Tajikistan.', 'The Fergana Valley is shared by how many countries?', 'Three', 'Seven'),
  ],
  'pakistan-afghanistan': [
    f('The Hindu Kush mountains cover much of Afghanistan.', 'The Hindu Kush mountains are mostly in…', 'Afghanistan', 'Peru'),
    f('Near Gilgit in Pakistan, three great mountain ranges meet: the Himalaya, the Karakoram and the Hindu Kush.', 'How many great mountain ranges meet near Gilgit in Pakistan?', 'Three', 'Ten'),
  ],
  india: [
    f('The Ganges river begins in the Himalayas and flows into the Bay of Bengal.', 'The Ganges flows into the…', 'Bay of Bengal', 'Red Sea'),
    f('The Thar Desert lies in north-west India, on the border with Pakistan.', 'The Thar Desert lies in India and…', 'Pakistan', 'Japan'),
  ],
  'nepal-bhutan-bangladesh': [
    f("Eight of the world's ten highest mountains are in Nepal or on its borders.", "How many of the world's ten highest mountains are in Nepal or on its borders?", 'Eight', 'One'),
    f('Bangladesh lies on the delta of the Ganges and Brahmaputra rivers, one of the largest river deltas in the world.', 'Bangladesh lies on a giant river…', 'delta', 'canyon'),
  ],
  'china-west': [
    f('Qinghai Lake, on the Tibetan Plateau, is the largest lake in China.', 'Which is the largest lake in China?', 'Qinghai Lake', 'Lake Baikal'),
    f('The Turpan Depression in Xinjiang is the lowest place in China.', 'The Turpan Depression lies…', 'below sea level', 'above the clouds'),
  ],
  'china-east': [
    f('The Yellow River gets its name from the yellow mud it carries.', 'Why is the Yellow River yellow?', 'Because of the mud it carries', 'Because of yellow fish'),
    f('Huangshan, the Yellow Mountains, is famous for granite peaks rising above a "sea of clouds".', 'Huangshan is famous for granite peaks above a sea of…', 'clouds', 'sand'),
  ],
  mongolia: [
    f('The Gobi is a cold desert: in winter it can be colder than −30 °C.', 'The Gobi is a…', 'cold desert', 'rainforest'),
    f("Lake Khövsgöl holds most of Mongolia's fresh water.", "Lake Khövsgöl holds most of Mongolia's…", 'fresh water', 'oil'),
  ],
  korea: [
    f('About 70% of the Korean Peninsula is mountains.', 'Most of the Korean Peninsula is…', 'mountains', 'desert'),
    f("South Korea's highest mountain, Hallasan, is a volcano on Jeju Island.", "South Korea's highest mountain, Hallasan, is on which island?", 'Jeju', 'Hawaii'),
  ],
  japan: [
    f("Lake Biwa is Japan's largest lake.", "Which is Japan's largest lake?", 'Lake Biwa', 'Lake Victoria'),
    f("Hokkaido, Japan's northern island, gets heavy snow every winter.", 'Hokkaido is famous for heavy…', 'snow', 'sandstorms'),
  ],
  myanmar: [
    f('Hkakabo Razi, in the far north of Myanmar, is the highest mountain in Southeast Asia.', 'The highest mountain in Southeast Asia is in…', 'Myanmar', 'Singapore'),
    f("Myanmar's coast faces the Bay of Bengal and the Andaman Sea.", "Myanmar's coast faces the Bay of…", 'Bengal', 'Biscay'),
  ],
  thailand: [
    f('The Chao Phraya river flows through Bangkok into the Gulf of Thailand.', 'Which river flows through Bangkok?', 'The Chao Phraya', 'The Amazon'),
    f("Thailand's rainy season, from about May to October, comes with the monsoon winds.", "Thailand's rainy season comes with the…", 'monsoon', 'midnight sun'),
  ],
  'cambodia-laos-vietnam': [
    f('Vietnam is long and narrow: at its narrowest it is only about 50 km wide.', 'What shape is Vietnam?', 'Long and narrow', 'Round'),
    f('The Mekong Delta in southern Vietnam grows so much rice that it is called the "rice bowl" of Vietnam.', 'The Mekong Delta is called the "rice bowl" because it grows a lot of…', 'rice', 'wheat'),
  ],
  'malaysia-singapore-brunei': [
    f('The Strait of Malacca, between Malaysia and the island of Sumatra, is one of the busiest sea routes in the world.', 'The Strait of Malacca separates Malaysia from which island?', 'Sumatra', 'Bali'),
    f('The two parts of Malaysia, on the mainland and on Borneo, are separated by the South China Sea.', 'The two parts of Malaysia are separated by the…', 'South China Sea', 'Red Sea'),
  ],
  'maritime-asia': [
    f('New Guinea, shared by Indonesia and Papua New Guinea, is the second-largest island in the world.', 'Among the world\'s islands, New Guinea is the…', 'second largest', 'smallest'),
    f('The equator crosses Indonesia, so most of it is hot and rainy all year.', 'Which line crosses Indonesia?', 'The equator', 'The Arctic Circle'),
  ],
  // ---------- Africa ----------
  morocco: [
    f('Toubkal, in the Atlas Mountains of Morocco, is the highest mountain in North Africa.', 'Toubkal, the highest mountain in North Africa, is in…', 'Morocco', 'Egypt'),
    f('The Strait of Gibraltar, only about 14 km wide, separates Morocco from Spain.', 'The Strait of Gibraltar separates Morocco from…', 'Spain', 'Italy'),
  ],
  algeria: [
    f("Algeria's northern coast lies on the Mediterranean Sea.", "Algeria's northern coast is on the…", 'Mediterranean Sea', 'Indian Ocean'),
    f('The Great Western Erg in Algeria is a huge sea of sand dunes.', 'An erg is a large area of…', 'sand dunes', 'ice'),
  ],
  'tunisia-libya': [
    f('The northernmost point of Africa is in Tunisia.', 'The northernmost point of Africa is in…', 'Tunisia', 'South Africa'),
    f('Djerba, off the coast of Tunisia, is the largest island in North Africa.', 'Djerba, the largest island in North Africa, belongs to…', 'Tunisia', 'Greece'),
  ],
  egypt: [
    f('The Aswan High Dam on the Nile holds back Lake Nasser, one of the largest man-made lakes in the world.', 'The lake behind the Aswan High Dam is Lake…', 'Nasser', 'Victoria'),
    f('The Sinai Peninsula is the only part of Egypt that lies in Asia.', 'Which part of Egypt lies in Asia?', 'The Sinai Peninsula', 'Alexandria'),
  ],
  'sahel-west': [
    f('In Mali, the Niger River spreads into the Inner Niger Delta, a huge area that floods every year.', 'The Inner Niger Delta in Mali…', 'floods every year', 'is always frozen'),
    f('The harmattan is a dry, dusty wind that blows from the Sahara in winter.', 'The harmattan is a dry wind full of…', 'dust', 'snow'),
  ],
  'sahel-east': [
    f('The Aïr Mountains rise out of the Sahara in Niger.', 'The Aïr Mountains are in…', 'Niger', 'Nepal'),
    f('The Ténéré, a sandy desert in Niger and Chad, is part of the Sahara.', 'The Ténéré is part of which desert?', 'The Sahara', 'The Gobi'),
  ],
  'west-coast': [
    f('Mount Fogo, on the islands of Cabo Verde, is an active volcano.', 'Mount Fogo on Cabo Verde is an active…', 'volcano', 'glacier'),
    f("Monrovia, the capital of Liberia, is one of the world's wettest capital cities.", 'Monrovia is one of the world\'s…', 'wettest capitals', 'driest capitals'),
  ],
  'gulf-of-guinea': [
    f('Togo is a long, narrow country: it is about 50 km wide at the coast and more than 500 km long.', 'What shape is Togo?', 'Long and narrow', 'Round'),
    f('The equator and the line of 0° longitude cross in the sea of the Gulf of Guinea.', 'The equator and 0° longitude cross in the…', 'Gulf of Guinea', 'Indian Ocean'),
  ],
  nigeria: [
    f('The Niger River and the Benue River meet at Lokoja, in the middle of Nigeria.', 'At Lokoja, the Niger meets which river?', 'The Benue', 'The Thames'),
    f('In southern Nigeria, the Niger River ends in the Niger Delta, one of the largest river deltas in the world.', 'In southern Nigeria, the Niger River ends in a big…', 'delta', 'waterfall'),
  ],
  sudan: [
    f('The Blue Nile and the White Nile meet at Khartoum, the capital of Sudan.', 'Which two rivers meet at Khartoum?', 'The Blue Nile and the White Nile', 'The Congo and the Niger'),
    f('The Nubian Desert lies in north-east Sudan.', 'The Nubian Desert is in…', 'Sudan', 'Mongolia'),
  ],
  'horn-of-africa': [
    f('The high Ethiopian Highlands are often called the "Roof of Africa".', 'The Ethiopian Highlands are called the…', 'Roof of Africa', 'Heart of Asia'),
    f("Ras Dashen, Ethiopia's highest mountain, is in the Simien Mountains.", "Ethiopia's highest mountain is in the…", 'Simien Mountains', 'Atlas Mountains'),
  ],
  'central-africa': [
    f("Malabo, the capital of Equatorial Guinea, is on the island of Bioko.", 'Malabo, the capital of Equatorial Guinea, is on…', 'the island of Bioko', 'the mainland'),
    f('The Ogooué is the main river of Gabon.', "Which is Gabon's main river?", 'The Ogooué', 'The Volga'),
  ],
  'dr-congo': [
    f("DR Congo is huge, but its coast on the Atlantic Ocean is only about 40 km long.", "DR Congo's coast on the Atlantic is…", 'very short', 'very long'),
    f("Lake Kivu and Lake Tanganyika lie on DR Congo's eastern border.", "Lake Kivu lies on DR Congo's…", 'eastern border', 'northern coast'),
  ],
  'kenya-uganda': [
    f('The equator crosses both Kenya and Uganda.', 'Which line crosses both Kenya and Uganda?', 'The equator', 'The Tropic of Capricorn'),
    f('The Great Rift Valley runs through Kenya from north to south.', 'The Great Rift Valley runs through Kenya from…', 'north to south', 'east to west'),
  ],
  tanzania: [
    f('Mount Kilimanjaro has ice on its top, even though it is close to the equator.', 'Even though it is near the equator, the top of Kilimanjaro has…', 'ice', 'palm forests'),
    f('Burundi lies on the shore of Lake Tanganyika.', 'Burundi lies on which lake?', 'Lake Tanganyika', 'Lake Titicaca'),
  ],
  madagascar: [
    f("Madagascar's east coast gets far more rain than its dry south-west.", 'Which side of Madagascar gets the most rain?', 'The east coast', 'The south-west'),
    f('The Seychelles are more than 100 islands in the Indian Ocean.', 'The Seychelles lie in which ocean?', 'The Indian Ocean', 'The Arctic Ocean'),
  ],
  'angola-namibia': [
    f('The Namib in Namibia is often called the oldest desert in the world.', 'The Namib is often called the world\'s…', 'oldest desert', 'wettest place'),
    f('The Cunene River forms part of the border between Angola and Namibia.', 'Part of the border between Angola and Namibia follows the…', 'Cunene River', 'Amazon River'),
  ],
  zambezi: [
    f('Lake Malawi covers about one fifth of the country of Malawi.', 'About how much of Malawi is covered by Lake Malawi?', 'About one fifth', 'Nine tenths'),
    f('Zambia, Malawi and Zimbabwe have no sea coast, but Mozambique has a long coast on the Indian Ocean.', 'Which of these countries has a sea coast?', 'Mozambique', 'Zambia'),
  ],
  'south-africa': [
    f('The Kalahari Desert covers most of Botswana.', 'The Kalahari Desert covers most of…', 'Botswana', 'Kenya'),
    f('Every part of Lesotho lies more than 1,000 metres above sea level.', "Lesotho's lowest point is…", 'above 1,000 metres', 'below sea level'),
  ],
  // ---------- North America ----------
  'canada-west': [
    f('Water from the Columbia Icefield in the Rocky Mountains flows to three different oceans.', 'Water from the Columbia Icefield flows to how many oceans?', 'Three', 'One'),
    f("Kluane National Park in Yukon has the largest area of ice in the world outside the polar regions.", 'Kluane in Yukon has a huge area of…', 'ice', 'desert'),
  ],
  'canada-central': [
    f('Hudson Bay, a huge sea in northern Canada, freezes over in winter.', 'In winter, Hudson Bay…', 'freezes over', 'stays warm'),
    f("Baffin Island in Nunavut is Canada's largest island.", "Which is Canada's largest island?", 'Baffin Island', 'Newfoundland'),
  ],
  'canada-east': [
    f('Cape Spear in Newfoundland is the easternmost point of North America (without Greenland).', 'The easternmost point of North America (without Greenland) is in…', 'Canada', 'Mexico'),
    f('The St. Lawrence River links the Great Lakes with the Atlantic Ocean.', 'The St. Lawrence River links the Great Lakes with the…', 'Atlantic Ocean', 'Pacific Ocean'),
  ],
  'usa-west': [
    f('Mount Whitney in California is the highest mountain in the USA outside Alaska.', 'Mount Whitney, the highest mountain in the USA outside Alaska, is in…', 'California', 'Florida'),
    f('The water of the Great Salt Lake in Utah is saltier than the sea.', 'The water of the Great Salt Lake is…', 'saltier than the sea', 'fresh'),
  ],
  alaska: [
    f('The Yukon River flows across Alaska into the Bering Sea.', 'The Yukon River flows into the…', 'Bering Sea', 'Gulf of Mexico'),
    f('Alaska is the most northern state of the USA.', 'Which is the most northern state of the USA?', 'Alaska', 'Maine'),
  ],
  'usa-east': [
    f('The Appalachian Mountains run along the east of the USA.', 'Which mountains run along the east of the USA?', 'The Appalachians', 'The Rockies'),
    f('Lake Superior is the largest of the five Great Lakes.', 'Which is the largest of the Great Lakes?', 'Lake Superior', 'Lake Erie'),
  ],
  mexico: [
    f("Pico de Orizaba, Mexico's highest mountain, is a volcano.", "Mexico's highest mountain, Pico de Orizaba, is a…", 'volcano', 'glacier'),
    f('The Gulf of California separates the long Baja California peninsula from mainland Mexico.', 'The Gulf of California separates mainland Mexico from…', 'Baja California', 'Cuba'),
  ],
  'central-america': [
    f('Central America is a narrow land bridge that joins North America and South America.', 'Central America joins North America with…', 'South America', 'Africa'),
    f('Guatemala has more than 30 volcanoes.', 'Guatemala has more than 30…', 'volcanoes', 'glaciers'),
  ],
  // ---------- South America ----------
  colombia: [
    f("The Magdalena is Colombia's main river. It flows north into the Caribbean Sea.", "Which is Colombia's main river?", 'The Magdalena', 'The Mississippi'),
    f('In Colombia the Andes split into three mountain ranges.', 'In Colombia the Andes split into…', 'three ranges', 'ten ranges'),
  ],
  'venezuela-guianas': [
    f('Lake Maracaibo in Venezuela is joined to the Caribbean Sea by a narrow channel.', 'Lake Maracaibo is joined to the…', 'Caribbean Sea', 'Pacific Ocean'),
    f('Mount Roraima, a flat-topped mountain, touches three countries: Venezuela, Guyana and Brazil.', 'Mount Roraima touches how many countries?', 'Three', 'One'),
  ],
  ecuador: [
    f('The Galápagos Islands, about 1,000 km out in the Pacific, belong to Ecuador.', 'The Galápagos Islands belong to…', 'Ecuador', 'Spain'),
    f('Mainland Ecuador has three regions: the coast, the Andes mountains, and the Amazon rainforest in the east.', 'Eastern Ecuador is covered by…', 'the Amazon rainforest', 'desert'),
  ],
  peru: [
    f("Most of Peru's coast is desert: the cold sea current along it keeps the rain away.", "Most of Peru's coast is…", 'desert', 'rainforest'),
    f("Huascarán, in the Andes, is Peru's highest mountain.", "Which is Peru's highest mountain?", 'Huascarán', 'Kilimanjaro'),
  ],
  bolivia: [
    f('Bolivia and Paraguay are the only countries in South America with no sea coast.', 'Bolivia and which other South American country have no sea coast?', 'Paraguay', 'Chile'),
    f('More than half of Bolivia is low, warm land in the east, not high mountains.', 'More than half of Bolivia is…', 'lowland', 'high mountains'),
  ],
  chile: [
    f('Ojos del Salado, on the border of Chile and Argentina, is the highest volcano in the world.', 'The highest volcano in the world is on Chile\'s border with…', 'Argentina', 'Peru'),
    f('The Southern Patagonian Ice Field in Chile and Argentina is one of the largest areas of ice outside the poles.', 'The Southern Patagonian Ice Field is a huge area of…', 'ice', 'sand'),
  ],
  'brazil-north': [
    f("Pico da Neblina, Brazil's highest mountain, is in the Amazon near the border with Venezuela.", "Brazil's highest mountain is near the border with…", 'Venezuela', 'Uruguay'),
    f('The Amazon River flows into the Atlantic Ocean.', 'The Amazon River flows into the…', 'Atlantic Ocean', 'Pacific Ocean'),
  ],
  'brazil-south': [
    f('The São Francisco is the longest river that flows only through Brazil.', 'Which is the longest river that flows only through Brazil?', 'The São Francisco', 'The Orinoco'),
    f('In winter, the hills of southern Brazil sometimes get frost and even snow.', 'In winter, southern Brazil sometimes gets…', 'snow', 'no daylight'),
  ],
  argentina: [
    f('The Pampas are wide, flat grasslands in central Argentina.', 'The Pampas are…', 'flat grasslands', 'high mountains'),
    f('Buenos Aires lies on the Río de la Plata, the wide mouth of the Paraná and Uruguay rivers.', 'Buenos Aires lies on the…', 'Río de la Plata', 'Amazon'),
  ],
  'uruguay-paraguay': [
    f('The Paraguay River splits Paraguay in two: the dry Chaco in the west and the greener east.', 'The Paraguay River splits the country into how many parts?', 'Two', 'Five'),
    f("Uruguay is low and gently hilly: its highest point is only about 500 metres high.", "About how high is Uruguay's highest point?", 'About 500 metres', 'About 5,000 metres'),
  ],
  // ---------- Oceania ----------
  'australia-west': [
    f('The Gibson Desert and the Great Sandy Desert are in Western Australia.', 'The Gibson Desert is in…', 'Western Australia', 'Brazil'),
    f('The Kimberley, in the north of Western Australia, has a wet season and a dry season.', 'The Kimberley has a wet season and a…', 'dry season', 'snow season'),
  ],
  'australia-east': [
    f('The Great Dividing Range runs along the east coast of Australia.', "The mountains along Australia's east coast are the…", 'Great Dividing Range', 'Andes'),
    f("The Murray is Australia's longest river.", "Which is Australia's longest river?", 'The Murray', 'The Danube'),
  ],
  'new-zealand': [
    f("Aoraki / Mount Cook, New Zealand's highest mountain, is in the Southern Alps.", "New Zealand's highest mountain is in the…", 'Southern Alps', 'Rocky Mountains'),
    f('Lake Taupō, the largest lake in New Zealand, fills the crater of a giant old volcano.', 'Lake Taupō fills the crater of an old…', 'volcano', 'meteorite'),
  ],
};

// The 30-turn map (step 2.3, owner-approved): each area takes at most 3 of these facts, from the
// 50-turn areas inside it: the 1st fact of each part in map order, then the 2nd, until it has 3.
// [50-turn area, fact number]. Checked against the 50-turn map by tests/geo-exam.test.ts.
export const GEO_EXAM_30_PICKS: Readonly<Record<string, readonly (readonly [string, number])[]>> = {
  'iberia': [['spain', 0], ['portugal', 0], ['spain', 1]],
  'france': [['france', 0], ['france', 1]],
  'uk-ireland': [['uk-ireland', 0], ['uk-ireland', 1]],
  'central-europe': [['germany', 0], ['benelux', 0], ['alps', 0]],
  'italy': [['italy', 0], ['italy', 1]],
  'scandinavia': [['scandinavia', 0], ['finland', 0], ['scandinavia', 1]],
  'iceland': [['iceland', 0], ['iceland', 1]],
  'poland-hungary': [['poland', 0], ['czechia-slovakia-hungary', 0], ['poland', 1]],
  'eastern-europe': [['baltics', 0], ['belarus-ukraine-moldova', 0], ['baltics', 1]],
  'balkans': [['western-balkans', 0], ['romania-bulgaria', 0], ['western-balkans', 1]],
  'greece': [['greece', 0], ['greece', 1]],
  'russia-west': [['russia-west', 0], ['russia-west', 1]],
  'russia-east': [['russia-east', 0], ['russia-east', 1]],
  'russia-far-east': [['russia-far-east', 0], ['russia-far-east', 1]],
  'turkey-caucasus': [['turkey', 0], ['caucasus', 0], ['turkey', 1]],
  'middle-east': [['levant', 0], ['jordan', 0], ['iraq', 0]],
  'arabia': [['saudi-yemen', 0], ['gulf-states', 0], ['saudi-yemen', 1]],
  'iran': [['iran', 0], ['iran', 1]],
  'central-asia': [['kazakhstan', 0], ['central-asia', 0], ['kazakhstan', 1]],
  'pakistan-afghanistan': [['pakistan-afghanistan', 0], ['pakistan-afghanistan', 1]],
  'india': [['india', 0], ['nepal-bhutan-bangladesh', 0], ['india', 1]],
  'china-west': [['china-west', 0], ['china-west', 1]],
  'china-east': [['china-east', 0], ['china-east', 1]],
  'mongolia': [['mongolia', 0], ['mongolia', 1]],
  'korea': [['korea', 0], ['korea', 1]],
  'japan': [['japan', 0], ['japan', 1]],
  'southeast-asia': [['myanmar', 0], ['thailand', 0], ['cambodia-laos-vietnam', 0]],
  'maritime-asia': [['maritime-asia', 0], ['maritime-asia', 1]],
  'north-africa': [['morocco', 0], ['algeria', 0], ['tunisia-libya', 0]],
  'egypt': [['egypt', 0], ['egypt', 1]],
  'sahel': [['sahel-west', 0], ['sahel-east', 0], ['sahel-west', 1]],
  'west-africa': [['west-coast', 0], ['gulf-of-guinea', 0], ['nigeria', 0]],
  'horn-of-africa': [['sudan', 0], ['horn-of-africa', 0], ['sudan', 1]],
  'central-africa': [['central-africa', 0], ['dr-congo', 0], ['central-africa', 1]],
  'east-africa': [['kenya-uganda', 0], ['tanzania', 0], ['madagascar', 0]],
  'southern-africa': [['angola-namibia', 0], ['zambezi', 0], ['south-africa', 0]],
  'canada-west': [['canada-west', 0], ['canada-west', 1]],
  'canada-central': [['canada-central', 0], ['canada-central', 1]],
  'canada-east': [['canada-east', 0], ['canada-east', 1]],
  'usa-west': [['usa-west', 0], ['usa-west', 1]],
  'alaska': [['alaska', 0], ['alaska', 1]],
  'usa-east': [['usa-east', 0], ['usa-east', 1]],
  'mexico': [['mexico', 0], ['mexico', 1]],
  'central-america': [['central-america', 0], ['central-america', 1]],
  'northern-andes': [['colombia', 0], ['venezuela-guianas', 0], ['ecuador', 0]],
  'peru-bolivia': [['peru', 0], ['bolivia', 0], ['peru', 1]],
  'chile': [['chile', 0], ['chile', 1]],
  'brazil-north': [['brazil-north', 0], ['brazil-north', 1]],
  'brazil-south': [['brazil-south', 0], ['brazil-south', 1]],
  'southern-cone': [['argentina', 0], ['uruguay-paraguay', 0], ['argentina', 1]],
  'australia-west': [['australia-west', 0], ['australia-west', 1]],
  'australia-east': [['australia-east', 0], ['australia-east', 1]],
  'new-zealand': [['new-zealand', 0], ['new-zealand', 1]],
};

export function geoExam30(): FactBatch {
  return Object.fromEntries(Object.entries(GEO_EXAM_30_PICKS).map(([id, picks]) => [id, picks.map(([area, k]) => GEO_EXAM_50[area][k])]));
}
