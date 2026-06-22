import { registerRootComponent } from 'expo';
import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import AppNavigator from './src/presentation/navigation/AppNavigator';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <AppNavigator />
    </StripeProvider>
  );
}

registerRootComponent(App);
