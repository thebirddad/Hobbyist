import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  protectedTags?: string[]; // Tags that cannot be removed
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = 'Add tag...',
  maxTags = 10,
  protectedTags = [],
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmedTag = inputValue.trim();
    
    if (!trimmedTag) {
      return;
    }
    
    if (tags.length >= maxTags) {
      Alert.alert('Tag Limit', `You can only add up to ${maxTags} tags per item.`);
      return;
    }
    
    if (tags.includes(trimmedTag)) {
      Alert.alert('Duplicate Tag', 'This tag already exists.');
      return;
    }
    
    if (trimmedTag.length > 20) {
      Alert.alert('Tag Too Long', 'Tags must be 20 characters or less.');
      return;
    }
    
    onTagsChange([...tags, trimmedTag]);
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    if (protectedTags.includes(tagToRemove)) {
      Alert.alert('Cannot Remove', 'This tag is required and cannot be removed.');
      return;
    }
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmitEditing = () => {
    addTag();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tags ({tags.length}/{maxTags})</Text>
      
      {/* Display existing tags */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => {
            const isProtected = protectedTags.includes(tag);
            return (
              <View key={index} style={[styles.tag, isProtected && styles.protectedTag]}>
                <Text style={[styles.tagText, isProtected && styles.protectedTagText]}>{tag}</Text>
                {!isProtected && (
                  <TouchableOpacity
                    onPress={() => removeTag(tag)}
                    style={styles.removeTagButton}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                )}
                {isProtected && (
                  <View style={styles.lockIcon}>
                    <Text style={styles.lockText}>🔒</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
      
      {/* Add new tag input */}
      {tags.length < maxTags && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder}
            placeholderTextColor="#999"
            onSubmitEditing={handleSubmitEditing}
            returnKeyType="done"
            maxLength={20}
          />
          <TouchableOpacity
            onPress={addTag}
            style={[styles.addButton, !inputValue.trim() && styles.addButtonDisabled]}
            disabled={!inputValue.trim()}
          >
            <Text style={[styles.addButtonText, !inputValue.trim() && styles.addButtonTextDisabled]}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {tags.length >= maxTags && (
        <Text style={styles.maxTagsText}>
          Maximum {maxTags} tags reached
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  tagText: {
    fontSize: 14,
    color: '#1976d2',
    marginRight: 6,
  },
  removeTagButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: '#999',
  },
  maxTagsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  protectedTag: {
    backgroundColor: '#f0f0f0',
    borderColor: '#999',
  },
  protectedTagText: {
    color: '#666',
  },
  lockIcon: {
    marginLeft: 4,
  },
  lockText: {
    fontSize: 10,
  },
});