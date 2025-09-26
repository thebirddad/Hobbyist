import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Game, GameStatus } from '@/data/game';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface GameListProps {
  games: Game[];
  onDeleteGame: (id: string) => void;
  onUpdateGame?: (id: string, updates: Partial<Game>) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const GameList: React.FC<GameListProps> = ({ 
  games, 
  onDeleteGame, 
  onUpdateGame,
  emptyTitle = "No games added yet",
  emptySubtitle = "Tap the \"+\" button to add your first game!"
}) => {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case GameStatus.NOT_STARTED:
        return '#6B7280';
      case GameStatus.PLAYING:
        return '#10B981';
      case GameStatus.COMPLETED:
        return '#3B82F6';
      case GameStatus.ON_HOLD:
        return '#F59E0B';
      case GameStatus.DROPPED:
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const handleDeleteGame = (game: Game) => {
    Alert.alert(
      'Delete Game',
      `Are you sure you want to delete "${game.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteGame(game.id) },
      ]
    );
  };

  const renderGameItem = ({ item }: { item: Game }) => (
    <ThemedView style={[styles.gameItem, { borderColor: tintColor + '20' }]}>
      <View style={styles.gameHeader}>
        <ThemedText style={styles.gameTitle}>{item.title}</ThemedText>
        <TouchableOpacity
          onPress={() => handleDeleteGame(item)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.gameDetails}>
        <View style={styles.gameRow}>
          <ThemedText style={styles.gameLabel}>Platform:</ThemedText>
          <ThemedText style={styles.gameValue}>{item.platform}</ThemedText>
        </View>
        
        <View style={styles.gameRow}>
          <ThemedText style={styles.gameLabel}>Genre:</ThemedText>
          <ThemedText style={styles.gameValue}>{item.genre}</ThemedText>
        </View>
        
        <View style={styles.gameRow}>
          <ThemedText style={styles.gameLabel}>Status:</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        {item.rating && (
          <View style={styles.gameRow}>
            <ThemedText style={styles.gameLabel}>Rating:</ThemedText>
            <ThemedText style={styles.gameValue}>{item.rating}/10</ThemedText>
          </View>
        )}
        
        {item.hoursPlayed && (
          <View style={styles.gameRow}>
            <ThemedText style={styles.gameLabel}>Hours Played:</ThemedText>
            <ThemedText style={styles.gameValue}>{item.hoursPlayed}h</ThemedText>
          </View>
        )}
        
        {item.hltbData && (
          <View style={styles.hltbContainer}>
            <ThemedText style={styles.gameLabel}>HowLongToBeat:</ThemedText>
            {item.hltbData.gameplayMain && (
              <ThemedText style={styles.hltbTime}>
                Main Story: {item.hltbData.gameplayMain}h
              </ThemedText>
            )}
            {item.hltbData.gameplayMainExtra && (
              <ThemedText style={styles.hltbTime}>
                Main + Extras: {item.hltbData.gameplayMainExtra}h
              </ThemedText>
            )}
            {item.hltbData.gameplayCompletionist && (
              <ThemedText style={styles.hltbTime}>
                Completionist: {item.hltbData.gameplayCompletionist}h
              </ThemedText>
            )}
          </View>
        )}

        {item.notes && (
          <View style={styles.notesContainer}>
            <ThemedText style={styles.gameLabel}>Notes:</ThemedText>
            <ThemedText style={styles.notesText}>{item.notes}</ThemedText>
          </View>
        )}

        {onUpdateGame && (
          <View style={styles.quickActions}>
            <ThemedText style={styles.quickActionsLabel}>Quick Actions:</ThemedText>
            <View style={styles.actionButtons}>
              {item.status !== GameStatus.NOT_STARTED && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#6B7280' }]}
                  onPress={() => onUpdateGame(item.id, { status: GameStatus.NOT_STARTED })}
                >
                  <Text style={styles.actionButtonText}>Wishlist</Text>
                </TouchableOpacity>
              )}
              {item.status !== GameStatus.PLAYING && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                  onPress={() => onUpdateGame(item.id, { status: GameStatus.PLAYING })}
                >
                  <Text style={styles.actionButtonText}>Playing</Text>
                </TouchableOpacity>
              )}
              {item.status !== GameStatus.COMPLETED && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                  onPress={() => onUpdateGame(item.id, { status: GameStatus.COMPLETED })}
                >
                  <Text style={styles.actionButtonText}>Completed</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        <View style={styles.gameRow}>
          <ThemedText style={styles.gameLabel}>Added:</ThemedText>
          <ThemedText style={styles.gameValue}>
            {new Date(item.dateAdded).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );

  if (games.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>{emptyTitle}</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          {emptySubtitle}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={games}
      keyExtractor={(item) => item.id}
      renderItem={renderGameItem}
      style={styles.container}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Space for floating action button
  },
  gameItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  gameDetails: {
    gap: 8,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  gameValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  hltbContainer: {
    marginTop: 8,
  },
  hltbTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 20,
  },
  quickActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickActionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});