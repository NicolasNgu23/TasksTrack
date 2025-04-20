import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: '#0003bd',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#0003bd',
          borderTopWidth: 0,
          position: 'absolute',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="addTask"
        options={{
          title: '',
          tabBarLabel: '',
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="interactiveMap"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
