import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator,
  TouchableOpacity 
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import PokemonCard from "./PokemonCard";
import TypeFilter from "./TypeFilter";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import { 
  getCachedPokemonList, 
  setCachedPokemonList,
  clearPokemonCache 
} from "../services/pokemonCache";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTheme } from "../contexts/ThemeContext";

export default function PokemonList() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites } = useFavorites();
  const { theme } = useTheme();

  useEffect(() => {
    loadPokemonList();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedTypes, searchQuery, pokemonList, showFavoritesOnly, favorites]);

  async function loadPokemonList() {
    try {
      const cachedData = await getCachedPokemonList();
      
      if (cachedData) {
        setPokemonList(cachedData);
        setFilteredList(cachedData);
        setFromCache(true);
        setLoading(false);
        return;
      }
      
      await fetchPokemonList();
    } catch (err) {
      console.error("Error loading pokemon list:", err);
      setError(err);
      setLoading(false);
    }
  }

  async function fetchPokemonList() {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/pokedex/1/");
      const data = await response.json();
      const entries = data.pokemon_entries;

      const detailedList = await Promise.all(
        entries.map(async (entry) => {
          const pokemonResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${entry.entry_number}/`
          );
          const pokemonData = await pokemonResponse.json();

          const speciesResponse = await fetch(entry.pokemon_species.url);
          const speciesData = await speciesResponse.json();

          const frenchName =
            speciesData.names.find((n) => n.language.name === "fr")?.name ||
            speciesData.name;

          return {
            id: entry.entry_number,
            name: frenchName,
            types: pokemonData.types.map((t) => t.type.name),
            speciesUrl: entry.pokemon_species.url,
          };
        })
      );

      await setCachedPokemonList(detailedList);
      setPokemonList(detailedList);
      setFilteredList(detailedList);
      setFromCache(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let result = [...pokemonList];

    if (showFavoritesOnly) {
      result = result.filter(pokemon => favorites.includes(pokemon.id));
    }

    if (selectedTypes.length > 0) {
      result = result.filter((pokemon) =>
        selectedTypes.every((selectedType) => pokemon.types.includes(selectedType))
      );
    }

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((pokemon) => {
        const nameMatch = pokemon.name.toLowerCase().includes(query);
        const idMatch = pokemon.id.toString().includes(query);
        return nameMatch || idMatch;
      });
    }

    setFilteredList(result);
  }

  function handleTypeToggle(type) {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  }

  function handleResetFilters() {
    setSelectedTypes([]);
  }

  function handleSearchClear() {
    setSearchQuery('');
  }

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Chargement des Pokémon...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          Erreur: {error.message}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={loadPokemonList}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleSearchClear}
        />
        <ThemeToggle />
      </View>
      
      <TypeFilter
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
        onReset={handleResetFilters}
      />
      
      {filteredList.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Aucun Pokémon trouvé
          </Text>
          {(searchQuery || selectedTypes.length > 0) && (
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Essayez de modifier votre recherche ou vos filtres
            </Text>
          )}
        </View>
      ) : (
        <>
          <View style={styles.resultHeader}>
            <Text style={[styles.resultCount, { color: theme.textSecondary }]}>
              {filteredList.length} Pokémon trouvé{filteredList.length > 1 ? 's' : ''}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.favoritesFilterCompact,
                { backgroundColor: showFavoritesOnly ? '#FFF9E6' : theme.card },
                showFavoritesOnly && { borderWidth: 1.5, borderColor: '#FFD700' }
              ]}
              onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Ionicons 
                name="star" 
                size={14} 
                color={showFavoritesOnly ? "#FFD700" : theme.textSecondary} 
              />
              <Text style={[
                styles.favoritesFilterTextCompact,
                { color: showFavoritesOnly ? '#333' : theme.textSecondary }
              ]}>
                Favoris
              </Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredList}
            renderItem={({ item, index }) => <PokemonCard pokemon={item} index={index} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  favoritesFilterCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 4,
  },
  favoritesFilterTextCompact: {
    fontSize: 12,
    fontWeight: '600',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});