import { useEffect, useRef, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { useUserLocation } from '@/context/UserLocationContext';
import { useTasks } from '@/context/TasksContext';

export default function AddTaskScreen() {
  const { location } = useUserLocation();
  const { refreshTasks } = useTasks();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (location && !marker && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [location]);

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });

    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const place = results[0];
        const fullAddress = `${place.name ?? ''} ${place.street ?? ''}, ${place.city ?? ''}`;
        setAddress(fullAddress.trim());
      }
    } catch {
      setAddress('');
    }
  };

  const handleGeocode = async () => {
    if (!address) return Alert.alert('Adresse vide', 'Saisis une adresse');

    try {
      const results = await Location.geocodeAsync(address);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        setMarker({ latitude, longitude });

        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        Alert.alert('Adresse introuvable');
      }
    } catch {
      Alert.alert('Erreur lors du géocodage');
    }
  };

  const handleAddTask = async () => {
    const user = (await supabase.auth.getUser()).data.user;

    if (!title || (!marker && !location)) {
      Alert.alert('Champs requis', 'Ajoute un titre et une localisation.');
      return;
    }

    const lat = marker?.latitude ?? location?.latitude;
    const lon = marker?.longitude ?? location?.longitude;
    const point = `POINT(${lon} ${lat})`;

    const { error } = await supabase.rpc('create_task', {
      p_user_id: user?.id,
      p_title: title,
      p_location_text: point,
      p_description: desc,
    });

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      await refreshTasks();
      setTitle('');
      setDesc('');
      setAddress('');
      setMarker(null);
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouvelle tâche</Text>

      <CustomInput
        placeholder="Titre"
        value={title}
        onChangeText={setTitle}
      />
      <CustomInput
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
        multiline
      />
      <CustomInput
        placeholder="Adresse"
        value={address}
        onChangeText={setAddress}
      />
      <CustomButton title="Valider l'adresse" onPress={handleGeocode} />

      <MapView
        ref={(ref) => (mapRef.current = ref)}
        style={styles.map}
        initialRegion={{
          latitude: marker?.latitude ?? location?.latitude ?? 48.8566,
          longitude: marker?.longitude ?? location?.longitude ?? 2.3522,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
        showsUserLocation
      >
        {marker && <Marker coordinate={marker} />}
      </MapView>

      <CustomButton title="Créer la tâche" onPress={handleAddTask} variant="primary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
});
