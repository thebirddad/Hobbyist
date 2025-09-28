import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameForm } from '../../components/game-form';
import { GameList } from '../../components/game-list';
import { Game, GameStatus } from '../../data/game';
import { useGameStorage } from '../../hooks/use-game-storage';

export default function PlayingScreen() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const { games, loading, addGame, updateGame, deleteGame } = useGameStorage();

  // Filter games for currently playing
  const playingGames = games.filter(game => game.status === GameStatus.PLAYING);

  const handleAddGame = async (gameData: Parameters<typeof addGame>[0]) => {
    // Force status to PLAYING for currently playing
    await addGame({
      ...gameData,
      status: GameStatus.PLAYING,
    });
  };

  const handleUpdateGame = async (game: Game) => {
    await updateGame(game.id, game);
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
        <Text style={styles.loadingText}>Loading currently playing games...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Currently Playing</Text>
        <Text style={styles.subtitle}>
          {playingGames.length} game{playingGames.length !== 1 ? 's' : ''} in progress
        </Text>
      </View>

      <GameList 
        games={playingGames} 
        onDeleteGame={deleteGame}
        onUpdateGame={updateGame}
        onEditGame={handleEditGame}
        emptyTitle="No games currently playing"
        emptySubtitle="Add games you're actively playing!"
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsFormVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <GameForm
        visible={isFormVisible}
        onClose={handleCloseForm}
        onGameAdded={editingGame ? undefined : handleAddGame}
        onGameUpdated={editingGame ? handleUpdateGame : undefined}
        initialGame={editingGame || undefined}
      />
    </SafeAreaView>
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
});