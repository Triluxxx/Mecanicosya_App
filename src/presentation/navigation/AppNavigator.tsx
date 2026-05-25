import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import {
  RootStackParamList,
  ClientTabParamList,
  MechanicTabParamList,
} from './types';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MechanicRegisterScreen from '../screens/auth/MechanicRegisterScreen';

// Client screens
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import ClientHistoryScreen from '../screens/client/ClientHistoryScreen';
import ClientProfileScreen from '../screens/client/ClientProfileScreen';

// Mechanic screens
import MechanicHomeScreen from '../screens/mechanic/MechanicHomeScreen';
import MechanicHistoryScreen from '../screens/mechanic/MechanicHistoryScreen';
import MechanicProfileScreen from '../screens/mechanic/MechanicProfileScreen';

// Shared screens
import SOSScreen from '../screens/SOSScreen';
import MechanicDetailScreen from '../screens/MechanicDetailScreen';
import TrackingScreen from '../screens/TrackingScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ReviewScreen from '../screens/ReviewScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const ClientTab = createBottomTabNavigator<ClientTabParamList>();
const MechanicTab = createBottomTabNavigator<MechanicTabParamList>();

// ─── Iconos para tabs ───
function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill={color} />
    </Svg>
  );
}
function HistoryIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path d="M12 7V12L15 15" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} fill={color} />
      <Path d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

// ─── Client Tabs ───
function ClientTabs() {
  return (
    <ClientTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <ClientTab.Screen
        name="ClientHome"
        component={ClientHomeScreen}
        options={{ tabBarLabel: 'Inicio', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <ClientTab.Screen
        name="ClientHistory"
        component={ClientHistoryScreen}
        options={{ tabBarLabel: 'Historial', tabBarIcon: ({ color }) => <HistoryIcon color={color} /> }}
      />
      <ClientTab.Screen
        name="ClientProfile"
        component={ClientProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <ProfileIcon color={color} /> }}
      />
    </ClientTab.Navigator>
  );
}

// ─── Mechanic Tabs ───
function MechanicTabs() {
  return (
    <MechanicTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <MechanicTab.Screen
        name="MechanicHome"
        component={MechanicHomeScreen}
        options={{ tabBarLabel: 'Solicitudes', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <MechanicTab.Screen
        name="MechanicHistory"
        component={MechanicHistoryScreen}
        options={{ tabBarLabel: 'Historial', tabBarIcon: ({ color }) => <HistoryIcon color={color} /> }}
      />
      <MechanicTab.Screen
        name="MechanicProfile"
        component={MechanicProfileScreen}
        options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <ProfileIcon color={color} /> }}
      />
    </MechanicTab.Navigator>
  );
}

// ─── Splash Screen ───
function SplashScreen() {
  return (
    <View style={styles.splash}>
      <Text style={styles.splashIcon}>🔧</Text>
      <Text style={styles.splashText}>MecánicosYa</Text>
      <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 20 }} />
    </View>
  );
}

// ─── Main App Navigator ───
export default function AppNavigator() {
  const { isAuthenticated, isLoading, isMechanic, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        {!isAuthenticated ? (
          // ─── Auth Stack ───
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="MechanicRegister"
              component={MechanicRegisterScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : isMechanic ? (
          // ─── Mechanic Stack ───
          <>
            <Stack.Screen name="MechanicTabs" component={MechanicTabs} />
            <Stack.Screen
              name="RequestDetail"
              component={RequestDetailPlaceholder}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          // ─── Client Stack ───
          <>
            <Stack.Screen name="ClientTabs" component={ClientTabs} />
            <Stack.Screen name="SOS" component={SOSScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="MechanicDetail" component={MechanicDetailScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Tracking" component={TrackingScreen} options={{ animation: 'slide_from_right', gestureEnabled: false }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="Review" component={ReviewScreen} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Placeholder for request detail (to be implemented)
function RequestDetailPlaceholder() {
  return (
    <View style={styles.splash}>
      <Text style={{ color: Colors.text, fontSize: 18 }}>Detalle de solicitud</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIcon: { fontSize: 64 },
  splashText: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 10,
  },
});
