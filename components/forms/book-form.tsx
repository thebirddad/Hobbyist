import { ImageCapture } from '@/components/image-picker';
import { TagInput } from '@/components/tag-input';
import { BookFormat, BookGenre, BookItem, BookStatus } from '@/data/hobby';

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
  View
} from 'react-native';

interface BookFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (book: Omit<BookItem, 'id' | 'dateAdded'>) => void;
  initialBook?: BookItem;
  mode?: 'add' | 'edit';
}

export const BookForm: React.FC<BookFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialBook,
  mode = 'add'
}) => {
  const [title, setTitle] = useState(initialBook?.title || '');
  const [author, setAuthor] = useState(initialBook?.author || '');
  const [status, setStatus] = useState<BookStatus>(initialBook?.status || BookStatus.WANT_TO_READ);
  const [format, setFormat] = useState<BookFormat>(initialBook?.format || BookFormat.HARDCOVER);
  const [totalPages, setTotalPages] = useState(initialBook?.totalPages?.toString() || '');
  const [pagesRead, setPagesRead] = useState(initialBook?.pagesRead?.toString() || '');
  const [thumbnail, setThumbnail] = useState(initialBook?.thumbnail || '');
  const [dateCompleted, setDateCompleted] = useState(initialBook?.dateCompleted || '');
  const [rating, setRating] = useState(initialBook?.rating?.toString() || '');
  const [genre, setGenre] = useState(initialBook?.genre || BookGenre.FICTION);
  const [tags, setTags] = useState<string[]>(() => {
    const initialTags = initialBook?.tags || [];
    // Ensure 'Book' tag is always present and first
    const filteredTags = initialTags.filter(tag => tag !== 'Book');
    return ['Book', ...filteredTags];
  });
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [showGenrePicker, setShowGenrePicker] = useState(false);

  // Initialize form data when initialBook changes
  useEffect(() => {
    if (initialBook) {
      setTitle(initialBook.title || '');
      setAuthor(initialBook.author || '');
      setStatus(initialBook.status || BookStatus.WANT_TO_READ);
      setFormat(initialBook.format || BookFormat.HARDCOVER);
      setTotalPages(initialBook.totalPages?.toString() || '');
      setPagesRead(initialBook.pagesRead?.toString() || '');
      setThumbnail(initialBook.thumbnail || '');
      setDateCompleted(initialBook.dateCompleted || '');
      setRating(initialBook.rating?.toString() || '');
      setGenre(initialBook.genre || BookGenre.FICTION);
      const initialTags = initialBook.tags || [];
      const filteredTags = initialTags.filter(tag => tag !== 'Book');
      setTags(['Book', ...filteredTags]);
    } else if (mode === 'add') {
      setTitle('');
      setAuthor('');
      setStatus(BookStatus.WANT_TO_READ);
      setFormat(BookFormat.HARDCOVER);
      setTotalPages('');
      setPagesRead('');
      setThumbnail('');
      setDateCompleted('');
      setRating('');
      setGenre(BookGenre.FICTION);
      setTags(['Book']);
      setShowStatusPicker(false);
      setShowFormatPicker(false);
      setShowGenrePicker(false);
    }
  }, [initialBook, mode]);

  const bookStatusOptions = BookStatus ? Object.values(BookStatus).map(status => ({ key: status, label: status })) : [];

  const bookFormatOptions = BookFormat ? Object.values(BookFormat).map(format => ({ key: format, label: format })) : [];

  const bookGenreOptions = BookGenre ? Object.values(BookGenre).map(genre => ({ key: genre, label: genre })) : [];

  const resetForm = useCallback(() => {
    if (mode === 'add') {
      setTitle('');
      setAuthor('');
      setStatus(BookStatus.WANT_TO_READ);
      setFormat(BookFormat.HARDCOVER);
      setTotalPages('');
      setPagesRead('');
      setThumbnail('');
      setDateCompleted('');
      setRating('');
      setGenre(BookGenre.FICTION);
      setTags(['Book']);
    }
    setShowStatusPicker(false);
    setShowFormatPicker(false);
    setShowGenrePicker(false);
  }, [mode]);

  const handleSubmit = () => {

    const ratingNum = rating ? parseInt(rating) : undefined;
    if (ratingNum && (ratingNum < 1 || ratingNum > 5)) {
      Alert.alert('Error', 'Rating must be between 1 and 5 stars');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a book title');
      return;
    }

    const totalPagesNum = totalPages ? parseInt(totalPages) : undefined;
    const pagesReadNum = pagesRead ? parseInt(pagesRead) : undefined;

    if (totalPagesNum && pagesReadNum && pagesReadNum > totalPagesNum) {
      Alert.alert('Error', 'Pages read cannot be more than total pages');
      return;
    }

    const bookData: Omit<BookItem, 'id' | 'dateAdded'> = {
      title: title.trim(),
      author: author.trim() || undefined,
      status,
      format,
      totalPages: totalPagesNum,
      pagesRead: pagesReadNum,
      thumbnail: thumbnail || undefined,
      dateCompleted: status === BookStatus.COMPLETED && !dateCompleted
        ? new Date().toISOString()
        : dateCompleted || undefined,
      rating: ratingNum,
      genre,
      tags: tags.length > 0 ? tags : undefined,
    };

    onSubmit(bookData);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleImageSelected = useCallback((uri: string) => {
    console.log('📸 Book form received image URI:', uri);
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
            {mode === 'add' ? 'Add Book' : 'Edit Book'}
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
                placeholder="Enter book title..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Author</Text>
              <TextInput
                style={styles.input}
                value={author}
                onChangeText={setAuthor}
                placeholder="Enter author name..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowStatusPicker(!showStatusPicker)}
              >
                <Text style={styles.pickerButtonText}>
                  {bookStatusOptions.find(opt => opt.key === status)?.label || 'Select Status'}
                </Text>
                <Text style={styles.pickerArrow}>{showStatusPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showStatusPicker && (
                <View style={styles.pickerOptions}>
                  {bookStatusOptions.map((option) => (
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
              <Text style={styles.label}>Format</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowFormatPicker(!showFormatPicker)}
              >
                <Text style={styles.pickerButtonText}>
                  {bookFormatOptions.find(opt => opt.key === format)?.label || 'Select Format'}
                </Text>
                <Text style={styles.pickerArrow}>{showFormatPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showFormatPicker && (
                <View style={styles.pickerOptions}>
                  {bookFormatOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.pickerOption,
                        format === option.key && styles.pickerOptionSelected
                      ]}
                      onPress={() => {
                        setFormat(option.key);
                        setShowFormatPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        format === option.key && styles.pickerOptionTextSelected
                      ]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Total Pages</Text>
              <TextInput
                style={styles.input}
                value={totalPages}
                onChangeText={setTotalPages}
                placeholder="Enter total pages..."
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Pages Read</Text>
              <TextInput
                style={styles.input}
                value={pagesRead}
                onChangeText={setPagesRead}
                placeholder="Enter pages read..."
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rating (1-5 stars)</Text>
              <StarRatingSelector />
            </View>

            <View style={{ maxHeight: 200 }}>
              <Text style={styles.label}>Genre</Text>

              <ScrollView>
                {bookGenreOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.pickerOption,
                      genre === option.key && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      setGenre(option.key);
                      setShowGenrePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      genre === option.key && styles.pickerOptionTextSelected
                    ]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>



            <View style={styles.formGroup}>
              <TagInput
                tags={tags}
                onTagsChange={(newTags) => {
                  // Always ensure 'Book' tag is present and first
                  const filteredTags = newTags.filter(tag => tag !== 'Book');
                  setTags(['Book', ...filteredTags]);
                }}
                placeholder="Add tag (e.g., Fiction, Mystery)..."
                maxTags={10}
                protectedTags={['Book']}
              />
            </View>

            <View style={styles.formGroup}>
              <ImageCapture
                onImageSelected={handleImageSelected}
                onImageRemoved={() => setThumbnail('')}
                imageUri={thumbnail}
                itemType="Book"
                label="Book Cover"
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