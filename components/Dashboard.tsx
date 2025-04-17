import { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import CustomButton from '@/components/CustomButton';

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
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    console.log(tasks)
    const user = (await supabase.auth.getUser()).data.user;
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setTasks(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const markTaskAsDone = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ done: true })
      .eq('id', taskId);

    if (error) {
      console.error('Erreur:', error.message);
    } else {
      fetchTasks();
    }
  };

  const tasksWithCoords = tasks.filter(
    (t) =>
      typeof t.latitude === 'number' &&
      typeof t.longitude === 'number' &&
      !isNaN(t.latitude) &&
      !isNaN(t.longitude)
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const createdDate = new Date(item.created_at).toLocaleDateString();
          return (
            <View style={styles.taskItem}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{createdDate}</Text>
              </View>
              <Text>
                Statut : {item.done ? '✅' : '❌'}
              </Text>
              <Text style={styles.description}>{item.description}</Text>
              {!item.done && (
                <CustomButton
                  title="Valider tâche"
                  variant="primary"
                  onPress={() => markTaskAsDone(item.id)}
                />
              )}
            </View>
          );
        }}
        ListFooterComponent={
          tasksWithCoords.length > 0 ? (
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
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 62,
    paddingBottom:24,
    paddingHorizontal: 26,
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
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  map: {
    width: '100%',
    height: 300,
    marginTop: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
  },
});
