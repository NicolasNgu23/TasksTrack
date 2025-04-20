import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import CustomButton from '@/components/CustomButton';
import * as Location from 'expo-location';
import { startBackgroundTracking } from '@/lib/backgroundNotifications';

type Task = {
  id: string;
  title: string;
  description?: string;
  latitude: number | null;
  longitude: number | null;
  done: boolean;
  created_at: string;
  user_id: string;
};

export default function Dashboard() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'distance'>('date');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const TASKS_PER_PAGE = 3;

  const fetchTasks = async () => {
    const user = (await supabase.auth.getUser()).data.user;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id);

    if (!error && data) {
      setAllTasks(data);
      setTotalPages(Math.ceil(data.length / TASKS_PER_PAGE));
    } else {
      Alert.alert('Erreur chargement des tâches.');
    }
  };

  const deleteAllTasks = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase.from('tasks').delete().eq('user_id', user?.id);

    if (!error) {
      setAllTasks([]);
      Alert.alert('Toutes les tâches ont été supprimées.');
    } else {
      Alert.alert('Erreur lors de la suppression des tâches.');
    }
  };

  const markTaskAsDone = async (taskId: string) => {
    const { error } = await supabase.from('tasks').update({ done: true }).eq('id', taskId);
    if (!error) fetchTasks();
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortTasks = async () => {
    if (sortBy === 'date') {
      const sorted = [...allTasks].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllTasks(sorted);
    } else {
      if (!userLocation) return;

      const sorted = [...allTasks].sort((a, b) => {
        if (a.latitude === null || a.longitude === null) return 1;
        if (b.latitude === null || b.longitude === null) return -1;
        const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
        const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
        return distA - distB;
      });
      setAllTasks(sorted);
    }
  };

  const toggleSort = async () => {
    const nextSort = sortBy === 'date' ? 'distance' : 'date';
    setSortBy(nextSort);

    if (nextSort === 'distance' && !userLocation) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée pour la localisation.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      setTimeout(sortTasks, 100); // laisser le temps de set l'état avant de trier
    } else {
      sortTasks();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      startBackgroundTracking();
    }, [])
  );

  useEffect(() => {
    sortTasks();
  }, [sortBy, userLocation]);

  const paginatedTasks = allTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  const tasksWithCoords = paginatedTasks.filter(
    (t) =>
      typeof t.latitude === 'number' &&
      typeof t.longitude === 'number' &&
      !isNaN(t.latitude) &&
      !isNaN(t.longitude)
  );

  if (allTasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Tu n’as encore aucune tâche ! Tu peux commencer à en ajouter ✍️
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomButton
        title={`Trier par : ${sortBy === 'date' ? '📅 Date' : '📍 Distance'}`}
        variant="primary"
        onPress={toggleSort}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {paginatedTasks.map((item) => {
          const createdDate = new Date(item.created_at).toLocaleDateString();

          let distance = '';
          if (item.latitude && item.longitude && userLocation) {
            const dist = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              item.latitude,
              item.longitude
            );
            distance = `${dist.toFixed(2)} km`;
          }

          return (
            <View key={item.id} style={styles.taskItem}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{createdDate}</Text>
              </View>
              <Text>Statut : {item.done ? '✅' : '❌'}</Text>
              <Text style={styles.description}>{item.description}</Text>
              {distance !== '' && <Text style={styles.distanceText}>{distance}</Text>}
              {!item.done && (
                <CustomButton
                  title="Valider tâche"
                  variant="primary"
                  onPress={() => markTaskAsDone(item.id)}
                />
              )}
            </View>
          );
        })}

        {tasksWithCoords.length > 0 && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: tasksWithCoords[0].latitude!,
              longitude: tasksWithCoords[0].longitude!,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {tasksWithCoords.map((task) => (
              <Marker
                key={task.id}
                coordinate={{
                  latitude: task.latitude!,
                  longitude: task.longitude!,
                }}
                title={task.title}
                description={task.description}
              />
            ))}
          </MapView>
        )}

        <View style={styles.pagination}>
          {[...Array(totalPages)].map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentPage(i + 1)}
              style={[
                styles.pageButton,
                currentPage === i + 1 && styles.pageButtonActive,
              ]}
            >
              <Text style={currentPage === i + 1 ? styles.pageTextActive : styles.pageText}>
                {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.deleteContainer}>
          <CustomButton
            title="🗑️ Supprimer toutes les tâches"
            variant="primary"
            onPress={() => {
              Alert.alert('Confirmation', 'Es-tu sûr de vouloir supprimer toutes les tâches ?', [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Supprimer',
                  style: 'destructive',
                  onPress: deleteAllTasks,
                },
              ]);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 62, paddingBottom: 24, paddingHorizontal: 26 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    color: '#444',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 16,
    borderRadius: 10,
    textAlign: 'center',
  },
  taskItem: {
    marginBottom: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontSize: 17, fontWeight: '600' },
  date: { fontSize: 13, color: '#999' },
  description: { fontSize: 14, color: '#666', marginTop: 6 },
  distanceText: { fontSize: 14, color: '#444', marginTop: 8, fontWeight: '500' },
  map: {
    width: '100%',
    height: 300,
    marginTop: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  pageButtonActive: {
    backgroundColor: '#1C008A',
  },
  pageText: {
    color: '#333',
    fontWeight: '600',
  },
  pageTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  deleteContainer: {
    marginTop: 32,
    marginBottom: 80,
  },
});
