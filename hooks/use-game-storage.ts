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
      const storedGames = await AsyncStorage.getItem(GAMES_STORAGE_KEY);
      if (storedGames) {
        setGames(JSON.parse(storedGames));
      }
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGames = async (gamesToSave: Game[]) => {
    try {
      await AsyncStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(gamesToSave));
      setGames(gamesToSave);
    } catch (error) {
      console.error('Failed to save games:', error);
    }
  };

  const addGame = async (game: Omit<Game, 'id' | 'dateAdded'>) => {
    const newGame: Game = {
      ...game,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    };
    const updatedGames = [...games, newGame];
    await saveGames(updatedGames);
  };

  const updateGame = async (id: string, updates: Partial<Game>) => {
    const updatedGames = games.map(game => 
      game.id === id ? { ...game, ...updates } : game
    );
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