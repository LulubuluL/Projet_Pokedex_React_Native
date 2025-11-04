import { TouchableOpacity, Image, Text, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getGeneration } from "../constants/pokemonTypes";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function PokemonCard({ pokemon }) {
  const navigation = useNavigation();
  const generation = getGeneration(pokemon.id);
  
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