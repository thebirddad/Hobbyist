import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { HobbyType } from '@/data/hobby';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHobbyStorage } from '@/hooks/use-hobby-storage';

function CustomDrawerContent(props: any) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const { hobbies, canAddHobby, loading } = useHobbyStorage();

  const getHobbyIcon = (type: HobbyType) => {
    switch (type) {
      case HobbyType.GAMES:
        return 'gamecontroller.fill';
      case HobbyType.BOOKS:
        return 'book.fill';
      case HobbyType.TV_FILM:
        return 'tv.fill';
      case HobbyType.CUSTOM:
        return 'star.fill';
      default:
        return 'folder.fill';
    }
  };

  return (
    <SafeAreaView style={styles.drawerContainer}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <IconSymbol name="gamecontroller.fill" size={40} color={tintColor} />
          <Text style={[styles.drawerTitle, { color: tintColor }]}>
            Hobbyist
          </Text>
        </View>
        
        <DrawerItem
          label="Home"
          onPress={() => router.push('/')}
          icon={({ color, size }) => (
            <IconSymbol name="house.fill" size={size} color={color} />
          )}
          activeTintColor={tintColor}
          inactiveTintColor="#666"
        />
        
        {canAddHobby() && (
          <DrawerItem
            label="Create Hobby"
            onPress={() => router.push('/(drawer)/hobbies')}
            icon={({ color, size }) => (
              <IconSymbol name="plus.circle.fill" size={size} color={color} />
            )}
            activeTintColor={tintColor}
            inactiveTintColor="#666"
          />
        )}
        
        {hobbies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Hobbies</Text>
            {hobbies.map((hobby) => (
              <DrawerItem
                key={hobby.id}
                label={hobby.name}
                onPress={() => {
                  // For now, navigate to a hobby page with the ID as a param
                  router.push({
                    pathname: '/(drawer)/hobby-detail',
                    params: { hobbyId: hobby.id, hobbyName: hobby.name }
                  });
                }}
                icon={({ color, size }) => (
                  <IconSymbol name={getHobbyIcon(hobby.type)} size={size} color={color} />
                )}
                activeTintColor={tintColor}
                inactiveTintColor="#666"
              />
            ))}
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legacy Gaming</Text>
          <DrawerItem
            label="Currently Playing"
            onPress={() => router.push('/playing')}
            icon={({ color, size }) => (
              <IconSymbol name="play.circle.fill" size={size} color={color} />
            )}
            activeTintColor={tintColor}
            inactiveTintColor="#666"
          />
          
          <DrawerItem
            label="Game Library"
            onPress={() => router.push('/library')}
            icon={({ color, size }) => (
              <IconSymbol name="list.bullet" size={size} color={color} />
            )}
            activeTintColor={tintColor}
            inactiveTintColor="#666"
          />
          
          <DrawerItem
            label="Consoles"
            onPress={() => router.push('/consoles')}
            icon={({ color, size }) => (
              <IconSymbol name="gamecontroller.fill" size={size} color={color} />
            )}
            activeTintColor={tintColor}
            inactiveTintColor="#666"
          />
        </View>
      </DrawerContentScrollView>
      
      <View style={styles.drawerFooter}>
        <Text style={styles.footerText}>
          Your hobby companion
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        drawerInactiveTintColor: '#666',
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Home',
          title: 'Hobbyist',
        }}
      />
      <Drawer.Screen
        name="hobbies"
        options={{
          drawerLabel: 'Create Hobby',
          title: 'Create New Hobby',
        }}
      />
      <Drawer.Screen
        name="playing"
        options={{
          drawerLabel: 'Currently Playing',
          title: 'Currently Playing',
        }}
      />
      <Drawer.Screen
        name="library"
        options={{
          drawerLabel: 'Game Library',
          title: 'Game Library',
        }}
      />
      <Drawer.Screen
        name="consoles"
        options={{
          drawerLabel: 'Consoles',
          title: 'Consoles',
        }}
      />
      <Drawer.Screen
        name="hobby-detail"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Hobby Details',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
