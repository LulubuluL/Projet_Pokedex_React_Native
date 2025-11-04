import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getCachedPokemonList } from '../services/pokemonCache';
import { 
  generateQuizQuestion, 
  getQuizStats, 
  updateQuizStats 
} from '../services/quizService';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function QuizScreen() {
  const { theme, isDark } = useTheme();
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState('menu');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const cached = await getCachedPokemonList();
      if (cached) {
        setPokemonList(cached);
      }
      const quizStats = await getQuizStats();
      setStats(quizStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function startGame() {
    setGameState('playing');
    setScore(0);
    setQuestionNumber(0);
    setStreak(0);
    setBestStreak(0);
    nextQuestion();
  }

  function nextQuestion() {
    const question = generateQuizQuestion(pokemonList);
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuestionNumber(prev => prev + 1);
  }

  function handleAnswer(pokemon) {
    setSelectedAnswer(pokemon);
    setShowResult(true);

    const isCorrect = pokemon.id === currentQuestion.correctPokemon.id;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (questionNumber >= 10) {
        endGame(isCorrect);
      } else {
        nextQuestion();
      }
    }, 1500);
  }

  async function endGame(lastCorrect) {
    const finalScore = lastCorrect ? score + 10 : score;
    const correct = Math.round(finalScore / 10);
    
    const newStats = await updateQuizStats(finalScore, correct, 10, bestStreak);
    setStats(newStats);
    setGameState('results');
  }

  function quitGame() {
    setGameState('menu');
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (gameState === 'menu') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.menuContainer}>
          <Ionicons name="game-controller" size={80} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>
            Qui est ce Pokémon ?
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Devine le Pokémon à partir de sa silhouette !
          </Text>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={startGame}
          >
            <Text style={styles.startButtonText}>Commencer le Quiz</Text>
          </TouchableOpacity>

          {stats && (
            <View style={[styles.statsCard, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={[styles.statsTitle, { color: theme.text }]}>
                Statistiques
              </Text>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Parties jouées
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {stats.totalGames}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Taux de réussite
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {stats.totalQuestions > 0
                    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
                    : 0}
                  %
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Meilleur score
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {stats.bestScore}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Meilleure série
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {stats.bestStreak}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  if (gameState === 'results') {
    const correct = Math.round(score / 10);
    const percentage = Math.round((correct / 10) * 100);

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.resultsContainer}>
          <Ionicons
            name={percentage >= 70 ? 'trophy' : 'ribbon'}
            size={80}
            color={percentage >= 70 ? '#FFD700' : theme.primary}
          />
          <Text style={[styles.resultsTitle, { color: theme.text }]}>
            Quiz terminé !
          </Text>
          
          <View style={[styles.scoreCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
              Score final
            </Text>
            <Text style={[styles.scoreValue, { color: theme.primary }]}>
              {score} / 100
            </Text>
            <Text style={[styles.correctText, { color: theme.textSecondary }]}>
              {correct} bonnes réponses sur 10
            </Text>
          </View>

          <View style={[styles.streakCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Ionicons name="flame" size={24} color="#FF5722" />
            <Text style={[styles.streakText, { color: theme.text }]}>
              Meilleure série : {bestStreak}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={startGame}
          >
            <Text style={styles.buttonText}>Rejouer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonSecondary, { borderColor: theme.border }]}
            onPress={quitGame}
          >
            <Text style={[styles.buttonSecondaryText, { color: theme.text }]}>
              Retour au menu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const isCorrect = selectedAnswer?.id === currentQuestion.correctPokemon.id;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.primary,
                width: `${(questionNumber / 10) * 100}%`,
              },
            ]}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.questionCount, { color: theme.text }]}>
            Question {questionNumber}/10
          </Text>
          <View style={styles.scoreContainer}>
            <Ionicons name="flame" size={16} color="#FF5722" />
            <Text style={[styles.streakCount, { color: theme.text }]}>
              {streak}
            </Text>
            <Text style={[styles.scoreText, { color: theme.text }]}>
              Score: {score}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.gameContainer}>
        <Text style={[styles.question, { color: theme.text }]}>
          Qui est ce Pokémon ?
        </Text>

        <View style={styles.imageContainer}>
          <Image
            source={{
                uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentQuestion.correctPokemon.id}.png`,
            }}
            style={[
                styles.pokemonImage,
                !showResult && { tintColor: isDark ? 'white' : 'black' },
            ]}
            />
        </View>

        {showResult && (
          <View
            style={[
              styles.resultBanner,
              {
                backgroundColor: isCorrect
                  ? 'rgba(76, 175, 80, 0.9)'
                  : 'rgba(244, 67, 54, 0.9)',
              },
            ]}
          >
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color="white"
            />
            <Text style={styles.resultText}>
              {isCorrect
                ? `Bravo ! C'était ${capitalize(currentQuestion.correctPokemon.name)} !`
                : `Raté ! C'était ${capitalize(currentQuestion.correctPokemon.name)}`}
            </Text>
          </View>
        )}

        <View style={styles.choicesContainer}>
          {currentQuestion.choices.map((pokemon) => {
            const isSelected = selectedAnswer?.id === pokemon.id;
            const isThisCorrect = pokemon.id === currentQuestion.correctPokemon.id;

            let buttonStyle = [
              styles.choiceButton,
              { backgroundColor: theme.card, borderColor: theme.border },
            ];

            if (showResult) {
              if (isThisCorrect) {
                buttonStyle.push(styles.correctChoice);
              } else if (isSelected) {
                buttonStyle.push(styles.wrongChoice);
              }
            }

            return (
              <TouchableOpacity
                key={pokemon.id}
                style={buttonStyle}
                onPress={() => !showResult && handleAnswer(pokemon)}
                disabled={showResult}
              >
                <Text style={[styles.choiceText, { color: theme.text }]}>
                  {capitalize(pokemon.name)}
                </Text>
                {showResult && isThisCorrect && (
                  <Ionicons name="checkmark" size={20} color="#4CAF50" />
                )}
                {showResult && isSelected && !isThisCorrect && (
                  <Ionicons name="close" size={20} color="#F44336" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.quitButton, { borderColor: theme.border }]}
          onPress={quitGame}
        >
          <Text style={[styles.quitButtonText, { color: theme.textSecondary }]}>
            Abandonner
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 40,
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 30,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 16,
    paddingTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  questionCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pokemonImage: {
    width: 200,
    height: 200,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  correctChoice: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  wrongChoice: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  choiceText: {
    fontSize: 18,
    fontWeight: '600',
  },
  quitButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  quitButtonText: {
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 30,
  },
  scoreCard: {
    width: '100%',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  correctText: {
    fontSize: 16,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    gap: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 2,
    width: '100%',
    alignItems: 'center',
  },
  buttonSecondaryText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});