import * as SQLite from 'expo-sqlite';

let db = null;
let initializationPromise = null;

async function getDatabase() {
  if (db) {
    return db;
  }
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      console.log('🔄 Opening database...');
      const database = await SQLite.openDatabaseAsync('pokedex.db');
      
      console.log('🔄 Creating tables...');
      await database.execAsync(`
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
      
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pokemon_id INTEGER NOT NULL UNIQUE,
          added_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Database initialized successfully');
      db = database;
      return database;
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      initializationPromise = null;
      throw error;
    }
  })();
  
  return initializationPromise;
}

export async function getAllTeamPokemon() {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT * FROM user_teams ORDER BY added_at ASC');
    
    return result.map(row => ({
      id: row.pokemon_id,
      name: row.pokemon_name,
      types: JSON.parse(row.pokemon_types),
      height: row.pokemon_height,
      weight: row.pokemon_weight,
      speciesUrl: row.species_url,
    }));
  } catch (error) {
    console.error('❌ Error getting team pokemon:', error);
    return [];
  }
}

export async function addPokemonToTeam(pokemon) {
  try {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO user_teams (pokemon_id, pokemon_name, pokemon_types, pokemon_height, pokemon_weight, species_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        pokemon.id,
        pokemon.name,
        JSON.stringify(pokemon.types),
        pokemon.height || 0,
        pokemon.weight || 0,
        pokemon.speciesUrl || '',
      ]
    );
    console.log(`✅ Added ${pokemon.name} to team`);
  } catch (error) {
    console.error('❌ Error adding pokemon to team:', error);
    throw error;
  }
}

export async function removePokemonFromTeam(pokemonId) {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM user_teams WHERE pokemon_id = ?', [pokemonId]);
    console.log(`✅ Removed pokemon #${pokemonId} from team`);
  } catch (error) {
    console.error('❌ Error removing pokemon from team:', error);
    throw error;
  }
}

export async function clearTeamTable() {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM user_teams');
    console.log('✅ Team cleared');
  } catch (error) {
    console.error('❌ Error clearing team:', error);
    throw error;
  }
}

export async function getTeamCount() {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM user_teams');
    return result.count;
  } catch (error) {
    console.error('❌ Error getting team count:', error);
    return 0;
  }
}

export async function addToFavorites(pokemonId) {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT OR IGNORE INTO favorites (pokemon_id) VALUES (?)',
      [pokemonId]
    );
    console.log(`✅ Added pokemon #${pokemonId} to favorites`);
  } catch (error) {
    console.error('❌ Error adding to favorites:', error);
    throw error;
  }
}

export async function removeFromFavorites(pokemonId) {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM favorites WHERE pokemon_id = ?', [pokemonId]);
    console.log(`✅ Removed pokemon #${pokemonId} from favorites`);
  } catch (error) {
    console.error('❌ Error removing from favorites:', error);
    throw error;
  }
}

export async function getAllFavorites() {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT pokemon_id FROM favorites ORDER BY added_at DESC');
    return result.map(row => row.pokemon_id);
  } catch (error) {
    console.error('❌ Error getting favorites:', error);
    return [];
  }
}