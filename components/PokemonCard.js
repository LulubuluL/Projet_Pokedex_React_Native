import { TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function PokemonCard({ pokemon }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("PokemonDetail", {
          id: pokemon.id,
        })
      }
    >
      <Image
        style={styles.cardImage}
        source={{
          uri:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
            pokemon.id +
            ".png",
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
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  cardNumber: {
    fontWeight: "bold",
    marginRight: 6,
  },
  cardText: {
    marginTop: 10,
  },
});
