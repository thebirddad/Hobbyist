import { ImageCapture } from '@/components/image-picker';
import { TagInput } from '@/components/tag-input';
import { CardItem, CardStatus, CardType } from '@/data/hobby';
import * as FileSystem from 'expo-file-system/legacy';
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
  mode = 'add',
}) => {
  // --- Form State ---
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
  const [rarity, setRarity] = useState(initialCardItem?.rarity || '');
  const [artist, setArtist] = useState(initialCardItem?.artist || '');
  const [typeLine, setTypeLine] = useState(initialCardItem?.typeLine || '');
  const [power, setPower] = useState(initialCardItem?.power || '');
  const [toughness, setToughness] = useState(initialCardItem?.toughness || '');
  const [keywords, setKeywords] = useState(initialCardItem?.keywords || []);

  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const cardStatusOptions = Object.values(CardStatus).map(status => ({ key: status, label: status }));
  const cardTypeOptions = Object.values(CardType).map(type => ({ key: type, label: type }));

  // --- Initialize form ---
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
      setRarity(initialCardItem.rarity || '');
      setArtist(initialCardItem.artist || '');
      setTypeLine(initialCardItem.typeLine || '');
      setPower(initialCardItem.power || '');
      setToughness(initialCardItem.toughness || '');
      setKeywords(initialCardItem.keywords || []);
      const initialTags = initialCardItem.tags || [];
      setTags(['Card', ...initialTags.filter(tag => tag !== 'Card')]);
    } else if (mode === 'add') {
      resetForm();
    }
  }, [initialCardItem, mode]);

  const resetForm = useCallback(() => {
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
    setRarity('');
    setArtist('');
    setTypeLine('');
    setPower('');
    setToughness('');
    setKeywords([]);
    setTags(['Card']);
    setShowStatusPicker(false);
    setShowTypePicker(false);
  }, []);

  // --- OCR & Scryfall ---
  const OCR_SPACE_API_KEY = 'K87445194388957';

  const runOCR = async (imageUri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
      const formData = new FormData();
      formData.append('base64Image', `data:image/jpeg;base64,${base64}`);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: { apikey: OCR_SPACE_API_KEY },
        body: formData,
      });

      const data = await response.json();
      if (data.OCRExitCode !== 1 || !data.ParsedResults?.length) return '';
      return data.ParsedResults[0].ParsedText || '';
    } catch (err) {
      console.error('OCR error:', err);
      return '';
    }
  };

  async function fetchCardByName(cardName: string) {
    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`
      );
      if (!response.ok) throw new Error('Card not found');
      return await response.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  const extractCardName = (ocrText: string): string => {
    const lines = ocrText.split('\n').map(line => line.trim()).filter(Boolean);
    return lines[0] || '';
  };

  const handleImageSelected = useCallback(async (uri: string) => {
    setThumbnail(uri);

    try {
      const ocrText = await runOCR(uri);
      const detectedName = extractCardName(ocrText);

      if (!detectedName) return;
      setCardName(detectedName);

      const cardData = await fetchCardByName(detectedName);
      if (!cardData) return;

      // --- Map Scryfall data to form ---
      setCardName(cardData.name || detectedName);
      setSetName(cardData.set_name || '');
      setCollectorNumber(cardData.collector_number || '');
      setCondition('Near Mint'); // default
      setType(CardType.NON_FOIL); // default
      setQuantity('1'); // default
      setCurrentValue(cardData.prices?.usd || '');
      setPricePaid(cardData.prices?.usd_foil || '');
      setThumbnail(cardData.image_uris?.normal || uri);
      setRarity(cardData.rarity || '');
      setArtist(cardData.artist || '');
      setTypeLine(cardData.type_line || '');
      setPower(cardData.power || '');
      setToughness(cardData.toughness || '');
      setKeywords(cardData.keywords || []);

      const newTags = ['Card', ...(cardData.keywords || [])];
      setTags(newTags);

    } catch (err) {
      console.error('Failed to fetch card info:', err);
    }
  }, []);

  // --- Form Submit ---
const handleSubmit = () => {
  if (!cardName.trim()) {
    Alert.alert('Error', 'Please enter a card name');
    return;
  }

  const cardData: Omit<CardItem, 'id' | 'dateAdded'> = {
    // Required fields
    title: cardName.trim(),
    cardName: cardName.trim(),
    typeLine: typeLine || '',        // required
    setName: setName.trim(),
    setCode: '',                      // you may need to get this from Scryfall if possible
    collectorNumber: collectorNumber.trim(),
    status,
    type,
    condition: condition.trim(),
    quantity: parseInt(quantity, 10) || 1,

    // Optional / extra fields
    pricePaid: pricePaid ? parseFloat(pricePaid) : undefined,
    currentValue: currentValue ? parseFloat(currentValue) : undefined,
    rarity: rarity || undefined,
    artist: artist || undefined,
    power: power || undefined,
    toughness: toughness || undefined,
    keywords: keywords.length ? keywords : undefined,
    imageUris: thumbnail ? { normal: thumbnail } : undefined,
    tags: tags.length ? tags : undefined,
  };

  onSubmit(cardData);
  resetForm();
  onClose();
};


  const handleCancel = () => {
    resetForm();
    onClose();
  };


  // --- Render ---
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}><Text style={styles.cancelButton}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>{mode === 'add' ? 'Add a Card' : 'Edit a Card'}</Text>
          <TouchableOpacity onPress={handleSubmit}><Text style={styles.saveButton}>Save</Text></TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Card Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Card Name *</Text>
              <TextInput
                style={styles.input}
                value={cardName}
                onChangeText={setCardName}
                placeholder="Enter card name..."
              />
            </View>

            {/* Set Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Set Name</Text>
              <TextInput style={styles.input} value={setName} onChangeText={setSetName} />
            </View>

            {/* Collector Number */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Collector Number</Text>
              <TextInput style={styles.input} value={collectorNumber} onChangeText={setCollectorNumber} />
            </View>

            {/* Condition */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Condition</Text>
              <TextInput style={styles.input} value={condition} onChangeText={setCondition} />
            </View>

            {/* Quantity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>

            {/* Price Paid */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Price Paid</Text>
              <TextInput
                style={styles.input}
                value={pricePaid}
                onChangeText={setPricePaid}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Current Value */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Value</Text>
              <TextInput
                style={styles.input}
                value={currentValue}
                onChangeText={setCurrentValue}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Rarity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Rarity</Text>
              <TextInput style={styles.input} value={rarity} onChangeText={setRarity} />
            </View>

            {/* Artist */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Artist</Text>
              <TextInput style={styles.input} value={artist} onChangeText={setArtist} />
            </View>

            {/* Type Line */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Type Line</Text>
              <TextInput style={styles.input} value={typeLine} onChangeText={setTypeLine} />
            </View>

            {/* Power/Toughness */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Power / Toughness</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput style={[styles.input, { flex: 1 }]} value={power} onChangeText={setPower} placeholder="Power" keyboardType="numeric" />
                <TextInput style={[styles.input, { flex: 1 }]} value={toughness} onChangeText={setToughness} placeholder="Toughness" keyboardType="numeric" />
              </View>
            </View>

            {/* Keywords */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Keywords</Text>
              <TextInput
                style={styles.input}
                value={keywords.join(', ')}
                onChangeText={text => setKeywords(text.split(',').map(k => k.trim()).filter(Boolean))}
                placeholder="Enter keywords separated by commas"
              />

              <View style={styles.formGroup}>
                <TagInput
                  tags={tags}
                  onTagsChange={newTags => setTags(['Card', ...newTags.filter(tag => tag !== 'Card')])}
                  placeholder="Add tags (e.g., Magic, Star Wars Unlimited)"
                  maxTags={10}
                  protectedTags={['Card']}
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
                    {cardStatusOptions.map(option => (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.pickerOption,
                          status === option.key && styles.pickerOptionSelected,
                        ]}
                        onPress={() => {
                          setStatus(option.key);
                          setShowStatusPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            status === option.key && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#000' },
  cancelButton: { fontSize: 16, color: '#666' },
  saveButton: { fontSize: 16, color: '#4a90e2', fontWeight: '600' },
  scrollView: { flex: 1 },
  form: { padding: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000' },
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
  pickerButtonText: { fontSize: 16, color: '#000' },
  pickerArrow: { fontSize: 12, color: '#666' },
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
  pickerOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pickerOptionSelected: { backgroundColor: '#e3f2fd' },
  pickerOptionText: { fontSize: 16, color: '#000' },
  pickerOptionTextSelected: { color: '#1976d2', fontWeight: '600' },
});

