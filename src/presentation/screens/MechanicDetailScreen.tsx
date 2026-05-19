import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import StarRating from '../components/StarRating';
import { CreateServiceRequestUseCase } from '../../domain/usecases/CreateServiceRequestUseCase';
import { ServiceRequestRepositoryImpl } from '../../data/repositories/ServiceRequestRepositoryImpl';
import { useAppStore } from '../../store/useAppStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'MechanicDetail'>;

const requestRepo = new ServiceRequestRepositoryImpl();
const createRequest = new CreateServiceRequestUseCase(requestRepo);

const SAMPLE_REVIEWS = [
  { name: 'Ana P.', rating: 5, comment: 'Llegó rapidísimo, muy profesional', date: 'Hace 2 días' },
  { name: 'Luis M.', rating: 5, comment: 'Excelente servicio, lo recomiendo', date: 'Hace 1 semana' },
  { name: 'María G.', rating: 4, comment: 'Buen trabajo, precios justos', date: 'Hace 2 semanas' },
];

export default function MechanicDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { mechanic } = route.params;
  const { user, setActiveRequest, addToHistory } = useAppStore();

  async function handleSolicitar() {
    Alert.alert(
      'Confirmar solicitud',
      `Solicitar a ${mechanic.name}\nETA: ${mechanic.etaMinutes} min\nEstimado: Bs. ${mechanic.pricePerHour * 1.5}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const req = await createRequest.execute({
              userId: user.id,
              mechanicId: mechanic.id,
              mechanicName: mechanic.name,
              mechanicPhoto: mechanic.photo,
              problemDescription: 'Solicitud SOS',
              userLocation: { latitude: -17.3895, longitude: -66.1568 },
              userAddress: 'Av. Heroínas #456, Cochabamba',
              estimatedCost: mechanic.pricePerHour * 1.5,
            });
            setActiveRequest(req);
            addToHistory(req);
            navigation.navigate('Tracking', { requestId: req.id });
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header foto */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Image source={{ uri: mechanic.photo }} style={styles.photo} />
          <View style={[styles.statusDot, mechanic.status === 'available' ? styles.online : styles.offline]} />
        </View>

        <View style={styles.content}>
          {/* Info principal */}
          <View style={styles.mainInfo}>
            <Text style={styles.name}>{mechanic.name}</Text>
            <Text style={styles.experience}>{mechanic.yearsExperience} años de experiencia</Text>
            <View style={styles.ratingRow}>
              <StarRating rating={mechanic.rating} size={18} />
              <Text style={styles.ratingValue}>{mechanic.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>· {mechanic.totalReviews} reseñas</Text>
            </View>
          </View>

          {/* Métricas */}
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{mechanic.distanceKm} km</Text>
              <Text style={styles.metricLabel}>Distancia</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: Colors.warning }]}>{mechanic.etaMinutes} min</Text>
              <Text style={styles.metricLabel}>Tiempo llegada</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: Colors.primary }]}>Bs. {mechanic.pricePerHour}</Text>
              <Text style={styles.metricLabel}>Por hora</Text>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre él</Text>
            <Text style={styles.bio}>{mechanic.bio}</Text>
          </View>

          {/* Especialidades */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Especialidades</Text>
            <View style={styles.tags}>
              {mechanic.specialties.map((s) => (
                <View key={s} style={styles.tag}>
                  <Text style={styles.tagText}>🔧 {s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tipos de vehículo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehículos que atiende</Text>
            <View style={styles.tags}>
              {mechanic.vehicleTypes.map((v) => (
                <View key={v} style={[styles.tag, styles.tagBlue]}>
                  <Text style={[styles.tagText, { color: Colors.info }]}>🚗 {v}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reseñas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Últimas reseñas</Text>
            {SAMPLE_REVIEWS.map((r, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <Text style={styles.reviewDate}>{r.date}</Text>
                </View>
                <StarRating rating={r.rating} size={14} />
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Botón solicitar */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerEta}>⏱ Llega en {mechanic.etaMinutes} min</Text>
          <Text style={styles.footerCost}>Bs. {mechanic.pricePerHour * 1.5} estimado</Text>
        </View>
        <TouchableOpacity style={styles.solicitarBtn} onPress={handleSolicitar} activeOpacity={0.85}>
          <Text style={styles.solicitarText}>Solicitar ahora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  photoSection: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: Spacing.md,
    top: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: Colors.text, fontSize: 20 },
  photo: {
    width: 110,
    height: 110,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  statusDot: {
    position: 'absolute',
    bottom: Spacing.lg + 8,
    right: '38%',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  online: { backgroundColor: Colors.success },
  offline: { backgroundColor: Colors.textMuted },
  content: { padding: Spacing.md },
  mainInfo: { alignItems: 'center', marginBottom: Spacing.lg },
  name: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginBottom: 4 },
  experience: { color: Colors.textSecondary, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingValue: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  reviewCount: { color: Colors.textSecondary, fontSize: FontSize.sm },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  metricLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  metricDivider: { width: 1, backgroundColor: Colors.border },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.sm },
  bio: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  tagBlue: { backgroundColor: 'rgba(59,130,246,0.15)' },
  tagText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewName: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  reviewDate: { color: Colors.textMuted, fontSize: FontSize.xs },
  reviewComment: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  footerInfo: { flex: 1 },
  footerEta: { color: Colors.warning, fontSize: FontSize.sm, fontWeight: '600' },
  footerCost: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  solicitarBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.full,
  },
  solicitarText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },
});
