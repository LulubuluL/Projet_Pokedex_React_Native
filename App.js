import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import TeamScreen from "./screens/TeamScreen";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from "expo-screen-orientation";

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    async function setInitialOrientation() {
      try {
        const orientation = await AsyncStorage.getItem("screenOrientation");

        if (orientation === null) {
          await AsyncStorage.setItem("screenOrientation", "unlocked");
          await ScreenOrientation.unlockAsync();
        } else if (orientation === "locked") {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT
          );
        } else {
          await ScreenOrientation.unlockAsync();
        }
      } catch (error) {
        console.error("Error setting screen orientation:", error);
      }
    }

    setInitialOrientation();
  }, []);

  return (
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
  );
}
