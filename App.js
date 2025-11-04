import { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import TeamScreen from "./screens/TeamScreen";
import QuizScreen from "./screens/QuizScreen";
import { Ionicons } from '@expo/vector-icons';
import { TeamProvider } from './contexts/TeamContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import * as NavigationBar from 'expo-navigation-bar';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Pokedex") {
              iconName = focused ? "list" : "list-outline";
            } else if (route.name === "Team") {
              iconName = focused ? "people" : "people-outline";
            } else if (route.name === "Quiz") {
              iconName = focused ? "game-controller" : "game-controller-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: theme.primary,
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 10,
          },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
        })}
      >
        <Tab.Screen name="Pokedex" component={HomeScreen} />
        <Tab.Screen name="Team" component={TeamScreen} />
        <Tab.Screen name="Quiz" component={QuizScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <ThemeProvider>
      <TeamProvider>
        <FavoritesProvider>
          <AppNavigator />
        </FavoritesProvider>
      </TeamProvider>
    </ThemeProvider>
  );
}