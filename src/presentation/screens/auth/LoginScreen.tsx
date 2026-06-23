import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import { useAuthStore } from '../../../store/useAuthStore';
import { UserRole } from '../../../data/local/Database';
import Logo from '../../components/Logo';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type LoadingKey = UserRole | 'login' | 'demo-client' | 'demo-mechanic' | null;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { sendOTP, quickDemoLogin } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState<LoadingKey>(null);

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

  // Demo: entra directo a la app con una cuenta de prueba ya completa, sin pedir datos.
  async function handleQuickDemo(role: UserRole) {
    const key: LoadingKey = role === 'mechanic' ? 'demo-mechanic' : 'demo-client';
    setLoading(key);
    await quickDemoLogin(role);
    setLoading(null);
    // La navegación a la app ocurre sola: AppNavigator reacciona a isAuthenticated.
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo size="lg" showText={true} layout="column" />
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>🏍️🔧</Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeIcon}>✓</Text>
            </View>
          </View>

          <Text style={styles.title}>
            Encuentra mecánicos para tu moto{' '}
            <Text style={styles.titleHighlight}>en minutos</Text>
          </Text>
          <Text style={styles.subtitle}>📍 Rápido, seguro y confiable</Text>

          {/* Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.prefix}>+51</Text>
            <Text style={styles.phoneIcon}>📞</Text>
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

          <TouchableOpacity
            style={[styles.continueBtn, loading && styles.btnDisabled]}
            onPress={handleSendCode}
            disabled={!!loading}
            activeOpacity={0.85}
          >
            {loading === 'login' ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.continueBtnText}>Continuar  →</Text>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.separatorLine} />
          </View>

          <Text style={styles.sectionLabel}>👥  ¿No tienes cuenta?</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.outlineCard, styles.outlineCardPrimary]}
              onPress={() => handleCreateAccount('client')}
              disabled={!!loading}
              activeOpacity={0.85}
            >
              {loading === 'client' ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Text style={styles.cardIcon}>🏍️</Text>
                  <View style={styles.cardTextWrap}>
                    <Text style={styles.cardLabel}>Crear cuenta</Text>
                    <Text style={styles.cardLabelHighlight}>Cliente</Text>
                  </View>
                  <Text style={styles.cardArrow}>›</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlineCard}
              onPress={() => handleCreateAccount('mechanic')}
              disabled={!!loading}
              activeOpacity={0.85}
            >
              {loading === 'mechanic' ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Text style={styles.cardIcon}>🔧</Text>
                  <View style={styles.cardTextWrap}>
                    <Text style={styles.cardLabel}>Crear cuenta</Text>
                    <Text style={styles.cardLabelHighlight}>Mecánico</Text>
                  </View>
                  <Text style={styles.cardArrow}>›</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>✨  Probar la app</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.demoCard}
              onPress={() => handleQuickDemo('client')}
              disabled={!!loading}
              activeOpacity={0.85}
            >
              {loading === 'demo-client' ? (
                <ActivityIndicator color={Colors.text} />
              ) : (
                <>
                  <Text style={styles.cardIcon}>👤</Text>
                  <Text style={styles.demoCardLabel}>Cliente demo</Text>
                  <Text style={styles.cardArrow}>›</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoCard}
              onPress={() => handleQuickDemo('mechanic')}
              disabled={!!loading}
              activeOpacity={0.85}
            >
              {loading === 'demo-mechanic' ? (
                <ActivityIndicator color={Colors.text} />
              ) : (
                <>
                  <Text style={styles.cardIcon}>🔧</Text>
                  <Text style={styles.demoCardLabel}>Mecánico demo</Text>
                  <Text style={styles.cardArrow}>›</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>🔒  Tus datos están protegidos</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  hero: {
    alignSelf: 'center',
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroEmoji: { fontSize: 64 },
  heroBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeIcon: { color: Colors.primary, fontWeight: '900' },
  title: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 26,
  },
  titleHighlight: { color: Colors.primary },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.sm,
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
  phoneIcon: { fontSize: 16, paddingHorizontal: 6 },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 16,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  continueBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  separatorText: { color: Colors.textMuted, fontSize: FontSize.sm },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  row: { flexDirection: 'row', gap: Spacing.sm },
  outlineCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.sm,
    gap: 6,
  },
  outlineCardPrimary: { borderColor: Colors.primary },
  cardIcon: { fontSize: 20 },
  cardTextWrap: { flex: 1 },
  cardLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  cardLabelHighlight: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '800' },
  cardArrow: { color: Colors.textMuted, fontSize: 18 },
  demoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    gap: 6,
  },
  demoCardLabel: { flex: 1, color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  footer: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
