import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import MechanicCard from '../components/MechanicCard';
import { Mechanic } from '../../domain/entities/Mechanic';
import { MechanicRepositoryImpl } from '../../data/repositories/MechanicRepositoryImpl';
import { ServiceRequestRepositoryImpl } from '../../data/repositories/ServiceRequestRepositoryImpl';
import { FindNearbyMechanicsUseCase } from '../../domain/usecases/FindNearbyMechanicsUseCase';
import { CreateServiceRequestUseCase } from '../../domain/usecases/CreateServiceRequestUseCase';
import { useAppStore } from '../../store/useAppStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const mechanicRepo = new MechanicRepositoryImpl();
const requestRepo = new ServiceRequestRepositoryImpl();
const findNearby = new FindNearbyMechanicsUseCase(mechanicRepo);
const createRequest = new CreateServiceRequestUseCase(requestRepo);

const USER_LAT = -17.3895;
const USER_LON = -66.1568;

export default function SOSScreen() {
  const navigation = useNavigation<Nav>();
  const { user, setActiveRequest, addToHistory } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    loadMechanics();
  }, []);

  async function loadMechanics() {
    setLoading(true);
    const result = await findNearby.execute(USER_LAT, USER_LON);
    setMechanics(result);
    setLoading(false);
  }

  async function handleRequest(mechanic: Mechanic) {
    Alert.alert(
      'Solicitar mecánico',
      `¿Confirmas solicitar a ${mechanic.name}?\n\nLlegará en aprox. ${mechanic.etaMinutes} minutos.\nCosto estimado: Bs. ${mechanic.pricePerHour * 1.5}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setRequesting(mechanic.id);
            const req = await createRequest.execute({
              userId: user.id,
              mechanicId: mechanic.id,
              mechanicName: mechanic.name,
              mechanicPhoto: mechanic.photo,
              problemDescription: 'Solicitud SOS',
              userLocation: { latitude: USER_LAT, longitude: USER_LON },
              userAddress: 'Av. Heroínas #456, Cochabamba',
              estimatedCost: mechanic.pricePerHour * 1.5,
            });
            setActiveRequest(req);
            addToHistory(req);
            setRequesting(null);
            navigation.replace('Tracking', { requestId: req.id });
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Mecánicos cercanos</Text>
          <Text style={styles.subtitle}>Cochabamba, Bolivia</Text>
        </View>
        <TouchableOpacity onPress={loadMechanics} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Mapa simulado */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapContent}>
          <Text style={styles.mapIcon}>📍</Text>
          <Text style={styles.mapText}>Tu ubicación</Text>
          <View style={styles.mechanicsOnMap}>
            {mechanics.slice(0, 3).map((m, i) => (
              <View
                key={m.id}
                style={[
                  styles.mapDot,
                  { left: 60 + i * 70, top: 30 + (i % 2) * 40 },
                ]}
              >
                <Text style={styles.mapDotText}>🔧</Text>
                <Text style={styles.mapDotDistance}>{m.distanceKm}km</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.mapBadge}>
          <Text style={styles.mapBadgeText}>📡 {mechanics.length} mecánicos disponibles</Text>
        </View>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Buscando mecánicos cerca tuyo...</Text>
        </View>
      ) : (
        <FlatList
          data={mechanics}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {mechanics.length} mecánicos disponibles
            </Text>
          }
          renderItem={({ item }) => (
            <MechanicCard
              mechanic={item}
              onPress={() => navigation.navigate('MechanicDetail', { mechanic: item })}
              onRequest={() => handleRequest(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.xs, textAlign: 'center' },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: { color: Colors.primary, fontSize: 20, fontWeight: '700' },
  mapPlaceholder: {
    height: 180,
    backgroundColor: '#0D1B2A',
    margin: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mapContent: {
    flex: 1,
    padding: Spacing.md,
    position: 'relative',
  },
  mapIcon: { fontSize: 28, position: 'absolute', bottom: 20, left: '45%' },
  mapText: {
    position: 'absolute',
    bottom: 8,
    left: '35%',
    color: Colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  mechanicsOnMap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapDot: {
    position: 'absolute',
    alignItems: 'center',
  },
  mapDotText: { fontSize: 20 },
  mapDotDistance: { color: Colors.primary, fontSize: 9, fontWeight: '700' },
  mapBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  mapBadgeText: { color: Colors.text, fontSize: 11, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.md },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 30 },
  listHeader: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
});
