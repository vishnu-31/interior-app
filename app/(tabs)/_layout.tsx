import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="renovate"
        options={{
          title: 'Renovate',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="pencil-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="furniture"
        options={{
          title: 'Furnish',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="sofa-single" color={color} />,
        }}
      />
      <Tabs.Screen
        name="customize"
        options={{
          title: 'Style transfer',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="style" color={color} />,
        }}
      />
      <Tabs.Screen
        name="renovated-gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={28} name="view-gallery" color={color} />,
        }}
      />
    </Tabs>
  );
}
