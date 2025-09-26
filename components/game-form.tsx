import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GameStatus, Genre, GENRES, Platform, PLATFORMS } from '@/data/game';
import { useThemeColor } from '@/hooks/use-theme-color';
import { HowLongToBeatEntry, HowLongToBeatService } from '@/services/hltb-service';
import React, { useState } from 'react';
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Modal,
    Platform as RNPlatform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface GameFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (game: {
    title: string;
    platform: Platform;
    genre: Genre;
    status: GameStatus;
    rating?: number;
    hoursPlayed?: number;
    notes?: string;
    hltbData?: {
      gameplayMain?: number;
      gameplayMainExtra?: number;
      gameplayCompletionist?: number;
      imageUrl?: string;
    };
  }) => void;
  initialStatus?: GameStatus;
}

export const GameForm: React.FC<GameFormProps> = ({ visible, onClose, onSubmit, initialStatus }) => {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<Platform>('PC');
  const [genre, setGenre] = useState<Genre>('Action');
  const [status, setStatus] = useState<GameStatus>(initialStatus || GameStatus.NOT_STARTED);
  const [rating, setRating] = useState('');
  const [hoursPlayed, setHoursPlayed] = useState('');
  const [notes, setNotes] = useState('');
  
  // HowLongToBeat related state
  const [hltbResults, setHltbResults] = useState<HowLongToBeatEntry[]>([]);
  const [selectedHltbEntry, setSelectedHltbEntry] = useState<HowLongToBeatEntry | null>(null);
  const [isSearchingHltb, setIsSearchingHltb] = useState(false);
  const [showHltbResults, setShowHltbResults] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  
  const hltbService = new HowLongToBeatService();

  const resetForm = () => {
    setTitle('');
    setPlatform('PC');
    setGenre('Action');
    setStatus(initialStatus || GameStatus.NOT_STARTED);
    setRating('');
    setHoursPlayed('');
    setNotes('');
    setHltbResults([]);
    setSelectedHltbEntry(null);
    setShowHltbResults(false);
  };

  // Search HowLongToBeat when title changes
  const searchHowLongToBeat = async (searchTitle: string) => {
    if (!searchTitle.trim()) {
      setHltbResults([]);
      setSelectedHltbEntry(null);
      return;
    }

    setIsSearchingHltb(true);
    try {
      const results = await hltbService.search(searchTitle.trim());
      setHltbResults(results.slice(0, 5)); // Limit to top 5 results
      setShowHltbResults(results.length > 0);
    } catch (error) {
      console.error('Failed to search HowLongToBeat:', error);
      setHltbResults([]);
    } finally {
      setIsSearchingHltb(false);
    }
  };

  const selectHltbEntry = (entry: HowLongToBeatEntry) => {
    setSelectedHltbEntry(entry);
    setShowHltbResults(false);
    // Auto-fill title if it's different
    if (entry.name && entry.name !== title) {
      setTitle(entry.name);
    }
  };

  // Picker helper functions
  const showPlatformPicker = () => {
    if (RNPlatform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...PLATFORMS],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setPlatform(PLATFORMS[buttonIndex - 1]);
          }
        }
      );
    } else {
      Alert.alert(
        'Select Platform',
        '',
        [
          ...PLATFORMS.map((p) => ({
            text: p,
            onPress: () => setPlatform(p),
          })),
          { text: 'Cancel', style: 'cancel' as const }
        ]
      );
    }
  };

  const showGenrePicker = () => {
    if (RNPlatform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...GENRES],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setGenre(GENRES[buttonIndex - 1]);
          }
        }
      );
    } else {
      Alert.alert(
        'Select Genre',
        '',
        [
          ...GENRES.map((g) => ({
            text: g,
            onPress: () => setGenre(g),
          })),
          { text: 'Cancel', style: 'cancel' as const }
        ]
      );
    }
  };

  const showStatusPicker = () => {
    const statusOptions = Object.values(GameStatus);
    if (RNPlatform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...statusOptions],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setStatus(statusOptions[buttonIndex - 1]);
          }
        }
      );
    } else {
      Alert.alert(
        'Select Status',
        '',
        [
          ...statusOptions.map((s) => ({
            text: s,
            onPress: () => setStatus(s),
          })),
          { text: 'Cancel', style: 'cancel' as const }
        ]
      );
    }
  };

  // Debounced search
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Clear previous results
    setHltbResults([]);
    setSelectedHltbEntry(null);
    setShowHltbResults(false);
    
    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchHowLongToBeat(newTitle);
    }, 1000);
    
    // Store timeout ID for cleanup (in a real app, you'd use useRef)
    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a game title');
      return;
    }

    const ratingNum = rating ? parseInt(rating) : undefined;
    const hoursNum = hoursPlayed ? parseFloat(hoursPlayed) : undefined;

    if (rating && (isNaN(ratingNum!) || ratingNum! < 1 || ratingNum! > 10)) {
      Alert.alert('Error', 'Rating must be between 1 and 10');
      return;
    }

    if (hoursPlayed && isNaN(hoursNum!)) {
      Alert.alert('Error', 'Hours played must be a valid number');
      return;
    }

    // Prepare HLTB data if available
    const hltbData = selectedHltbEntry ? {
      gameplayMain: selectedHltbEntry.gameplayMain,
      gameplayMainExtra: selectedHltbEntry.gameplayMainExtra,
      gameplayCompletionist: selectedHltbEntry.gameplayCompletionist,
      imageUrl: selectedHltbEntry.imageUrl,
    } : undefined;

    onSubmit({
      title: title.trim(),
      platform,
      genre,
      status,
      rating: ratingNum,
      hoursPlayed: hoursNum,
      notes: notes.trim() || undefined,
      hltbData,
    });

    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title">Add New Game</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: tintColor }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Title *</ThemedText>
            <View style={styles.titleInputContainer}>
              <TextInput
                style={[styles.textInput, { backgroundColor: backgroundColor, color: textColor, borderColor: tintColor }]}
                value={title}
                onChangeText={handleTitleChange}
                placeholder="Enter game title"
                placeholderTextColor={textColor + '80'}
              />
              {isSearchingHltb && (
                <ActivityIndicator 
                  style={styles.searchIndicator} 
                  size="small" 
                  color={tintColor} 
                />
              )}
            </View>
            
            {/* HowLongToBeat Search Results */}
            {showHltbResults && hltbResults.length > 0 && (
              <View style={[styles.hltbResults, { backgroundColor: backgroundColor, borderColor: tintColor }]}>
                <ThemedText style={styles.hltbResultsTitle}>Search Results:</ThemedText>
                {hltbResults.map((entry) => (
                  <TouchableOpacity
                    key={entry.id}
                    style={[styles.hltbResultItem, { borderBottomColor: tintColor + '20' }]}
                    onPress={() => selectHltbEntry(entry)}
                  >
                    <View>
                      <ThemedText style={styles.hltbResultName}>{entry.name}</ThemedText>
                      <Text style={[styles.hltbResultTime, { color: textColor + '80' }]}>
                        Main: {entry.gameplayMain || 'N/A'}h • 
                        Complete: {entry.gameplayCompletionist || 'N/A'}h
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Selected HLTB Entry Display */}
            {selectedHltbEntry && (
              <View style={[styles.selectedHltbEntry, { backgroundColor: tintColor + '10', borderColor: tintColor }]}>
                <ThemedText style={styles.selectedHltbTitle}>Selected: {selectedHltbEntry.name}</ThemedText>
                <View style={styles.hltbTimes}>
                  {selectedHltbEntry.gameplayMain && (
                    <Text style={[styles.hltbTime, { color: textColor }]}>
                      Main Story: {selectedHltbEntry.gameplayMain}h
                    </Text>
                  )}
                  {selectedHltbEntry.gameplayMainExtra && (
                    <Text style={[styles.hltbTime, { color: textColor }]}>
                      Main + Extras: {selectedHltbEntry.gameplayMainExtra}h
                    </Text>
                  )}
                  {selectedHltbEntry.gameplayCompletionist && (
                    <Text style={[styles.hltbTime, { color: textColor }]}>
                      Completionist: {selectedHltbEntry.gameplayCompletionist}h
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedHltbEntry(null)}
                  style={styles.clearHltbButton}
                >
                  <Text style={[styles.clearHltbText, { color: tintColor }]}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Platform</ThemedText>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: backgroundColor, borderColor: tintColor }]}
              onPress={showPlatformPicker}
            >
              <Text style={[styles.pickerButtonText, { color: textColor }]}>{platform}</Text>
              <Text style={[styles.pickerArrow, { color: tintColor }]}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Genre</ThemedText>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: backgroundColor, borderColor: tintColor }]}
              onPress={showGenrePicker}
            >
              <Text style={[styles.pickerButtonText, { color: textColor }]}>{genre}</Text>
              <Text style={[styles.pickerArrow, { color: tintColor }]}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Status</ThemedText>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: backgroundColor, borderColor: tintColor }]}
              onPress={showStatusPicker}
            >
              <Text style={[styles.pickerButtonText, { color: textColor }]}>{status}</Text>
              <Text style={[styles.pickerArrow, { color: tintColor }]}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Rating (1-10)</ThemedText>
            <TextInput
              style={[styles.textInput, { backgroundColor: backgroundColor, color: textColor, borderColor: tintColor }]}
              value={rating}
              onChangeText={setRating}
              placeholder="Optional rating"
              placeholderTextColor={textColor + '80'}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Hours Played</ThemedText>
            <TextInput
              style={[styles.textInput, { backgroundColor: backgroundColor, color: textColor, borderColor: tintColor }]}
              value={hoursPlayed}
              onChangeText={setHoursPlayed}
              placeholder="Hours played"
              placeholderTextColor={textColor + '80'}
              keyboardType="numeric"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: tintColor }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Add Game</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  titleInputContainer: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  searchIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  hltbResults: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
  },
  hltbResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  hltbResultItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  hltbResultName: {
    fontSize: 14,
    fontWeight: '600',
  },
  hltbResultTime: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedHltbEntry: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  selectedHltbTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  hltbTimes: {
    marginBottom: 8,
  },
  hltbTime: {
    fontSize: 12,
    marginBottom: 2,
  },
  clearHltbButton: {
    alignSelf: 'flex-end',
  },
  clearHltbText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
  },
  pickerArrow: {
    fontSize: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});