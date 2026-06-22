import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Image, Platform, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import { useAuthStore } from '../../../store/useAuthStore';
import { ServiceRequest } from '../../../data/local/Database';
import * as DB from '../../../data/local/Database';

type Nav = NativeStackNavigationProp<RootStackParamList>;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function MechanicHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user, refreshUser, updateProfile } = useAuthStore();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isOnline, setIsOnline] = useState(user?.status === 'online');
  const [loading, setLoading] = useState(true);
  const seenPendingIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Solicitudes',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }
  }, []);

  useEffect(() => {
    isFirstLoad.current = true;
    seenPendingIds.current = new Set();
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, [user]);

  async function notifyNewRequest(req: ServiceRequest) {
    Vibration.vibrate([0, 300, 150, 300]);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Nueva solicitud de servicio',
        body: `${req.problemDescription} · 📍 ${req.userAddress ?? 'Ubicación no disponible'}`,
        sound: 'default',
      },
      trigger: null,
    });
  }

  async function loadRequests() {
    if (!user) return;
    const all = await DB.getHistory(user.id);
    const pending = all.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');
    const pendingNow = pending.filter((r) => r.status === 'pending');

    if (!isFirstLoad.current) {
      const newOnes = pendingNow.filter((r) => !seenPendingIds.current.has(r.id));
      newOnes.forEach(notifyNewRequest);
    }
    isFirstLoad.current = false;
    pendingNow.forEach((r) => seenPendingIds.current.add(r.id));

    setRequests(pending);
    setLoading(false);
  }

  async function toggleOnline(value: boolean) {
    setIsOnline(value);
    await updateProfile({ status: value ? 'online' : 'offline' });
  }

  async function handleAccept(requestId: string) {
    await DB.updateRequest(requestId, { status: 'accepted', acceptedAt: new Date().toISOString() });
    loadRequests();
    refreshUser();
  }

  async function handleSetInRoute(requestId: string) {
    await DB.updateRequest(requestId, { status: 'in_route', inRouteAt: new Date().toISOString() });
    loadRequests();
  }

  async function handleStartWork(requestId: string) {
    await DB.updateRequest(requestId, { status: 'in_progress' });
    loadRequests();
  }

  async function handleComplete(requestId: string) {
    await DB.updateRequest(requestId, { status: 'completed', completedAt: new Date().toISOString() });
    loadRequests();
    refreshUser();
  }

  async function handleCancel(requestId: string) {
    await DB.updateRequest(requestId, { status: 'cancelled' });
    loadRequests();
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Panel de Mecánico</Text>
          <Text style={styles.subtitle}>🏍️ {user?.specialties?.slice(0, 2).join(' · ')}</Text>
        </View>
        <View style={styles.onlineRow}>
          <Text style={[styles.onlineLabel, { color: isOnline ? Colors.success : Colors.textMuted }]}>
            {isOnline ? 'En línea' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ false: Colors.card, true: 'rgba(16,185,129,0.3)' }}
            thumbColor={isOnline ? Colors.success : Colors.textMuted}
          />
        </View>
      </View>

      {/* Plan */}
      <TouchableOpacity
        style={styles.planBanner}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Benefits')}
      >
        <Text style={styles.planIcon}>{user?.plan === 'expert' ? '⭐' : '🔧'}</Text>
        <Text style={styles.planText}>
          Cuenta {user?.plan === 'expert' ? 'Experto' : 'Normal'}
        </Text>
        <Text style={styles.planAction}>
          {user?.plan === 'expert' ? 'Ver beneficios' : 'Mejorar a Experto'} ›
        </Text>
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{pendingRequests.length}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.totalServices ?? 0}</Text>
          <Text style={styles.statLabel}>Completados hoy</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{user?.rating?.toFixed(1) ?? '5.0'} ⭐</Text>
          <Text style={styles.statLabel}>Mi rating</Text>
        </View>
      </View>

      {/* New requests */}
      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Nuevas solicitudes</Text>
          {pendingRequests.map((req) => (
            <View key={req.id} style={styles.requestCard}>
              <Text style={styles.requestDesc}>🏍️ {req.problemDescription}</Text>
              <Text style={styles.requestAddress}>📍 {req.userAddress}</Text>
              <Text style={styles.requestCost}>💰 S/. {req.estimatedCost} estimado</Text>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAccept(req.id)}
                >
                  <Text style={styles.acceptBtnText}>✅ Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleCancel(req.id)}
                >
                  <Text style={styles.cancelBtnText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Active requests */}
      {activeRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ En progreso</Text>
          {activeRequests.map((req) => (
            <View key={req.id} style={styles.activeCard}>
              <View style={styles.activeHeader}>
                <Text style={styles.activeDesc}>🏍️ {req.problemDescription}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) + '22' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(req.status) }]}>
                    {STATUS_MAP[req.status] ?? req.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.requestAddress}>📍 {req.userAddress}</Text>
              {req.status === 'accepted' && (
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() => handleSetInRoute(req.id)}
                >
                  <Text style={styles.completeBtnText}>🏍️ Salir en camino</Text>
                </TouchableOpacity>
              )}
              {req.status === 'in_route' && (
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() => handleStartWork(req.id)}
                >
                  <Text style={styles.completeBtnText}>🔧 Llegué, iniciar reparación</Text>
                </TouchableOpacity>
              )}
              {req.status === 'in_progress' && (
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={() => handleComplete(req.id)}
                >
                  <Text style={styles.completeBtnText}>✅ Completar servicio</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {!loading && pendingRequests.length === 0 && activeRequests.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔧</Text>
          <Text style={styles.emptyText}>Sin solicitudes por ahora</Text>
          <Text style={styles.emptySubtext}>
            {isOnline ? 'Te avisaremos cuando llegue una solicitud' : 'Actívate en línea para recibir solicitudes'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'accepted': return Colors.info;
    case 'in_route': return Colors.info;
    case 'in_progress': return Colors.warning;
    default: return Colors.textMuted;
  }
}

const STATUS_MAP: Record<string, string> = {
  accepted: 'Aceptado',
  in_route: 'En camino',
  in_progress: 'En progreso',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  onlineRow: { alignItems: 'center', gap: 4 },
  onlineLabel: { fontSize: FontSize.xs, fontWeight: '600' },
  planBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  planIcon: { fontSize: 18 },
  planText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700', flex: 1 },
  planAction: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  section: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  requestCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 6,
  },
  requestDesc: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  requestAddress: { color: Colors.textSecondary, fontSize: FontSize.sm },
  requestCost: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
  requestActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  acceptBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    padding: 10,
    alignItems: 'center',
  },
  acceptBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
  cancelBtn: {
    flex: 1,
    borderRadius: Radius.full,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  activeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeDesc: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600', flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  completeBtn: {
    backgroundColor: Colors.success,
    borderRadius: Radius.full,
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  completeBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyIcon: { fontSize: 60 },
  emptyText: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  emptySubtext: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: 40 },
});
