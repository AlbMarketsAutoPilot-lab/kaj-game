# Map shapes (30-turn map)

Made by `node scripts/map-shapes.ts --from <file>` from Natural Earth 1:10m states and provinces
(public domain). Do not edit by hand: change the lists in the script and run it again.

## Big countries: which states or provinces make each part

| Part | States or provinces | Other part |
|---|---|---|
| USA West | Alaska, Arizona, California, Colorado, Hawaii, Idaho, Montana, Nevada, New Mexico, Oregon, Utah, Washington, Wyoming | USA East: all the others |
| Canada West | Alberta, British Columbia, Manitoba, Northwest Territories, Nunavut, Saskatchewan, Yukon | Canada East: all the others |
| China West | Gansu, Qinghai, Xinjiang, Xizang | China East: all the others |
| Russia East (Siberia) | Altay, Amur, Buryat, Chelyabinsk, Chita, Chukchi Autonomous Okrug, Gorno-Altay, Irkutsk, Kamchatka, Kemerovo, Khabarovsk, Khakass, Khanty-Mansiy, Krasnoyarsk, Kurgan, Maga Buryatdan, Novosibirsk, Omsk, Primor'ye, Sakha (Yakutia), Sakhalin, Sverdlovsk, Tomsk, Tuva, Tyumen', Yamal-Nenets, Yevrey | Russia West: all the others |
| Brazil North | Acre, Alagoas, Amapá, Amazonas, Bahia, Ceará, Maranhão, Paraíba, Pará, Pernambuco, Piauí, Rio Grande do Norte, Rondônia, Roraima, Sergipe, Tocantins | Brazil South: all the others |
| Australia West | Northern Territory, South Australia, Western Australia | Australia East: all the others |

## Drawn with an area, although not a country in the map data

- Somaliland → Sudan & Horn of Africa
- Aland → Scandinavia
- Faroe Islands → Scandinavia
- Hong Kong S.A.R. → China East
- Macau S.A.R → China East
- Siachen Glacier → India & South Asia
- Baykonur Cosmodrome → Central Asia
- US Naval Base Guantanamo Bay → Central America & Caribbean
- Puerto Rico → Central America & Caribbean
- Trinidad and Tobago → Central America & Caribbean
- Gibraltar → Spain & Portugal
- Isle of Man → UK & Ireland
- Jersey → UK & Ireland
- Guernsey → UK & Ireland
- French Guiana → Colombia, Venezuela & Guianas

## Left out (not drawn)

- Akrotiri Sovereign Base Area, American Samoa, Anguilla, Antarctica, Antigua and Barbuda, Aruba, Ashmore and Cartier Islands, Barbados, Bermuda, British Indian Ocean Territory, British Virgin Islands, Caribbean Netherlands, Cayman Islands, Clipperton Island, Cook Islands, Coral Sea Islands, Curaçao, Cyprus, Dhekelia Sovereign Base Area, Dominica, Falkland Islands, Federated States of Micronesia, Fiji, French Polynesia, French Southern and Antarctic Lands, Grenada, Guam, Heard Island and McDonald Islands, Indian Ocean Territories, Kiribati, Marshall Islands, Montserrat, Nauru, New Caledonia, Niue, Norfolk Island, Northern Cyprus, Northern Mariana Islands, Palau, Pitcairn Islands, Saint Barthelemy, Saint Helena, Saint Kitts and Nevis, Saint Lucia, Saint Martin, Saint Pierre and Miquelon, Saint Vincent and the Grenadines, Samoa, Sint Maarten, Solomon Islands, South Georgia and the Islands, Spratly Is., Taiwan, Tonga, Turks and Caicos Islands, Tuvalu, United States Minor Outlying Islands, United States Virgin Islands, Vanuatu, Wallis and Futuna
- French overseas islands (Guadeloupe, Martinique, Réunion, Mayotte), Bouvet Island, Macquarie Island, Paracel Islands
- Islands smaller than about 60 km² (too small to see).

## Check: drawn borders vs. walking links

- Touching on the map but no walking link: china-west – southeast-asia
- Walking link but not touching on the map: none (the Channel Tunnel is a fixed link)
