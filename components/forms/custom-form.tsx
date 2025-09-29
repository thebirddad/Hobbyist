import { GameImagePicker } from '@/components/game-image-picker';
import { TagInput } from '@/components/tag-input';
import { CustomItem } from '@/data/hobby';
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

interface CustomFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<CustomItem, 'id' | 'dateAdded'>) => void;
  initialItem?: CustomItem;
  mode?: 'add' | 'edit';
}

export const CustomForm: React.FC<CustomFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialItem,
  mode = 'add'
}) => {
  const [name, setName] = useState(initialItem?.name || '');
  const [thumbnail, setThumbnail] = useState(initialItem?.thumbnail || '');
  const [tags, setTags] = useState<string[]>(initialItem?.tags || []);

  // Initialize form data when initialItem changes
  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name || '');
      setThumbnail(initialItem.thumbnail || '');
      setTags(initialItem.tags || []);
    } else {
      resetForm();
    }
  }, [initialItem]);

  const resetForm = useCallback(() => {
    if (mode === 'add') {
      setName('');
      setThumbnail('');
      setTags([]);
    }
  }, [mode]);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const itemData: Omit<CustomItem, 'id' | 'dateAdded'> = {
      name: name.trim(),
      thumbnail: thumbnail || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    onSubmit(itemData);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleImageSelected = useCallback((uri: string) => {
    console.log('🎨 Custom form received image URI:', uri);
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
            {mode === 'add' ? 'Add Item' : 'Edit Item'}
          </Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter item name..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                placeholder="Add tag (e.g., Collection, Project)..."
                maxTags={10}
              />
            </View>

            <View style={styles.formGroup}>
              <GameImagePicker
                onImageSelected={handleImageSelected}
                onImageRemoved={() => setThumbnail('')}
                imageUri={thumbnail}
                itemType="Item"
                label="Item Photo"
              />
            </View>

            <View style={styles.description}>
              <Text style={styles.descriptionText}>
                Custom items are simple tracking entries with just a name and optional image. 
                Perfect for collections, goals, or anything else you want to keep track of!
              </Text>
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
  description: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
});