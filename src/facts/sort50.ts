// The 50-turn map's facts sorted by country (task M3, owner-approved plan).
// For each 30-turn area split on the 50-turn map: the 50-turn area of each of its 12 facts, in
// order. A fact about several parts (e.g. the Dead Sea, between Israel and Jordan) goes to each,
// joined with "+". Areas that are the same place on both maps keep all their facts.

export const SORT_50: Readonly<Record<string, readonly string[]>> = {
  iberia: ['spain', 'spain', 'portugal', 'spain', 'spain', 'portugal', 'spain', 'portugal', 'spain', 'portugal', 'spain', 'portugal'],
  'central-europe': ['germany', 'benelux', 'benelux', 'alps', 'alps', 'benelux', 'germany', 'alps', 'germany', 'alps', 'germany', 'benelux'],
  scandinavia: ['scandinavia', 'scandinavia', 'scandinavia', 'scandinavia', 'finland', 'scandinavia', 'finland', 'scandinavia', 'scandinavia', 'scandinavia+finland', 'scandinavia', 'scandinavia'],
  'poland-hungary': ['poland', 'poland', 'poland', 'czechia-slovakia-hungary', 'czechia-slovakia-hungary', 'czechia-slovakia-hungary', 'czechia-slovakia-hungary', 'czechia-slovakia-hungary', 'poland', 'czechia-slovakia-hungary', 'poland+czechia-slovakia-hungary', 'poland'],
  'eastern-europe': ['belarus-ukraine-moldova', 'belarus-ukraine-moldova', 'belarus-ukraine-moldova', 'baltics', 'baltics', 'baltics', 'baltics', 'belarus-ukraine-moldova', 'baltics', 'belarus-ukraine-moldova', 'belarus-ukraine-moldova', 'baltics'],
  balkans: ['western-balkans', 'western-balkans', 'western-balkans', 'romania-bulgaria', 'western-balkans', 'romania-bulgaria', 'western-balkans', 'romania-bulgaria', 'western-balkans', 'western-balkans', 'western-balkans', 'western-balkans'],
  'turkey-caucasus': ['turkey', 'turkey', 'turkey', 'turkey', 'caucasus', 'caucasus', 'caucasus', 'caucasus', 'turkey', 'turkey', 'turkey', 'turkey'],
  'middle-east': ['jordan', 'levant+jordan', 'levant+jordan', 'iraq', 'iraq', 'levant', 'levant', 'levant', 'iraq', 'jordan', 'levant', 'levant+jordan+iraq'],
  arabia: ['gulf-states', 'saudi-yemen+gulf-states', 'saudi-yemen+gulf-states', 'saudi-yemen', 'gulf-states', 'saudi-yemen', 'saudi-yemen', 'gulf-states', 'gulf-states', 'gulf-states', 'gulf-states', 'saudi-yemen'],
  'central-asia': ['central-asia', 'kazakhstan+central-asia', 'kazakhstan', 'kazakhstan', 'central-asia', 'kazakhstan', 'central-asia', 'central-asia', 'central-asia', 'central-asia', 'kazakhstan', 'central-asia'],
  india: ['india', 'nepal-bhutan-bangladesh', 'india', 'india', 'india+nepal-bhutan-bangladesh', 'india+nepal-bhutan-bangladesh', 'india', 'nepal-bhutan-bangladesh', 'india', 'india+nepal-bhutan-bangladesh', 'india', 'india'],
  'southeast-asia': ['cambodia-laos-vietnam', 'cambodia-laos-vietnam', 'thailand', 'myanmar+thailand+cambodia-laos-vietnam', 'malaysia-singapore-brunei', 'malaysia-singapore-brunei', 'myanmar', 'cambodia-laos-vietnam', 'cambodia-laos-vietnam', 'cambodia-laos-vietnam', 'malaysia-singapore-brunei', 'thailand'],
  'north-africa': ['morocco+algeria+tunisia-libya', 'morocco', 'morocco', 'tunisia-libya', 'tunisia-libya', 'algeria', 'morocco+algeria+tunisia-libya', 'morocco+algeria+tunisia-libya', 'tunisia-libya', 'morocco', 'algeria+tunisia-libya', 'morocco'],
  sahel: ['sahel-west', 'sahel-west', 'sahel-west', 'sahel-west+sahel-east', 'sahel-east', 'sahel-west+sahel-east', 'sahel-east', 'sahel-west', 'sahel-west', 'sahel-west', 'sahel-east', 'sahel-west+sahel-east'],
  'west-africa': ['gulf-of-guinea', 'gulf-of-guinea', 'nigeria', 'nigeria', 'west-coast', 'west-coast', 'west-coast', 'gulf-of-guinea', 'west-coast', 'gulf-of-guinea', 'nigeria', 'west-coast+gulf-of-guinea+nigeria'],
  'horn-of-africa': ['horn-of-africa', 'horn-of-africa', 'horn-of-africa', 'sudan', 'horn-of-africa', 'horn-of-africa', 'horn-of-africa+sudan', 'horn-of-africa', 'sudan', 'horn-of-africa', 'horn-of-africa', 'horn-of-africa'],
  'central-africa': ['central-africa+dr-congo', 'central-africa+dr-congo', 'dr-congo', 'dr-congo', 'dr-congo', 'central-africa+dr-congo', 'central-africa', 'central-africa', 'central-africa', 'central-africa', 'central-africa+dr-congo', 'central-africa'],
  'east-africa': ['tanzania', 'tanzania+kenya-uganda', 'kenya-uganda+tanzania', 'madagascar', 'madagascar', 'tanzania', 'tanzania', 'kenya-uganda+tanzania', 'madagascar', 'tanzania', 'kenya-uganda+tanzania', 'madagascar'],
  'southern-africa': ['zambezi', 'south-africa', 'south-africa', 'angola-namibia', 'south-africa', 'zambezi', 'south-africa', 'zambezi', 'south-africa', 'south-africa', 'south-africa', 'angola-namibia'],
  'northern-andes': ['venezuela-guianas', 'ecuador', 'ecuador', 'colombia', 'colombia', 'colombia', 'colombia', 'ecuador', 'venezuela-guianas', 'venezuela-guianas', 'venezuela-guianas', 'ecuador'],
  'peru-bolivia': ['peru', 'peru+bolivia', 'bolivia', 'peru', 'peru+bolivia', 'peru+bolivia', 'peru+bolivia', 'bolivia', 'peru', 'peru', 'peru', 'bolivia'],
  'southern-cone': ['argentina', 'argentina+uruguay-paraguay', 'uruguay-paraguay', 'argentina', 'argentina+uruguay-paraguay', 'argentina', 'uruguay-paraguay', 'argentina+uruguay-paraguay', 'argentina', 'argentina', 'argentina', 'uruguay-paraguay'],
};
