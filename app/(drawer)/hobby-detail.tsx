import { BookForm } from '@/components/forms/book-form';
import { CustomForm } from '@/components/forms/custom-form';
import { GameForm } from '@/components/forms/game-form';
import { TvFilmForm } from '@/components/forms/tv-film-form';
import { TagFilterModal } from '@/components/tag-filter-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BookItem, CustomItem, Game, Hobby, HobbyType, TvFilmItem } from '@/data/hobby';
import { useHobbyStorage } from '@/hooks/use-hobby-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Keyboard, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function HobbyDetailScreen() {
  const { hobbyId } = useLocalSearchParams<{ hobbyId: string; hobbyName: string }>();
  const { hobbies, deleteHobby, updateHobby, addItemToHobby, updateItemInHobby, deleteItemFromHobby } = useHobbyStorage();
  const [hobby, setHobby] = useState<Hobby | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [showEditHobbyModal, setShowEditHobbyModal] = useState(false);
  const [editHobbyName, setEditHobbyName] = useState('');
  const [editHobbyDate, setEditHobbyDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Always start with valid current date
  const [searchText, setSearchText] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (hobbyId) {
      const foundHobby = hobbies.find(h => h.id === hobbyId);
      setHobby(foundHobby || null);
    }
  }, [hobbyId, hobbies, refreshKey]);

  // Get all unique tags from items
  const getAllTags = () => {
    if (!hobby) {
      console.log('🏷️ No hobby found for tags');
      return [];
    }
    const allTags = new Set<string>();
    hobby.items.forEach((item: any) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          if (tag && tag.trim()) {
            allTags.add(tag.trim());
          }
        });
      }
    });
    const tags = Array.from(allTags).sort();
    console.log('🏷️ Available tags:', tags);
    return tags;
  };

  // Filter items based on selected tags and search text
  const getFilteredItems = () => {
    if (!hobby) return [];

    return hobby.items.filter((item: any) => {
      // Apply tag filter
      if (selectedFilterTags.length > 0) {
        if (!item.tags) return false;
        if (!selectedFilterTags.every(filterTag => item.tags.includes(filterTag))) {
          return false;
        }
      }

      // Apply search filter
      if (searchText.trim()) {
        const searchLower = searchText.toLowerCase().trim();

        // Search in title/name
        if (item.title?.toLowerCase().includes(searchLower)) return true;
        if (item.name?.toLowerCase().includes(searchLower)) return true;

        // Search in author (books)
        if (item.author?.toLowerCase().includes(searchLower)) return true;

        // Search in director (TV/Film)
        if (item.director?.toLowerCase().includes(searchLower)) return true;

        // Search in platform (games)
        if (item.platform?.toLowerCase().includes(searchLower)) return true;

        // Custom items don't have a description field - their name is already checked above

        // Search in tags
        if (item.tags && Array.isArray(item.tags)) {
          if (item.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))) {
            return true;
          }
        }

        return false;
      }

      return true; // Show item if no filters applied
    });
  };

  // Get filtered items by type
  const getFilteredGameItems = () => {
    const filtered = getFilteredItems();
    return filtered.filter((item: any) => item.platform !== undefined) as Game[]; // Games have platform property
  };

  const getFilteredBookItems = () => {
    const filtered = getFilteredItems();
    return filtered.filter((item: any) => item.author !== undefined); // Books have author property
  };

  const getFilteredTvFilmItems = () => {
    const filtered = getFilteredItems();
    return filtered.filter((item: any) => item.title !== undefined); // TV/Films have director property
  };

  const getFilteredCustomItems = () => {
    const filtered = getFilteredItems();
    return filtered.filter((item: any) =>
      // Custom items have a 'name' field but not the type-specific fields that other items have
      item.name !== undefined &&
      item.platform === undefined &&
      item.author === undefined &&
      item.director === undefined &&
      item.title === undefined  // Custom items use 'name' not 'title'
    );
  };

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

  const handleEditHobby = () => {
    if (hobby) {
      setEditHobbyName(hobby.name);

      // Try to parse the existing date, fallback to current date if invalid
      let date = new Date(hobby.dateStarted);
      if (isNaN(date.getTime())) {
        // If the stored date is invalid, use current date as fallback
        date = new Date();
        console.log('Invalid date found, using current date as fallback');
      }

      setSelectedDate(date);
      setEditHobbyDate(date.toLocaleDateString());
      setShowEditHobbyModal(true);
    }
  };

  const handleSaveHobbyEdits = async () => {
    if (!hobby || !hobbyId) return;

    const trimmedName = editHobbyName.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Hobby name cannot be empty.');
      return;
    }

    try {
      await updateHobby(hobbyId, {
        name: trimmedName,
        dateStarted: selectedDate.toISOString().split('T')[0] // Save as YYYY-MM-DD format
      });

      setShowEditHobbyModal(false);
      setRefreshKey(prev => prev + 1);

      Alert.alert('Success', 'Hobby updated successfully!');
    } catch (error) {
      console.error('Error updating hobby:', error);
      Alert.alert('Error', 'Failed to update hobby. Please try again.');
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date && event.type !== 'dismissed') {
      setSelectedDate(date);
      setEditHobbyDate(date.toLocaleDateString());
    }
  };

  const showDatePickerModal = () => {
    Keyboard.dismiss(); // Dismiss keyboard before showing date picker
    setShowDatePicker(true);
  };

  const handleTagFilter = () => {
    console.log('🏷️ Manual test - opening tag filter');
    setShowTagFilter(true);
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

  const handleToggleCollapse = async (itemId: string) => {
    if (!hobbyId || !hobby) return;
    try {
      if (hobby.type === HobbyType.GAMES) {
        const gameToUpdate = hobby.items.find((item: Game) => item.id === itemId) as Game;
        if (!gameToUpdate) return;
        await updateItemInHobby(hobbyId, itemId, {
          ...gameToUpdate,
          collapsed: !gameToUpdate.collapsed
        });
      } else if (hobby.type === HobbyType.BOOKS) {
        const bookToUpdate = hobby.items.find((item: BookItem) => item.id === itemId) as BookItem;
        if (!bookToUpdate) return;
        await updateItemInHobby(hobbyId, itemId, {
          ...bookToUpdate,
          collapsed: !bookToUpdate.collapsed
        });
      } else if (hobby.type === HobbyType.TV_FILM) {
        const tvFilmToUpdate = hobby.items.find((item: TvFilmItem) => item.id === itemId) as TvFilmItem;
        if (!tvFilmToUpdate) return;
        await updateItemInHobby(hobbyId, itemId, {
          ...tvFilmToUpdate,
          collapsed: !tvFilmToUpdate.collapsed
        });
      } else if (hobby.type === HobbyType.CUSTOM) {
        const customToUpdate = hobby.items.find((item: CustomItem) => item.id === itemId) as CustomItem;
        if (!customToUpdate) return;
        await updateItemInHobby(hobbyId, itemId, {
          ...customToUpdate,
          collapsed: !customToUpdate.collapsed
        });
      }
      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error('Error toggling collapse state:', error);
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', {
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
        <View style={styles.hobbyTitleContainer}>
          <ThemedText type="title" style={styles.hobbyTitle}>
            {hobby.name}
          </ThemedText>
          <View style={styles.hobbyActions}>
            <TouchableOpacity onPress={handleTagFilter} style={styles.editHobbyButton}>
              <IconSymbol name="tag" size={18} color="#00AA00" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEditHobby} style={styles.editHobbyButton}>
              <IconSymbol name="pencil" size={18} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteHobby} style={styles.deleteHobbyButton}>
              <IconSymbol name="trash" size={18} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>

        <ThemedText style={styles.hobbyInfo}>
          Hobby Started: {formatDate(hobby.dateStarted)}
        </ThemedText>

        <ThemedText style={styles.itemCount}>
          {hobby.items.length} items {getFilteredItems().length !== hobby.items.length && `(${getFilteredItems().length} shown)`}
        </ThemedText>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items by title, author, platform, tags..."
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearchButton}>
              <IconSymbol name="xmark.circle.fill" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {hobby.type === HobbyType.GAMES && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  {hobby.name} Collection
                </ThemedText>
                {selectedFilterTags.length > 0 && (
                  <ThemedText style={styles.filterIndicator}>
                    Filtered by: {selectedFilterTags.join(', ')}
                  </ThemedText>
                )}
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={[styles.filterButton, selectedFilterTags.length > 0 && styles.filterButtonActive]}
                  onPress={() => setShowTagFilter(true)}
                >
                  <ThemedText style={[styles.filterButtonText, selectedFilterTags.length > 0 && styles.filterButtonTextActive]}>
                    🏷️ Filter{selectedFilterTags.length > 0 && ` (${selectedFilterTags.length})`}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddItemModal(true)}
                >
                  <ThemedText style={styles.addButtonText}>+ Add {hobby.name}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            {getFilteredGameItems().length > 0 ? (
              <View>
                {[...getFilteredGameItems()].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).map((game: any) => (
                  <TouchableOpacity
                    key={game.id}
                    style={styles.itemCard}
                    onLongPress={() => handleEditItem(game)}
                    onPress={() => handleToggleCollapse(game.id)}
                  >
                    <ThemedText style={styles.expandIcon}>{game.collapsed ? '−' : '+'}
                    </ThemedText>
                    <ThemedText style={styles.itemTitle}>{game.title}</ThemedText>

                    {game.collapsed && (
                      <View style={styles.itemContent}>
                        {game.thumbnail && (
                          <Image source={{ uri: game.thumbnail }} style={styles.itemThumbnail} />
                        )}
                        <View style={styles.itemInfo}>
                          <View style={styles.gameRow}>
                            <ThemedText style={styles.gameLabel}>Platform:</ThemedText>
                            <ThemedText style={styles.gameValue}>{game.platform}</ThemedText>
                          </View>
                          <ThemedText style={styles.itemStatus}>Status: {game.status}</ThemedText>

                          {game.totalPages && (
                            <ThemedText style={styles.itemProgress}>
                              Progress: {game.pagesRead || 0} / {game.totalPages} pages
                            </ThemedText>
                          )}

                          {game.timeToBeat && (
                            <View style={styles.gameRow}>
                              <ThemedText style={styles.gameLabel}>Time to Beat:</ThemedText>
                              <ThemedText style={styles.gameValue}>{game.timeToBeat}h</ThemedText>
                            </View>
                          )}
                          {game.hoursPlayed && (
                            <View style={styles.gameRow}>
                              <ThemedText style={styles.gameLabel}>Hours Played:</ThemedText>
                              <ThemedText style={styles.gameValue}>{game.hoursPlayed}h</ThemedText>
                            </View>
                          )}
                          {game.tags && game.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                              {game.tags.map((tag: string, index: number) => (
                                <View key={index} style={styles.tag}>
                                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                                </View>
                              ))}
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => handleDeleteItem(game)}
                          >
                            <ThemedText style={styles.deleteItemButtonText}>Click to Delete</ThemedText>
                          </TouchableOpacity>
                          <ThemedText style={styles.editHint}>Hold to edit game</ThemedText>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>
                {(selectedFilterTags.length > 0 || searchText.trim())
                  ? "No books match your search or filters. Try adjusting your criteria."
                  : "No books added yet. Tap 'Add Book' to get started!"}
              </ThemedText>
            )}
          </View>
        )}

        {hobby.type === HobbyType.BOOKS && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Books Collection
                </ThemedText>
                {selectedFilterTags.length > 0 && (
                  <ThemedText style={styles.filterIndicator}>
                    Filtered by: {selectedFilterTags.join(', ')}
                  </ThemedText>
                )}
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={[styles.filterButton, selectedFilterTags.length > 0 && styles.filterButtonActive]}
                  onPress={() => setShowTagFilter(true)}
                >
                  <ThemedText style={[styles.filterButtonText, selectedFilterTags.length > 0 && styles.filterButtonTextActive]}>
                    🏷️ Filter{selectedFilterTags.length > 0 && ` (${selectedFilterTags.length})`}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddItemModal(true)}
                >
                  <ThemedText style={styles.addButtonText}>+ Add Book</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            {getFilteredBookItems().length > 0 ? (
              <View>
                {[...getFilteredBookItems()].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).map((book: any) => (
                  <TouchableOpacity
                    key={book.id}
                    style={styles.itemCard}
                    onLongPress={() => handleEditItem(book)}
                    onPress={() => handleToggleCollapse(book.id)}
                  >
                    <ThemedText style={styles.expandIcon}>{book.collapsed ? '−' : '+'}
                    </ThemedText>
                    <ThemedText style={styles.itemTitle}>{book.title}</ThemedText>

                    {book.collapsed && (
                      <View style={styles.itemContent}>
                        {book.thumbnail && (
                          <Image source={{ uri: book.thumbnail }} style={styles.itemThumbnail} />
                        )}
                        <View style={styles.itemInfo}>
                          {book.author && <ThemedText style={styles.itemSubtitle}>by {book.author}</ThemedText>}
                          <ThemedText style={styles.itemStatus}>Status: {book.status}</ThemedText>
                          {book.totalPages && (
                            <ThemedText style={styles.itemProgress}>
                              Progress: {book.pagesRead || 0} / {book.totalPages} pages
                            </ThemedText>
                          )}
                          {book.tags && book.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                              {book.tags.map((tag: string, index: number) => (
                                <View key={index} style={styles.tag}>
                                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                                </View>
                              ))}
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => handleDeleteItem(book)}
                          >
                            <ThemedText style={styles.deleteItemButtonText}>Click to Delete</ThemedText>
                          </TouchableOpacity>
                          <ThemedText style={styles.editHint}>Hold to edit book</ThemedText>
                        </View>

                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>
                {(selectedFilterTags.length > 0 || searchText.trim())
                  ? "No books match your search or filters. Try adjusting your criteria."
                  : "No books added yet. Tap 'Add Book' to get started!"}
              </ThemedText>
            )}
          </View>
        )}

        {hobby.type === HobbyType.TV_FILM && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  TV/Film Collection
                </ThemedText>
                {selectedFilterTags.length > 0 && (
                  <ThemedText style={styles.filterIndicator}>
                    Filtered by: {selectedFilterTags.join(', ')}
                  </ThemedText>
                )}
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={[styles.filterButton, selectedFilterTags.length > 0 && styles.filterButtonActive]}
                  onPress={() => setShowTagFilter(true)}
                >
                  <ThemedText style={[styles.filterButtonText, selectedFilterTags.length > 0 && styles.filterButtonTextActive]}>
                    🏷️ Filter{selectedFilterTags.length > 0 && ` (${selectedFilterTags.length})`}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddItemModal(true)}
                >
                  <ThemedText style={styles.addButtonText}>+ Add TV/Film</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            {getFilteredTvFilmItems().length > 0 ? (
              <View>
                {[...getFilteredTvFilmItems()].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).map((movie: any) => (
                  <TouchableOpacity
                    key={movie.id}
                    style={styles.itemCard}
                    onLongPress={() => handleEditItem(movie)}
                    onPress={() => handleToggleCollapse(movie.id)}
                  >
                    <ThemedText style={styles.expandIcon}>{movie.collapsed ? '−' : '+'}
                    </ThemedText>
                    <ThemedText style={styles.itemTitle}>{movie.title}</ThemedText>
                    {movie.collapsed && (
                      <View style={styles.itemContent}>
                        {movie.thumbnail && (
                          <Image source={{ uri: movie.thumbnail }} style={styles.itemThumbnail} />
                        )}
                        <View style={styles.itemInfo}>
                          {movie.director && <ThemedText style={styles.itemSubtitle}>Directed by {movie.director}</ThemedText>}
                          {movie.currentSeason && <ThemedText style={styles.itemSubtitle}>Season: {movie.currentSeason}</ThemedText>}
                          <ThemedText style={styles.itemStatus}>Status: {movie.status}</ThemedText>
                          {movie.rating && (
                            <ThemedText style={styles.itemRating}>
                              Rating: {'★'.repeat(movie.rating)}{'☆'.repeat(5 - movie.rating)}
                            </ThemedText>
                          )}
                          {movie.tags && movie.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                              {movie.tags.map((tag: string, index: number) => (
                                <View key={index} style={styles.tag}>
                                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                                </View>
                              ))}
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => handleDeleteItem(movie)}
                          >
                            <ThemedText style={styles.deleteItemButtonText}>Click to Delete</ThemedText>
                          </TouchableOpacity>
                          <ThemedText style={styles.editHint}>Hold to edit</ThemedText>
                        </View>
                        
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>
                {(selectedFilterTags.length > 0 || searchText.trim())
                  ? "No TV shows or movies match your search or filters. Try adjusting your criteria."
                  : "No TV shows or movies added yet. Tap 'Add TV/Film' to get started!"}
              </ThemedText>
            )}
          </View>
        )}

        {hobby.type === HobbyType.CUSTOM && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Custom Items
                </ThemedText>
                {selectedFilterTags.length > 0 && (
                  <ThemedText style={styles.filterIndicator}>
                    Filtered by: {selectedFilterTags.join(', ')}
                  </ThemedText>
                )}
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={[styles.filterButton, selectedFilterTags.length > 0 && styles.filterButtonActive]}
                  onPress={() => setShowTagFilter(true)}
                >
                  <ThemedText style={[styles.filterButtonText, selectedFilterTags.length > 0 && styles.filterButtonTextActive]}>
                    🏷️ Filter{selectedFilterTags.length > 0 && ` (${selectedFilterTags.length})`}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddItemModal(true)}
                >
                  <ThemedText style={styles.addButtonText}>+ Add Item</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            {getFilteredCustomItems().length > 0 ? (
              <View>
                {[...getFilteredCustomItems()].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemCard}
                    onLongPress={() => handleEditItem(item)}
                    onPress={() => handleToggleCollapse(item.id)}
                  >
                    <ThemedText style={styles.expandIcon}>{item.collapsed ? '−' : '+'}
                    </ThemedText>
                    <ThemedText style={styles.itemTitle}>{item.name}</ThemedText>

                    {item.collapsed && (
                      <View style={styles.itemContent}>
                        {item.thumbnail && (
                          <Image source={{ uri: item.thumbnail }} style={styles.itemThumbnail} />
                        )}
                        <View style={styles.itemInfo}>
                          <ThemedText style={styles.itemDate}>
                            Added: {new Date(item.dateAdded).toLocaleDateString()}
                          </ThemedText>
                          {item.tags && item.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                              {item.tags.map((tag: string, index: number) => (
                                <View key={index} style={styles.tag}>
                                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                                </View>
                              ))}
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => handleDeleteItem(item)}
                          >
                            <ThemedText style={styles.deleteItemButtonText}>Click to Delete</ThemedText>
                          </TouchableOpacity>
                          <ThemedText style={styles.editHint}>Hold to edit</ThemedText>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>

                ))}
              </View>
            ) : (
              <ThemedText style={styles.emptyText}>
                {(selectedFilterTags.length > 0 || searchText.trim())
                  ? "No items match your search or filters. Try adjusting your criteria."
                  : "No items added yet. Tap 'Add Item' to get started!"}
              </ThemedText>
            )}
          </View>
        )}


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
            onGameUpdated={handleUpdateItem}
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

      {/* Edit Hobby Modal */}
      <Modal
        visible={showEditHobbyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditHobbyModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
          setShowEditHobbyModal(false);
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.editHobbyModal}>
                <ThemedText style={styles.editHobbyTitle}>Edit Hobby</ThemedText>

                <ThemedText style={styles.editHobbyLabel}>Hobby Name</ThemedText>
                <TextInput
                  style={styles.editHobbyInput}
                  value={editHobbyName}
                  onChangeText={setEditHobbyName}
                  placeholder="Enter hobby name"
                  autoFocus={true}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />

                <ThemedText style={styles.editHobbyLabel}>Date Started</ThemedText>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={showDatePickerModal}
                >
                  <ThemedText style={styles.datePickerText}>
                    {editHobbyDate || 'Select Date'}
                  </ThemedText>
                  <IconSymbol name="calendar" size={16} color="#007AFF" />
                </TouchableOpacity>

                {showDatePicker && (
                  <>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                    />
                    {Platform.OS === 'ios' && (
                      <View style={styles.datePickerActions}>
                        <TouchableOpacity
                          style={styles.datePickerDoneButton}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <ThemedText style={styles.datePickerDoneText}>Done</ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}

                <View style={styles.editHobbyButtonContainer}>
                  <TouchableOpacity
                    style={styles.editHobbyCancelButton}
                    onPress={() => setShowEditHobbyModal(false)}
                  >
                    <ThemedText style={[styles.editHobbyButtonText, styles.editHobbyCancelText]}>
                      Cancel
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editHobbySaveButton}
                    onPress={handleSaveHobbyEdits}
                  >
                    <ThemedText style={[styles.editHobbyButtonText, styles.editHobbySaveText]}>
                      Save
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Tag Filter Modal */}
      <TagFilterModal
        visible={showTagFilter}
        onClose={() => {
          console.log('🏷️ TagFilterModal closing');
          setShowTagFilter(false);
        }}
        availableTags={getAllTags()}
        selectedTags={selectedFilterTags}
        onTagsChange={(tags) => {
          console.log('🏷️ Filter tags changed:', tags);
          setSelectedFilterTags(tags);
        }}
        title={`Filter ${hobby?.type || 'Items'} by Tags`}
      />
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
  hobbyTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  hobbyTitle: {
    textAlign: 'center',
    marginRight: 10,
  },
  deleteHobbyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    marginBottom: 10,
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
  deleteItemButtonText: {
    color: '#551414ff',
    fontSize: 16,
    paddingTop: 30,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    fontWeight: '600',
  },
  editHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 4,
    gap: 6,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  tagText: {
    fontSize: 11,
    color: '#12181fff',
    fontWeight: '500',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filterIndicator: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  hobbyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editHobbyButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editHobbyModal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    minWidth: 300,
    maxWidth: 400,
    width: '90%',
  },
  editHobbyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  editHobbyLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  editHobbyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 15,
  },
  datePickerDoneButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  datePickerDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  editHobbyButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editHobbyCancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  editHobbySaveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  editHobbyButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  editHobbyCancelText: {
    color: '#333',
  },
  editHobbySaveText: {
    color: '#fff',
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
    width: 30,
  },
});