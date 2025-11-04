import { Audio } from 'expo-av';

let currentSound = null;

export async function playPokemonCry(pokemonId) {
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: `https://pokemoncries.com/cries/${pokemonId}.mp3` },
      { shouldPlay: true, volume: 0.7 }
    );

    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error playing Pokemon cry:', error);
    return { success: false, error };
  }
}

export async function stopPokemonCry() {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (error) {
    console.error('Error stopping Pokemon cry:', error);
  }
}