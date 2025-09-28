import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const ImagePickerDebugTool: React.FC = () => {
  const [lastSelectedUri, setLastSelectedUri] = useState<string>('');

  const testImagePicker = async () => {
    console.log('🔧 DEBUG: Testing image picker...');
    
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('🔧 DEBUG: Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need photo library access');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      console.log('🔧 DEBUG: Image picker result:', {
        canceled: result.canceled,
        assetsLength: result.assets?.length,
        firstAsset: result.assets?.[0]
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        console.log('🔧 DEBUG: Selected image URI:', uri);
        console.log('🔧 DEBUG: URI type:', typeof uri);
        console.log('🔧 DEBUG: URI length:', uri.length);
        setLastSelectedUri(uri);
        
        // Test if URI is accessible
        try {
          const response = await fetch(uri);
          console.log('🔧 DEBUG: URI fetch test - status:', response.status);
        } catch (fetchError) {
          console.log('🔧 DEBUG: URI fetch test failed:', fetchError);
        }
      }
    } catch (error) {
      console.error('🔧 DEBUG: Image picker error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={testImagePicker}>
        <Text style={styles.buttonText}>🔧 Test Image Picker</Text>
      </TouchableOpacity>
      {lastSelectedUri ? (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Last Selected URI:</Text>
          <Text style={styles.resultText} numberOfLines={3}>
            {lastSelectedUri}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  button: {
    backgroundColor: '#ff7675',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  result: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});