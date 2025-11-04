import { createContext, useContext, useState, useEffect } from 'react';
import {
  getAllTeamPokemon,
  addPokemonToTeam,
  removePokemonFromTeam,
  clearTeamTable,
  getTeamCount,
} from '../database/teamDatabase';

const TeamContext = createContext();

export function TeamProvider({ children }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    try {
      console.log('🔄 Loading team...');
      const teamData = await getAllTeamPokemon();
      setTeam(teamData);
      console.log('✅ Team loaded:', teamData.length, 'pokemon');
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addPokemon(pokemon) {
    try {
      const count = await getTeamCount();
      
      if (count >= 6) {
        return { success: false, error: 'TEAM_FULL' };
      }

      if (team.some(p => p.id === pokemon.id)) {
        return { success: false, error: 'ALREADY_IN_TEAM' };
      }

      await addPokemonToTeam(pokemon);
      await loadTeam();
      return { success: true };
    } catch (error) {
      console.error('Error adding pokemon:', error);
      return { success: false, error: 'DATABASE_ERROR' };
    }
  }

  async function removePokemon(pokemonId) {
    try {
      await removePokemonFromTeam(pokemonId);
      await loadTeam();
      return { success: true };
    } catch (error) {
      console.error('Error removing pokemon:', error);
      return { success: false, error: 'DATABASE_ERROR' };
    }
  }

  async function clearTeam() {
    try {
      await clearTeamTable();
      setTeam([]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing team:', error);
      return { success: false, error: 'DATABASE_ERROR' };
    }
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