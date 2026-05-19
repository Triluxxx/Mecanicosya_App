import { registerRootComponent } from 'expo';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/presentation/navigation/AppNavigator';

function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#111827" />
      <AppNavigator />
    </>
  );
}

registerRootComponent(App);
