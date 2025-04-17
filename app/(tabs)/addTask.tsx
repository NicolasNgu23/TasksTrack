import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';

export default function AddTaskScreen() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView | null>(null);

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
    } catch (err) {
      Alert.alert('Erreur lors du géocodage');
    }
  };

  const handleAddTask = async () => {
    if (!title || !marker) {
      Alert.alert('Champs requis', 'Ajoute un titre et une localisation.');
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    const point = `POINT(${marker.longitude} ${marker.latitude})`;

    const { error } = await supabase.rpc('create_task', {
      p_user_id: user?.id,
      p_title: title,
      p_description: desc,
      p_location_text: point,
    });

    if (error) Alert.alert('Erreur', error.message);
    else router.replace('/');
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
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
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
    paddingHorizontal:32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  subtitle: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
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
