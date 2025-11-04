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
import PokemonCard from "./PokemonCard";
import TypeFilter from "./TypeFilter";
import SearchBar from "./SearchBar";
import { 
  getCachedPokemonList, 
  setCachedPokemonList,
  clearPokemonCache 
} from "../services/pokemonCache";

export default function PokemonList() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    loadPokemonList();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedTypes, searchQuery, pokemonList]);

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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="rgba(238,21,21,1)" />
        <Text style={styles.loadingText}>Chargement des Pokémon...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erreur: {error.message}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadPokemonList}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleSearchClear}
      />
      
      <TypeFilter
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
        onReset={handleResetFilters}
      />
      
      {filteredList.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Aucun Pokémon trouvé
          </Text>
          {(searchQuery || selectedTypes.length > 0) && (
            <Text style={styles.emptySubtext}>
              Essayez de modifier votre recherche ou vos filtres
            </Text>
          )}
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>
            {filteredList.length} Pokémon trouvé{filteredList.length > 1 ? 's' : ''}
          </Text>
          <FlatList
            data={filteredList}
            renderItem={({ item }) => <PokemonCard pokemon={item} />}
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
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "rgba(238,21,21,1)",
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: 'rgba(238,21,21,1)',
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