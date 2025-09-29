import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GameForm } from '../../components/forms/game-form';
import { GameStats } from '../../components/game-stats';
import { Game, HobbyType } from '../../data/hobby';
import { useHobbyStorage } from '../../hooks/use-hobby-storage';

export default function HomeScreen() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const { hobbies, loading, updateItemInHobby, deleteItemFromHobby } = useHobbyStorage();

  // Get all games from all Game hobbies
  const games = useMemo(() => {
    const gameHobbies = hobbies.filter(hobby => hobby.type === HobbyType.GAMES);
    const allGames: Game[] = [];
    
    gameHobbies.forEach(hobby => {
      if (hobby.items) {
        hobby.items.forEach((item: Game) => {
          // Convert GameItem to Game format for compatibility
          const game: Game & { _hobbyId: string } = {
            id: item.id,
            title: item.title,
            platform: item.platform,
            status: item.status,
            timeToBeat: item.timeToBeat,
            hoursPlayed: item.hoursPlayed,
            dateAdded: item.dateAdded,
            dateCompleted: item.dateCompleted,
            thumbnail: item.thumbnail,
            tags: item.tags,
            // Add hobby reference for updates
            _hobbyId: hobby.id
          };
          allGames.push(game);
        });
      }
    });
    
    return allGames;
  }, [hobbies]);

  const handleAddGame = async (gameData: Omit<Game, 'id' | 'dateAdded'>) => {
    Alert.alert(
      'Add Game to Hobby',
      'Games should be added through specific Game hobbies. Please go to your Game hobby and add the game there.',
      [{ text: 'OK' }]
    );
  };

  const handleUpdateGame = async (game: Game & { _hobbyId?: string }) => {
    if (!game._hobbyId) {
      Alert.alert('Error', 'Cannot update game: hobby not found');
      return;
    }
    
    // Convert back to GameItem format
    const gameItem: Game = {
      id: game.id,
      title: game.title,
      platform: game.platform,
      status: game.status,
      timeToBeat: game.timeToBeat,
      hoursPlayed: game.hoursPlayed,
      dateAdded: game.dateAdded,
      dateCompleted: game.dateCompleted,
      thumbnail: game.thumbnail,
      tags: game.tags,
    };
    
    await updateItemInHobby(game._hobbyId, game.id, gameItem);
  };

  // Adapter function for GameAccordion interface
  const handleUpdateGameById = async (gameId: string, updates: Partial<Game>) => {
    // Find the game in our games array to get the hobbyId
    const gameWithHobby = games.find(g => g.id === gameId) as Game & { _hobbyId?: string };
    if (!gameWithHobby || !gameWithHobby._hobbyId) {
      Alert.alert('Error', 'Cannot update game: hobby not found');
      return;
    }

    // Apply updates to the game
    const updatedGame = { ...gameWithHobby, ...updates };
    await handleUpdateGame(updatedGame);
  };

  const deleteGame = async (gameId: string) => {
    // Find which hobby this game belongs to
    const gameHobbies = hobbies.filter(hobby => hobby.type === HobbyType.GAMES);
    for (const hobby of gameHobbies) {
      if (hobby.items?.some((item: Game) => item.id === gameId)) {
        await deleteItemFromHobby(hobby.id, gameId);
        return;
      }
    }
    Alert.alert('Error', 'Game not found in any hobby');
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setEditingGame(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your games...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Library</Text>
        <Text style={styles.subtitle}>
          {games.length} game{games.length !== 1 ? 's' : ''} from your Game hobbies
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <GameStats games={games} />
    
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Add Game',
            'To add a new game, please go to a Game hobby and add it there.\n\nYou can create a new Game hobby or add to an existing one.',
            [
              { text: 'OK' }
            ]
          );
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Game editing is handled through hobby detail pages now */}
      {isFormVisible && (
        <GameForm
          visible={isFormVisible}
          onClose={handleCloseForm}
          onGameAdded={editingGame ? undefined : handleAddGame}
          onGameUpdated={editingGame ? handleUpdateGame : undefined}
          initialGame={editingGame || undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
    color: '#333',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
});
