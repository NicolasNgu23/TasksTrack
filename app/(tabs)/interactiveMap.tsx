import { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useUserLocation } from '@/context/UserLocationContext';

export default function MapTasksScreen() {
  const mapRef = useRef<MapView>(null);
  const { location } = useUserLocation();

  return (
    <View style={styles.container}>
      {!location ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1C008A" />
          <Text style={{ marginTop: 10 }}>En cours de localisation</Text>
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
