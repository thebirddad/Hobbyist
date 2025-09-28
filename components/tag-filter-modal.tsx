import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TagFilterProps {
  visible: boolean;
  onClose: () => void;
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  title?: string;
}

export const TagFilterModal: React.FC<TagFilterProps> = ({
  visible,
  onClose,
  availableTags,
  selectedTags,
  onTagsChange,
  title = 'Filter by Tags',
}) => {
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>(selectedTags);

  // Debug logging
  React.useEffect(() => {
    console.log('🏷️ TagFilterModal props:', {
      visible,
      availableTags,
      selectedTags,
      title
    });
  }, [visible, availableTags, selectedTags, title]);

  const handleTagToggle = (tag: string) => {
    if (tempSelectedTags.includes(tag)) {
      setTempSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setTempSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleApply = () => {
    onTagsChange(tempSelectedTags);
    onClose();
  };

  const handleClear = () => {
    setTempSelectedTags([]);
  };

  const handleCancel = () => {
    setTempSelectedTags(selectedTags);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {availableTags.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tags available</Text>
              <Text style={styles.emptyStateSubtext}>
                Add some items with tags to use this filter
              </Text>
            </View>
          ) : (
            <View style={styles.tagsContainer}>
              {availableTags.map((tag) => {
                const isSelected = tempSelectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagButton,
                      isSelected && styles.tagButtonSelected,
                    ]}
                    onPress={() => handleTagToggle(tag)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tagButtonText,
                        isSelected && styles.tagButtonTextSelected,
                      ]}
                    >
                      {tag}
                    </Text>
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.selectedSection}>
            <Text style={styles.selectedTitle}>
              Selected Tags ({tempSelectedTags.length})
            </Text>
            {tempSelectedTags.length > 0 ? (
              <View style={styles.selectedTags}>
                {tempSelectedTags.map((tag) => (
                  <View key={tag} style={styles.selectedTag}>
                    <Text style={styles.selectedTagText}>{tag}</Text>
                    <TouchableOpacity
                      onPress={() => handleTagToggle(tag)}
                      style={styles.removeTagButton}
                    >
                      <Text style={styles.removeTagText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noSelectionText}>No tags selected</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>
              Apply Filter
              {tempSelectedTags.length > 0 && ` (${tempSelectedTags.length})`}
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tagButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  tagButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tagButtonTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
  checkmark: {
    marginLeft: 6,
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '700',
  },
  selectedSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedTagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  removeTagButton: {
    marginLeft: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  noSelectionText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});