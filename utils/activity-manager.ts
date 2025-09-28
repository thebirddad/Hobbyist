import AsyncStorage from '@react-native-async-storage/async-storage';

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
const MAX_ACTIVITIES = 50;

// Global listeners for activity updates
const activityListeners: Array<() => void> = [];

export const addActivityListener = (listener: () => void) => {
  activityListeners.push(listener);
  return () => {
    const index = activityListeners.indexOf(listener);
    if (index > -1) {
      activityListeners.splice(index, 1);
    }
  };
};

const notifyActivityListeners = () => {
  activityListeners.forEach(listener => listener());
};

export const addActivityToStorage = async (activity: Omit<Activity, 'id' | 'timestamp'>) => {
  try {
    const storedActivities = await AsyncStorage.getItem(ACTIVITIES_STORAGE_KEY);
    const activities: Activity[] = storedActivities ? JSON.parse(storedActivities) : [];
    
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    const updatedActivities = [newActivity, ...activities].slice(0, MAX_ACTIVITIES);
    await AsyncStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(updatedActivities));
    
    // Notify all listeners that activities have been updated
    notifyActivityListeners();
  } catch (error) {
    console.error('Failed to save activity:', error);
  }
};

export const getActivitiesFromStorage = async (): Promise<Activity[]> => {
  try {
    const storedActivities = await AsyncStorage.getItem(ACTIVITIES_STORAGE_KEY);
    return storedActivities ? JSON.parse(storedActivities) : [];
  } catch (error) {
    console.error('Failed to load activities:', error);
    return [];
  }
};