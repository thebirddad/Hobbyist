import { useActivityTracking } from '@/hooks/use-activity-tracking';
import { useCompletionStats } from '@/hooks/use-completion-stats';
import { useInstallationDate } from '@/hooks/use-installation-date';
import { useTagStats } from '@/hooks/use-tag-stats';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomePage() {
  const { getMostRecentActivity, formatActivityMessage, loading: activityLoading } = useActivityTracking();
  const { stats } = useCompletionStats();
  const { formattedInstallationDate, loading: installationLoading } = useInstallationDate();
  const { getTopTags } = useTagStats();
  
  const recentActivity = getMostRecentActivity();
  const topTags = getTopTags(5);
  
  // State for collapsible sections
  const [isRecentActivityExpanded, setIsRecentActivityExpanded] = useState(true);
  const [isVibesExpanded, setIsVibesExpanded] = useState(true);
  const [isProgressExpanded, setIsProgressExpanded] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
              <View style={styles.drawerHeader}>
                <Image 
                  source={require('@/assets/images/icon.png')} 
                  style={styles.drawerIcon}
                  resizeMode="contain"
                />
              </View>
      
      {/* Hobbyist Since Section */}
      <View style={styles.installationSection}>
        <Text style={styles.hobbyistSinceText}>
          Hobbyist since: {!installationLoading && formattedInstallationDate ? formattedInstallationDate : 'Loading...'}
        </Text>
      </View>
      
      {/* Recent Activity Section */}
            {/* Recent Activity */}
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => setIsRecentActivityExpanded(!isRecentActivityExpanded)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.expandIcon}>
            {isRecentActivityExpanded ? '−' : '+'}
          </Text>
        </TouchableOpacity>
        {isRecentActivityExpanded && (
          <View style={styles.activityContainer}>
            {activityLoading ? (
              <Text style={styles.activityText}>Loading...</Text>
            ) : recentActivity ? (
              <Text style={styles.activityText}>
                {formatActivityMessage(recentActivity)}
              </Text>
            ) : (
              <Text style={styles.activityText}>No recent activity</Text>
            )}
          </View>
        )}
      </View>

      {/* Completion Stats Section */}
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => setIsProgressExpanded(!isProgressExpanded)}
          style={styles.sectionHeader}
        >
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <Text style={styles.expandIcon}>
            {isProgressExpanded ? '−' : '+'}
          </Text>
        </TouchableOpacity>
        
        {isProgressExpanded && (
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
        )}
      </View>

      {/* Vibes Section */}
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => setIsVibesExpanded(!isVibesExpanded)}
          style={styles.sectionHeader}
        >
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Vibes</Text>
            <Text style={styles.sectionSubtitle}>Here are your most popular tags</Text>
          </View>
          <Text style={styles.expandIcon}>
            {isVibesExpanded ? '−' : '+'}
          </Text>
        </TouchableOpacity>
        
        {isVibesExpanded && (
          <View style={styles.vibesContainer}>
            {topTags.length > 0 ? (
              topTags.map((tagStat, index) => (
                <View key={tagStat.tag} style={styles.vibeItem}>
                  <View style={styles.vibeRank}>
                    <Text style={styles.vibeRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.vibeContent}>
                    <Text style={styles.vibeTag}>
                     {tagStat.tag}
                    </Text>
                    <Text style={styles.vibeCount}>
                      {tagStat.count} item{tagStat.count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noVibesText}>
                No tags found yet. Add tags to your items to see your vibes!
              </Text>
            )}
          </View>
        )}
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
    drawerHeader: {
    padding: 5,
    paddingTop: 0,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  drawerIcon: {
    width: 70,
    height: 70,
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
    fontSize: 24,
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
  sectionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  vibesContainer: {
    gap: 6,
  },
  vibeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  vibeRank: {
    backgroundColor: '#4a90e2',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vibeRankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vibeContent: {
    flex: 1,
  },
  vibeTag: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  vibeCount: {
    fontSize: 14,
    color: '#666',
  },
  noVibesText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
    width: 30,
    textAlign: 'center',
  },
});
