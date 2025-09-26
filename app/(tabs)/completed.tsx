import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameForm } from '@/components/game-form';
import { GameList } from '@/components/game-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GameStatus } from '@/data/game';
import { useGameStorage } from '@/hooks/use-game-storage';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function CompletedScreen() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { games, loading, addGame, updateGame, deleteGame } = useGameStorage();
  const tintColor = useThemeColor({}, 'tint');

  // Filter games for completed
  const completedGames = games.filter(game => game.status === GameStatus.COMPLETED);

  const handleAddGame = async (gameData: Parameters<typeof addGame>[0]) => {
    // Force status to COMPLETED for completed games
    await addGame({
      ...gameData,
      status: GameStatus.COMPLETED,
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Loading completed games...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Completed</ThemedText>
        <ThemedText style={styles.subtitle}>
          {completedGames.length} game{completedGames.length !== 1 ? 's' : ''} completed
        </ThemedText>
      </ThemedView>

      <GameList 
        games={completedGames} 
        onDeleteGame={deleteGame}
        onUpdateGame={updateGame}
        emptyTitle="No completed games yet"
        emptySubtitle="Mark games as completed to see them here!"
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: tintColor }]}
        onPress={() => setIsFormVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <GameForm
        visible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSubmit={handleAddGame}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
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