import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTeam } from "../contexts/TeamContext";

const POKEMON_TYPES = [
  "normal", "fighting", "flying", "poison", "ground", "rock",
  "bug", "ghost", "steel", "fire", "water", "grass",
  "electric", "psychic", "ice", "dragon", "dark", "fairy",
];

const POKEMON_COLORS = [
  "#A8A878", "#C03028", "#A890F0", "#A040A0", "#E0C068", "#B8A038",
  "#A8B820", "#705898", "#B8B8D0", "#F08030", "#6890F0", "#78C850",
  "#F8D030", "#F85888", "#98D8D8", "#7038F8", "#705848", "#EE99AC",
];

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTypeColor(type) {
  const index = POKEMON_TYPES.indexOf(type);
  return index !== -1 ? POKEMON_COLORS[index] : "#A8A878";
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E3350D" />
        <Text>Chargement du Pokémon...</Text>
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
              {capitalize(type.type.name)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});