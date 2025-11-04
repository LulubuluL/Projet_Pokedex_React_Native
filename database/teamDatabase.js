import * as SQLite from 'expo-sqlite';

let db = null;

export async function initDatabase() {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('pokedex.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pokemon_id INTEGER NOT NULL UNIQUE,
      pokemon_name TEXT NOT NULL,
      pokemon_types TEXT NOT NULL,
      pokemon_height INTEGER,
      pokemon_weight INTEGER,
      species_url TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  return db;
}

export async function getAllTeamPokemon() {
  const database = await initDatabase();
  const result = await database.getAllAsync('SELECT * FROM user_teams ORDER BY added_at ASC');
  
  return result.map(row => ({
    id: row.pokemon_id,
    name: row.pokemon_name,
    types: JSON.parse(row.pokemon_types),
    height: row.pokemon_height,
    weight: row.pokemon_weight,
    speciesUrl: row.species_url,
  }));
}

export async function addPokemonToTeam(pokemon) {
  const database = await initDatabase();
  
  await database.runAsync(
    `INSERT INTO user_teams (pokemon_id, pokemon_name, pokemon_types, pokemon_height, pokemon_weight, species_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      pokemon.id,
      pokemon.name,
      JSON.stringify(pokemon.types),
      pokemon.height,
      pokemon.weight,
      pokemon.speciesUrl,
    ]
  );
}

export async function removePokemonFromTeam(pokemonId) {
  const database = await initDatabase();
  await database.runAsync('DELETE FROM user_teams WHERE pokemon_id = ?', [pokemonId]);
}

export async function clearTeamTable() {
  const database = await initDatabase();
  await database.runAsync('DELETE FROM user_teams');
}

export async function isPokemonInTeamDB(pokemonId) {
  const database = await initDatabase();
  const result = await database.getFirstAsync(
    'SELECT COUNT(*) as count FROM user_teams WHERE pokemon_id = ?',
    [pokemonId]
  );
  return result.count > 0;
}

export async function getTeamCount() {
  const database = await initDatabase();
  const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM user_teams');
  return result.count;
}