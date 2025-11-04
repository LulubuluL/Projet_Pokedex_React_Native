import { createContext, useContext, useState, useEffect } from 'react';
import {
  addToFavorites,
  removeFromFavorites,
  getAllFavorites,
} from '../database/teamDatabase';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      console.log('🔄 Loading favorites...');
      const favoriteIds = await getAllFavorites();
      setFavorites(favoriteIds);
      console.log('✅ Favorites loaded:', favoriteIds.length, 'pokemon');
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(pokemonId) {
    try {
      if (favorites.includes(pokemonId)) {
        await removeFromFavorites(pokemonId);
      } else {
        await addToFavorites(pokemonId);
      }
      await loadFavorites();
      return { success: true };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, error: 'DATABASE_ERROR' };
    }
  }

  function isFavorite(pokemonId) {
    return favorites.includes(pokemonId);
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}