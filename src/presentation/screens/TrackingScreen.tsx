import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import { useAppStore } from '../../store/useAppStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Tracking'>;

const STATUS_STEPS = [
  { key: 'pending', label: 'Solicitud enviada', icon: '📤' },
  { key: 'accepted', label: 'Mecánico aceptó', icon: '✅' },
  { key: 'in_route', label: 'En camino a ti', icon: '🚗' },
  { key: 'in_progress', label: 'Trabajando en tu auto', icon: '🔧' },
  { key: 'completed', label: 'Servicio completado', icon: '🎉' },
];

export default function TrackingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { requestId } = route.params;
  const { activeRequest, updateHistoryItem } = useAppStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [eta, setEta] = useState(activeRequest?.mechanicId ? 12 : 15);
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    const stepTimer = setInterval(() => {
      setCurrentStep((s) => {
        if (s < STATUS_STEPS.length - 1) return s + 1;
        clearInterval(stepTimer);
        return s;
      });
    }, 4000);

    const etaTimer = setInterval(() => {
      setEta((e) => (e > 0 ? e - 1 : 0));
    }, 60000);

    return () => {
      clearInterval(stepTimer);
      clearInterval(etaTimer);
    };
  }, []);

  useEffect(() => {
    const statusMap = ['pending', 'accepted', 'in_route', 'in_progress', 'completed'] as const;
    updateHistoryItem(requestId, { status: statusMap[currentStep] });

    if (currentStep === STATUS_STEPS.length - 1) {
      setTimeout(() => {
        navigation.replace('Payment', {
          requestId,
          estimatedCost: activeRequest?.estimatedCost ?? 150,
        });
      }, 2000);
    }
  }, [currentStep]);

  function handleCancel() {
    Alert.alert(
      'Cancelar servicio',
      '¿Estás seguro? Solo puedes cancelar antes de que el mecánico llegue.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            updateHistoryItem(requestId, { status: 'cancelled' });
            navigation.navigate('MainTabs');
          },
        },
      ]
    );
  }

  const dotOpacity = dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Seguimiento en vivo</Text>
        <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
      </View>

      {/* Mapa animado simulado */}
      <View style={styles.mapArea}>
        <View style={styles.mapBg}>
          <Text style={styles.mapEmoji}>🗺️</Text>
          <Text style={styles.mapSubtext}>Rastreando ubicación del mecánico</Text>

          {/* Mecánico moviéndose */}
          <Animated.Text style={[styles.mechanicDot, {
            transform: [{ translateX: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 30] }) }]
          }]}>
            🔧
          </Animated.Text>

          {/* Usuario */}
          <Text style={styles.userDot}>📍</Text>
        </View>

        {/* ETA badge */}
        {currentStep < 4 && (
          <View style={styles.etaBadge}>
            <Text style={styles.etaNumber}>{eta}</Text>
            <Text style={styles.etaLabel}>min</Text>
          </View>
        )}
      </View>

      {/* Info mecánico */}
      {activeRequest && (
        <View style={styles.mechanicCard}>
          <Image source={{ uri: activeRequest.mechanicPhoto }} style={styles.mechanicPhoto} />
          <View style={styles.mechanicInfo}>
            <Text style={styles.mechanicName}>{activeRequest.mechanicName}</Text>
            <Text style={styles.mechanicStatus}>{STATUS_STEPS[currentStep].icon} {STATUS_STEPS[currentStep].label}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progreso */}
      <View style={styles.stepsContainer}>
        {STATUS_STEPS.map((step, i) => (
          <View key={step.key} style={styles.stepRow}>
            <View style={[
              styles.stepCircle,
              i < currentStep && styles.stepDone,
              i === currentStep && styles.stepActive,
            ]}>
              {i < currentStep ? (
                <Text style={styles.stepCheck}>✓</Text>
              ) : (
                <Text style={styles.stepNum}>{i + 1}</Text>
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={[
                styles.stepLabel,
                i <= currentStep && styles.stepLabelActive,
              ]}>
                {step.icon} {step.label}
              </Text>
            </View>
            {i < STATUS_STEPS.length - 1 && (
              <View style={[styles.stepLine, i < currentStep && styles.stepLineDone]} />
            )}
          </View>
        ))}
      </View>

      {/* Cancelar */}
      {currentStep < 2 && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancelar servicio</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.sos },
  mapArea: {
    height: 200,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mapBg: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapEmoji: { fontSize: 40 },
  mapSubtext: { color: Colors.textSecondary, fontSize: FontSize.xs },
  mechanicDot: { fontSize: 28, position: 'absolute', top: 50 },
  userDot: { fontSize: 28, position: 'absolute', bottom: 20 },
  etaBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.warning,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  etaNumber: { color: Colors.black, fontSize: FontSize.xl, fontWeight: '900' },
  etaLabel: { color: Colors.black, fontSize: FontSize.xs, fontWeight: '600' },
  mechanicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mechanicPhoto: { width: 55, height: 55, borderRadius: Radius.full },
  mechanicInfo: { flex: 1 },
  mechanicName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  mechanicStatus: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 3 },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: { fontSize: 20 },
  stepsContainer: {
    paddingHorizontal: Spacing.lg,
    flex: 1,
    gap: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    position: 'relative',
    paddingBottom: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,107,53,0.15)' },
  stepCheck: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  stepNum: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '700' },
  stepContent: { flex: 1 },
  stepLabel: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '500' },
  stepLabelActive: { color: Colors.text, fontWeight: '700' },
  stepLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
  },
  stepLineDone: { backgroundColor: Colors.success },
  cancelBtn: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.sos,
    alignItems: 'center',
  },
  cancelText: { color: Colors.sos, fontSize: FontSize.sm, fontWeight: '700' },
});
