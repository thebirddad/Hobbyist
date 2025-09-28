import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Console, useConsoleStorage } from '../../hooks/use-console-storage';
import { useGameStorage } from '../../hooks/use-game-storage';

interface ConsoleFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  initialName?: string;
  title: string;
}

const ConsoleForm: React.FC<ConsoleFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialName = '',
  title,
}) => {
  const [name, setName] = useState(initialName);
  const [submitting, setSubmitting] = useState(false);

  // Update name when initialName changes (for edit mode)
  React.useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a console name');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(name.trim());
      setName('');
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save console');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName(initialName);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Console Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter console name"
              autoCorrect={false}
              autoCapitalize="words"
              editable={!submitting}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {title.includes('Add') ? 'Add Console' : 'Update Console'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function ConsolesScreen() {
  const { consoles, loading, addConsole, deleteConsole, updateConsole } = useConsoleStorage();
  const { games } = useGameStorage();
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [editingConsole, setEditingConsole] = useState<Console | null>(null);

  const handleAddConsole = async (name: string) => {
    await addConsole(name);
  };

  const handleUpdateConsole = async (name: string) => {
    if (editingConsole) {
      try {
        await updateConsole(editingConsole.id, name);
        setEditingConsole(null);
      } catch (error) {
        console.error('Failed to update console:', error);
        throw error; // Re-throw to show the error in the form
      }
    }
  };

  const handleDeleteConsole = (consoleItem: Console) => {
    console.log('Delete button pressed for console:', consoleItem.name);
    
    // Check if console has games before showing confirmation
    const gamesUsingConsole = games.filter(game => game.platform === consoleItem.name);
    const hasGames = gamesUsingConsole.length > 0;
    
    if (hasGames) {
      const gameCount = gamesUsingConsole.length;
      const gameWord = gameCount === 1 ? 'game' : 'games';
      Alert.alert(
        'Cannot Delete Console',
        `"${consoleItem.name}" cannot be deleted because ${gameCount} ${gameWord} ${gameCount === 1 ? 'is' : 'are'} using this console.\n\nPlease remove or change the platform for ${gameCount === 1 ? 'this game' : 'these games'} first.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Delete Console',
      `Are you sure you want to delete "${consoleItem.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting console with ID:', consoleItem.id);
              await deleteConsole(consoleItem.id, games);
              console.log('Console deleted successfully');
            } catch (error) {
              console.error('Failed to delete console:', error);
              const errorMessage = error instanceof Error ? error.message : 'Failed to delete console. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleEditConsole = (consoleItem: Console) => {
    console.log('Edit button pressed for console:', consoleItem.name);
    setEditingConsole(consoleItem);
  };

  const renderConsoleItem = ({ item }: { item: Console }) => (
    <View style={styles.consoleItem}>
      <View style={styles.consoleInfo}>
        <Text style={styles.consoleName}>{item.name}</Text>
        <Text style={styles.consoleDate}>
          Added: {new Date(item.dateAdded).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.consoleActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditConsole(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteConsole(item)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading consoles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Console Management</Text>
        <Text style={styles.subtitle}>
          {consoles.length} console{consoles.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Add custom consoles here and they'll appear in the platform dropdown when adding games.
        </Text>
      </View>

      <FlatList
        data={consoles}
        keyExtractor={(item) => item.id}
        renderItem={renderConsoleItem}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsAddFormVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ConsoleForm
        visible={isAddFormVisible}
        onClose={() => setIsAddFormVisible(false)}
        onSubmit={handleAddConsole}
        title="Add New Console"
      />

      <ConsoleForm
        visible={!!editingConsole}
        onClose={() => setEditingConsole(null)}
        onSubmit={handleUpdateConsole}
        initialName={editingConsole?.name || ''}
        title="Edit Console"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
    color: '#333',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    color: '#666',
  },
  infoBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  consoleItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  consoleInfo: {
    flex: 1,
  },
  consoleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  consoleDate: {
    fontSize: 12,
    color: '#666',
  },
  consoleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
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
  modalTitle: {
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
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
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});