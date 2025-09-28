import { GameList } from '@/components/game-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GameForm } from '@/components/game-form';
import { BookForm } from '@/components/book-form';
import { MovieForm } from '@/components/movie-form';
import { CustomForm } from '@/components/custom-form';
import { Hobby, HobbyType } from '@/data/hobby';
import { useHobbyStorage } from '@/hooks/use-hobby-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HobbyDetailScreen() {
  const { hobbyId, hobbyName } = useLocalSearchParams<{ hobbyId: string; hobbyName: string }>();
  const { hobbies, deleteHobby, addItemToHobby } = useHobbyStorage();
  const [hobby, setHobby] = useState<Hobby | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (hobbyId) {
      const foundHobby = hobbies.find(h => h.id === hobbyId);
      setHobby(foundHobby || null);
    }
  }, [hobbyId, hobbies]);

  const handleDeleteHobby = () => {
    Alert.alert(
      'Delete Hobby',
      `Are you sure you want to delete "${hobby?.name}"? This will remove all items in this hobby.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (hobbyId) {
              await deleteHobby(hobbyId);
              router.back();
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderHobbyContent = () => {
    if (!hobby) {
      return (
        <ThemedText>Hobby not found</ThemedText>
      );
    }

    return (
      <View style={styles.content}>
        <ThemedText type="title" style={styles.hobbyTitle}>
          {hobby.name}
        </ThemedText>
        
        <ThemedText style={styles.hobbyInfo}>
          Type: {hobby.type}
        </ThemedText>
        
        <ThemedText style={styles.hobbyInfo}>
          Started: {formatDate(hobby.dateStarted)}
        </ThemedText>

        <ThemedText style={styles.itemCount}>
          {hobby.items.length} items
        </ThemedText>

        {hobby.type === HobbyType.GAMES && (
          <View style={styles.gameSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Games Collection
            </ThemedText>
            {hobby.items.length > 0 ? (
              <GameList 
                games={hobby.items} 
                onDeleteGame={() => {}}
                onUpdateGame={() => {}}
                onEditGame={() => {}}
              />
            ) : (
              <ThemedText style={styles.emptyText}>
                No games added yet. Add your first game to get started!
              </ThemedText>
            )}
          </View>
        )}

        {hobby.type === HobbyType.BOOKS && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Books Collection
            </ThemedText>
            {hobby.items.length > 0 ? (
              <ThemedText>Book list component coming soon...</ThemedText>
            ) : (
              <ThemedText style={styles.emptyText}>
                No books added yet. Add your first book to get started!
              </ThemedText>
            )}
          </View>
        )}

        {hobby.type === HobbyType.MOVIES && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Movies Collection
            </ThemedText>
            {hobby.items.length > 0 ? (
              <ThemedText>Movie list component coming soon...</ThemedText>
            ) : (
              <ThemedText style={styles.emptyText}>
                No movies added yet. Add your first movie to get started!
              </ThemedText>
            )}
          </View>
        )}

        {hobby.type === HobbyType.CUSTOM && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Custom Items
            </ThemedText>
            {hobby.items.length > 0 ? (
              <ThemedText>Custom item list component coming soon...</ThemedText>
            ) : (
              <ThemedText style={styles.emptyText}>
                No items added yet. Add your first item to get started!
              </ThemedText>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteHobby}>
          <ThemedText style={styles.deleteButtonText}>
            Delete Hobby
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHobbyContent()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  hobbyTitle: {
    textAlign: 'center',
    marginBottom: 10,
  },
  hobbyInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
    textAlign: 'center',
  },
  itemCount: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#4a90e2',
  },
  section: {
    marginTop: 20,
  },
  gameSection: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});