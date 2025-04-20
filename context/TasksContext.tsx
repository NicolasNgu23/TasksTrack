import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Task = {
  id: string;
  title: string;
  description?: string;
  location: { coordinates: [number, number] } | null;
  done: boolean;
  created_at: string;
};

type TaskContextType = {
  tasks: Task[];
  loading: boolean;
  refreshTasks: () => Promise<void>;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const parseWKT = (wkt: string | null): { coordinates: [number, number] } | null => {
  if (!wkt || !wkt.startsWith('POINT')) return null;
  const match = wkt.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
  if (!match) return null;
  return {
    coordinates: [parseFloat(match[1]), parseFloat(match[2])],
  };
};

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTasks = async () => {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;

    const { data, error } = await supabase.rpc('get_tasks_with_location', {
      p_user_id: user?.id,
    });

    if (!error && data) {
      const parsedTasks = data.map((task: any) => ({
        ...task,
        location: parseWKT(task.location),
      }));
      setTasks(parsedTasks);
      console.log('Tâches chargées :', parsedTasks);
    } else {
      console.log('Aucune tâche trouvée ou erreur :', error?.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, loading, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
