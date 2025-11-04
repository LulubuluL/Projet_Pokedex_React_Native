import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import PokemonCard from "./PokemonCard";
import TypeFilter from "./TypeFilter";

export default function PokemonList() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);

  useEffect(() => {
    fetchPokemonList();
  }, []);

  useEffect(() => {
    filterPokemon();
  }, [selectedTypes, pokemonList]);

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

      setPokemonList(detailedList);
      setFilteredList(detailedList);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  function filterPokemon() {
    if (selectedTypes.length === 0) {
      setFilteredList(pokemonList);
      return;
    }

    const filtered = pokemonList.filter((pokemon) =>
      selectedTypes.every((selectedType) => pokemon.types.includes(selectedType))
    );
    setFilteredList(filtered);
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TypeFilter
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
        onReset={handleResetFilters}
      />
      
      {filteredList.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            Aucun Pokémon trouvé avec {selectedTypes.length > 1 ? 'ces types combinés' : 'ce type'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          renderItem={({ item }) => <PokemonCard pokemon={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
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
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});