import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // rayon de la terre en mètres
  const toRad = (val: number) => val * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function useProximityNotifications() {
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted' || bgStatus !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const user = (await supabase.auth.getUser()).data.user;

      if (!user) return;

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('done', false);

      for (const task of tasks || []) {
        if (!task.location) continue;
        const [lng, lat] = task.location.coordinates;

        const distance = getDistance(location.coords.latitude, location.coords.longitude, lat, lng);
        if (distance < 100) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '📍 Tâche à proximité',
              body: `Tu as "${task.title}" à faire juste à côté !`,
            },
            trigger: null,
          });
        }
      }
    };

    // Vérifie toutes les 30 secondes
    interval = setInterval(checkLocation, 30000);

    return () => clearInterval(interval);
  }, []);
}
