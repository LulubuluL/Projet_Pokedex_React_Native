import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, FlatList } from "react-native";
import PokemonCard from "./components/PokemonCard";

export default function PokemonList() {
  const [pokemonList, setPokemonList] = useState([]);
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
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pokemonList}
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
    paddingTop: 20,
  },
  card: {
    flex: 1,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  cardText: {
    marginTop: 10,
  },
});
