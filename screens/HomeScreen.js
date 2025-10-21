import { createStackNavigator } from "@react-navigation/stack";
import PokemonList from "../components/PokemonList";
import PokemonDetail from "../components/PokemonDetail";

const Stack = createStackNavigator();

export default function HomeScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={PokemonList} />
      <Stack.Screen name="PokemonDetail" component={PokemonDetail} />
    </Stack.Navigator>
  );
}
