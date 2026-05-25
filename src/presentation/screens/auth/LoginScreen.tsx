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
import Logo from '../../components/Logo';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { sendOTP, login } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
  };

  async function handleSendCode() {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) {
      Alert.alert('Error', 'Ingresa un número de celular válido');
      return;
    }
    setLoading(true);
    const code = await sendOTP(`+591 ${digits}`);
    setLoading(false);
    navigation.navigate('OTP', { phone: `+591 ${digits}`, code });
  }

  async function handleQuickLogin(quickPhone: string) {
    setPhone(quickPhone);
    const digits = quickPhone.replace(/\D/g, '');
    setLoading(true);
    const code = await sendOTP(`+591 ${digits}`);
    setLoading(false);
    navigation.navigate('OTP', { phone: `+591 ${digits}`, code });
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
            <Text style={styles.prefix}>+591</Text>
            <TextInput
              style={styles.input}
              placeholder="700 12345"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(t) => setPhone(formatPhone(t))}
              maxLength={13}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
            onPress={handleSendCode}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.sendBtnText}>Enviar código SMS</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Te enviaremos un código de 6 dígitos para verificar tu número
          </Text>

          {/* Separador */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>o prueba como</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Quick login */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => handleQuickLogin('70000001')}
            >
              <Text style={styles.quickIcon}>👤</Text>
              <Text style={styles.quickLabel}>Cliente demo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => handleQuickLogin('70011111')}
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
