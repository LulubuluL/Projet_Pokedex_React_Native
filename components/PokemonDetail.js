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
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTeam } from "../contexts/TeamContext";
import { getTypeColor, translateType, getGeneration } from "../constants/pokemonTypes";
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from "../contexts/FavoritesContext";

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

      const frenchName =
        speciesData.names.find((n) => n.language.name === "fr")?.name ||
        data.name;
      const frenchDesc =
        speciesData.flavor_text_entries
          .find((t) => t.language.name === "fr")
          ?.flavor_text.replace(/\n|\f/g, " ") || "";

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
        speciesUrl: data.species.url,
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

  const isInTeam = pokemon && isPokemonInTeam(pokemon.id);

  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemon?.id);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="rgba(238,21,21,1)" />
        <Text style={styles.loadingText}>Chargement du Pokémon...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>

        <View style={styles.topButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.favoriteButtonDetail}
            onPress={() => toggleFavorite(pokemon.id)}
          >
            <Ionicons 
              name={favorite ? "star" : "star-outline"} 
              size={28} 
              color={favorite ? "#FFD700" : "#999"} 
            />
          </TouchableOpacity>
        </View>

        <Image
          style={styles.image}
          source={{
            uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          }}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.pokemonNumber}>#{pokemon.id.toString().padStart(3, '0')}</Text>
          <Text style={styles.title}>{capitalize(pokemon.name)}</Text>
        </View>

        <View style={[styles.genBadgeLarge, { backgroundColor: getGeneration(pokemon.id).color }]}>
          <Text style={styles.genTextLarge}>
            Génération {getGeneration(pokemon.id).id} • {getGeneration(pokemon.id).name}
          </Text>
        </View>

        <View style={styles.typesContainer}>
          {pokemon.types.map((type) => (
            <View
              key={type}
              style={[styles.typeTag, { backgroundColor: getTypeColor(type) }]}
            >
              <Text style={styles.typeText}>
                {translateType(type)}
              </Text>
            </View>
          ))}
        </View>

        {description && (
          <View style={styles.card}>
            <Text style={styles.description}>{description}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Taille</Text>
              <Text style={styles.infoValue}>{pokemon.height} m</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Poids</Text>
              <Text style={styles.infoValue}>{pokemon.weight} kg</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          {pokemon.stats.map((s) => (
            <View key={s.name} style={styles.statRow}>
              <Text style={styles.statName}>{s.name}</Text>
              <View style={styles.statBarContainer}>
                <View 
                  style={[
                    styles.statBar, 
                    { 
                      width: `${(s.value / 255) * 100}%`,
                      backgroundColor: s.value > 100 ? '#4CAF50' : s.value > 60 ? '#FFC107' : '#FF5722'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        {weaknesses.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Faiblesses</Text>
            <View style={styles.typesContainer}>
              {weaknesses.map((w) => (
                <View
                  key={w}
                  style={[styles.typeTagSmall, { backgroundColor: getTypeColor(w) }]}
                >
                  <Text style={styles.typeTextSmall}>
                    {translateType(w)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {evolutions.length > 1 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Évolutions</Text>
            <View style={styles.evoContainer}>
              {evolutions.map((e, index) => (
                <View key={e.id} style={styles.evoWrapper}>
                  <TouchableOpacity
                    style={styles.evoItem}
                    onPress={() => navigation.push('PokemonDetail', { id: e.id })}
                  >
                    <Image
                      style={styles.evoImg}
                      source={{
                        uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${e.id}.png`,
                      }}
                    />
                    <Text style={styles.evoName}>{capitalize(e.name)}</Text>
                  </TouchableOpacity>
                  {index < evolutions.length - 1 && (
                    <Ionicons name="arrow-forward" size={20} color="#999" style={styles.evoArrow} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isInTeam ? styles.buttonRemove : styles.buttonAdd]}
          onPress={isInTeam ? handleRemoveFromTeam : handleAddToTeam}
        >
          <Text style={styles.buttonText}>
            {isInTeam ? "Retirer de l'équipe" : "Ajouter à l'équipe"}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: 8,
  },
  image: {
    width: 180,
    height: 180,
    marginVertical: 10,
  },
  headerInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  pokemonNumber: {
    fontSize: 16,
    color: "#999",
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  typesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  typeTag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 4,
  },
  typeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  typeTagSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  typeTextSmall: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
  card: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#ddd",
  },
  infoLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statName: {
    width: 80,
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  statBar: {
    height: "100%",
    borderRadius: 4,
  },
  statValue: {
    width: 40,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  evoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  evoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  evoItem: {
    alignItems: "center",
    padding: 8,
  },
  evoImg: {
    width: 80,
    height: 80,
  },
  evoName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  evoArrow: {
    marginHorizontal: 8,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
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
  bottomSpacer: {
    height: 100,
  },
  genBadgeLarge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  genTextLarge: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  favoriteButtonDetail: {
    padding: 8,
  },
});