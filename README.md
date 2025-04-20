# 📌 TasksTrack

UTILISATEUR SUPABASE POUR SE CONNECTER

1: Avec des tâches
id: test@gmail.com
mdp: test

2: Sans tâches
id: test2@gmail.com
mdp: test

**TasksTrack** est une application mobile construite avec **Expo**, **React Native** et **Supabase**, qui permet de créer, afficher et interagir avec des tâches géolocalisées.

---

## 🚀 Fonctionnalités

- ✅ Authentification avec Supabase
- 🗺️ Carte interactive (React Native Maps)
- ➕ Ajout de tâches avec géolocalisation
- 📍 Marqueur automatique de la position de l'utilisateur
- 🔁 Rafraîchissement automatique des tâches
- 🔔 Notifications de proximité toutes les 10 minutes (en background)
- 📊 Tri des tâches par distance ou date
- 📱 Interface responsive et légère

---

## 🧱 Stack technique

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.com/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/)
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [EAS Update](https://docs.expo.dev/eas-update/intro/)

---

## 📦 Installation

```bash
git clone https://github.com/NicolasNgu23/TasksTrack.git
cd TasksTrack
npm install
npx expo start


const supabaseUrl = 'https://<your-project>.supabase.co';
const supabaseAnonKey = 'your-anon-key';


npx eas update --branch preview
