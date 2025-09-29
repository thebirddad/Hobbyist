import { GameImagePicker } from '@/components/game-image-picker';
import { TagInput } from '@/components/tag-input';
import { BookItem, BookStatus } from '@/data/hobby';

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
  const [totalPages, setTotalPages] = useState(initialBook?.totalPages?.toString() || '');
  const [pagesRead, setPagesRead] = useState(initialBook?.pagesRead?.toString() || '');
  const [thumbnail, setThumbnail] = useState(initialBook?.thumbnail || '');
  const [dateCompleted, setDateCompleted] = useState(initialBook?.dateCompleted || '');
  const [tags, setTags] = useState<string[]>(() => {
    const initialTags = initialBook?.tags || [];
    // Ensure 'Book' tag is always present and first
    const filteredTags = initialTags.filter(tag => tag !== 'Book');
    return ['Book', ...filteredTags];
  });
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  // Initialize form data when initialBook changes
  useEffect(() => {
    if (initialBook) {
      setTitle(initialBook.title || '');
      setAuthor(initialBook.author || '');
      setStatus(initialBook.status || BookStatus.WANT_TO_READ);
      setTotalPages(initialBook.totalPages?.toString() || '');
      setPagesRead(initialBook.pagesRead?.toString() || '');
      setThumbnail(initialBook.thumbnail || '');
      setDateCompleted(initialBook.dateCompleted || '');
      const initialTags = initialBook.tags || [];
      const filteredTags = initialTags.filter(tag => tag !== 'Book');
      setTags(['Book', ...filteredTags]);
    } else if (mode === 'add') {
      setTitle('');
      setAuthor('');
      setStatus(BookStatus.WANT_TO_READ);
      setTotalPages('');
      setPagesRead('');
      setThumbnail('');
      setDateCompleted('');
      setTags(['Book']);
      setShowStatusPicker(false);
    }
  }, [initialBook, mode]);

  const bookStatusOptions = [
    { key: BookStatus.WANT_TO_READ, label: 'Want to Read' },
    { key: BookStatus.READING, label: 'Currently Reading' },
    { key: BookStatus.COMPLETED, label: 'Completed' },
    { key: BookStatus.DROPPED, label: 'Dropped' },
  ];

  const resetForm = useCallback(() => {
    if (mode === 'add') {
      setTitle('');
      setAuthor('');
      setStatus(BookStatus.WANT_TO_READ);
      setTotalPages('');
      setPagesRead('');
      setThumbnail('');
      setDateCompleted('');
      setTags(['Book']);
    }
    setShowStatusPicker(false);
  }, [mode]);

  const handleSubmit = () => {
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
      totalPages: totalPagesNum,
      pagesRead: pagesReadNum,
      thumbnail: thumbnail || undefined,
      dateCompleted: status === BookStatus.COMPLETED && !dateCompleted 
        ? new Date().toISOString() 
        : dateCompleted || undefined,
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
              <GameImagePicker
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
});