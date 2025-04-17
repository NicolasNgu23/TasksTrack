import * as Notifications from 'expo-notifications'; // Importation correcte
import * as Location from 'expo-location';
import { supabase } from './supabase'; // Assurez-vous que vous importez le bon fichier de configuration Supabase

// Fonction pour vérifier la distance et envoyer des notifications en arrière-plan
export const startBackgroundTracking = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.error('Permission refusée pour accéder à la localisation');
    return;
  }

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('done', false); // Récupérer uniquement les tâches non terminées

  if (error || !tasks) {
    console.error('Erreur lors de la récupération des tâches ou tâches vides');
    return;
  }

  const location = await Location.getCurrentPositionAsync({});
  const { latitude: userLat, longitude: userLon } = location.coords;

  // Pour chaque tâche non terminée, vérifier la distance et envoyer une notification si l'utilisateur est proche
  tasks.forEach((task: any) => {
    if (task.latitude && task.longitude) {
      const dist = calculateDistance(userLat, userLon, task.latitude, task.longitude);

      if (dist <= 1) { // Si la distance est inférieure ou égale à 1 km
        sendNotification(task); // Appeler la fonction pour envoyer la notification
      }
    }
  });
};

// Calculer la distance entre deux points (en km)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en km
};

// Envoyer une notification si l'utilisateur est proche de la tâche
const sendNotification = async (task: any) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Proche de la tâche: ${task.title}`,
      body: task.description || 'N\'oublie pas de la compléter!',
    },
    trigger: null, // Envoie la notification immédiatement
  });
};
