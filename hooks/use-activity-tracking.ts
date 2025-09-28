import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export interface Activity {
  id: string;
  type: 'added' | 'completed' | 'updated';
  itemTitle: string;
  hobbyName: string;
  hobbyType: string;
  status?: string;
  timestamp: string;
}

const ACTIVITIES_STORAGE_KEY = 'activities_data';
const MAX_ACTIVITIES = 50; // Keep last 50 activities

export const useActivityTracking = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const storedActivities = await AsyncStorage.getItem(ACTIVITIES_STORAGE_KEY);
      if (storedActivities) {
        const parsedActivities = JSON.parse(storedActivities);
        setActivities(parsedActivities);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveActivities = async (activitiesToSave: Activity[]) => {
    try {
      const jsonData = JSON.stringify(activitiesToSave);
      await AsyncStorage.setItem(ACTIVITIES_STORAGE_KEY, jsonData);
      setActivities(activitiesToSave);
    } catch (error) {
      console.error('Failed to save activities:', error);
    }
  };

  const addActivity = async (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    // Add to beginning of array and limit to MAX_ACTIVITIES
    const updatedActivities = [newActivity, ...activities].slice(0, MAX_ACTIVITIES);
    await saveActivities(updatedActivities);
  };

  const getMostRecentActivity = (): Activity | null => {
    return activities.length > 0 ? activities[0] : null;
  };

  const formatActivityMessage = (activity: Activity): string => {
    switch (activity.type) {
      case 'added':
        if (activity.status) {
          return `Added '${activity.itemTitle}' to '${activity.status.toLowerCase()}' in ${activity.hobbyName}!`;
        }
        return `Added '${activity.itemTitle}' to ${activity.hobbyName}!`;
      
      case 'completed':
        return `Completed '${activity.itemTitle}' in ${activity.hobbyName}!`;
      
      case 'updated':
        if (activity.status) {
          return `Updated '${activity.itemTitle}' to '${activity.status.toLowerCase()}' in ${activity.hobbyName}!`;
        }
        return `Updated '${activity.itemTitle}' in ${activity.hobbyName}!`;
      
      default:
        return `Activity in ${activity.hobbyName}`;
    }
  };

  return {
    activities,
    loading,
    addActivity,
    getMostRecentActivity,
    formatActivityMessage,
    refreshActivities: loadActivities,
  };
};