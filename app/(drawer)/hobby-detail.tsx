import { BookForm } from '@/components/book-form';
import { CustomForm } from '@/components/custom-form';
import { GameForm } from '@/components/game-form';
import { GameList } from '@/components/game-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Hobby, HobbyType } from '@/data/hobby';
import { useHobbyStorage } from '@/hooks/use-hobby-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HobbyDetailScreen() {
  const { hobbyId, hobbyName } = useLocalSearchParams<{ hobbyId: string; hobbyName: string }>();
  const { hobbies, deleteHobby, addItemToHobby, updateItemInHobby, deleteItemFromHobby } = useHobbyStorage();
  const [hobby, setHobby] = useState<Hobby | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (hobbyId) {
      const foundHobby = hobbies.find(h => h.id === hobbyId);
      setHobby(foundHobby || null);
    }
  }, [hobbyId, hobbies, refreshKey]);

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

  const handleAddItem = async (itemData: any) => {
    if (hobbyId) {
      try {
        await addItemToHobby(hobbyId, itemData);
        setShowAddItemModal(false);
        // Force refresh
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        Alert.alert('Error', 'Failed to add item to hobby');
      }
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowEditItemModal(true);
  };

  const handleUpdateItem = async (itemData: any) => {
    if (hobbyId && editingItem) {
      try {
        await updateItemInHobby(hobbyId, editingItem.id, itemData);
        setShowEditItemModal(false);
        setEditingItem(null);
        // Force refresh
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        Alert.alert('Error', 'Failed to update item');
      }
    }
  };

  const handleDeleteItem = (item: any) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.title || item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (hobbyId) {
              await deleteItemFromHobby(hobbyId, item.id);
              setRefreshKey(prev => prev + 1);
            }
          },
        },
      ]
    );
  };

  const getAddItemButtonText = () => {
    if (!hobby) return 'Add Item';
    switch (hobby.type) {
      case HobbyType.GAMES:
        return 'Add Game';
      case HobbyType.BOOKS:
        return 'Add Book';
      case HobbyType.TV_FILM:
        return 'Add TV/Film';
      case HobbyType.CUSTOM:
        return 'Add Item';
      default:
        return 'Add Item';
    }
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
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Games Collection
              </ThemedText>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setShowAddItemModal(true)}
              >
                <ThemedText style={styles.addButtonText}>+ Add Game</ThemedText>
              </TouchableOpacity>
            </View>
            {hobby.items.length > 0 ? (
              <GameList 
                games={hobby.items} 
                onDeleteGame={() => {}}
                onUpdateGame={() => {}}
                onEditGame={() => {}}
              />
            ) : (
              <ThemedText style={styles.emptyText}>
                No games added yet. Tap "Add Game" to get started!
              </ThemedText>
            )}
          </View>
        )}

        {hobby.type === HobbyType.BOOKS && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Books Collection
              </ThemedText>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setShowAddItemModal(true)}
              >
                <ThemedText style={styles.addButtonText}>+ Add Book</ThemedText>
              </TouchableOpacity>
            </View>
            {hobby.items.length > 0 ? (
              <View>
                {hobby.items.map((book: any) => (
                  <TouchableOpacity 
                    key={book.id} 
                    style={styles.itemCard} 
                    onPress={() => handleEditItem(book)}
                    onLongPress={() => handleDeleteItem(book)}
                  >
                    <View style={styles.itemContent}>
                      {book.thumbnail && (
                        <Image source={{ uri: book.thumbnail }} style={styles.itemThumbnail} />
                      )}
                      <View style={styles.itemInfo}>
                        <View style={styles.itemHeader}>
                          <ThemedText style={styles.itemTitle}>{book.title}</ThemedText>
                          <TouchableOpacity
                            onPress={() => handleDeleteItem(book)}
                            style={styles.deleteItemButton}
                          >
                            <ThemedText style={styles.deleteItemButtonText}>×</ThemedText>
                          </TouchableOpacity>
                        </View>
                        {book.author && <ThemedText style={styles.itemSubtitle}>by {book.author}</ThemedText>}
                        <ThemedText style={styles.itemStatus}>Status: {book.status}</ThemedText>
                        {book.totalPages && (
                          <ThemedText style={styles.itemProgress}>
                            Progress: {book.pagesRead || 0} / {book.totalPages} pages
                          </ThemedText>
                        )}
                        <ThemedText style={styles.editHint}>Tap to edit</ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>
                No books added yet. Tap "Add Book" to get started!
              </ThemedText>
            )}
          </View>
        )}

        {hobby.type === HobbyType.TV_FILM && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                TV/Film Collection
              </ThemedText>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setShowAddItemModal(true)}
              >
                <ThemedText style={styles.addButtonText}>+ Add Movie</ThemedText>
              </TouchableOpacity>
            </View>
            {hobby.items.length > 0 ? (
              <View>
                {hobby.items.map((movie: any) => (
                  <TouchableOpacity 
                    key={movie.id} 
                    style={styles.itemCard} 
                    onPress={() => handleEditItem(movie)}
                    onLongPress={() => handleDeleteItem(movie)}
                  >
                    <View style={styles.itemContent}>
                      {movie.thumbnail && (
                        <Image source={{ uri: movie.thumbnail }} style={styles.itemThumbnail} />
                      )}
                      <View style={styles.itemInfo}>
                        <View style={styles.itemHeader}>
                          <ThemedText style={styles.itemTitle}>{movie.title}</ThemedText>
                          <TouchableOpacity
                            onPress={() => handleDeleteItem(movie)}
                            style={styles.deleteItemButton}
                          >
                            <ThemedText style={styles.deleteItemButtonText}>×</ThemedText>
                          </TouchableOpacity>
                        </View>
                        {movie.director && <ThemedText style={styles.itemSubtitle}>Directed by {movie.director}</ThemedText>}
                        <ThemedText style={styles.itemStatus}>Status: {movie.status}</ThemedText>
                        {movie.rating && (
                          <ThemedText style={styles.itemRating}>
                            Rating: {'★'.repeat(movie.rating)}{'☆'.repeat(5 - movie.rating)}
                          </ThemedText>
                        )}
                        <ThemedText style={styles.editHint}>Tap to edit</ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>
                No TV shows or movies added yet. Tap "Add TV/Film" to get started!
              </ThemedText>
            )}
          </View>
        )}

        {hobby.type === HobbyType.CUSTOM && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Custom Items
              </ThemedText>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setShowAddItemModal(true)}
              >
                <ThemedText style={styles.addButtonText}>+ Add Item</ThemedText>
              </TouchableOpacity>
            </View>
            {hobby.items.length > 0 ? (
              <View>
                {hobby.items.map((item: any) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.itemCard} 
                    onPress={() => handleEditItem(item)}
                    onLongPress={() => handleDeleteItem(item)}
                  >
                    <View style={styles.itemContent}>
                      {item.thumbnail && (
                        <Image source={{ uri: item.thumbnail }} style={styles.itemThumbnail} />
                      )}
                      <View style={styles.itemInfo}>
                        <View style={styles.itemHeader}>
                          <ThemedText style={styles.itemTitle}>{item.name}</ThemedText>
                          <TouchableOpacity
                            onPress={() => handleDeleteItem(item)}
                            style={styles.deleteItemButton}
                          >
                            <ThemedText style={styles.deleteItemButtonText}>×</ThemedText>
                          </TouchableOpacity>
                        </View>
                        <ThemedText style={styles.itemDate}>
                          Added: {new Date(item.dateAdded).toLocaleDateString()}
                        </ThemedText>
                        <ThemedText style={styles.editHint}>Tap to edit</ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>
                No items added yet. Tap "Add Item" to get started!
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

  const renderAddItemModal = () => {
    if (!hobby || !showAddItemModal) return null;

    switch (hobby.type) {
      case HobbyType.GAMES:
        return (
          <GameForm
            visible={showAddItemModal}
            onClose={() => setShowAddItemModal(false)}
            onGameAdded={handleAddItem}
          />
        );
      case HobbyType.BOOKS:
        return (
          <BookForm
            visible={showAddItemModal}
            onClose={() => setShowAddItemModal(false)}
            onSubmit={handleAddItem}
            mode="add"
          />
        );
      case HobbyType.TV_FILM:
        return (
          <TvFilmForm
            visible={showAddItemModal}
            onClose={() => setShowAddItemModal(false)}
            onSubmit={handleAddItem}
            mode="add"
          />
        );
      case HobbyType.CUSTOM:
        return (
          <CustomForm
            visible={showAddItemModal}
            onClose={() => setShowAddItemModal(false)}
            onSubmit={handleAddItem}
            mode="add"
          />
        );
      default:
        return null;
    }
  };

  const renderEditItemModal = () => {
    if (!hobby || !showEditItemModal || !editingItem) return null;

    switch (hobby.type) {
      case HobbyType.GAMES:
        return (
          <GameForm
            visible={showEditItemModal}
            onClose={() => {
              setShowEditItemModal(false);
              setEditingItem(null);
            }}
            onGameAdded={handleUpdateItem}
            initialGame={editingItem}
          />
        );
      case HobbyType.BOOKS:
        return (
          <BookForm
            visible={showEditItemModal}
            onClose={() => {
              setShowEditItemModal(false);
              setEditingItem(null);
            }}
            onSubmit={handleUpdateItem}
            initialBook={editingItem}
            mode="edit"
          />
        );
      case HobbyType.TV_FILM:
        return (
          <TvFilmForm
            visible={showEditItemModal}
            onClose={() => {
              setShowEditItemModal(false);
              setEditingItem(null);
            }}
            onSubmit={handleUpdateItem}
            initialTvFilmItem={editingItem}
            mode="edit"
          />
        );
      case HobbyType.CUSTOM:
        return (
          <CustomForm
            visible={showEditItemModal}
            onClose={() => {
              setShowEditItemModal(false);
              setEditingItem(null);
            }}
            onSubmit={handleUpdateItem}
            initialItem={editingItem}
            mode="edit"
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHobbyContent()}
      </ScrollView>
      {renderAddItemModal()}
      {renderEditItemModal()}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemStatus: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemProgress: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  itemRating: {
    fontSize: 14,
    color: '#ffc107',
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemThumbnail: {
    width: 60,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    minHeight: 80,
    justifyContent: 'center',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deleteItemButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteItemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
});