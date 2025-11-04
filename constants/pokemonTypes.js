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

export const GENERATIONS = [
  { id: 1, name: 'Kanto', range: [1, 151], color: '#FF5350' },
  { id: 2, name: 'Johto', range: [152, 251], color: '#C7B7FF' },
  { id: 3, name: 'Hoenn', range: [252, 386], color: '#7EC8E3' },
  { id: 4, name: 'Sinnoh', range: [387, 493], color: '#FFB84D' },
  { id: 5, name: 'Unys', range: [494, 649], color: '#A8E6CF' },
  { id: 6, name: 'Kalos', range: [650, 721], color: '#FF85B3' },
  { id: 7, name: 'Alola', range: [722, 809], color: '#FFD93D' },
  { id: 8, name: 'Galar', range: [810, 905], color: '#95D5B2' },
];

export function getTypeColor(type) {
  const index = POKEMON_TYPES.indexOf(type);
  return index !== -1 ? POKEMON_COLORS[index] : '#A8A878';
}

export function translateType(type) {
  return TYPE_TRANSLATIONS[type] || type;
}

export function getGeneration(pokemonId) {
  const gen = GENERATIONS.find(
    g => pokemonId >= g.range[0] && pokemonId <= g.range[1]
  );
  return gen || GENERATIONS[0];
}