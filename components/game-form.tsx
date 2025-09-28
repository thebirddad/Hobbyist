import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Game, GameStatus } from '../data/game';
import { useConsoleStorage } from '../hooks/use-console-storage';
import { GameImagePicker } from './game-image-picker';

interface GameFormProps {
  visible: boolean;
  onGameAdded?: (game: Omit<Game, 'id' | 'dateAdded'>) => void;
  onGameUpdated?: (game: Game) => void;
  onClose: () => void;
  initialGame?: Game; // For editing existing games
}

export const GameForm: React.FC<GameFormProps> = ({ 
  visible, 
  onGameAdded, 
  onGameUpdated, 
  onClose, 
  initialGame 
}) => {
  const isEditing = !!initialGame;
  
  const { getConsoleNames } = useConsoleStorage();
  const availablePlatforms = getConsoleNames();
  
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState(availablePlatforms[0] || 'PC');
  const [status, setStatus] = useState<GameStatus>(GameStatus.WANT_TO_PLAY);
  const [timeToBeat, setTimeToBeat] = useState('');
  const [hoursPlayed, setHoursPlayed] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);

  // Selection state
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  // Initialize form data when initialGame changes
  useEffect(() => {
    if (initialGame) {
      setTitle(initialGame.title);
      setPlatform(initialGame.platform);
      setStatus(initialGame.status);
      setTimeToBeat(initialGame.timeToBeat?.toString() || '');
      setHoursPlayed(initialGame.hoursPlayed?.toString() || '');
      setThumbnail(initialGame.thumbnail);
    } else {
      resetForm();
    }
  }, [initialGame]);

  const resetForm = () => {
    setTitle('');
    setPlatform(availablePlatforms[0] || 'PC');
    setStatus(GameStatus.WANT_TO_PLAY);
    setTimeToBeat('');
    setHoursPlayed('');
    setThumbnail(undefined);
    setShowPlatformPicker(false);
    setShowStatusPicker(false);
  };

  const handleSubmit = useCallback(() => {
    if (!isEditing && !title.trim()) {
      Alert.alert('Error', 'Please enter a game title');
      return;
    }

    const timeToBeatNum = timeToBeat ? parseFloat(timeToBeat) : undefined;
    const hoursPlayedNum = hoursPlayed ? parseFloat(hoursPlayed) : undefined;

    if (timeToBeat && (isNaN(timeToBeatNum!) || timeToBeatNum! < 0)) {
      Alert.alert('Error', 'Time to beat must be a valid positive number');
      return;
    }

    if (hoursPlayed && (isNaN(hoursPlayedNum!) || hoursPlayedNum! < 0)) {
      Alert.alert('Error', 'Hours played must be a valid positive number');
      return;
    }

    console.log('🖼️ Form submission - thumbnail value:', thumbnail);
    
    if (isEditing && initialGame && onGameUpdated) {
      const updatedGame: Game = {
        ...initialGame,
        timeToBeat: timeToBeatNum,
        hoursPlayed: hoursPlayedNum,
        thumbnail,
      };
      console.log('🖼️ Updating game with thumbnail:', updatedGame.thumbnail);
      onGameUpdated(updatedGame);
    } else if (onGameAdded) {
      const newGame: Omit<Game, 'id' | 'dateAdded'> = {
        title: title.trim(),
        platform,
        status,
        timeToBeat: timeToBeatNum,
        hoursPlayed: hoursPlayedNum,
        dateCompleted: status === GameStatus.COMPLETED ? new Date().toISOString() : undefined,
        thumbnail,
      };
      console.log('🖼️ Adding new game with thumbnail:', newGame.thumbnail);
      onGameAdded(newGame);
      resetForm();
    }
    
    onClose();
  }, [title, platform, status, timeToBeat, hoursPlayed, isEditing, initialGame, onGameAdded, onGameUpdated, onClose]);

  const statusOptions = [
    { key: GameStatus.WANT_TO_PLAY, label: 'Want to Play' },
    { key: GameStatus.PLAYING, label: 'Currently Playing' },
    { key: GameStatus.COMPLETED, label: 'Completed' },
    { key: GameStatus.DROPPED, label: 'Dropped' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{isEditing ? 'Edit Game' : 'Add New Game'}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          {/* Game Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Game Title</Text>
            {isEditing ? (
              <View style={[styles.textInput, styles.readOnlyInput]}>
                <Text style={styles.readOnlyText}>{title}</Text>
              </View>
            ) : (
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter game title"
                autoCorrect={false}
                autoCapitalize="words"
              />
            )}
          </View>

          {/* Platform Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Platform</Text>
            {isEditing ? (
              <View style={[styles.pickerButton, styles.readOnlyInput]}>
                <Text style={styles.readOnlyText}>{platform}</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.pickerButton} 
                  onPress={() => setShowPlatformPicker(!showPlatformPicker)}
                >
                  <Text style={styles.pickerButtonText}>{platform}</Text>
                  <Text style={styles.pickerArrow}>{showPlatformPicker ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                
                {showPlatformPicker && (
                  <View style={styles.pickerOptions}>
                    {availablePlatforms.map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.pickerOption,
                          platform === p && styles.pickerOptionSelected
                        ]}
                        onPress={() => {
                          setPlatform(p);
                          setShowPlatformPicker(false);
                        }}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          platform === p && styles.pickerOptionTextSelected
                        ]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Status Selection - Hidden when editing */}
          {!isEditing && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowStatusPicker(!showStatusPicker)}
              >
                <Text style={styles.pickerButtonText}>
                  {statusOptions.find(opt => opt.key === status)?.label || 'Select Status'}
                </Text>
                <Text style={styles.pickerArrow}>{showStatusPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {showStatusPicker && (
                <View style={styles.pickerOptions}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.pickerOption,
                        status === option.key && styles.pickerOptionSelected
                      ]}
                      onPress={() => {
                        setStatus(option.key);
                        setShowStatusPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        status === option.key && styles.pickerOptionTextSelected
                      ]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Time to Beat */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time to Beat (hours)</Text>
            <TextInput
              style={styles.textInput}
              value={timeToBeat}
              onChangeText={setTimeToBeat}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          {/* Hours Played */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hours Played</Text>
            <TextInput
              style={styles.textInput}
              value={hoursPlayed}
              onChangeText={setHoursPlayed}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          {/* Game Thumbnail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Game Thumbnail</Text>
            <GameImagePicker
              imageUri={thumbnail}
              onImageSelected={setThumbnail}
              onImageRemoved={() => setThumbnail(undefined)}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Update Game' : 'Add Game'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#666',
  },
  pickerOptions: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  readOnlyInput: {
    backgroundColor: '#f8f8f8',
    borderColor: '#e0e0e0',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#666',
  },
});