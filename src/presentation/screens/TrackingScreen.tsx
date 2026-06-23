import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Line } from 'react-native-svg';

import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import * as DB from '../../data/local/Database';
import { ServiceRequest } from '../../data/local/Database';
import { ApiClient, ApiSos } from '../../data/remote/ApiClient';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Tracking'>;

function backendStatusToLocal(status: ApiSos['status']): ServiceRequest['status'] {
  switch (status) {
    case 'accepted': return 'accepted';
    case 'on_way': return 'in_route';
    case 'in_progress': return 'in_progress';
    case 'completed': return 'completed';
    case 'rejected':
    case 'cancelled': return 'cancelled';
    default: return 'pending'; // 'searching' | 'assigned'
  }
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Solicitud enviada', icon: '📤' },
  { key: 'accepted', label: 'Mecánico aceptó', icon: '✅' },
  { key: 'in_route', label: 'En camino a ti', icon: '🏍️' },
  { key: 'in_progress', label: 'Trabajando en tu moto', icon: '🔧' },
  { key: 'completed', label: 'Servicio completado', icon: '🎉' },
];

const STEP_INDEX: Record<string, number> = {
  pending: 0,
  accepted: 1,
  in_route: 2,
  in_progress: 3,
  completed: 4,
};

const MAP_W = 320;
const MAP_H = 160;
const PAD = 24;

function projectPoints(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  const minLat = Math.min(a.latitude, b.latitude);
  const maxLat = Math.max(a.latitude, b.latitude);
  const minLng = Math.min(a.longitude, b.longitude);
  const maxLng = Math.max(a.longitude, b.longitude);
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;

  const toXY = (p: { latitude: number; longitude: number }) => ({
    x: PAD + ((p.longitude - minLng) / lngRange) * (MAP_W - 2 * PAD),
    y: PAD + (1 - (p.latitude - minLat) / latRange) * (MAP_H - 2 * PAD),
  });

  return { mechanicXY: toXY(a), clientXY: toXY(b) };
}

