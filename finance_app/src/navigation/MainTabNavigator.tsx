import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { DashboardScreen } from '../features/transactions/screens/DashboardScreen';
import { HistoryScreen } from '../features/transactions/screens/HistoryScreen';
import { AddTransactionScreen } from '../features/transactions/screens/AddTransactionScreen';
import { ProfileScreen } from '../features/transactions/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#1E293B', // Slate 800
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#F8FAFC', // Slate 50
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        tabBarStyle: {
          backgroundColor: '#1E293B', // Slate 800
          borderTopWidth: 1,
          borderTopColor: '#334155', // Slate 700
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6366F1', // Indigo 500
        tabBarInactiveTintColor: '#94A3B8', // Slate 400
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'grid-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Add Transaction') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size || 24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Add Transaction" component={AddTransactionScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
