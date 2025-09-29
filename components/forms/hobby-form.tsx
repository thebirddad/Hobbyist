import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BaseHobby, HobbyType } from '@/data/hobby';
import { useHobbyStorage } from '@/hooks/use-hobby-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface HobbyFormProps {
  onHobbyCreated?: () => void;
}

export const HobbyForm: React.FC<HobbyFormProps> = ({ onHobbyCreated }) => {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<HobbyType>(HobbyType.GAMES);
  const [nameManuallySet, setNameManuallySet] = useState(false);
  const [dateStarted, setDateStarted] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { addHobby, canAddHobby, getRemainingHobbySlots, MAX_HOBBIES } = useHobbyStorage();

  // Auto-populate name based on selected type (unless user manually set it)
  useEffect(() => {
    if (!nameManuallySet) {
      setName(selectedType);
    }
  }, [selectedType, nameManuallySet]);

  // Set initial name on component mount
  useEffect(() => {
    if (!name && !nameManuallySet) {
      setName(selectedType);
    }
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateStarted(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a hobby name');
      return;
    }

    if (!canAddHobby()) {
      Alert.alert('Limit Reached', `You can only have ${MAX_HOBBIES} hobbies total`);
      return;
    }

    setIsLoading(true);

    try {
      const hobbyData: Omit<BaseHobby, 'id'> = {
        name: name.trim(),
        type: selectedType,
        dateStarted: dateStarted.toISOString(),
      };

      await addHobby(hobbyData);
      
      // Reset form
      setName('');
      setSelectedType(HobbyType.GAMES);
      setDateStarted(new Date());
      setNameManuallySet(false);
      
      Alert.alert('Success', 'Hobby created successfully!');
      onHobbyCreated?.();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create hobby');
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = [
    { value: HobbyType.GAMES, label: 'Games', description: 'Track video games with platforms, hours, and completion status' },
    { value: HobbyType.BOOKS, label: 'Books', description: 'Track books with pages read and reading progress' },
    { value: HobbyType.TV_FILM, label: 'TV/Film', description: 'Track movies and TV shows with ratings, seasons, and watch status' },
    { value: HobbyType.CUSTOM, label: 'Custom', description: 'Simple tracking with just name and image' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Create New Hobby
      </ThemedText>
      
      {!canAddHobby() && (
        <ThemedView style={styles.warningContainer}>
          <ThemedText style={styles.warningText}>
            Maximum hobbies reached ({MAX_HOBBIES}/{MAX_HOBBIES})
          </ThemedText>
        </ThemedView>
      )}
      
      {canAddHobby() && getRemainingHobbySlots() <= 2 && (
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>
            {getRemainingHobbySlots()} hobby slots remaining
          </ThemedText>
        </ThemedView>
      )}

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Hobby Name</ThemedText>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setNameManuallySet(true);
          }}
          placeholder="Enter hobby name..."
          placeholderTextColor="#999"
          editable={canAddHobby()}
        />
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Date Started</ThemedText>
        <TouchableOpacity
          style={[styles.dateButton, !canAddHobby() && styles.disabled]}
          onPress={() => canAddHobby() && setShowDatePicker(true)}
          disabled={!canAddHobby()}
        >
          <ThemedText style={styles.dateButtonText}>
            {formatDate(dateStarted)}
          </ThemedText>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={dateStarted}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Hobby Type</ThemedText>
        {typeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.typeOption,
              selectedType === option.value && styles.typeOptionSelected,
              !canAddHobby() && styles.disabled
            ]}
            onPress={() => {
              if (canAddHobby()) {
                setSelectedType(option.value);
                // If name hasn't been manually modified, update it to match the new type
                if (!nameManuallySet || name === selectedType) {
                  setName(option.value);
                  setNameManuallySet(false);
                }
              }
            }}
            disabled={!canAddHobby()}
          >
            <View style={styles.typeOptionHeader}>
              <ThemedText style={[
                styles.typeOptionTitle,
                selectedType === option.value && styles.typeOptionTitleSelected
              ]}>
                {option.label}
              </ThemedText>
            </View>
            <ThemedText style={[
              styles.typeOptionDescription,
              selectedType === option.value && styles.typeOptionDescriptionSelected
            ]}>
              {option.description}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!canAddHobby() || isLoading) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={!canAddHobby() || isLoading}
      >
        <ThemedText style={[
          styles.submitButtonText,
          (!canAddHobby() || isLoading) && styles.submitButtonTextDisabled
        ]}>
          {isLoading ? 'Creating...' : 'Create Hobby'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: '#ffebcd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffa500',
  },
  warningText: {
    color: '#ff4500',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#e6f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  infoText: {
    color: '#4a90e2',
    textAlign: 'center',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
  },
  typeOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  typeOptionSelected: {
    borderColor: '#4a90e2',
    backgroundColor: '#e6f3ff',
  },
  typeOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  typeOptionTitleSelected: {
    color: '#4a90e2',
  },
  typeOptionDescription: {
    fontSize: 14,
    color: '#666',
  },
  typeOptionDescriptionSelected: {
    color: '#4a90e2',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  disabled: {
    opacity: 0.5,
  },
});