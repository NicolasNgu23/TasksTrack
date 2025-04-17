import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

type Task = {
  id: string;
  title: string;
  description?: string;
  latitude: number | null;
  longitude: number | null;
};

export default function MapTasksScreen() {
  const [userLocation, setUserLocation] = useState<any>(null)
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    loc().then(r => {
        console.log("in loc")
    })
  }, []);

  const loc = async() => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
        console.log("Permission to access location was denied")
        return
    }

    let location = await Location.getCurrentPositionAsync();
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  }

  return (
    <View style={styles.container}>
      {!userLocation ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1C008A" />
          <Text style={{ marginTop: 10 }}> En cours de localisation</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
          showsUserLocation
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#1C008A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 4,
    elevation: 6,
  },
  recenterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
