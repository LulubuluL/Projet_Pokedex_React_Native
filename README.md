# 📱 Pokédex React Native
Une application mobile Pokédex complète développée avec React Native et Expo, permettant de consulter les informations des Pokémon de la génération 1 à 9, de constituer une équipe et de tester ses connaissances avec un quiz interactif.
![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue)
![Expo](https://img.shields.io/badge/Expo-~54.0.14-black)
![License](https://img.shields.io/badge/license-0BSD-green)
## ✨ Fonctionnalités
### 🔍 Exploration des Pokémon
- **Liste complète** des 151 premiers Pokémon (Génération 1)
- **Recherche** par nom ou numéro
- **Filtrage par type** (combinable)
- **Cache intelligent** pour un chargement instantané
- **Noms français** officiels
### 📊 Fiches détaillées
- Image haute qualité (artwork officiel)
- Statistiques complètes (PV, Attaque, Défense, etc.)
- Types et faiblesses
- Chaîne d'évolution interactive
- Taille et poids
- Description officielle
- Badge de génération
- **Cri du Pokémon** 🔊
### 👥 Gestion d'équipe
- Constituer une équipe de **6 Pokémon maximum**
- Ajout/retrait depuis la fiche détail
- Persistance en base de données SQLite
- Gestion des doublons
### ⭐ Favoris
- Marquer des Pokémon en favoris
- Filtre "Favoris uniquement"
- Stockage persistant
### 🎮 Quiz Pokémon
#### Mode Facile
- 4 choix de réponse
- 10 points par bonne réponse
- Silhouette du Pokémon
#### Mode Difficile
- Saisie du nom exact
- 15 points par bonne réponse
- Tolérance sur les accents et majuscules
- Validation au clavier
#### Statistiques
- Nombre de parties jouées
- Taux de réussite
- Meilleur score
- Meilleure série (streak)
### 🌓 Mode sombre
- Toggle jour/nuit
- Thème persistant
- Interface adaptée pour les deux modes
## 🛠️ Technologies utilisées
### Frameworks & Librairies
- **React Native** 0.81.4
- **Expo** ~54.0.14
- **React Navigation** 7.x
  - Bottom Tabs Navigator
  - Stack Navigator
### Gestion d'état
- **React Context API**
  - TeamContext (équipes)
  - FavoritesContext (favoris)
  - ThemeContext (mode sombre)
### Base de données & Stockage
- **expo-sqlite** - Base de données locale
- **@react-native-async-storage/async-storage** - Cache et préférences
### APIs & Médias
- **PokeAPI** - Données des Pokémon
- **expo-audio** - Sons des Pokémon
- **expo-navigation-bar** - Mode immersif Android
### UI/UX
- **Ionicons** - Icônes
- **React Native Safe Area Context** - Gestion des zones sûres
## 📦 Installation
### Prérequis
- Node.js >= 18.0.0
- npm >= 9.0.0
- Expo Go (pour tester sur mobile)

### ⌨️ Cloner le projet
```bash
git clone https://github.com/LulubuluL/Projet_Pokedex_React_Native.git
cd pokedex-react-native
Installer les dépendances
npm install
Lancer l application
npx expo start
Tester sur mobile
Installer Expo Go depuis le Play Store / App Store
Scanner le QR code affiché dans le terminal
```
### 🏗️ Structure du projet
```bash
pokedex-react-native/
├── components/
│   ├── PokemonCard.js           # Carte Pokémon dans la liste
│   ├── PokemonDetail.js         # Fiche détaillée
│   ├── PokemonList.js           # Liste avec filtres
│   ├── PokemonTeam.js           # Gestion d équipe
│   ├── SearchBar.js             # Barre de recherche
│   ├── ThemeToggle.js           # Bouton mode sombre
│   └── TypeFilter.js            # Filtres par type
├── constants/
│   └── pokemonTypes.js          # Types, couleurs, générations
├── contexts/
│   ├── FavoritesContext.js      # État global favoris
│   ├── TeamContext.js           # État global équipe
│   └── ThemeContext.js          # État global thème
├── database/
│   └── teamDatabase.js          # Requêtes SQLite
├── screens/
│   ├── HomeScreen.js            # Navigation Pokédex
│   ├── QuizScreen.js            # Quiz interactif
│   └── TeamScreen.js            # Navigation équipe
├── services/
│   ├── pokemonCache.js          # Gestion du cache
│   ├── pokemonSound.js          # Lecture des cris
│   └── quizService.js           # Logique du quiz
├── App.js                        # Point d'entrée
└── package.json
```
### 💾 Base de données
```bash
Tables SQLite
user_teams
Stocke les Pokémon de l équipe du joueur.
CREATE TABLE user_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pokemon_id INTEGER NOT NULL UNIQUE,
  pokemon_name TEXT NOT NULL,
  pokemon_types TEXT NOT NULL,
  pokemon_height INTEGER,
  pokemon_weight INTEGER,
  species_url TEXT,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
favorites
Stocke les Pokémon favoris.
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pokemon_id INTEGER NOT NULL UNIQUE,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
### 🎯 API utilisée
- PokeAPI - https://pokeapi.co/
- Documentation : https://pokeapi.co/docs/v2
- PokemonCries - https://pokemoncries.com/ (Cris des Pokémon en MP3)
