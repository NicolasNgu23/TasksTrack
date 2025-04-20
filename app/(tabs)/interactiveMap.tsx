import { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, AnimatedRegion, LatLng } from 'react-native-maps';
import { useUserLocation } from '@/context/UserLocationContext';
import { useTasks } from '@/context/TasksContext';

export default function MapTasksScreen() {
  const mapRef = useRef<MapView>(null);
  const { location } = useUserLocation();
  const { tasks, loading } = useTasks();

  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      }, 1000);
    }
  }, [location]);

  const handleMarkerPress = (coords: LatLng) => {
    mapRef.current?.animateToRegion({
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {!location || loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1C008A" />
          <Text style={{ marginTop: 10 }}>Chargement en cours...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
          showsUserLocation
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Vous êtes ici"
            pinColor="#1C008A"
          />

          {tasks.map((task) => {
            const coords = task.location?.coordinates;
            if (!coords) return null;

            const lat = coords[1];
            const lon = coords[0];

            return (
              <Marker
                key={task.id}
                coordinate={{ latitude: lat, longitude: lon }}
                title={task.title}
                description={task.description}
                onPress={() => handleMarkerPress({ latitude: lat, longitude: lon })}
              />
            );
          })}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
