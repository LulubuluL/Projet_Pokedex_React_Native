import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeamContext = createContext();

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    try {
      const teamData = await AsyncStorage.getItem('pokemonTeam');
      setTeam(teamData ? JSON.parse(teamData) : []);
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addPokemon(pokemon) {
    if (team.length >= 6) {
      return { success: false, error: 'TEAM_FULL' };
    }

    if (team.some(p => p.id === pokemon.id)) {
      return { success: false, error: 'ALREADY_IN_TEAM' };
    }

    const newTeam = [...team, pokemon];
    await AsyncStorage.setItem('pokemonTeam', JSON.stringify(newTeam));
    setTeam(newTeam);
    return { success: true };
  }

  async function removePokemon(pokemonId) {
    const newTeam = team.filter(p => p.id !== pokemonId);
    await AsyncStorage.setItem('pokemonTeam', JSON.stringify(newTeam));
    setTeam(newTeam);
    return { success: true };
  }

  async function clearTeam() {
    await AsyncStorage.removeItem('pokemonTeam');
    setTeam([]);
  }

  function isPokemonInTeam(pokemonId) {
    return team.some(p => p.id === pokemonId);
  }

  return (
    <TeamContext.Provider
      value={{
        team,
        loading,
        addPokemon,
        removePokemon,
        clearTeam,
        isPokemonInTeam,
        isTeamFull: team.length >= 6,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
}