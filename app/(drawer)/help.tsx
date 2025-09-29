import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ClearDataButton from '@/components/clear-data-button';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHobbyStorage } from '@/hooks/use-hobby-storage';
import { HobbyExportService } from '@/services/export-service';

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const { hobbies, saveHobbies } = useHobbyStorage();

  const handleEmailPress = async () => {
    const email = 'hobbyistappdevelopment@gmail.com';
    const subject = 'Hobbyist App - Support Request';
    const body = 'Hi there,\n\nI have a question/request regarding the Hobbyist app:\n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Email Not Available',
          'Please send an email to:\nhobbyistappdevelopment@gmail.com',
          [
            {
              text: 'Copy Email',
              onPress: () => {
                // Note: Clipboard would require @react-native-clipboard/clipboard
                Alert.alert('Email Address', 'hobbyistappdevelopment@gmail.com');
              }
            },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to open email client. Please contact:\nhobbyistappdevelopment@gmail.com'
      );
    }
  };

  const handleExport = async () => {
    try {
      await HobbyExportService.exportAndShareCSV(hobbies, {
        includeHobbyInfo: true,
        includeItems: true,
        flattenData: true
      });
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    }
  };

  const handleImport = async () => {
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
    try {
      const importedHobbies = await HobbyExportService.importFromCSV();
      
      let finalHobbies = importedHobbies;
      
      if (mergeWithExisting && hobbies.length > 0) {
        // Simple merge logic - you can enhance this
        const existingNames = new Set(hobbies.map(h => h.name));
        const newHobbies = importedHobbies.filter(h => !existingNames.has(h.name));
        finalHobbies = [...hobbies, ...newHobbies];
      }
      
      await saveHobbies(finalHobbies);
      
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
        return;
      }
      
      Alert.alert(
        'Import Failed',
        `Unable to import data: ${errorMessage}\n\nMake sure your CSV data is in the correct format.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${tintColor}15` }]}>
            <IconSymbol name="questionmark.circle.fill" size={40} color={tintColor} />
          </View>
          <ThemedText style={styles.title}>Help & Support</ThemedText>
          <ThemedText style={styles.subtitle}>Professional assistance for your hobby management needs</ThemedText>
        </View>
        {/* Quick Actions Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <ThemedText style={styles.description}>
            Essential tools for managing your hobby data. Import uses text paste (not file upload).
          </ThemedText>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { borderColor: tintColor + '20' }]} 
              onPress={handleExport}
              activeOpacity={0.7}
            >
              <IconSymbol name="square.and.arrow.up" size={24} color={tintColor} />
              <ThemedText style={styles.quickActionTitle}>Export Data</ThemedText>
              <ThemedText style={styles.quickActionDesc}>Backup your hobbies</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionCard, { borderColor: tintColor + '20' }]} 
              onPress={handleImport}
              activeOpacity={0.7}
            >
              <IconSymbol name="square.and.arrow.down" size={24} color={tintColor} />
              <ThemedText style={styles.quickActionTitle}>Import Data</ThemedText>
              <ThemedText style={styles.quickActionDesc}>Upload file or paste CSV data</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <View style={styles.dataButtons}>
            <ClearDataButton />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Professional Support</ThemedText>
          <ThemedText style={styles.description}>
            Our dedicated support team is ready to assist with technical issues, feature requests, and general inquiries.
          </ThemedText>
        </View>

        <TouchableOpacity 
          style={[styles.emailButton, { borderColor: tintColor }]} 
          onPress={handleEmailPress}
          activeOpacity={0.7}
        >
          <IconSymbol name="envelope.fill" size={24} color={tintColor} />
          <View style={styles.emailContent}>
            <ThemedText style={[styles.emailLabel, { color: tintColor }]}>
              Contact Support
            </ThemedText>
            <ThemedText style={styles.emailAddress}>
              hobbyistappdevelopment@gmail.com
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={16} color={tintColor} />
        </TouchableOpacity>

        

        {/* Service Level Information */}
        <View style={styles.serviceLevel}>
          <View style={styles.serviceItem}>
            <View style={[styles.serviceBadge, { backgroundColor: `${tintColor}15` }]}>
              <IconSymbol name="clock.fill" size={18} color={tintColor} />
            </View>
            <View style={styles.serviceContent}>
              <ThemedText style={styles.serviceTitle}>Response Time</ThemedText>
              <ThemedText style={styles.serviceDesc}>24-hour response commitment</ThemedText>
            </View>
          </View>
          <View style={styles.serviceItem}>
            <View style={[styles.serviceBadge, { backgroundColor: `${tintColor}15` }]}>
              <IconSymbol name="shield.checkerboard" size={18} color={tintColor} />
            </View>
            <View style={styles.serviceContent}>
              <ThemedText style={styles.serviceTitle}>Data Privacy</ThemedText>
              <ThemedText style={styles.serviceDesc}>
  Your privacy is our priority. All of your data is stored directly on your device, 
  ensuring that none of it is shared with us or anyone else.
</ThemedText>
            </View>
          </View>
          <View style={styles.serviceItem}>
            <View style={[styles.serviceBadge, { backgroundColor: `${tintColor}15` }]}>
              <IconSymbol name="star.fill" size={18} color={tintColor} />
            </View>
            <View style={styles.serviceContent}>
              <ThemedText style={styles.serviceTitle}>Continuous Improvement</ThemedText>
              <ThemedText style={styles.serviceDesc}>Regular updates based on your feedback</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 8,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  emailContent: {
    flex: 1,
    marginLeft: 16,
  },
  emailLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emailAddress: {
    fontSize: 14,
    opacity: 0.7,
  },
  supportInfo: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    opacity: 0.7,
    flex: 1,
  },
  dataButtons: {
    marginTop: 20,
    gap: 10,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionDesc: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  faqContainer: {
    marginTop: 16,
    gap: 16,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  faqContent: {
    flex: 1,
    marginLeft: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  serviceLevel: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    gap: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceContent: {
    flex: 1,
    marginLeft: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 14,
    opacity: 0.7,
  },
});