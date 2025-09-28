import { HobbyForm } from '@/components/hobby-form';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function HobbiesScreen() {
  const router = useRouter();

  const handleHobbyCreated = () => {
    // Navigate back and force refresh by going to index then back
    router.push('/(drawer)');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HobbyForm onHobbyCreated={handleHobbyCreated} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});