import React from 'react';
import { StyleSheet, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HelpScreen() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Help & Support</ThemedText>
        
        <View style={styles.messageContainer}>
          <ThemedText style={styles.message}>
            Have questions, requests, or run into an issue?
          </ThemedText>
          <ThemedText style={styles.message}>
            We'd love to hear from you!
          </ThemedText>
          
          <ThemedText style={styles.emailText}>
            📩 Please reach out anytime at: hobbyistappdevelopment@gmail.com
          </ThemedText>
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
});