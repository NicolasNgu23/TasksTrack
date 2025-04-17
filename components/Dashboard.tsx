import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';

type Task = {
  id: string;
  title: string;
  description?: string;
  location: any;
  done: boolean;
  created_at: string;
  user_id: string;
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setTasks(data);
  };

  const deleteAllTasks = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', user?.id);

    if (!error) {
      setTasks([]);
      Alert.alert('Toutes les tâches ont été supprimées.');
    } else {
      Alert.alert('Erreur lors de la suppression des tâches.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  return (
    <View style={styles.container}>
      {tasks.length > 0 ? (
        <>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.taskItem}>
                <Text style={styles.title}>{item.title}</Text>
              </View>
            )}
          />
          <View style={styles.deleteContainer}>
            <Button title="🗑️ Supprimer toutes les tâches" color="red" onPress={deleteAllTasks} />
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Tu n’as pas encore de tâches. Tu peux en ajouter quand tu veux 💪</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 52,
    justifyContent: 'center',
  },
  taskItem: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  deleteContainer: {
    marginTop: 20,
  },
});
