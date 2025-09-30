import { ImageCapture } from '@/components/image-picker';
import { TagInput } from '@/components/tag-input';
import { CardItem, CardStatus, CardType } from '@/data/hobby';
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

interface CardFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (cardItem: Omit<CardItem, 'id' | 'dateAdded'>) => void;
  initialCardItem?: CardItem;
  mode?: 'add' | 'edit';
}

export const CardForm: React.FC<CardFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialCardItem,
  mode = 'add'
}) => {
  const [cardName, setCardName] = useState(initialCardItem?.cardName || '');
  const [setName, setSetName] = useState(initialCardItem?.setName || '');
  const [collectorNumber, setCollectorNumber] = useState(initialCardItem?.collectorNumber || '');
  const [condition, setCondition] = useState(initialCardItem?.condition || '');
  const [type, setType] = useState<CardType>(initialCardItem?.type || CardType.NON_FOIL);
  const [quantity, setQuantity] = useState(initialCardItem?.quantity.toString() || '1');
  const [pricePaid, setPricePaid] = useState(initialCardItem?.pricePaid?.toString() || '');
  const [currentValue, setCurrentValue] = useState(initialCardItem?.currentValue?.toString() || '');
  const [thumbnail, setThumbnail] = useState(initialCardItem?.thumbnail || '');
  const [status, setStatus] = useState<CardStatus>(initialCardItem?.status || CardStatus.WISHLIST);
  const [tags, setTags] = useState<string[]>(() => {
    const initialTags = initialCardItem?.tags || [];
    const filteredTags = initialTags.filter(tag => tag !== 'Card');
    return ['Card', ...filteredTags];
  });
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const cardStatusOptions = CardStatus ? Object.values(CardStatus).map(status => ({ key: status, label: status })) : [];

  const cardTypeOptions = CardType ? Object.values(CardType).map(type => ({ key: type, label: type })) : [];
  // Initialize form data when initialCardItem changes
  useEffect(() => {
    if (initialCardItem) {
      setCardName(initialCardItem.cardName || '');
      setSetName(initialCardItem.setName || '');
      setCollectorNumber(initialCardItem.collectorNumber || '');
      setCondition(initialCardItem.condition || '');
      setType(initialCardItem.type || CardType.NON_FOIL);
      setQuantity(initialCardItem.quantity.toString() || '1');
      setPricePaid(initialCardItem.pricePaid?.toString() || '');
      setCurrentValue(initialCardItem.currentValue?.toString() || '');
      setThumbnail(initialCardItem.thumbnail || '');
      setStatus(initialCardItem.status || CardStatus.WISHLIST);
      const initialTags = initialCardItem.tags || [];
      const filteredTags = initialTags.filter(tag => tag !== 'Card');
      setTags(['Card', ...filteredTags]);
      setShowStatusPicker(false);
      setShowTypePicker(false);
    } else if (mode === 'add') {
      // Reset form for adding new item
      setCardName('');
      setSetName('');
      setCollectorNumber('');
      setCondition('');
      setType(CardType.NON_FOIL);
      setQuantity('1');
      setPricePaid('');
      setCurrentValue('');
      setThumbnail('');
      setStatus(CardStatus.WISHLIST);
      setTags(['Card']);
      setShowStatusPicker(false);
      setShowTypePicker(false);
    }
  }, [initialCardItem, mode]);

  const resetForm = useCallback(() => {
    if (mode === 'add') {
      setCardName('');
      setSetName('');
      setCollectorNumber('');
      setCondition('');
      setType(CardType.NON_FOIL);
      setQuantity('1');
      setPricePaid('');
      setCurrentValue('');
      setThumbnail('');
      setStatus(CardStatus.WISHLIST);
      setTags(['Card']);
    }
    setShowStatusPicker(false);
    setShowTypePicker(false);
  }, [mode]);

  const handleSubmit = () => {
    if (!cardName.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }

    const cardData: Omit<CardItem, 'id' | 'dateAdded'> = {
      title: cardName.trim(),
      cardName: cardName.trim(),
      setName: setName.trim(),
      collectorNumber: collectorNumber.trim(),
      condition: condition.trim(),
      type,
      quantity: parseInt(quantity, 10) || 1,
      pricePaid: pricePaid ? parseFloat(pricePaid) : undefined,
      currentValue: currentValue ? parseFloat(currentValue) : undefined,
      thumbnail: thumbnail || undefined,
      status,
      tags: tags.length > 0 ? tags : undefined,
    };
    onSubmit(cardData);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleImageSelected = useCallback((uri: string) => {
    console.log('Card form received image URI:', uri);
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
            {mode === 'add' ? 'Add a Card' : 'Edit a Card'}
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
                value={cardName}
                onChangeText={setCardName}
                placeholder="Enter card name..."
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
                  {cardStatusOptions.find(opt => opt.key === status)?.label || 'Select Status'}
                </Text>
                <Text style={styles.pickerArrow}>{showStatusPicker ? '\u25b2' : '\u25bc'}</Text>
              </TouchableOpacity>

              {showStatusPicker && (
                <View style={styles.pickerOptions}>
                  {cardStatusOptions.map((option) => (
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
              <TagInput
                tags={tags}
                onTagsChange={(newTags) => {
                  // Always ensure 'Card' tag is present and first
                  const filteredTags = newTags.filter(tag => tag !== 'Card');
                  setTags(['Card', ...filteredTags]);
                }}
                placeholder="Add tag (e.g., Magic, Star Wars Unlimited)..."
                maxTags={10}
                protectedTags={['Card']}
              />
            </View>

            <View style={styles.formGroup}>
              <ImageCapture
                onImageSelected={handleImageSelected}
                onImageRemoved={() => setThumbnail('')}
                imageUri={thumbnail}
                itemType="Card"
                label="Card Thumbnail"
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