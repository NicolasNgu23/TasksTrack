import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, Button, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter, useFocusEffect } from 'expo-router';

type Task = {
  id: string;
  title: string;
  description?: string;
  location: any;
  done: boolean;
  created_at: string;
  user_id: string;
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  const fetchTasks = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
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

  return (
    <View style={styles.container}>
      <Button title="Ajouter une tâche" />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 52,
    justifyContent: 'center'
  },
  taskItem: {
    marginBottom: 16, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
});
