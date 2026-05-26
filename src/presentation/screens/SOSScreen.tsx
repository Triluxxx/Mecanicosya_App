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

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SOSScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const loc = useLocation();

  const [loading, setLoading] = useState(true);
  const [mechanics, setMechanics] = useState<User[]>([]);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    loadMechanics();
  }, []);

  async function loadMechanics() {
    setLoading(true);
    const result = await DB.getAvailableMechanics();
    // Calcular distancias simuladas
    const withDistances = result.map((m, i) => ({
      ...m,
      distanceKm: parseFloat((0.5 + i * 0.4 + Math.random() * 0.5).toFixed(1)),
      etaMinutes: 5 + i * 3 + Math.floor(Math.random() * 10),
    }));
    setMechanics(withDistances as any);
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
              estimatedCost,
              paymentStatus: 'pending',
            });

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
