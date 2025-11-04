import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
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
  const [description, setDescription] = useState("");
  const [evolutions, setEvolutions] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPokemonDetails();
  }, [id]);

  async function fetchPokemonDetails() {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();

      const speciesResp = await fetch(data.species.url);
      const speciesData = await speciesResp.json();

      // Nom et description FR
      const frenchName =
        speciesData.names.find((n) => n.language.name === "fr")?.name ||
        data.name;
      const frenchDesc =
        speciesData.flavor_text_entries
          .find((t) => t.language.name === "fr")
          ?.flavor_text.replace(/\n|\f/g, " ") || "";

      // Évolutions
      const evolResp = await fetch(speciesData.evolution_chain.url);
      const evolData = await evolResp.json();
      const evoChain = [];
      let evo = evolData.chain;
      while (evo) {
        const evoId = evo.species.url.split("/")[6];
        const evoSpeciesResp = await fetch(evo.species.url);
        const evoSpeciesData = await evoSpeciesResp.json();
        const evoNameFR =
          evoSpeciesData.names.find((n) => n.language.name === "fr")?.name ||
          evo.species.name;

        evoChain.push({ id: evoId, name: evoNameFR });
        evo = evo.evolves_to[0];
      }

      // Types + faiblesses
      const typeUrls = data.types.map((t) => t.type.url);
      const typeData = await Promise.all(
        typeUrls.map((url) => fetch(url).then((r) => r.json()))
      );
      const weakSet = new Set();
      typeData.forEach((t) =>
        t.damage_relations.double_damage_from.forEach((w) =>
          weakSet.add(w.name)
        )
      );

      // Traduction des stats
      const statTranslations = {
        hp: "PV",
        attack: "Attaque",
        defense: "Défense",
        "special-attack": "Att. Spé",
        "special-defense": "Déf. Spé",
        speed: "Vitesse",
      };

      setPokemon({
        id: data.id,
        name: frenchName,
        types: data.types.map((t) => t.type.name),
        height: data.height / 10,
        weight: data.weight / 10,
        stats: data.stats.map((s) => ({
          name: statTranslations[s.stat.name] || s.stat.name,
          value: s.base_stat,
        })),
      });
      setDescription(frenchDesc);
      setEvolutions(evoChain);
      setWeaknesses(Array.from(weakSet));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const isInTeam = pokemon && isPokemonInTeam(pokemon.id);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E3350D" />
        <Text>Chargement du Pokémon...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        {/* Bouton retour en haut */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>⬅ Retour</Text>
        </TouchableOpacity>

        <Image
          style={styles.image}
          source={{
            uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
          }}
        />

        <Text style={styles.title}>
          #{pokemon.id} {capitalize(pokemon.name)}
        </Text>

        <View style={styles.types}>
          {pokemon.types.map((type) => (
            <Text
              key={type}
              style={[styles.typeTag, { backgroundColor: getTypeColor(type) }]}
            >
              {capitalize(translateType(type))}
            </Text>
          ))}
        </View>

        <Text style={styles.description}>{description}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          {pokemon.stats.map((s) => (
            <View key={s.name} style={styles.statRow}>
              <Text style={styles.statName}>{s.name}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faiblesses</Text>
          <View style={styles.types}>
            {weaknesses.map((w) => (
              <Text
                key={w}
                style={[styles.typeTag, { backgroundColor: getTypeColor(w) }]}
              >
                {capitalize(translateType(w))}
              </Text>
            ))}
          </View>
        </View>

        {evolutions.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Évolutions</Text>
            <View style={styles.evoContainer}>
              {evolutions.map((e) => (
                <View key={e.id} style={styles.evoItem}>
                  <Image
                    style={styles.evoImg}
                    source={{
                      uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${e.id}.png`,
                    }}
                  />
                  <Text>{capitalize(e.name)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isInTeam ? styles.remove : styles.add]}
          onPress={() =>
            isInTeam ? removePokemon(pokemon.id) : addPokemon(pokemon)
          }
        >
          <Text style={styles.buttonText}>
            {isInTeam ? "Retirer de l'équipe" : "Ajouter à l'équipe"}
          </Text>
        </TouchableOpacity>

        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#fff" },
  container: { alignItems: "center", padding: 10 },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: 10,
    marginTop: 5,
    marginBottom: 5,
  },
  backText: { fontSize: 16, color: "#333" },
  image: { width: 90, height: 90, marginVertical: 5 },
  title: { fontSize: 26, fontWeight: "bold", marginVertical: 6 },
  types: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  typeTag: {
    color: "white",
    fontWeight: "bold",
    margin: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  description: {
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 6,
    paddingHorizontal: 10,
  },
  statsContainer: { width: "90%", marginVertical: 6 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statName: { fontWeight: "bold", textTransform: "capitalize" },
  statValue: { color: "#333" },
  section: { marginTop: 10, alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  evoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  evoItem: { alignItems: "center", marginHorizontal: 10 },
  evoImg: { width: 70, height: 70 },
  button: {
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    width: "80%",
    alignItems: "center",
  },
  add: { backgroundColor: "#E3350D" },
  remove: { backgroundColor: "#757575" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
