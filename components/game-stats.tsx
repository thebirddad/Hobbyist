import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Game, GameStatus } from '../data/hobby';

interface GameStatsProps {
  games: Game[];
}

interface ConsoleStats {
  platform: string;
  totalGames: number;
  completedGames: number;
  totalHours: number;
}

export const GameStats: React.FC<GameStatsProps> = ({ games }) => {
  // Calculate stats by platform
  const statsByPlatform = games.reduce((acc, game) => {
    const platform = game.platform;
    
    if (!acc[platform]) {
      acc[platform] = {
        platform,
        totalGames: 0,
        completedGames: 0,
        totalHours: 0,
      };
    }
    
    acc[platform].totalGames += 1;
    
    if (game.status === GameStatus.COMPLETED) {
      acc[platform].completedGames += 1;
    }
    
    if (game.hoursPlayed) {
      acc[platform].totalHours += game.hoursPlayed;
    }
    
    return acc;
  }, {} as Record<string, ConsoleStats>);

  // Convert to array and sort by total games descending
  const platformStats = Object.values(statsByPlatform)
    .sort((a, b) => b.totalGames - a.totalGames);

  // Calculate overall totals
  const totalGames = games.length;
  const totalCompletedGames = games.filter(game => game.status === GameStatus.COMPLETED).length;
  const totalHoursSpent = games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0);

  // Filter platforms that have completed games for the completed games section
  const platformsWithCompletedGames = platformStats.filter(stat => stat.completedGames > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Gaming Stats</Text>
      
      <View style={styles.statsGrid}>
        {/* Overall Stats */}
        <View style={styles.overallStats}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalGames}</Text>
            <Text style={styles.statLabel}>Total Games</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalHoursSpent.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Hours Played</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCompletedGames}</Text>
            <Text style={styles.statLabel}>Games Completed</Text>
          </View>
        </View>

        {/* Games per Console */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 Games per Console</Text>
          <View style={styles.platformList}>
            {platformStats.map(stat => (
              <View key={stat.platform} style={styles.platformRow}>
                <Text style={styles.platformName}>{stat.platform}</Text>
                <Text style={styles.platformCount}>{stat.totalGames} game{stat.totalGames !== 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Completed Games per Console */}
        {platformsWithCompletedGames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Completed Games by Console</Text>
            <View style={styles.platformList}>
              {platformsWithCompletedGames.map(stat => (
                <View key={stat.platform} style={styles.platformRow}>
                  <Text style={styles.platformName}>{stat.platform}</Text>
                  <Text style={styles.completedCount}>{stat.completedGames} completed</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    gap: 16,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  platformList: {
    gap: 8,
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  platformName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  platformCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  completedCount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});