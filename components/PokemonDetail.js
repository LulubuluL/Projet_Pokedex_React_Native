import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTeam } from "../contexts/TeamContext";
import { getTypeColor, translateType } from "../constants/pokemonTypes";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function PokemonDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const { addPokemon, removePokemon, isPokemonInTeam } = useTeam();

  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isInTeam = pokemon ? isPokemonInTeam(pokemon.id) : false;

  useEffect(() => {
    fetchPokemonDetails();
  }, [id]);

  async function fetchPokemonDetails() {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
      const data = await response.json();

      const speciesResponse = await fetch(data.species.url);
      const speciesData = await speciesResponse.json();

      const frenchName =
        speciesData.names.find((n) => n.language.name === "fr")?.name ||
        data.name;

      setPokemon({
        id: data.id,
        name: frenchName,
        types: data.types,
        height: data.height,
        weight: data.weight,
        speciesUrl: data.species.url,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToTeam() {
    const result = await addPokemon(pokemon);
    
    if (!result.success) {
      if (result.error === 'TEAM_FULL') {
        Alert.alert('Équipe complète', 'Vous avez déjà 6 Pokémon dans votre équipe !');
      } else if (result.error === 'ALREADY_IN_TEAM') {
        Alert.alert('Déjà dans l\'équipe', 'Ce Pokémon est déjà dans votre équipe !');
      }
    }
  }

  async function handleRemoveFromTeam() {
    await removePokemon(pokemon.id);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isInTeam ? styles.buttonRemove : styles.buttonAdd]}
        onPress={isInTeam ? handleRemoveFromTeam : handleAddToTeam}
      >
        <Text style={styles.buttonText}>
          {isInTeam ? 'Retirer de l\'équipe' : 'Ajouter à l\'équipe'}
        </Text>
      </TouchableOpacity>

      <Image
        style={styles.pokemonImage}
        source={{
          uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
        }}
      />
      <Text style={styles.pokemonName}>{capitalize(pokemon.name)}</Text>

      <View style={styles.typesContainer}>
        {pokemon.types.map((type, index) => (
          <View
            key={index}
            style={[
              styles.typeTag,
              { backgroundColor: getTypeColor(type.type.name) },
            ]}
          >
            <Text style={styles.typeText}>
              {translateType(type.type.name)}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.stat}>Taille : {pokemon.height / 10}m</Text>
      <Text style={styles.stat}>Poids : {pokemon.weight / 10}kg</Text>

      <TouchableOpacity
        style={styles.goBack}
        onPress={() => navigation.goBack()}
      >
        <Text>Retour</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
    alignItems: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonAdd: {
    backgroundColor: "rgba(238,21,21,1)",
  },
  buttonRemove: {
    backgroundColor: "#757575",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  pokemonImage: {
    width: 200,
    height: 200,
  },
  pokemonName: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },
  typesContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  typeTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: 5,
  },
  typeText: {
    color: "white",
    fontWeight: "bold",
  },
  stat: {
    fontSize: 16,
    marginVertical: 4,
  },
  goBack: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
});