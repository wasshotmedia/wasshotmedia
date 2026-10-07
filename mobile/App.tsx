import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';
import { ShootsScreen } from './src/screens/ShootsScreen';
import { ClientsScreen } from './src/screens/ClientsScreen';
import { InvoicesScreen } from './src/screens/InvoicesScreen';
import { InquiriesScreen } from './src/screens/InquiriesScreen';

const Tab = createBottomTabNavigator();

const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#111110',
    card: '#161614',
    text: '#FFFFFF',
    border: '#252522',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={darkTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#141412',
              borderTopColor: '#222220',
              borderTopWidth: 1,
              height: 62,
              paddingBottom: 8,
              paddingTop: 6,
            },
            tabBarActiveTintColor: '#FF4D14',
            tabBarInactiveTintColor: '#777777',
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '700',
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'cube';

              if (route.name === 'Dashboard') {
                iconName = focused ? 'speedometer' : 'speedometer-outline';
              } else if (route.name === 'Shoots') {
                iconName = focused ? 'videocam' : 'videocam-outline';
              } else if (route.name === 'Clients') {
                iconName = focused ? 'people' : 'people-outline';
              } else if (route.name === 'Invoices') {
                iconName = focused ? 'receipt' : 'receipt-outline';
              } else if (route.name === 'Leads') {
                iconName = focused ? 'mail-unread' : 'mail-unread-outline';
              }

              return <Ionicons name={iconName} size={22} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Dashboard" component={HomeScreen} />
          <Tab.Screen name="Shoots" component={ShootsScreen} />
          <Tab.Screen name="Clients" component={ClientsScreen} />
          <Tab.Screen name="Invoices" component={InvoicesScreen} />
          <Tab.Screen name="Leads" component={InquiriesScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
