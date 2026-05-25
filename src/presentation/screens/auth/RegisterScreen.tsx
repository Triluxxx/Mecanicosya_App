import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import { useAuthStore } from '../../../store/useAuthStore';
import { UserRole } from '../../../data/local/Database';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { phone } = route.params;
  const { register } = useAuthStore();

  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [vehicle, setVehicle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim()) {
      Alert.alert('Error', 'Ingresa tu nombre completo');
      return;
    }

    setLoading(true);
    await register({
      phone,
      role,
      name: name.trim(),
      vehicle: role === 'client' ? vehicle.trim() : '',
    });
    setLoading(false);

    if (role === 'mechanic') {
      navigation.replace('MechanicRegister', { phone });
    }
    // For client, auth store handles navigation via AppNavigator
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>👋</Text>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
              Cuéntanos un poco sobre ti
            </Text>
          </View>

          {/* Role selector */}
          <Text style={styles.sectionLabel}>Eres...</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleCard, role === 'client' && styles.roleSelected]}
              onPress={() => setRole('client')}
              activeOpacity={0.8}
            >
              <Text style={styles.roleIcon}>🏍️</Text>
              <Text style={[styles.roleTitle, role === 'client' && { color: Colors.primary }]}>
                Cliente
              </Text>
              <Text style={styles.roleDesc}>Tengo una moto y necesito mecánico</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleCard, role === 'mechanic' && styles.roleSelected]}
              onPress={() => setRole('mechanic')}
              activeOpacity={0.8}
            >
              <Text style={styles.roleIcon}>🔧</Text>
              <Text style={[styles.roleTitle, role === 'mechanic' && { color: Colors.primary }]}>
                Mecánico
              </Text>
              <Text style={styles.roleDesc}>Soy mecánico y quiero ofrecer mis servicios</Text>
            </TouchableOpacity>
          </View>

          {/* Name input */}
          <Text style={styles.sectionLabel}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          {/* Vehicle input (only for clients) */}
          {role === 'client' && (
            <>
              <Text style={styles.sectionLabel}>Tu moto (modelo)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Honda CB 190R 2024"
                placeholderTextColor={Colors.textMuted}
                value={vehicle}
                onChangeText={setVehicle}
              />
            </>
          )}

          {/* Terms */}
          <Text style={styles.terms}>
            Al registrarte aceptas los Términos y Condiciones y la Política de Privacidad de MecánicosYa.
          </Text>

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.registerBtnText}>
                {role === 'mechanic' ? 'Continuar →' : 'Crear cuenta'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Usar otro número</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  header: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  icon: { fontSize: 56 },
  title: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.md },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: -Spacing.sm,
    marginTop: Spacing.sm,
  },
  roleRow: { flexDirection: 'row', gap: Spacing.sm },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  roleSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255,107,53,0.08)',
  },
  roleIcon: { fontSize: 36 },
  roleTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  roleDesc: { color: Colors.textSecondary, fontSize: FontSize.xs, textAlign: 'center' },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    color: Colors.text,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  terms: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.sm,
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  registerBtnDisabled: { opacity: 0.6 },
  registerBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800' },
  backBtn: { alignItems: 'center', marginTop: Spacing.sm },
  backText: { color: Colors.textSecondary, fontSize: FontSize.sm },
});
