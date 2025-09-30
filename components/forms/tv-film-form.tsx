import { ImageCapture } from '@/components/image-picker';
import { TagInput } from '@/components/tag-input';
import { TvFilmItem, TvFilmStatus } from '@/data/hobby';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TvFilmFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (tvFilmItem: Omit<TvFilmItem, 'id' | 'dateAdded'>) => void;
  initialTvFilmItem?: TvFilmItem;
  mode?: 'add' | 'edit';
}

export const TvFilmForm: React.FC<TvFilmFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialTvFilmItem,
  mode = 'add'
}) => {
  const [title, setTitle] = useState(initialTvFilmItem?.title || '');
  const [director, setDirector] = useState(initialTvFilmItem?.director || '');
  const [status, setStatus] = useState<TvFilmStatus>(initialTvFilmItem?.status || TvFilmStatus.WANT_TO_WATCH);
  const [rating, setRating] = useState(initialTvFilmItem?.rating?.toString() || '');
  const [currentSeason, setCurrentSeason] = useState(initialTvFilmItem?.currentSeason || '');
  const [thumbnail, setThumbnail] = useState(initialTvFilmItem?.thumbnail || '');
  const [dateWatched, setDateWatched] = useState(initialTvFilmItem?.dateWatched || '');
  const [tags, setTags] = useState<string[]>(() => {
    const initialTags = initialTvFilmItem?.tags || [];
    // Ensure 'Film' tag is always present and first
    const filteredTags = initialTags.filter(tag => tag !== 'Film');
    return ['Film', ...filteredTags];
  });
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  // Initialize form data when initialTvFilmItem changes
  useEffect(() => {
    if (initialTvFilmItem) {
      setTitle(initialTvFilmItem.title || '');
      setDirector(initialTvFilmItem.director || '');
      setStatus(initialTvFilmItem.status || TvFilmStatus.WANT_TO_WATCH);
      setRating(initialTvFilmItem.rating?.toString() || '');
      setCurrentSeason(initialTvFilmItem.currentSeason || '');
      setThumbnail(initialTvFilmItem.thumbnail || '');
      setDateWatched(initialTvFilmItem.dateWatched || '');
      const initialTags = initialTvFilmItem.tags || [];
      const filteredTags = initialTags.filter(tag => tag !== 'Film');
      setTags(['Film', ...filteredTags]);
    } else if (mode === 'add') {
      setTitle('');
      setDirector('');
      setStatus(TvFilmStatus.WANT_TO_WATCH);
      setRating('');
      setCurrentSeason('');
      setThumbnail('');
      setDateWatched('');
      setTags(['Film']);
      setShowStatusPicker(false);
    }
  }, [initialTvFilmItem, mode]);

  const tvFilmStatusOptions = [
    { key: TvFilmStatus.WANT_TO_WATCH, label: 'Want to Watch' },
    { key: TvFilmStatus.WATCHED, label: 'Watched' },
    { key: TvFilmStatus.WATCHING, label: 'Currently Watching' },
  ];

  const resetForm = useCallback(() => {
    if (mode === 'add') {
      setTitle('');
      setDirector('');
      setStatus(TvFilmStatus.WANT_TO_WATCH);
      setRating('');
      setCurrentSeason('');
      setThumbnail('');
      setDateWatched('');
      setTags(['Film']);
    }
    setShowStatusPicker(false);
  }, [mode]);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    const ratingNum = rating ? parseInt(rating) : undefined;
    if (ratingNum && (ratingNum < 1 || ratingNum > 5)) {
      Alert.alert('Error', 'Rating must be between 1 and 5 stars');
      return;
    }

    const tvFilmData: Omit<TvFilmItem, 'id' | 'dateAdded'> = {
      title: title.trim(),
      director: director.trim() || undefined,
      status,
      rating: ratingNum,
      currentSeason: currentSeason.trim() || undefined,
      thumbnail: thumbnail || undefined,
      dateWatched: status === TvFilmStatus.WATCHED && !dateWatched 
        ? new Date().toISOString() 
        : dateWatched || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    onSubmit(tvFilmData);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleImageSelected = useCallback((uri: string) => {
    console.log('🎬 TV/Film form received image URI:', uri);
    setThumbnail(uri);
  }, []);

  const StarRatingSelector = () => {
    const stars = [1, 2, 3, 4, 5];
    const currentRating = rating ? parseInt(rating) : 0;

    return (
      <View style={styles.starContainer}>
        {stars.map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star.toString())}
            style={styles.starButton}
          >
            <Text style={[
              styles.star,
              star <= currentRating ? styles.starFilled : styles.starEmpty
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setRating('')}
          style={styles.clearRatingButton}
        >
          <Text style={styles.clearRatingText}>Clear</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {mode === 'add' ? 'Add TV/Film' : 'Edit TV/Film'}
          </Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter movie or TV show title..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Director/Creator</Text>
              <TextInput
                style={styles.input}
                value={director}
                onChangeText={setDirector}
                placeholder="Enter director or creator name..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Season (for TV shows)</Text>
              <TextInput
                style={styles.input}
                value={currentSeason}
                onChangeText={setCurrentSeason}
                placeholder="e.g., 3, 5, 12..."
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowStatusPicker(!showStatusPicker)}
              >
                <Text style={styles.pickerButtonText}>
                  {tvFilmStatusOptions.find(opt => opt.key === status)?.label || 'Select Status'}
                </Text>
                <Text style={styles.pickerArrow}>{showStatusPicker ? '\u25b2' : '\u25bc'}</Text>
              </TouchableOpacity>
              
              {showStatusPicker && (
                <View style={styles.pickerOptions}>
                  {tvFilmStatusOptions.map((option) => (
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

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rating (1-5 stars)</Text>
              <StarRatingSelector />
            </View>

            <View style={styles.formGroup}>
              <TagInput
                tags={tags}
                onTagsChange={(newTags) => {
                  // Always ensure 'Film' tag is present and first
                  const filteredTags = newTags.filter(tag => tag !== 'Film');
                  setTags(['Film', ...filteredTags]);
                }}
                placeholder="Add tag (e.g., Action, Comedy)..."
                maxTags={10}
                protectedTags={['Film']}
              />
            </View>

            <View style={styles.formGroup}>
              <ImageCapture
                onImageSelected={handleImageSelected}
                onImageRemoved={() => setThumbnail('')}
                imageUri={thumbnail}
                itemType="TV/Film"
                label="Poster/Cover"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#666',
  },
  pickerOptions: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#000',
  },
  pickerOptionTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  starButton: {
    marginRight: 8,
  },
  star: {
    fontSize: 24,
  },
  starFilled: {
    color: '#ffd700',
  },
  starEmpty: {
    color: '#ccc',
  },
  clearRatingButton: {
    marginLeft: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  clearRatingText: {
    fontSize: 12,
    color: '#666',
  },
});