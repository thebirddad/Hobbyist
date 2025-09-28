import { useActivityTracking } from '@/hooks/use-activity-tracking';
import { useCompletionStats } from '@/hooks/use-completion-stats';
import { useInstallationDate } from '@/hooks/use-installation-date';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomePage() {
  const { getMostRecentActivity, formatActivityMessage, loading: activityLoading } = useActivityTracking();
  const { stats } = useCompletionStats();
  const { formattedInstallationDate, loading: installationLoading } = useInstallationDate();
  
  const recentActivity = getMostRecentActivity();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.welcomeText}>Welcome to Hobbyist</Text>
      
      {/* Hobbyist Since Section */}
      <View style={styles.installationSection}>
        <Text style={styles.hobbyistSinceText}>
          Hobbyist since: {!installationLoading && formattedInstallationDate ? formattedInstallationDate : 'Loading...'}
        </Text>
      </View>
      
      {/* Recent Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          {!activityLoading && recentActivity ? (
            <Text style={styles.activityText}>
              {formatActivityMessage(recentActivity)}
            </Text>
          ) : (
            <Text style={styles.noActivityText}>
              No recent activity. Start adding items to your hobbies!
            </Text>
          )}
        </View>
      </View>

      {/* Completion Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.gamesCompleted}</Text>
            <Text style={styles.statLabel}>Games Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.booksRead}</Text>
            <Text style={styles.statLabel}>Books Read</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.moviesWatched}</Text>
            <Text style={styles.statLabel}>TV/Film Watched</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.gamesInProgress}</Text>
            <Text style={styles.statLabel}>Games In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.booksInProgress}</Text>
            <Text style={styles.statLabel}>Books In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.showsInProgress}</Text>
            <Text style={styles.statLabel}>Shows In Progress</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalHobbies}</Text>
            <Text style={styles.statLabel}>Total Hobbies</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  activityContainer: {
    minHeight: 50,
    justifyContent: 'center',
  },
  activityText: {
    fontSize: 16,
    color: '#4a90e2',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  noActivityText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  installationSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  hobbyistSinceText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});
