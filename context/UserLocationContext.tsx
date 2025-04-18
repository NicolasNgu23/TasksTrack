// contexts/UserLocationContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';

type LocationType = {
  latitude: number;
  longitude: number;
} | null;

type UserLocationContextType = {
  location: LocationType;
  refreshLocation: () => Promise<void>;
};

const UserLocationContext = createContext<UserLocationContextType | undefined>(undefined);

export const UserLocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<LocationType>(null);

  const refreshLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    const current = await Location.getCurrentPositionAsync();
    setLocation({
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    });
  };

  useEffect(() => {
    refreshLocation();

    const interval = setInterval(() => {
      refreshLocation();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <UserLocationContext.Provider value={{ location, refreshLocation }}>
      {children}
    </UserLocationContext.Provider>
  );
};

export const useUserLocation = () => {
  const context = useContext(UserLocationContext);
  if (!context) throw new Error('useUserLocation must be used within a UserLocationProvider');
  return context;
};
