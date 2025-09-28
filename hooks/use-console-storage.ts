import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface Console {
  id: string;
  name: string;
  dateAdded: string;
}

const STORAGE_KEY = '@game_tracker_consoles';

// Default consoles that come with the app
const DEFAULT_CONSOLES: Console[] = [
  { id: '1', name: 'PC', dateAdded: new Date().toISOString() },
  { id: '2', name: 'PlayStation 5', dateAdded: new Date().toISOString() },
];

export const useConsoleStorage = () => {
  const [consoles, setConsoles] = useState<Console[]>([]);
  const [loading, setLoading] = useState(true);

  // Load consoles from storage
  const loadConsoles = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConsoles(parsed);
      } else {
        // First time - initialize with default consoles
        setConsoles(DEFAULT_CONSOLES);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONSOLES));
      }
    } catch (error) {
      console.error('Failed to load consoles:', error);
      setConsoles(DEFAULT_CONSOLES);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save consoles to storage
  const saveConsoles = useCallback(async (consolesToSave: Console[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(consolesToSave));
      setConsoles(consolesToSave);
    } catch (error) {
      console.error('Failed to save consoles:', error);
      throw error;
    }
  }, []);

  // Add a new console
  const addConsole = useCallback(async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Console name cannot be empty');
    }

    // Check if console already exists
    const exists = consoles.some(console => 
      console.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (exists) {
      throw new Error('A console with this name already exists');
    }

    const newConsole: Console = {
      id: Date.now().toString(),
      name: trimmedName,
      dateAdded: new Date().toISOString(),
    };

    const updatedConsoles = [...consoles, newConsole];
    await saveConsoles(updatedConsoles);
    return newConsole;
  }, [consoles, saveConsoles]);

  // Delete a console
  const deleteConsole = useCallback(async (id: string) => {
    console.log('deleteConsole called with ID:', id);
    console.log('Current consoles:', consoles.map(c => ({ id: c.id, name: c.name })));
    const updatedConsoles = consoles.filter(console => console.id !== id);
    console.log('Updated consoles after filter:', updatedConsoles.map(c => ({ id: c.id, name: c.name })));
    await saveConsoles(updatedConsoles);
    console.log('Console deletion completed');
  }, [consoles, saveConsoles]);

  // Update a console
  const updateConsole = useCallback(async (id: string, name: string) => {
    console.log('updateConsole called with ID:', id, 'and name:', name);
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Console name cannot be empty');
    }

    // Check if another console already has this name
    const exists = consoles.some(console => 
      console.id !== id && console.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (exists) {
      throw new Error('A console with this name already exists');
    }

    const updatedConsoles = consoles.map(console =>
      console.id === id ? { ...console, name: trimmedName } : console
    );
    
    console.log('Updated consoles for update:', updatedConsoles.map(c => ({ id: c.id, name: c.name })));
    await saveConsoles(updatedConsoles);
    console.log('Console update completed');
  }, [consoles, saveConsoles]);

  // Get console names as array (for compatibility with existing code)
  const getConsoleNames = useCallback(() => {
    return consoles.map(console => console.name).sort();
  }, [consoles]);

  useEffect(() => {
    loadConsoles();
  }, [loadConsoles]);

  return {
    consoles,
    loading,
    addConsole,
    deleteConsole,
    updateConsole,
    getConsoleNames,
    reload: loadConsoles,
  };
};