import { createStackNavigator } from "@react-navigation/stack";
import PokemonTeam from "../components/PokemonTeam";
import PokemonDetail from "../components/PokemonDetail";

const Stack = createStackNavigator();

export default function TeamScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PokemonTeam" component={PokemonTeam} />
      <Stack.Screen name="PokemonDetail" component={PokemonDetail} />
    </Stack.Navigator>
  );
}
