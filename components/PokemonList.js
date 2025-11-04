import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import PokemonCard from "./PokemonCard";

export default function PokemonList() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = "https://pokeapi.co/api/v2/pokedex/1/";
    fetch(url)
      .then((resp) => resp.json())
      .then(async (data) => {
        const entries = data.pokemon_entries;

        const detailedList = await Promise.all(
          entries.map(async (entry) => {
            const speciesUrl = entry.pokemon_species.url;
            const speciesResp = await fetch(speciesUrl);
            const speciesData = await speciesResp.json();

            const frenchName =
              speciesData.names.find((n) => n.language.name === "fr")?.name ||
              speciesData.name;

            return {
              id: entry.entry_number,
              name: frenchName,
              speciesUrl,
            };
          })
        );

        setPokemonList(detailedList);
        setFilteredList(detailedList);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);

    const filtered = pokemonList.filter((pokemon) => {
      const query = text.toLowerCase();

      if (!isNaN(query) && query.trim() !== "") {
        return pokemon.id.toString().padStart(3, "0").includes(query);
      }

      return pokemon.name.toLowerCase().includes(query);
    });

    setFilteredList(filtered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E3350D" />
        <Text>Chargement des Pokémon...</Text>
      </View>
    );
  }

  if (error) {
    return <Text>Erreur : {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un Pokémon..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredList}
        renderItem={({ item }) => <PokemonCard pokemon={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  searchBar: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
