import AsyncStorage from '@react-native-async-storage/async-storage';

const QUIZ_STATS_KEY = 'quiz_statistics';

export async function getQuizStats() {
  try {
    const stats = await AsyncStorage.getItem(QUIZ_STATS_KEY);
    if (stats) {
      return JSON.parse(stats);
    }
    return {
      totalGames: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      bestScore: 0,
      bestStreak: 0,
    };
  } catch (error) {
    console.error('Error getting quiz stats:', error);
    return {
      totalGames: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      bestScore: 0,
      bestStreak: 0,
    };
  }
}

export async function saveQuizStats(stats) {
  try {
    await AsyncStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving quiz stats:', error);
  }
}

export async function updateQuizStats(score, correct, total, streak) {
  const stats = await getQuizStats();
  
  const newStats = {
    totalGames: stats.totalGames + 1,
    totalCorrect: stats.totalCorrect + correct,
    totalQuestions: stats.totalQuestions + total,
    bestScore: Math.max(stats.bestScore, score),
    bestStreak: Math.max(stats.bestStreak, streak),
  };
  
  await saveQuizStats(newStats);
  return newStats;
}

export function generateQuizQuestion(pokemonList) {
  const correctPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
  
  const wrongAnswers = [];
  while (wrongAnswers.length < 3) {
    const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
    if (randomPokemon.id !== correctPokemon.id && !wrongAnswers.find(p => p.id === randomPokemon.id)) {
      wrongAnswers.push(randomPokemon);
    }
  }
  
  const allChoices = [correctPokemon, ...wrongAnswers];
  const shuffledChoices = allChoices.sort(() => Math.random() - 0.5);
  
  return {
    correctPokemon,
    choices: shuffledChoices,
  };
}