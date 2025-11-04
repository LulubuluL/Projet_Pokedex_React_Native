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
import { playPokemonCry } from '../services/pokemonSound';
import { useTheme } from "../contexts/ThemeContext";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function PokemonDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const { addPokemon, removePokemon, isPokemonInTeam } = useTeam();
  const { theme } = useTheme();

  const [pokemon, setPokemon] = useState(null);
  const [description, setDescription] = useState("");
  const [evolutions, setEvolutions] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingSound, setPlayingSound] = useState(false);
  const [isShiny, setIsShiny] = useState(false);
  const [alternativeForms, setAlternativeForms] = useState([]);
  const [alternativeEvolutions, setAlternativeEvolutions] = useState([]);

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
      
      const evoChains = [];
      const sameStageEvolutions = [];
      
      function extractEvolutions(evo, currentChain = [], depth = 0) {
        const evoId = evo.species.url.split("/")[6];
        const evolutionDetails = evo.evolution_details[0];
        
        const chainEntry = {
          id: evoId,
          details: evolutionDetails,
          depth: depth
        };
        
        const newChain = [...currentChain, chainEntry];
        
        if (evo.evolves_to.length === 0) {
          evoChains.push(newChain);
        } else if (evo.evolves_to.length > 1) {
          const firstEvo = evo.evolves_to[0];
          const firstEvoId = firstEvo.species.url.split("/")[6];
          
          for (let i = 1; i < evo.evolves_to.length; i++) {
            const altEvoId = evo.evolves_to[i].species.url.split("/")[6];
            
            if (!sameStageEvolutions.some(group => group.some(e => e.id === firstEvoId))) {
              sameStageEvolutions.push(evo.evolves_to.map(e => ({
                id: e.species.url.split("/")[6],
                details: e.evolution_details[0],
                depth: depth + 1
              })));
            }
          }
          
          evo.evolves_to.forEach(nextEvo => {
            extractEvolutions(nextEvo, newChain, depth + 1);
          });
        } else {
          extractEvolutions(evo.evolves_to[0], newChain, depth + 1);
        }
      }
      
      extractEvolutions(evolData.chain);
      
      const currentChainIndex = evoChains.findIndex(chain => 
        chain.some(entry => entry.id === id.toString())
      );
      
      if (currentChainIndex !== -1) {
        const currentChain = evoChains.splice(currentChainIndex, 1)[0];
        evoChains.unshift(currentChain);
      }
      
      const allEvoWithNames = await Promise.all(
        evoChains.map(async (chain) => {
          const chainWithNames = await Promise.all(
            chain.map(async (entry) => {
              const evoSpeciesResp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${entry.id}`);
              const evoSpeciesData = await evoSpeciesResp.json();
              const evoNameFR =
                evoSpeciesData.names.find((n) => n.language.name === "fr")?.name ||
                evoSpeciesData.name;
              
              let conditionText = "";
              if (entry.details) {
                if (entry.details.time_of_day) {
                  conditionText = entry.details.time_of_day === "day" ? "Jour" : "Nuit";
                }
                if (entry.details.location) {
                  const locationName = entry.details.location.name;
                  if (locationName.includes("forest")) conditionText = "Forêt";
                  else if (locationName.includes("cave")) conditionText = "Grotte";
                  else if (locationName.includes("mountain")) conditionText = "Montagne";
                }
                if (entry.details.held_item) {
                  conditionText = "Objet requis";
                }
              }
              
              return { 
                id: entry.id, 
                name: evoNameFR,
                condition: conditionText
              };
            })
          );
          return chainWithNames;
        })
      );
      
      const currentDepth = evoChains[0]?.find(e => e.id === id.toString())?.depth;
      const alternativeEvos = sameStageEvolutions
        .filter(group => group.some(e => e.id === id.toString()))
        .flatMap(group => group.filter(e => e.id !== id.toString()));
      
      const alternativeEvosWithNames = await Promise.all(
        alternativeEvos.map(async (entry) => {
          const evoSpeciesResp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${entry.id}`);
          const evoSpeciesData = await evoSpeciesResp.json();
          const evoNameFR =
            evoSpeciesData.names.find((n) => n.language.name === "fr")?.name ||
            evoSpeciesData.name;
          
          let conditionText = "";
          if (entry.details) {
            if (entry.details.time_of_day) {
              conditionText = entry.details.time_of_day === "day" ? "Jour" : "Nuit";
            }
            if (entry.details.location) {
              const locationName = entry.details.location.name;
              if (locationName.includes("forest")) conditionText = "Forêt";
              else if (locationName.includes("cave")) conditionText = "Grotte";
              else if (locationName.includes("mountain")) conditionText = "Montagne";
            }
            if (entry.details.held_item) {
              conditionText = "Objet requis";
            }
          }
          
          return { 
            id: entry.id, 
            name: evoNameFR,
            condition: conditionText
          };
        })
      );
      
      const varieties = speciesData.varieties.filter(v => !v.is_default);
      const alternativeForms = [];
      
      for (const variety of varieties) {
        const varietyId = variety.pokemon.url.split("/")[6];
        const varietyResp = await fetch(variety.pokemon.url);
        const varietyData = await varietyResp.json();
        
        const formName = varietyData.name;
        let formLabel = "";
        
        if (formName.includes("mega")) {
          if (formName.includes("mega-x")) formLabel = "Méga-X";
          else if (formName.includes("mega-y")) formLabel = "Méga-Y";
          else formLabel = "Méga";
        } else if (formName.includes("alola")) {
          formLabel = "Alola";
        } else if (formName.includes("galar")) {
          formLabel = "Galar";
        } else if (formName.includes("hisui")) {
          formLabel = "Hisui";
        } else if (formName.includes("paldea")) {
          formLabel = "Paldea";
        }
        
        if (formLabel) {
          alternativeForms.push({
            id: varietyId,
            name: frenchName,
            form: formLabel
          });
        }
      }
      
      setEvolutions(allEvoWithNames);
      setAlternativeForms(alternativeForms);
      setAlternativeEvolutions(alternativeEvosWithNames);

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

  async function handlePlayCry() {
    setPlayingSound(true);
    await playPokemonCry(pokemon.id);
    setTimeout(() => setPlayingSound(false), 1000);
  }

  const isInTeam = pokemon && isPokemonInTeam(pokemon.id);

  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemon?.id);

  const getImageUrl = (pokemonId, shiny = false) => {
    const shinyPath = shiny ? 'shiny/' : '';
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shinyPath}${pokemonId}.png`;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Chargement du Pokémon...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>

        <View style={styles.topButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.favoriteButtonDetail}
            onPress={() => toggleFavorite(pokemon.id)}
          >
            <Ionicons 
              name={favorite ? "star" : "star-outline"} 
              size={28} 
              color={favorite ? "#FFD700" : theme.textTertiary} 
            />
          </TouchableOpacity>
        </View>

        <Image
          style={styles.image}
          source={{
            uri: getImageUrl(id, isShiny),
          }}
        />

        <TouchableOpacity
          style={[styles.shinyButton, { backgroundColor: isShiny ? '#FFD700' : theme.card }]}
          onPress={() => setIsShiny(!isShiny)}
        >
          <Ionicons 
            name="sparkles" 
            size={20} 
            color={isShiny ? '#000' : theme.textSecondary} 
          />
          <Text style={[styles.shinyButtonText, { color: isShiny ? '#000' : theme.textSecondary }]}>
            {isShiny ? "Shiny" : "Normal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.soundButton, { backgroundColor: theme.card }]}
          onPress={handlePlayCry}
          disabled={playingSound}
        >
          <Ionicons 
            name={playingSound ? "volume-high" : "volume-medium-outline"} 
            size={24} 
            color={playingSound ? theme.primary : theme.textSecondary} 
          />
          <Text style={[styles.soundButtonText, { color: theme.textSecondary }]}>
            {playingSound ? "Lecture..." : "Écouter le cri"}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.pokemonNumber, { color: theme.textTertiary }]}>
            #{pokemon.id.toString().padStart(3, '0')}
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            {capitalize(pokemon.name)}
          </Text>
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
          <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {description}
            </Text>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Informations</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>Taille</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{pokemon.height} m</Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: theme.border }]} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>Poids</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{pokemon.weight} kg</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistiques</Text>
          {pokemon.stats.map((s) => (
            <View key={s.name} style={styles.statRow}>
              <Text style={[styles.statName, { color: theme.textSecondary }]}>{s.name}</Text>
              <View style={[styles.statBarContainer, { backgroundColor: theme.border }]}>
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
              <Text style={[styles.statValue, { color: theme.text }]}>{s.value}</Text>
            </View>
          ))}
        </View>

        {weaknesses.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Faiblesses</Text>
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

        {evolutions.length > 0 && evolutions[0].length > 1 && (
          <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Évolutions</Text>
            {evolutions.map((chain, chainIndex) => (
              <View key={chainIndex} style={styles.evoChainContainer}>
                {chainIndex > 0 && (
                  <View style={[styles.chainDivider, { backgroundColor: theme.border }]} />
                )}
                <View style={styles.evoContainer}>
                  {chain.map((e, index) => (
                    <View key={e.id} style={styles.evoWrapper}>
                      <TouchableOpacity
                        style={styles.evoItem}
                        onPress={() => navigation.push('PokemonDetail', { id: e.id })}
                      >
                        <Image
                          style={styles.evoImg}
                          source={{
                            uri: getImageUrl(e.id, isShiny),
                          }}
                        />
                        <Text style={[styles.evoName, { color: theme.text }]}>
                          {capitalize(e.name)}
                        </Text>
                        {e.condition && (
                          <View style={[styles.conditionBadge, { backgroundColor: theme.primary }]}>
                            <Text style={styles.conditionText}>{e.condition}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      {index < chain.length - 1 && (
                        <Ionicons name="arrow-forward" size={20} color={theme.textTertiary} style={styles.evoArrow} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

          {alternativeForms.length > 0 && (
            <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Formes alternatives</Text>
              <View style={styles.formsContainer}>
                {alternativeForms.map((form) => (
                  <TouchableOpacity
                    key={form.id}
                    style={styles.formItem}
                    onPress={() => navigation.push('PokemonDetail', { id: form.id })}
                  >
                    <Image
                      style={styles.formImg}
                      source={{
                        uri: getImageUrl(form.id, isShiny),
                      }}
                    />
                    <Text style={[styles.formName, { color: theme.text }]}>
                      {capitalize(form.name)}
                    </Text>
                    <View style={[styles.formBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.formBadgeText}>{form.form}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {alternativeEvolutions.length > 0 && (
            <View style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Évolutions alternatives</Text>
              <View style={styles.formsContainer}>
                {alternativeEvolutions.map((evo) => (
                  <TouchableOpacity
                    key={evo.id}
                    style={styles.formItem}
                    onPress={() => navigation.push('PokemonDetail', { id: evo.id })}
                  >
                    <Image
                      style={styles.formImg}
                      source={{
                        uri: getImageUrl(evo.id, isShiny),
                      }}
                    />
                    <Text style={[styles.formName, { color: theme.text }]}>
                      {capitalize(evo.name)}
                    </Text>
                    {evo.condition && (
                      <View style={[styles.formBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.formBadgeText}>{evo.condition}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  backButton: {
    padding: 8,
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
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "bold",
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
  },
  statBarContainer: {
    flex: 1,
    height: 8,
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
  soundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  soundButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  shinyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 5,
  },
  shinyButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  evoChainContainer: {
    marginBottom: 12,
  },
  chainDivider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  formsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  formItem: {
    alignItems: "center",
    padding: 8,
    margin: 4,
  },
  formImg: {
    width: 80,
    height: 80,
  },
  formName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  formBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  conditionBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  conditionText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
});