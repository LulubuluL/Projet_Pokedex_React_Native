export const POKEMON_TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
  'bug', 'ghost', 'steel', 'fire', 'water', 'grass',
  'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy',
];

export const POKEMON_COLORS = [
  '#A8A878', '#C03028', '#A890F0', '#A040A0', '#E0C068', '#B8A038',
  '#A8B820', '#705898', '#B8B8D0', '#F08030', '#6890F0', '#78C850',
  '#F8D030', '#F85888', '#98D8D8', '#7038F8', '#705848', '#EE99AC',
];

export const TYPE_TRANSLATIONS = {
  normal: 'Normal',
  fighting: 'Combat',
  flying: 'Vol',
  poison: 'Poison',
  ground: 'Sol',
  rock: 'Roche',
  bug: 'Insecte',
  ghost: 'Spectre',
  steel: 'Acier',
  fire: 'Feu',
  water: 'Eau',
  grass: 'Plante',
  electric: 'Électrik',
  psychic: 'Psy',
  ice: 'Glace',
  dragon: 'Dragon',
  dark: 'Ténèbres',
  fairy: 'Fée',
};

export function getTypeColor(type) {
  const index = POKEMON_TYPES.indexOf(type);
  return index !== -1 ? POKEMON_COLORS[index] : '#A8A878';
}

export function translateType(type) {
  return TYPE_TRANSLATIONS[type] || type;
}