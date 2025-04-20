import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

const TASK_NAME = 'BACKGROUND_PROXIMITY_CHECK';

const DISTANCE_THRESHOLD_METERS = 300;

const getTasks = async () => {
  const user = (await supabase.auth.getUser()).data.user;
  const { data } = await supabase.rpc('get_tasks_with_location', {
    p_user_id: user?.id,
  });

  if (!data) return [];

  return data
    .filter((t: any) => !t.done && t.location)
    .map((task: any) => {
      const match = task.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
      if (!match) return null;
      return {
        id: task.id,
        title: task.title,
        latitude: parseFloat(match[2]),
        longitude: parseFloat(match[1]),
      };
    })
    .filter(Boolean);
};

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const { coords } = await Location.getCurrentPositionAsync({});
    const tasks = await getTasks();

    for (const task of tasks) {
      const distance = haversineDistance(
        coords.latitude,
        coords.longitude,
        task.latitude,
        task.longitude
      );

      if (distance < DISTANCE_THRESHOLD_METERS) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Tâche à proximité 🧭',
            body: `Tu es proche de la tâche : ${task.title}`,
            sound: true,
          },
          trigger: null,
        });
        break;
      }
    }
  } catch (error) {
    console.log('Erreur dans la tâche de fond :', error);
  }
});

export const startBackgroundTracking = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  const notifStatus = await Notifications.requestPermissionsAsync();

  if (status !== 'granted' || bgStatus !== 'granted' || notifStatus.status !== 'granted') {
    console.log('Permissions insuffisantes');
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10 * 60 * 1000,
      distanceInterval: 0,
      showsBackgroundLocationIndicator: false,
      pausesUpdatesAutomatically: false,
    });
  }
};
