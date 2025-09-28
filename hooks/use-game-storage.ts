import { Game } from '@/data/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const GAMES_STORAGE_KEY = 'games_data';

export const useGameStorage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Load games from storage on mount
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      console.log('🗄️ Loading games from AsyncStorage...');
      const storedGames = await AsyncStorage.getItem(GAMES_STORAGE_KEY);
      if (storedGames) {
        const parsedGames = JSON.parse(storedGames);
        console.log('🗄️ Loaded games:', parsedGames.length, 'games');
        parsedGames.forEach((game: Game, index: number) => {
          console.log(`🗄️ Game ${index + 1}: "${game.title}" thumbnail:`, game.thumbnail);
        });
        setGames(parsedGames);
      } else {
        console.log('🗄️ No stored games found');
      }
    } catch (error) {
      console.error('🗄️ Failed to load games:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGames = async (gamesToSave: Game[]) => {
    try {
      console.log('🗄️ Saving games to AsyncStorage...', gamesToSave.length, 'games');
      gamesToSave.forEach((game: Game, index: number) => {
        console.log(`🗄️ Saving Game ${index + 1}: "${game.title}" thumbnail:`, game.thumbnail);
      });
      const jsonData = JSON.stringify(gamesToSave);
      console.log('🗄️ JSON data size:', jsonData.length, 'characters');
      await AsyncStorage.setItem(GAMES_STORAGE_KEY, jsonData);
      console.log('🗄️ Games saved successfully');
      setGames(gamesToSave);
    } catch (error) {
      console.error('🗄️ Failed to save games:', error);
    }
  };

  const addGame = async (game: Omit<Game, 'id' | 'dateAdded'>) => {
    console.log('🗄️ Adding new game:', game.title, 'with thumbnail:', game.thumbnail);
    const newGame: Game = {
      ...game,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    };
    console.log('🗄️ New game object created with ID:', newGame.id, 'thumbnail:', newGame.thumbnail);
    const updatedGames = [...games, newGame];
    await saveGames(updatedGames);
  };

  const updateGame = async (id: string, updates: Partial<Game>) => {
    console.log('🗄️ Updating game with ID:', id, 'updates:', updates);
    const updatedGames = games.map(game => {
      if (game.id === id) {
        const updatedGame = { ...game, ...updates };
        console.log('🗄️ Game updated:', updatedGame.title, 'thumbnail:', updatedGame.thumbnail);
        return updatedGame;
      }
      return game;
    });
    await saveGames(updatedGames);
  };

  const deleteGame = async (id: string) => {
    const updatedGames = games.filter(game => game.id !== id);
    await saveGames(updatedGames);
  };

  return {
    games,
    loading,
    addGame,
    updateGame,
    deleteGame,
    refreshGames: loadGames,
  };
};