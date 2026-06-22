import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { LayoutDashboard, ListTodo, User } from 'lucide-react-native';

import RoutineScreen from './src/screens/RoutineScreen';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: '#fafafa', fontSize: 24, fontWeight: 'bold' }}>{title}</Text>
    <Text style={{ color: '#a1a1aa', marginTop: 8 }}>Coming soon on mobile</Text>
  </View>
);

const DashboardScreen = () => <PlaceholderScreen title="Dashboard" />;
const ProfileScreen = () => <PlaceholderScreen title="Profile" />;

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer theme={DarkTheme}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#09090b',
              borderTopColor: '#27272a',
              borderTopWidth: 1,
            },
            tabBarActiveTintColor: '#10b981', // emerald-500
            tabBarInactiveTintColor: '#71717a', // zinc-500
          }}
        >
          <Tab.Screen 
            name="Routine" 
            component={RoutineScreen} 
            options={{
              tabBarIcon: ({ color, size }) => <ListTodo color={color} size={size} />
            }}
          />
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{
              tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
