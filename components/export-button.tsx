import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHobbyStorage } from '@/hooks/use-hobby-storage';
import { ExportOptions, HobbyExportService } from '@/services/export-service';
import { SimpleExportService } from '@/services/simple-export-service';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ExportButtonProps {
  style?: any;
}

export default function ExportButton({ style }: ExportButtonProps) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const { hobbies } = useHobbyStorage();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (hobbies.length === 0) {
      Alert.alert(
        'No Data to Export',
        'You don\'t have any hobbies to export yet. Create some hobbies first!',
        [{ text: 'OK' }]
      );
      return;
    }

    // Show export options
    Alert.alert(
      'Export Hobby Data',
      'Choose export format:',
      [
        {
          text: 'Complete Export',
          onPress: () => exportData(true),
          style: 'default'
        },
        {
          text: 'Summary Only',
          onPress: () => exportData(false),
          style: 'default'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const exportData = async (comprehensive: boolean) => {
    setIsExporting(true);
    
    try {
      const options: ExportOptions = {
        includeHobbyInfo: true,
        includeItems: comprehensive,
        flattenData: true
      };

      await HobbyExportService.exportAndShareCSV(hobbies, options);
      
      // Show success message
      const stats = HobbyExportService.getExportStats(hobbies);
      Alert.alert(
        'Export Successful! 🎉',
        `Exported ${stats.totalHobbies} hobbies with ${stats.totalItems} total items.\n\nThe CSV file is ready to share!`,
        [{ text: 'Great!' }]
      );
      
    } catch (error) {
      console.error('Export error:', error);
      
      // Offer fallback option
      Alert.alert(
        'Export Issue',
        'There was an issue with file sharing. Would you like to try a simple text export instead?',
        [
          {
            text: 'Try Simple Export',
            onPress: async () => {
              try {
                await SimpleExportService.exportAsText(hobbies);
              } catch (fallbackError) {
                Alert.alert(
                  'Export Failed',
                  'Unable to export data. Please try again later.',
                  [{ text: 'OK' }]
                );
              }
            }
          },
          { text: 'Cancel' }
        ]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const stats = HobbyExportService.getExportStats(hobbies);

  return (
    <TouchableOpacity
      style={[styles.exportButton, { borderColor: tintColor }, style]}
      onPress={handleExport}
      disabled={isExporting}
      activeOpacity={0.7}
    >
      <View style={styles.exportContent}>
        <IconSymbol 
          name={isExporting ? "arrow.clockwise" : "square.and.arrow.up"} 
          size={24} 
          color={tintColor} 
        />
        <View style={styles.exportText}>
          <Text style={[styles.exportTitle, { color: tintColor }]}>
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Text>
          <Text style={styles.exportSubtitle}>
            {stats.totalHobbies} hobbies • {stats.totalItems} items
          </Text>
        </View>
        {isExporting && (
          <ActivityIndicator size="small" color={tintColor} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  exportButton: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginVertical: 8,
  },
  exportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportText: {
    flex: 1,
    marginLeft: 12,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  exportSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});