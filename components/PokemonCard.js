import { TouchableOpacity, Image, Text, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getGeneration } from "../constants/pokemonTypes";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from '@expo/vector-icons';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function PokemonCard({ pokemon }) {
  const navigation = useNavigation();
  const generation = getGeneration(pokemon.id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { theme } = useTheme();
  const favorite = isFavorite(pokemon.id);
  
  function handleFavoritePress(e) {
    e.stopPropagation();
    toggleFavorite(pokemon.id);
  }
  
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() =>
        navigation.navigate("PokemonDetail", {
          id: pokemon.id,
        })
      }
    >
      {getGeneration(pokemon.id) && (
        <View style={[styles.genBadge, { backgroundColor: getGeneration(pokemon.id).color }]}>
          <Text style={styles.genText}>Gen {getGeneration(pokemon.id).id}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={handleFavoritePress}
      >
        <Ionicons 
          name={favorite ? "star" : "star-outline"} 
          size={24} 
          color={favorite ? "#FFD700" : theme.textTertiary} 
        />
      </TouchableOpacity>
      
      <Image
        style={styles.cardImage}
        source={{
          uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
        }}
      />
      <Text style={[styles.cardNumber, { color: theme.textSecondary }]}>
        #{pokemon.id.toString().padStart(3, "0")}
      </Text>
      <Text style={[styles.cardText, { color: theme.text }]}>
        {capitalize(pokemon.name)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '45%',
    aspectRatio: 1,
    margin: '2.5%',
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 12,
  },
  cardText: {
    marginTop: 4,
    fontWeight: '600',
    fontSize: 14,
  },
});