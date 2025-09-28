import { GameImagePicker } from '@/components/game-image-picker';
import { BookItem, BookStatus } from '@/data/hobby';
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

  const resetForm = useCallback(() => {
    if (mode === 'add') {
      setTitle('');
      setAuthor('');
      setStatus(BookStatus.WANT_TO_READ);
      setTotalPages('');
      setPagesRead('');
      setThumbnail('');
      setDateCompleted('');
    }
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
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={status}
                  onValueChange={setStatus}
                  style={styles.picker}
                >
                  <Picker.Item label="Want to Read" value={BookStatus.WANT_TO_READ} />
                  <Picker.Item label="Currently Reading" value={BookStatus.READING} />
                  <Picker.Item label="Completed" value={BookStatus.COMPLETED} />
                  <Picker.Item label="Dropped" value={BookStatus.DROPPED} />
                </Picker>
              </View>
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
              <Text style={styles.label}>Book Cover</Text>
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
});