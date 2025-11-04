import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from "react-native";
import { useTeam } from "../contexts/TeamContext";
import PokemonCardTeam from "../components/PokemonCardTeam";

export default function PokemonTeam() {
  const { team, clearTeam } = useTeam();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Votre équipe ({team.length}/6)</Text>
        {team.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearTeam}
          >
            <Text style={styles.clearButtonText}>Vider l'équipe</Text>
          </TouchableOpacity>
        )}
      </View>

      {team.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun Pokémon dans votre équipe</Text>
        </View>
      ) : (
        <FlatList
          data={team}
          renderItem={({ item }) => <PokemonCardTeam pokemon={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "rgba(238,21,21,1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  clearButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
  },
});