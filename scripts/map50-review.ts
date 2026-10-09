// Makes docs/map50.md, the 50-turn map area list for the owner to review (task M1).
// Run: node scripts/map50-review.ts
import { map30 } from '../src/maps/map30.ts';
import { writeFileSync } from 'node:fs';
// [30-turn area id, 50-turn area name, countries, wonder?]
const S: [string, string, string[], boolean?][] = [
 ['iberia','Spain',['Spain','Andorra']],['iberia','Portugal',['Portugal']],
 ['france','France',['France','Monaco']],['uk-ireland','UK & Ireland',['United Kingdom','Ireland']],
 ['central-europe','Germany',['Germany']],['central-europe','Benelux',['Belgium','Netherlands','Luxembourg']],
 ['central-europe','Alps',['Switzerland','Austria','Liechtenstein']],
 ['italy','Italy',['Italy','San Marino','Vatican City','Malta'],true],
 ['scandinavia','Scandinavia',['Norway','Sweden','Denmark','Greenland']],['scandinavia','Finland',['Finland']],
 ['iceland','Iceland',['Iceland']],
 ['poland-hungary','Poland',['Poland']],['poland-hungary','Czechia, Slovakia & Hungary',['Czechia','Slovakia','Hungary']],
 ['eastern-europe','Baltics',['Estonia','Latvia','Lithuania']],['eastern-europe','Belarus, Ukraine & Moldova',['Belarus','Ukraine','Moldova']],
 ['balkans','Western Balkans',['Slovenia','Croatia','Bosnia and Herzegovina','Serbia','Montenegro','Kosovo','North Macedonia','Albania']],
 ['balkans','Romania & Bulgaria',['Romania','Bulgaria']],
 ['greece','Greece',['Greece'],true],['russia-west','Russia West',['Russia']],
 ['russia-east','Siberia',['Russia']],['russia-far-east','Russia Far East',['Russia']],
 ['turkey-caucasus','Turkey',['Turkey']],['turkey-caucasus','Caucasus',['Georgia','Armenia','Azerbaijan']],
 ['middle-east','Levant',['Israel','Palestine','Lebanon','Syria']],['middle-east','Jordan',['Jordan'],true],['middle-east','Iraq',['Iraq']],
 ['arabia','Saudi Arabia & Yemen',['Saudi Arabia','Yemen']],['arabia','Gulf States',['United Arab Emirates','Qatar','Bahrain','Kuwait','Oman']],
 ['iran','Iran',['Iran']],
 ['central-asia','Kazakhstan',['Kazakhstan']],['central-asia','Central Asia',['Uzbekistan','Turkmenistan','Kyrgyzstan','Tajikistan']],
 ['pakistan-afghanistan','Pakistan & Afghanistan',['Pakistan','Afghanistan']],
 ['india','India',['India','Sri Lanka','Maldives'],true],['india','Nepal, Bhutan & Bangladesh',['Nepal','Bhutan','Bangladesh']],
 ['china-west','China West',['China']],['china-east','China East',['China']],
 ['mongolia','Mongolia',['Mongolia']],['korea','Korea',['South Korea','North Korea']],['japan','Japan',['Japan'],true],
 ['southeast-asia','Myanmar',['Myanmar']],['southeast-asia','Thailand',['Thailand']],
 ['southeast-asia','Cambodia, Laos & Vietnam',['Cambodia','Laos','Vietnam'],true],['southeast-asia','Malaysia, Singapore & Brunei',['Malaysia','Singapore','Brunei']],
 ['maritime-asia','Malay Islands',['Indonesia','Timor-Leste','Papua New Guinea','Philippines']],
 ['north-africa','Morocco & Western Sahara',['Morocco','Western Sahara']],['north-africa','Algeria',['Algeria']],['north-africa','Tunisia & Libya',['Tunisia','Libya']],
 ['egypt','Egypt',['Egypt'],true],
 ['sahel','Sahel West',['Mauritania','Mali','Burkina Faso']],['sahel','Sahel East',['Niger','Chad']],
 ['west-africa','Senegal Coast',['Senegal','Gambia','Guinea-Bissau','Guinea','Sierra Leone','Liberia','Cabo Verde']],
 ['west-africa','Gulf of Guinea',["Côte d'Ivoire",'Ghana','Togo','Benin']],['west-africa','Nigeria',['Nigeria']],
 ['horn-of-africa','Sudan & South Sudan',['Sudan','South Sudan']],['horn-of-africa','Horn of Africa',['Ethiopia','Eritrea','Djibouti','Somalia']],
 ['central-africa','Central Africa',['Cameroon','Central African Republic','Equatorial Guinea','Gabon','Republic of the Congo','São Tomé and Príncipe']],
 ['central-africa','DR Congo',['DR Congo']],
 ['east-africa','Kenya & Uganda',['Kenya','Uganda']],['east-africa','Tanzania, Rwanda & Burundi',['Tanzania','Rwanda','Burundi'],true],
 ['east-africa','Madagascar & Islands',['Madagascar','Seychelles','Comoros','Mauritius']],
 ['southern-africa','Angola & Namibia',['Angola','Namibia']],['southern-africa','Zambezi',['Zambia','Malawi','Mozambique','Zimbabwe']],
 ['southern-africa','South Africa',['South Africa','Botswana','Lesotho','Eswatini']],
 ['canada-west','Canada West',['Canada']],['canada-central','Canada Central',['Canada']],['canada-east','Canada East',['Canada']],
 ['usa-west','USA West',['United States']],['alaska','Alaska',['United States']],['usa-east','USA East',['United States']],
 ['mexico','Mexico',['Mexico'],true],
 ['central-america','Central America',['Guatemala','Belize','Honduras','El Salvador','Nicaragua','Costa Rica','Panama','Cuba','Jamaica','Haiti','Dominican Republic','Bahamas']],
 ['northern-andes','Colombia',['Colombia']],['northern-andes','Venezuela & Guianas',['Venezuela','Guyana','Suriname']],['northern-andes','Ecuador',['Ecuador']],
 ['peru-bolivia','Peru',['Peru'],true],['peru-bolivia','Bolivia',['Bolivia']],['chile','Chile',['Chile']],
 ['brazil-north','Brazil North',['Brazil']],['brazil-south','Brazil South',['Brazil']],
 ['southern-cone','Argentina',['Argentina']],['southern-cone','Uruguay & Paraguay',['Uruguay','Paraguay']],
 ['australia-west','Australia West',['Australia']],['australia-east','Australia East',['Australia']],['new-zealand','New Zealand',['New Zealand'],true],
];
const R: [string,string,string][] = [
 ['port','Spain','UK & Ireland'],['port','UK & Ireland','Iceland'],['port','Iceland','Canada East'],
 ['port','Japan','USA West'],['port','Australia East','New Zealand'],['port','USA West','Alaska'],
 ['port','Madagascar & Islands','Tanzania, Rwanda & Burundi'],['port','Senegal Coast','Brazil North'],
 ['airport','Gulf States','Australia West'],['airport','Australia West','Malay Islands'],['airport','Malay Islands','Japan'],
 ['airport','Japan','New Zealand'],['airport','New Zealand','Chile'],['airport','South Africa','Chile'],['airport','UK & Ireland','Gulf States'],
 ['airport','UK & Ireland','USA East'],['airport','USA East','Brazil South'],['airport','Brazil South','Nigeria'],
 ['airport','India','Gulf States'],['airport','India','Malay Islands'],['airport','India','Kenya & Uganda'],
];
const a30 = new Map((map30.areas as any[]).map(a => [a.id, a]));
const names = new Set(S.map(s => s[1]));
for (const [,a,b] of R) for (const n of [a,b]) if (!names.has(n)) throw new Error(n);
// every country of every 30-turn area must be used exactly once (big countries: once per part)
for (const a of a30.values()) { const used = S.filter(s => s[0]===a.id).flatMap(s=>s[2]).sort(); if (JSON.stringify(used)!==JSON.stringify([...a.countries].sort())) throw new Error(a.id+' '+used); }
const sites = (k: string) => new Set(R.filter(r=>r[0]===k).flatMap(r=>[r[1],r[2]]));
const ap = sites('airport'), pt = sites('port');
for (const n of names) for (const k of ['airport','port']) { const d = R.filter(r=>r[0]===k&&(r[1]===n||r[2]===n)).length; if (d>3) throw new Error(n+k+d); }
const cont = (id:string)=>a30.get(id).continent;
let md = `# 50-turn map — area list for review (task M1)\n\nOwner-approved basis: 80–90 areas, same big-country splits as the 30-turn map, islands kept inside their bigger 30-turn areas (owner), 11 wonders, about 13 airports and 13 ports with about 21 connections, every rule and design from the 30-turn game (which stays frozen). Every 50-turn area lies inside one 30-turn area, so its facts can be sorted by country (M3).\n\n**Totals:** ${S.length} areas · ${S.filter(s=>s[3]).length} wonders (🏛️) · ${ap.size} airports · ${pt.size} ports · ${R.length} connections.\n\nWalking links come from the real borders (shapes, M2/M3) plus short sea crossings like the 30-turn map (e.g. UK & Ireland ↔ France). They are listed for review in M2.\n`;
for (const c of ['Europe','Asia','Africa','North America','South America','Oceania']) {
  const rows = S.filter(s=>cont(s[0])===c);
  md += `\n## ${c} (${rows.length})\n\n| Area | Countries | Inside 30-turn area | ✈️ | ⛴️ |\n|---|---|---|---|---|\n`;
  for (const [id,n,cs,w] of rows) md += `| ${w?'🏛️ ':''}${n} | ${cs.join(', ')} | ${a30.get(id).name} | ${ap.has(n)?'✈️':''} | ${pt.has(n)?'⛴️':''} |\n`;
}
md += `\n## Connections (${R.length})\n\nThe 13 connections of the 30-turn map are kept (on the matching part), plus 8 new ones (marked new).\n\n| | From | To | |\n|---|---|---|---|\n`;
R.forEach((r,i)=>{ const isNew = ['Madagascar & Islands','Senegal Coast','USA East','Brazil South','India'].includes(r[1]); md += `| ${r[0]==='airport'?'✈️':'⛴️'} | ${r[1]} | ${r[2]} | ${isNew?'new':''} |\n`; });
md += `\n## Wonders (11)\n\nEurope 2 (Italy, Greece) · Asia 4 (Jordan, India, Cambodia, Japan) · Africa 2 (Egypt, Tanzania) · North America 1 (Mexico) · South America 1 (Peru) · Oceania 1 (New Zealand). From the rulebook's list of 15; left out: France, Turkey, Morocco, Chile.\n\n## Questions for the owner\n\n1. Are the groupings OK (names and countries)?\n2. Are the 8 new connections OK?\n3. Are the 11 wonders OK?\n`;
writeFileSync(new URL('../docs/map50.md', import.meta.url), md);
console.log(S.length, S.filter(s=>s[3]).length, ap.size, pt.size, R.length);
