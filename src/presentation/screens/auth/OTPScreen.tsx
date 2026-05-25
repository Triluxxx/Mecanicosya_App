import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import { useAuthStore } from '../../../store/useAuthStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'OTP'>;

export default function OTPScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { phone, code: demoCode } = route.params;
  const { login, sendOTP } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [resendTimer, setResendTimer] = useState(30);

  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-submit for demo quick login
    if (demoCode && demoCode.length === 6) {
      handleAutoLogin();
    }
    // Countdown for resend
    const interval = setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleAutoLogin() {
    setLoading(true);
    const result = await login(phone, demoCode);
    setLoading(false);
    if (result.success) {
      if (result.isNewUser) {
        navigation.replace('Register', { phone });
      }
      // If existing user, auth store handles navigation via AppNavigator
    } else {
      Alert.alert('Error', 'Código inválido. Intenta de nuevo.');
    }
  }

  function handleInputChange(text: string, index: number) {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-advance to next input
    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && text) {
      const code = newOtp.join('');
      if (code.length === 6) {
        submitOTP(code);
      }
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function submitOTP(code?: string) {
    const finalCode = code || otp.join('');
    if (finalCode.length !== 6) {
      Alert.alert('Error', 'Ingresa el código de 6 dígitos');
      return;
    }
    setLoading(true);
    const result = await login(phone, finalCode);
    setLoading(false);

    if (result.success) {
      if (result.isNewUser) {
        navigation.replace('Register', { phone });
      }
    } else {
      Alert.alert('Código incorrecto', 'Revisa el código e intenta de nuevo.');
      setOtp(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    setLoading(true);
    const code = await sendOTP(phone);
    setLoading(false);
    setResendTimer(30);
    Alert.alert('Código reenviado', `(Demo) Tu código es: ${code}`);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.icon}>📱</Text>
          <Text style={styles.title}>Verificar número</Text>
          <Text style={styles.subtitle}>
            Ingresa el código de 6 dígitos enviado a{'\n'}
            <Text style={styles.phone}>{phone}</Text>
          </Text>
        </View>

        {/* Mock: Mostrar código (solo demo) */}
        {showCode && demoCode && (
          <View style={styles.codeBanner}>
            <Text style={styles.codeLabel}>🔧 MODO PRUEBA</Text>
            <Text style={styles.codeValue}>Tu código es: {demoCode}</Text>
            <TouchableOpacity onPress={() => setShowCode(false)}>
              <Text style={styles.codeHide}>Ocultar ✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Inputs OTP */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputsRef.current[i] = ref; }}
              style={[styles.otpInput, digit ? styles.otpFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(t) => handleInputChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              selectTextOnFocus
            />
          ))}
        </View>

        {loading && <ActivityIndicator color={Colors.primary} size="large" />}

        <TouchableOpacity
          style={styles.verifyBtn}
          onPress={() => submitOTP()}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.verifyBtnText}>Verificar código</Text>
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>¿No recibiste el código? </Text>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>Reenviar en {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Reenviar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  backBtn: { alignSelf: 'flex-start' },
  backText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '600' },
  header: { alignItems: 'center', gap: Spacing.sm },
  icon: { fontSize: 56 },
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
    lineHeight: 22,
  },
  phone: { color: Colors.primary, fontWeight: '700' },
  codeBanner: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  codeLabel: {
    color: Colors.success,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 2,
  },
  codeValue: {
    color: Colors.success,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  codeHide: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  otpInput: {
    width: 50,
    height: 60,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    textAlign: 'center',
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  otpFilled: { borderColor: Colors.primary },
  verifyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
  },
  verifyBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  resendTimer: { color: Colors.textMuted, fontSize: FontSize.sm },
  resendLink: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
});
