import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'pokemon_list_cache';
const CACHE_TIMESTAMP_KEY = 'pokemon_list_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function getCachedPokemonList() {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEY);
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cachedData || !timestamp) {
      return null;
    }
    
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    
    if (cacheAge > CACHE_DURATION) {
      await clearPokemonCache();
      return null;
    }
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export async function setCachedPokemonList(pokemonList) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(pokemonList));
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

export async function clearPokemonCache() {
  try {
    await AsyncStorage.multiRemove([CACHE_KEY, CACHE_TIMESTAMP_KEY]);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export async function isCacheValid() {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    return cacheAge <= CACHE_DURATION;
  } catch (error) {
    return false;
  }
}