import { Activity, addActivityListener, addActivityToStorage, getActivitiesFromStorage } from '@/utils/activity-manager';
import { useEffect, useState } from 'react';

export const useActivityTracking = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    try {
      const storedActivities = await getActivitiesFromStorage();
      setActivities(storedActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
    
    // Listen for activity updates
    const unsubscribe = addActivityListener(() => {
      loadActivities();
    });

    return unsubscribe;
  }, []);

  const addActivity = async (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    await addActivityToStorage(activity);
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