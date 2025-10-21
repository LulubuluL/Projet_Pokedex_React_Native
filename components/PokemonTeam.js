import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PokemonCardTeam from "../components/PokemonCardTeam";

export default function PokemonTeam() {
  const [pokemonList, setPokemonList] = useState([]);

  async function getTeam() {
    await AsyncStorage.getItem("pokemonTeam").then((team) => {
      if (team !== null) {
        setPokemonList(JSON.parse(team));
      }
    });
  }

  useEffect(() => {
    const fetchTeam = async () => {
      getTeam();
    };

    fetchTeam();

    const interval = setInterval(fetchTeam, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text>Votre équipe</Text>
        <Button
          title="Clear team"
          onPress={() =>
            AsyncStorage.removeItem("pokemonTeam") && setPokemonList([])
          }
          color={"rgba(238,21,21,1)"}
        />
      </View>

      <FlatList
        data={pokemonList}
        renderItem={({ item }) => <PokemonCardTeam pokemon={item} />}
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
  },
  title: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
});
