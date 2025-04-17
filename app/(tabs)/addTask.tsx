import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

export default function AddTaskScreen() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
  };

  const handleAddTask = async () => {
    if (!title || !marker) {
      Alert.alert('Champs requis', 'Ajoute un titre et place un marqueur sur la carte.');
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

      <TextInput
        style={styles.input}
        placeholder="Titre"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={desc}
        onChangeText={setDesc}
      />

      <MapView
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

      <Button title="Créer la tâche" onPress={handleAddTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, marginTop: 12, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 16,
  },
});
