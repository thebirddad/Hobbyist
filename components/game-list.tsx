import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Game, GameStatus } from '../data/game';

interface GameListProps {
  games: Game[];
  onDeleteGame: (id: string) => void;
  onUpdateGame?: (id: string, updates: Partial<Game>) => void;
  onEditGame?: (game: Game) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const GameList: React.FC<GameListProps> = ({
  games,
  onDeleteGame,
  onUpdateGame,
  onEditGame,
  emptyTitle = "No games added yet",
  emptySubtitle = "Tap the \"+\" button to add your first game!"
}) => {
  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case GameStatus.WANT_TO_PLAY:
        return '#6B7280';
      case GameStatus.PLAYING:
        return '#10B981';
      case GameStatus.COMPLETED:
        return '#3B82F6';
      case GameStatus.DROPPED:
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: GameStatus) => {
    switch (status) {
      case GameStatus.WANT_TO_PLAY:
        return 'Want to Play';
      case GameStatus.PLAYING:
        return 'Currently Playing';
      case GameStatus.COMPLETED:
        return 'Completed';
      case GameStatus.DROPPED:
        return 'Dropped';
      default:
        return status;
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

  const handleTilePress = (game: Game) => {
    if (onEditGame) {
      onEditGame(game);
    }
  };

  const renderGameItem = ({ item }: { item: Game }) => {
    console.log(`🖼️ Rendering game "${item.title}" with thumbnail:`, item.thumbnail);
    
    return (
      <TouchableOpacity 
        style={styles.gameItem} 
        onPress={() => handleTilePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.gameItemContent}>
          {item.thumbnail && (
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </View>
          )}
          
          <View style={styles.gameInfoContainer}>
            <View style={styles.gameHeader}>
              <Text style={styles.gameTitle}>{item.title}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteGame(item)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
        
            <View style={styles.gameDetails}>
              <View style={styles.gameRow}>
                <Text style={styles.gameLabel}>Platform:</Text>
                <Text style={styles.gameValue}>{item.platform}</Text>
              </View>
              
              <View style={styles.gameRow}>
                <Text style={styles.gameLabel}>Status:</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                </View>
              </View>
              
              {item.timeToBeat && (
                <View style={styles.gameRow}>
                  <Text style={styles.gameLabel}>Time to Beat:</Text>
                  <Text style={styles.gameValue}>{item.timeToBeat}h</Text>
                </View>
              )}
              
              {item.hoursPlayed && (
                <View style={styles.gameRow}>
                  <Text style={styles.gameLabel}>Hours Played:</Text>
                  <Text style={styles.gameValue}>{item.hoursPlayed}h</Text>
                </View>
              )}

              {onUpdateGame && (
                <View style={styles.quickActions}>
                  <Text style={styles.quickActionsLabel}>Quick Actions:</Text>
                  <View style={styles.actionButtons}>
                    {item.status !== GameStatus.WANT_TO_PLAY && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#6B7280' }]}
                        onPress={() => onUpdateGame(item.id, { status: GameStatus.WANT_TO_PLAY })}
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
                        onPress={() => onUpdateGame(item.id, { 
                          status: GameStatus.COMPLETED,
                          dateCompleted: new Date().toISOString()
                        })}
                      >
                        <Text style={styles.actionButtonText}>Completed</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
              
              <View style={styles.gameRow}>
                <Text style={styles.gameLabel}>Added:</Text>
                <Text style={styles.gameValue}>
                  {new Date(item.dateAdded).toLocaleDateString()}
                </Text>
              </View>

              {item.dateCompleted && (
                <View style={styles.gameRow}>
                  <Text style={styles.gameLabel}>Completed:</Text>
                  <Text style={styles.gameValue}>
                    {new Date(item.dateCompleted).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {onEditGame && (
              <View style={styles.editHint}>
                <Text style={styles.editHintText}>Tap to edit</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (games.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyTitle}</Text>
        <Text style={styles.emptySubtext}>
          {emptySubtitle}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {games.map((item) => (
          <View key={item.id}>
            {renderGameItem({ item })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  gameItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  gameItemContent: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailContainer: {
    width: 60,
    height: 80,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  gameInfoContainer: {
    flex: 1,
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
    color: '#333',
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
    color: '#333',
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
  editHint: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  editHintText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
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
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});