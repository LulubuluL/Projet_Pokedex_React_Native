import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  POKEMON_TYPES,
  getTypeColor,
  translateType,
} from "../constants/pokemonTypes";

export default function TypeFilter({ selectedTypes, onTypeToggle, onReset }) {
  const sortedTypes = [...POKEMON_TYPES].sort((a, b) => {
    return translateType(a).localeCompare(translateType(b));
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filtrer par type</Text>
        {selectedTypes.length > 0 && (
          <TouchableOpacity onPress={onReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Réinitialiser</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sortedTypes.map((type) => {
          const isSelected = selectedTypes.includes(type);
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                {
                  backgroundColor: isSelected ? getTypeColor(type) : "#f0f0f0",
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: "#ddd",
                },
              ]}
              onPress={() => onTypeToggle(type)}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: isSelected ? "white" : "#333" },
                ]}
              >
                {translateType(type)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetText: {
    color: "rgba(238,21,21,1)",
    fontWeight: "600",
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  typeText: {
    fontWeight: "600",
    fontSize: 14,
  },
});