export default function TrackingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { requestId } = route.params;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [now, setNow] = useState(Date.now());
  const dotAnim = useRef(new Animated.Value(0)).current;
  const navigatedToPayment = useRef(false);

  useEffect(() => {
    loadRequest();
    const pollTimer = setInterval(loadRequest, 3000);
    const clockTimer = setInterval(() => setNow(Date.now()), 5000);
    return () => {
      clearInterval(pollTimer);
      clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Si el mecánico está en otro celular, sus cambios de estado llegan por el backend real
  // (no por el almacenamiento local de este dispositivo). Acá se reflejan en la solicitud local.
  async function loadRequest() {
    let req = await DB.getRequestById(requestId);
    if (req?.backendSosId && req.status !== 'completed' && req.status !== 'cancelled') {
      try {
        const list = await ApiClient.getSosList();
        const sos = list.find((s) => s.id === req!.backendSosId);
        if (sos) {
          const mappedStatus = backendStatusToLocal(sos.status);
          if (mappedStatus !== req.status) {
            const updates: Partial<ServiceRequest> = { status: mappedStatus };
            if (mappedStatus === 'accepted' && !req.acceptedAt) updates.acceptedAt = new Date().toISOString();
            if (mappedStatus === 'in_route' && !req.inRouteAt) updates.inRouteAt = new Date().toISOString();
            if (mappedStatus === 'completed' && !req.completedAt) updates.completedAt = new Date().toISOString();
            await DB.updateRequest(req.id, updates);
            req = await DB.getRequestById(requestId);
          }
        }
      } catch (e) {
        console.warn('No se pudo sincronizar el estado desde el backend real:', e);
      }
    }
    setRequest(req);
  }

  useEffect(() => {
    if (request?.status === 'completed' && !navigatedToPayment.current) {
      navigatedToPayment.current = true;
      setTimeout(() => {
        navigation.replace('Payment', {
          requestId,
          estimatedCost: request.estimatedCost ?? 150,
        });
      }, 1500);
    }
  }, [request?.status]);

  function handleCancel() {
    Alert.alert(
      'Cancelar servicio',
      '¿Estás seguro?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar', style: 'destructive',
          onPress: async () => {
            await DB.updateRequest(requestId, { status: 'cancelled' });
            if (request?.backendSosId) {
              ApiClient.updateSosStatus(request.backendSosId, 'cancelled').catch((e) =>
                console.warn('No se pudo cancelar en el backend real:', e)
              );
            }
            navigation.navigate('ClientTabs' as any);
          },
        },
      ]
    );
  }

  const dotOpacity = dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  if (!request) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Seguimiento en vivo</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (request.status === 'cancelled') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.cancelledBox}>
          <Text style={styles.mapEmoji}>❌</Text>
          <Text style={styles.cancelledText}>Este servicio fue cancelado</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.navigate('ClientTabs' as any)}>
            <Text style={styles.cancelText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStep = STEP_INDEX[request.status] ?? 0;

  // Progreso del trayecto real (0 = en el punto de origen del mecánico, 1 = llegó)
  let progress = 0;
  if (request.status === 'in_route' && request.inRouteAt && request.etaMinutes) {
    const elapsedMs = now - new Date(request.inRouteAt).getTime();
    progress = Math.min(0.95, Math.max(0, elapsedMs / (request.etaMinutes * 60000)));
  } else if (currentStep >= STEP_INDEX.in_progress) {
    progress = 1;
  }

  const remainingMin =
    request.status === 'in_route' && request.etaMinutes
      ? Math.max(0, Math.ceil(request.etaMinutes * (1 - progress)))
      : request.etaMinutes ?? 0;

  const mechanicOrigin = request.mechanicLocation ?? request.userLocation;
  const { mechanicXY, clientXY } = projectPoints(mechanicOrigin, request.userLocation);
  const markerX = mechanicXY.x + (clientXY.x - mechanicXY.x) * progress;
  const markerY = mechanicXY.y + (clientXY.y - mechanicXY.y) * progress;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Seguimiento en vivo</Text>
        <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
      </View>

      <View style={styles.mapArea}>
        <View style={styles.mapBg}>
          <Svg width={MAP_W} height={MAP_H}>
            <Line
              x1={mechanicXY.x} y1={mechanicXY.y}
              x2={clientXY.x} y2={clientXY.y}
              stroke={Colors.border}
              strokeWidth={2}
              strokeDasharray="6,6"
            />
            <Circle cx={clientXY.x} cy={clientXY.y} r={8} fill={Colors.sos} />
            <Circle cx={markerX} cy={markerY} r={9} fill={Colors.primary} />
          </Svg>
          <Text style={styles.mapSubtext}>📍 Tú · 🏍️ Mecánico acercándose</Text>
        </View>
        {currentStep < 3 && (
          <View style={styles.etaBadge}>
            <Text style={styles.etaNumber}>{remainingMin}</Text>
            <Text style={styles.etaLabel}>min</Text>
          </View>
        )}
      </View>

      <View style={styles.mechanicCard}>
        <Image source={{ uri: request.mechanicPhoto }} style={styles.mechanicPhoto} />
        <View style={styles.mechanicInfo}>
          <Text style={styles.mechanicName}>{request.mechanicName}</Text>
          <Text style={styles.mechanicStatus}>
            {STATUS_STEPS[currentStep].icon} {STATUS_STEPS[currentStep].label}
          </Text>
        </View>
      </View>

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
              <Text style={[styles.stepLabel, i <= currentStep && styles.stepLabelActive]}>
                {step.icon} {step.label}
              </Text>
            </View>
            {i < STATUS_STEPS.length - 1 && (
              <View style={[styles.stepLine, i < currentStep && styles.stepLineDone]} />
            )}
          </View>
        ))}
      </View>

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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: Spacing.md, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.sos },
  mapArea: {
    height: 200, margin: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden', position: 'relative',
  },
  mapBg: { flex: 1, backgroundColor: '#0D1B2A', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mapEmoji: { fontSize: 40 },
  mapSubtext: { color: Colors.textSecondary, fontSize: FontSize.xs },
  etaBadge: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    backgroundColor: Colors.warning, borderRadius: Radius.md,
    paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center',
  },
  etaNumber: { color: Colors.black, fontSize: FontSize.xl, fontWeight: '900' },
  etaLabel: { color: Colors.black, fontSize: FontSize.xs, fontWeight: '600' },
  mechanicCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md,
    marginBottom: Spacing.md, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  mechanicPhoto: { width: 55, height: 55, borderRadius: Radius.full },
  mechanicInfo: { flex: 1 },
  mechanicName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  mechanicStatus: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 3 },
  stepsContainer: { paddingHorizontal: Spacing.lg, flex: 1, gap: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, position: 'relative', paddingBottom: 8 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border,
  },
  stepDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,107,53,0.15)' },
  stepCheck: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  stepNum: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '700' },
  stepContent: { flex: 1 },
  stepLabel: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '500' },
  stepLabelActive: { color: Colors.text, fontWeight: '700' },
  stepLine: { position: 'absolute', left: 15, top: 32, width: 2, height: 20, backgroundColor: Colors.border },
  stepLineDone: { backgroundColor: Colors.success },
  cancelBtn: {
    margin: Spacing.md, padding: Spacing.md, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.sos, alignItems: 'center',
  },
  cancelText: { color: Colors.sos, fontSize: FontSize.sm, fontWeight: '700' },
  cancelledBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  cancelledText: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
});
