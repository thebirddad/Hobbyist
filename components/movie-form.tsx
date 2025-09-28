import { GameImagePicker } from '@/components/game-image-picker';
import { MovieItem, MovieStatus } from '@/data/hobby';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useState } from 'react';
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

interface MovieFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (movie: Omit<MovieItem, 'id' | 'dateAdded'>) => void;
  initialMovie?: MovieItem;
  mode?: 'add' | 'edit';
}

export const MovieForm: React.FC<MovieFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialMovie,
  mode = 'add'
}) => {
  const [title, setTitle] = useState(initialMovie?.title || '');
  const [director, setDirector] = useState(initialMovie?.director || '');
  const [status, setStatus] = useState<MovieStatus>(initialMovie?.status || MovieStatus.WANT_TO_WATCH);
  const [rating, setRating] = useState(initialMovie?.rating?.toString() || '');
  const [thumbnail, setThumbnail] = useState(initialMovie?.thumbnail || '');
  const [dateWatched, setDateWatched] = useState(initialMovie?.dateWatched || '');

  const resetForm = useCallback(() => {
    if (mode === 'add') {
      setTitle('');
      setDirector('');
      setStatus(MovieStatus.WANT_TO_WATCH);
      setRating('');
      setThumbnail('');
      setDateWatched('');
    }
  }, [mode]);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a movie title');
      return;
    }

    const ratingNum = rating ? parseInt(rating) : undefined;
    if (ratingNum && (ratingNum < 1 || ratingNum > 5)) {
      Alert.alert('Error', 'Rating must be between 1 and 5 stars');
      return;
    }

    const movieData: Omit<MovieItem, 'id' | 'dateAdded'> = {
      title: title.trim(),
      director: director.trim() || undefined,
      status,
      rating: ratingNum,
      thumbnail: thumbnail || undefined,
      dateWatched: status === MovieStatus.WATCHED && !dateWatched 
        ? new Date().toISOString() 
        : dateWatched || undefined,
    };

    onSubmit(movieData);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleImageSelected = useCallback((uri: string) => {
    console.log('🎬 Movie form received image URI:', uri);
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
            {mode === 'add' ? 'Add Movie' : 'Edit Movie'}
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
                placeholder="Enter movie title..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Director</Text>
              <TextInput
                style={styles.input}
                value={director}
                onChangeText={setDirector}
                placeholder="Enter director name..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={status}
                  onValueChange={setStatus}
                  style={styles.picker}
                >
                  <Picker.Item label="Want to Watch" value={MovieStatus.WANT_TO_WATCH} />
                  <Picker.Item label="Watched" value={MovieStatus.WATCHED} />
                </Picker>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rating (1-5 stars)</Text>
              <StarRatingSelector />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Movie Poster</Text>
              <GameImagePicker
                onImageSelected={handleImageSelected}
                onImageRemoved={() => setThumbnail('')}
                imageUri={thumbnail}
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    color: '#000',
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