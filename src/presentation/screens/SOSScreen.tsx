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
import { useAuthStore } from '../../store/useAuthStore';
import { useLocation } from '../hooks/useLocation';
import { User, ServiceRequest } from '../../data/local/Database';
import * as DB from '../../data/local/Database';
import { ApiClient, ApiUser } from '../../data/remote/ApiClient';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Number((2 * R * Math.asin(Math.sqrt(h))).toFixed(1));
}

function apiMechanicToLocalUser(
  u: ApiUser,
  fromLocation?: { lat: number; lng: number }
): User & { distanceKm: number; etaMinutes: number } {
  const distanceKm = fromLocation && u.location ? haversineKm(fromLocation, u.location) : 1.5;
  return {
    id: u.id,
    phone: u.phone,
    role: 'mechanic',
    name: u.name,
    email: '',
    photo: u.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name),
    vehicle: '',
    ruc: u.ruc ?? '',
    verified: u.verified,
    specialties: u.specialties ?? [],
    yearsExperience: u.yearsExperience ?? 0,
    pricePerHour: u.pricePerHour ?? 0,
    bio: u.bio ?? '',
    vehicleTypes: u.vehicleTypes ?? [],
    latitude: u.location?.lat ?? 0,
    longitude: u.location?.lng ?? 0,
    status: u.available ? 'online' : 'offline',
    rating: u.rating ?? 5,
    totalReviews: u.totalReviews ?? 0,
    totalServices: 0,
    plan: u.plan,
    hasTowingVehicle: u.hasTowingVehicle ?? Boolean(u.plate),
    towingPlate: u.towingPlate ?? u.plate ?? '',
    badge: u.badge ?? '',
    backendId: u.id,
    createdAt: u.createdAt,
    distanceKm,
    etaMinutes: Math.max(5, Math.round(distanceKm * 4)),
  };
}

export default function SOSScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const loc = useLocation();

  const [loading, setLoading] = useState(true);
  const [mechanics, setMechanics] = useState<User[]>([]);
  const [requesting, setRequesting] = useState<string | null>(null);
  const { syncBackendId } = useAuthStore();

  useEffect(() => {
    loadMechanics();
  }, []);

  async function loadMechanics() {
    setLoading(true);
    const result = await DB.getAvailableMechanics();
    // Distancia real entre la ubicación del cliente y la del mecánico registrado
    const withDistances = result.map((m) => {
      const distanceKm = haversineKm(
        { lat: loc.latitude, lng: loc.longitude },
        { lat: m.latitude, lng: m.longitude }
      );
      return {
        ...m,
        distanceKm,
        etaMinutes: Math.max(5, Math.round(distanceKm * 4)),
      };
    });

    // Sumar mecánicos reales del backend (si está disponible), sin bloquear si falla
    let remoteMechanics: ReturnType<typeof apiMechanicToLocalUser>[] = [];
    try {
      const apiMechanics = await ApiClient.getMechanics();
      remoteMechanics = apiMechanics
        .filter((m) => m.available)
        .map((m) => apiMechanicToLocalUser(m, { lat: loc.latitude, lng: loc.longitude }));
    } catch (e) {
      console.warn('No se pudo cargar mecánicos del backend real:', e);
    }

    setMechanics([...withDistances, ...remoteMechanics] as any);
    setLoading(false);
  }

  async function handleRequest(mechanic: User) {
    const distance = (mechanic as any).distanceKm ?? 1;
    const eta = (mechanic as any).etaMinutes ?? 10;
    const estimatedCost = Math.round((mechanic.pricePerHour || 70) * 1.5);

    Alert.alert(
      'Solicitar mecánico',
      `¿Confirmas solicitar a ${mechanic.name}?\n\n🏍️ Moto: ${user?.vehicle || 'No especificada'}\n⏱ Llegará en aprox. ${eta} minutos\n💰 Costo estimado: S/. ${estimatedCost}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            if (!user) return;
            setRequesting(mechanic.id);

            const problem = mechanic.specialties?.[0]
              ? `Problema de ${mechanic.specialties[0].toLowerCase()} en mi moto`
              : 'Solicitud de servicio para moto';

            const req = await DB.createRequest({
              userId: user.id,
              mechanicId: mechanic.id,
              mechanicName: mechanic.name,
              mechanicPhoto: mechanic.photo,
              status: 'pending',
              problemDescription: problem,
              userLocation: { latitude: loc.latitude, longitude: loc.longitude },
              userAddress: loc.address,
              mechanicLocation: { latitude: mechanic.latitude, longitude: mechanic.longitude },
              etaMinutes: eta,
              estimatedCost,
              paymentStatus: 'pending',
            });

            // Espejo del SOS en el backend real, sin bloquear el flujo local si falla
            syncBackendId({ lat: loc.latitude, lng: loc.longitude })
              .then((driverId) => {
                if (!driverId) return;
                return ApiClient.createSos({
                  driverId,
                  address: loc.address,
                  location: { lat: loc.latitude, lng: loc.longitude },
                });
              })
              .then((result) => {
                if (result?.sos?.id) {
                  return DB.updateRequest(req.id, { backendSosId: result.sos.id });
                }
              })
              .catch((e) => console.warn('No se pudo replicar el SOS en el backend real:', e));

            setRequesting(null);
            navigation.replace('Tracking', { requestId: req.id });
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Mecánicos de motos</Text>
          <Text style={styles.subtitle}>{loc.loading ? 'Obteniendo ubicación...' : loc.city}</Text>
        </View>
        <TouchableOpacity onPress={loadMechanics} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapPlaceholder}>
        <View style={styles.mapContent}>
          <Text style={styles.mapIcon}>📍</Text>
          <Text style={styles.mapText}>Tu ubicación</Text>
        </View>
        <View style={styles.mapBadge}>
          <Text style={styles.mapBadgeText}>📡 {mechanics.length} mecánicos disponibles</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Buscando mecánicos de motos cerca tuyo...</Text>
        </View>
      ) : (
        <FlatList
          data={mechanics}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.listHeader}>{mechanics.length} mecánicos disponibles</Text>
          }
          renderItem={({ item }) => (
            <MechanicCard
              mechanic={item as any}
              onPress={() => navigation.navigate('MechanicDetail', { mechanic: item as any })}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.xs, textAlign: 'center' },
  refreshBtn: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  refreshText: { color: Colors.primary, fontSize: 20, fontWeight: '700' },
  mapPlaceholder: {
    height: 180, backgroundColor: '#0D1B2A', margin: Spacing.md,
    borderRadius: Radius.lg, overflow: 'hidden', position: 'relative',
  },
  mapContent: { flex: 1, padding: Spacing.md, position: 'relative' },
  mapIcon: { fontSize: 28, position: 'absolute', bottom: 20, left: '45%' },
  mapText: { position: 'absolute', bottom: 8, left: '35%', color: Colors.text, fontSize: 10, fontWeight: '600' },
  mapBadge: {
    position: 'absolute', bottom: Spacing.sm, right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
  },
  mapBadgeText: { color: Colors.text, fontSize: 11, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.md },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 30 },
  listHeader: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.md },
});
