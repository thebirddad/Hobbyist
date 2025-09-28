import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const INSTALLATION_DATE_KEY = 'app_installation_date';

export const useInstallationDate = () => {
  const [installationDate, setInstallationDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeInstallationDate();
  }, []);

  const initializeInstallationDate = async () => {
    try {
      // Check if we already have an installation date
      let storedDate = await AsyncStorage.getItem(INSTALLATION_DATE_KEY);
      
      if (!storedDate) {
        // First time opening the app - set the current date
        const currentDate = new Date().toISOString();
        await AsyncStorage.setItem(INSTALLATION_DATE_KEY, currentDate);
        storedDate = currentDate;
      }
      
      setInstallationDate(storedDate);
    } catch (error) {
      console.error('Failed to initialize installation date:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatInstallationDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  return {
    installationDate,
    loading,
    formattedInstallationDate: installationDate ? formatInstallationDate(installationDate) : null,
  };
};