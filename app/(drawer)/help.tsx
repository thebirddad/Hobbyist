import React from 'react';
import { Alert, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <IconSymbol name="questionmark.circle.fill" size={60} color={tintColor} />
          <ThemedText style={styles.title}>Help & Support</ThemedText>
          <ThemedText style={styles.subtitle}>We're here to help you succeed</ThemedText>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Get in Touch</ThemedText>
          <ThemedText style={styles.description}>
            Have questions, suggestions, or encountered an issue? We'd love to hear from you and help make your hobby tracking experience better.
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

        <View style={styles.supportInfo}>
          <View style={styles.infoItem}>
            <IconSymbol name="clock.fill" size={20} color="#666" />
            <ThemedText style={styles.infoText}>
              We typically respond within 24 hours
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark.circle.fill" size={20} color="#666" />
            <ThemedText style={styles.infoText}>
              All feedback helps improve the app
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    justifyContent: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
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
});