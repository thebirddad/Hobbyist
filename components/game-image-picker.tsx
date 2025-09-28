import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface GameImagePickerProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
}

export const GameImagePicker: React.FC<GameImagePickerProps> = ({
  imageUri,
  onImageSelected,
  onImageRemoved,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    // Request camera permissions
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus.status !== 'granted' || mediaLibraryStatus.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Sorry, we need camera and photo library permissions to add game thumbnails.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Portrait aspect ratio for game covers
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImageFromLibrary = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Portrait aspect ratio for game covers
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showImagePicker = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImageFromCamera();
          } else if (buttonIndex === 2) {
            pickImageFromLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        'Add Game Photo',
        'Choose how you want to add a photo for this game',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: pickImageFromCamera },
          { text: 'Choose from Library', onPress: pickImageFromLibrary },
        ]
      );
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onImageRemoved },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Game Photo</Text>
      
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.thumbnail} />
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={showImagePicker}
              disabled={isLoading}
            >
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveImage}
              disabled={isLoading}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={showImagePicker}
          disabled={isLoading}
        >
          <View style={styles.addPhotoContent}>
            <Text style={styles.addPhotoIcon}>📷</Text>
            <Text style={styles.addPhotoText}>
              {isLoading ? 'Loading...' : 'Add Game Photo'}
            </Text>
            <Text style={styles.addPhotoSubtext}>
              Take a photo or choose from library
            </Text>
          </View>
        </TouchableOpacity>
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
    color: '#333',
    marginBottom: 8,
  },
  imageContainer: {
    alignItems: 'center',
  },
  thumbnail: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  changeButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addPhotoButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  addPhotoContent: {
    alignItems: 'center',
  },
  addPhotoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addPhotoSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});