import { BaseHobby, BookStatus, GameStatus, Hobby, TvFilmStatus } from '@/data/hobby';
import { addActivityToStorage } from '@/utils/activity-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const HOBBIES_STORAGE_KEY = 'hobbies_data';
const MAX_HOBBIES = 7;

export const useHobbyStorage = () => {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);

  // Load hobbies from storage on mount
  useEffect(() => {
    loadHobbies();
  }, []);

  const loadHobbies = async () => {
    try {
      const storedHobbies = await AsyncStorage.getItem(HOBBIES_STORAGE_KEY);
      if (storedHobbies) {
        const parsedHobbies = JSON.parse(storedHobbies);
        setHobbies(parsedHobbies);
      }
    } catch (error) {
      console.error('Failed to load hobbies:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHobbies = async (hobbiesToSave: Hobby[]) => {
    try {
      const jsonData = JSON.stringify(hobbiesToSave);
      await AsyncStorage.setItem(HOBBIES_STORAGE_KEY, jsonData);
      setHobbies(hobbiesToSave);
    } catch (error) {
      console.error('Failed to save hobbies:', error);
    }
  };

  const addHobby = async (hobbyData: Omit<BaseHobby, 'id'>) => {
    if (hobbies.length >= MAX_HOBBIES) {
      throw new Error(`Maximum of ${MAX_HOBBIES} hobbies allowed`);
    }

    console.log('🎯 Adding new hobby:', hobbyData.name, 'type:', hobbyData.type);
    
    // Create hobby with empty items array based on type
    const newHobby: Hobby = {
      ...hobbyData,
      id: Date.now().toString(),
      items: []
    } as Hobby;

    const updatedHobbies = [...hobbies, newHobby];
    await saveHobbies(updatedHobbies);
  };

  const updateHobby = async (id: string, updates: Partial<BaseHobby>) => {
    const updatedHobbies = hobbies.map(hobby => {
      if (hobby.id === id) {
        return { ...hobby, ...updates };
      }
      return hobby;
    });
    await saveHobbies(updatedHobbies as Hobby[]);
  };

  const deleteHobby = async (id: string) => {
    const updatedHobbies = hobbies.filter(hobby => hobby.id !== id);
    await saveHobbies(updatedHobbies);
  };

  const addItemToHobby = async (hobbyId: string, item: any) => {
    const hobby = hobbies.find(h => h.id === hobbyId);
    if (!hobby) return;

    const updatedHobbies = hobbies.map(h => {
      if (h.id === hobbyId) {
        const newItem = {
          ...item,
          id: Date.now().toString(),
          dateAdded: new Date().toISOString(),
        };
        return {
          ...h,
          items: [...h.items, newItem]
        } as Hobby;
      }
      return h;
    });
    await saveHobbies(updatedHobbies);

    // Track activity
    const itemTitle = item.title || item.name;
    const statusLabel = item.status || '';
    await addActivityToStorage({
      type: 'added',
      itemTitle,
      hobbyName: hobby.name,
      hobbyType: hobby.type,
      status: statusLabel,
    });
  };

  const updateItemInHobby = async (hobbyId: string, itemId: string, updates: any) => {
    const hobby = hobbies.find(h => h.id === hobbyId);
    const existingItem = hobby?.items.find(item => item.id === itemId);
    
    const updatedHobbies = hobbies.map(h => {
      if (h.id === hobbyId) {
        const updatedItems = h.items.map(item => {
          if (item.id === itemId) {
            return { ...item, ...updates };
          }
          return item;
        });
        return { ...h, items: updatedItems } as Hobby;
      }
      return h;
    });
    await saveHobbies(updatedHobbies);

    // Track completion activity if status changed to completed
    if (hobby && existingItem) {
      const itemTitle = (existingItem as any).title || (existingItem as any).name;
      const oldStatus = (existingItem as any).status;
      const newStatus = updates.status;
      
      const isNowCompleted = 
        newStatus === GameStatus.COMPLETED ||
        newStatus === BookStatus.COMPLETED ||
        newStatus === TvFilmStatus.WATCHED;
        
      const wasNotCompletedBefore = 
        oldStatus !== GameStatus.COMPLETED &&
        oldStatus !== BookStatus.COMPLETED &&
        oldStatus !== TvFilmStatus.WATCHED;

      if (isNowCompleted && wasNotCompletedBefore) {
        await addActivityToStorage({
          type: 'completed',
          itemTitle,
          hobbyName: hobby.name,
          hobbyType: hobby.type,
        });
      } else if (newStatus && newStatus !== oldStatus) {
        await addActivityToStorage({
          type: 'updated',
          itemTitle,
          hobbyName: hobby.name,
          hobbyType: hobby.type,
          status: newStatus,
        });
      }
    }
  };

  const deleteItemFromHobby = async (hobbyId: string, itemId: string) => {
    const updatedHobbies = hobbies.map(hobby => {
      if (hobby.id === hobbyId) {
        const filteredItems = hobby.items.filter(item => item.id !== itemId);
        return { ...hobby, items: filteredItems } as Hobby;
      }
      return hobby;
    });
    await saveHobbies(updatedHobbies);
  };

  const canAddHobby = () => hobbies.length < MAX_HOBBIES;
  const getRemainingHobbySlots = () => MAX_HOBBIES - hobbies.length;

  return {
    hobbies,
    loading,
    addHobby,
    updateHobby,
    deleteHobby,
    addItemToHobby,
    updateItemInHobby,
    deleteItemFromHobby,
    refreshHobbies: loadHobbies,
    canAddHobby,
    getRemainingHobbySlots,
    MAX_HOBBIES
  };
};