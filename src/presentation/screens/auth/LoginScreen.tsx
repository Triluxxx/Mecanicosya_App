import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import { useAuthStore } from '../../../store/useAuthStore';
import { UserRole } from '../../../data/local/Database';
import Logo from '../../components/Logo';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { sendOTP } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState<UserRole | 'login' | null>(null);

  const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  function getValidDigits(): string | null {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      Alert.alert('Error', 'Ingresa un número de celular válido');
      return null;
    }
    return digits;
  }

  async function handleSendCode() {
    const digits = getValidDigits();
    if (!digits) return;
    setLoading('login');
    const code = await sendOTP(`+51 ${digits}`);
    setLoading(null);
    navigation.navigate('OTP', { phone: `+51 ${digits}`, code });
  }

  async function handleCreateAccount(role: UserRole) {
    const digits = getValidDigits();
    if (!digits) return;
    setLoading(role);
    const code = await sendOTP(`+51 ${digits}`);
    setLoading(null);
    navigation.navigate('OTP', { phone: `+51 ${digits}`, code, role });
  }

  async function handleQuickLogin(quickPhone: string, role: UserRole) {
    setPhone(quickPhone);
    const digits = quickPhone.replace(/\D/g, '');
    setLoading(role);
    const code = await sendOTP(`+51 ${digits}`);
    setLoading(null);
    navigation.navigate('OTP', { phone: `+51 ${digits}`, code, role });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo size="lg" showText={true} />
          </View>

          <Text style={styles.title}>Bienvenido a MecánicosYa</Text>
          <Text style={styles.subtitle}>
            🏍️ Encuentra mecánicos para tu moto en minutos
          </Text>

          {/* Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.prefix}>+51</Text>
            <TextInput
              style={styles.input}
              placeholder="987 654 321"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(t) => setPhone(formatPhone(t))}
              maxLength={11}
            />
          </View>

          <Text style={styles.hint}>
            Te enviaremos un código de 6 dígitos para verificar tu número
          </Text>

          {/* Crear cuenta nueva */}
          <Text style={styles.sectionLabel}>¿Nuevo en MecánicosYa? Crea tu cuenta</Text>
          <View style={styles.createRow}>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => handleCreateAccount('client')}
              disabled={!!loading}
              activeOpacity={0.85}
            >
              {loading === 'client' ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.createIcon}>🏍️</Text>
                  <Text style={styles.createBtnText}>Crear cuenta de Cliente</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createBtn, styles.createBtnMechanic]}
              onPress={() => handleCreateAccount('mechanic')}
              disabled={!!loading}
              activeOpacity={0.85}
            >
              {loading === 'mechanic' ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Text style={styles.createIcon}>🔧</Text>
                  <Text style={[styles.createBtnText, { color: Colors.primary }]}>Crear cuenta de Mecánico</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Separador */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
            onPress={handleSendCode}
            disabled={!!loading}
            activeOpacity={0.85}
          >
            {loading === 'login' ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.sendBtnText}>Ya tengo cuenta · Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          {/* Quick login */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => handleQuickLogin('900000001', 'client')}
            >
              <Text style={styles.quickIcon}>👤</Text>
              <Text style={styles.quickLabel}>Cliente demo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => handleQuickLogin('987011111', 'mechanic')}
            >
              <Text style={styles.quickIcon}>🔧</Text>
              <Text style={styles.quickLabel}>Mecánico demo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>MecánicosYa v1.0 · Solo motos 🏍️</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  prefix: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
    backgroundColor: Colors.card,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 16,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  hint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  createRow: { gap: Spacing.sm },
  createBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createBtnMechanic: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  createIcon: { fontSize: 20 },
  createBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  separatorText: { color: Colors.textMuted, fontSize: FontSize.sm },
  quickRow: { flexDirection: 'row', gap: Spacing.sm },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIcon: { fontSize: 28 },
  quickLabel: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  version: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
