import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHobbyStorage } from '@/hooks/use-hobby-storage';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ClearDataButtonProps {
  style?: any;
}

export default function ClearDataButton({ style }: ClearDataButtonProps) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const { hobbies, saveHobbies } = useHobbyStorage();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearData = () => {
    if (hobbies.length === 0) {
      Alert.alert(
        'No Data to Clear',
        'You don\'t have any hobby data to clear.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      '⚠️ Clear All Data',
      `This will permanently delete all your hobby data including:\n\n• ${hobbies.length} ${hobbies.length === 1 ? 'hobby' : 'hobbies'}\n• All items within your hobbies\n• Activity history\n\nThis action cannot be undone. Consider exporting your data first as a backup.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Export First',
          onPress: () => {
            Alert.alert(
              'Good Choice! 👍',
              'Please use the Export Data button above to backup your data first, then return here to clear if needed.',
              [{ text: 'Got it' }]
            );
          },
          style: 'default'
        },
        {
          text: 'Clear All Data',
          onPress: () => confirmClearData(),
          style: 'destructive'
        }
      ]
    );
  };

  const confirmClearData = () => {
    Alert.alert(
      '🚨 Final Confirmation',
      'Are you absolutely sure you want to delete ALL your hobby data? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Yes, Delete Everything',
          onPress: () => performClearData(),
          style: 'destructive'
        }
      ]
    );
  };

  const performClearData = async () => {
    setIsClearing(true);
    
    try {
      // Clear all hobby data
      await saveHobbies([]);
      
      // Show success message
      Alert.alert(
        'Data Cleared Successfully! 🧹',
        'All your hobby data has been permanently deleted. You can start fresh by adding new hobbies.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Clear data error:', error);
      Alert.alert(
        'Clear Failed',
        'Unable to clear data. Please try again or contact support if the problem persists.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.clearButton, style]}
      onPress={handleClearData}
      disabled={isClearing}
      activeOpacity={0.7}
    >
      <View style={styles.clearContent}>
        <IconSymbol 
          name={isClearing ? "arrow.clockwise" : "trash.fill"} 
          size={24} 
          color="#ff4444" 
        />
        <View style={styles.clearText}>
          <Text style={styles.clearTitle}>
            {isClearing ? 'Clearing Data...' : 'Clear All Data'}
          </Text>
          <Text style={styles.clearSubtitle}>
            Permanently delete all hobbies
          </Text>
        </View>
        {isClearing && (
          <ActivityIndicator size="small" color="#ff4444" />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  clearButton: {
    borderWidth: 2,
    borderColor: '#ff4444',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
    marginVertical: 8,
  },
  clearContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearText: {
    flex: 1,
    marginLeft: 12,
  },
  clearTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
    marginBottom: 2,
  },
  clearSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});