import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Hobby } from '@/data/hobby';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHobbyStorage } from '@/hooks/use-hobby-storage';
import { HobbyExportService } from '@/services/export-service';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ImportButtonProps {
  style?: any;
}

export default function ImportButton({ style }: ImportButtonProps) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const { hobbies, saveHobbies } = useHobbyStorage();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    // Show import options with clear explanation
    Alert.alert(
      'Import Hobby Data',
      'Import works by pasting CSV text (not file upload).\n\n⚠️ iOS Limitation: The text input may not handle multi-line CSV properly. If import fails, try smaller sections.\n\nChoose your import method:',
      [
        {
          text: 'Replace All Data',
          onPress: () => importFromText(false),
          style: 'destructive'
        },
        {
          text: 'Merge with Existing',
          onPress: () => importFromText(true),
          style: 'default'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const importFromText = async (mergeWithExisting: boolean = false) => {
    setIsImporting(true);
    
    try {
      const importedHobbies = await HobbyExportService.importFromCSV();
      
      let finalHobbies = importedHobbies;
      
      if (mergeWithExisting && hobbies.length > 0) {
        // Merge imported hobbies with existing ones
        const existingHobbyMap = new Map<string, Hobby>(
          hobbies.map(h => [`${h.name}-${h.type}`, h])
        );
        
        importedHobbies.forEach(importedHobby => {
          const key = `${importedHobby.name}-${importedHobby.type}`;
          const existingHobby = existingHobbyMap.get(key);
          
          if (existingHobby) {
            // Merge items from imported hobby into existing hobby
            if (importedHobby.items && importedHobby.items.length > 0) {
              const existingItemIds = new Set(existingHobby.items?.map((item: any) => item.id) || []);
              const newItems = importedHobby.items.filter((item: any) => !existingItemIds.has(item.id));
              
              if (existingHobby.items && existingHobby.items.length > 0) {
                (existingHobby.items as any[]).push(...newItems);
              } else {
                (existingHobby as any).items = newItems;
              }
            }
          } else {
            // Add new hobby
            existingHobbyMap.set(key, importedHobby);
          }
        });
        
        finalHobbies = Array.from(existingHobbyMap.values());
      }
      
      await saveHobbies(finalHobbies);
      
      // Show success message
      const importStats = HobbyExportService.getExportStats(importedHobbies);
      Alert.alert(
        'Import Successful! 🎉',
        `Imported ${importStats.totalHobbies} hobbies with ${importStats.totalItems} total items.${mergeWithExisting ? '\n\nData has been merged with your existing hobbies.' : '\n\nPrevious data has been replaced.'}`,
        [{ text: 'Great!' }]
      );
      
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage === 'Import cancelled') {
        // User cancelled, don't show error
        return;
      }
      
      Alert.alert(
        'Import Failed',
        `Unable to import data: ${errorMessage}\n\nMake sure your CSV data is in the correct format.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.importButton, { borderColor: tintColor }, style]}
      onPress={handleImport}
      disabled={isImporting}
      activeOpacity={0.7}
    >
      <View style={styles.importContent}>
        <IconSymbol 
          name={isImporting ? "arrow.clockwise" : "square.and.arrow.down"} 
          size={24} 
          color={tintColor} 
        />
        <View style={styles.importText}>
          <Text style={[styles.importTitle, { color: tintColor }]}>
            {isImporting ? 'Importing...' : 'Import Data'}
          </Text>
          <Text style={styles.importSubtitle}>
            Paste CSV text (not file upload)
          </Text>
        </View>
        {isImporting && (
          <ActivityIndicator size="small" color={tintColor} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  importButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginVertical: 8,
  },
  importContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  importText: {
    flex: 1,
    marginLeft: 12,
  },
  importTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  importSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});