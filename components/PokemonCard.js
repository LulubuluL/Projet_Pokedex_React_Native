import { TouchableOpacity, Image, Text, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getGeneration } from "../constants/pokemonTypes";
import { useFavorites } from "../contexts/FavoritesContext";
import { Ionicons } from '@expo/vector-icons';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function PokemonCard({ pokemon }) {
  const navigation = useNavigation();
  const generation = getGeneration(pokemon.id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemon.id);
  
  function handleFavoritePress(e) {
    e.stopPropagation();
    toggleFavorite(pokemon.id);
  }
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("PokemonDetail", {
          id: pokemon.id,
        })
      }
    >
      <View style={[styles.genBadge, { backgroundColor: generation.color }]}>
        <Text style={styles.genText}>Gen {generation.id}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={handleFavoritePress}
      >
        <Ionicons 
          name={favorite ? "star" : "star-outline"} 
          size={24} 
          color={favorite ? "#FFD700" : "#999"} 
        />
      </TouchableOpacity>
      
      <Image
        style={styles.cardImage}
        source={{
          uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
        }}
      />
      <Text style={styles.cardNumber}>
        #{pokemon.id.toString().padStart(3, "0")}
      </Text>
      <Text style={styles.cardText}>{capitalize(pokemon.name)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    position: 'relative',
  },
  genBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  genText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
    padding: 4,
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  cardNumber: {
    fontWeight: "bold",
    marginTop: 4,
    color: '#666',
    fontSize: 12,
  },
  cardText: {
    marginTop: 4,
    fontWeight: '600',
    fontSize: 14,
  },
});