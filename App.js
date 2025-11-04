import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import TeamScreen from "./screens/TeamScreen";
import { Ionicons } from "@expo/vector-icons";
import { TeamProvider } from "./contexts/TeamContext";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <TeamProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Pokedex") {
                iconName = focused ? "list" : "list-outline";
              } else if (route.name === "Mon équipe") {
                iconName = focused ? "people" : "people-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            headerStyle: {
              backgroundColor: "rgba(238,21,21,1)",
              shadowColor: "rgba(238,21,21,1)",
            },
            headerTintColor: "#fff",
            tabBarStyle: {
              backgroundColor: "rgba(238,21,21,1)",
              shadowColor: "rgba(238,21,21,1)",
              position: "absolute",
              borderTopWidth: 0,
              height: 60,
              paddingBottom: 10,
            },
            tabBarActiveTintColor: "white",
            tabBarInactiveTintColor: "black",
          })}
        >
          <Tab.Screen name="Pokedex" component={HomeScreen} />
          <Tab.Screen name="Mon équipe" component={TeamScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </TeamProvider>
  );
}
