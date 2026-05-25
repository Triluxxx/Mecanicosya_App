import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import StarRating from '../../components/StarRating';
import { useAuthStore } from '../../../store/useAuthStore';
import { ServiceRequest } from '../../../data/local/Database';
import * as DB from '../../../data/local/Database';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  completed: { label: 'Completado', color: Colors.success },
  cancelled: { label: 'Cancelado', color: Colors.sos },
  pending: { label: 'Pendiente', color: Colors.warning },
  in_progress: { label: 'En progreso', color: Colors.info },
  in_route: { label: 'En camino', color: Colors.info },
  accepted: { label: 'Aceptado', color: Colors.info },
};

function RequestCard({ request, onReview }: { request: ServiceRequest; onReview: () => void }) {
  const meta = STATUS_LABELS[request.status] ?? { label: request.status, color: Colors.textMuted };
  const date = new Date(request.createdAt).toLocaleDateString('es-BO', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: request.mechanicPhoto }} style={styles.photo} />
        <View style={styles.cardInfo}>
          <Text style={styles.mechanicName}>{request.mechanicName}</Text>
          <Text style={styles.cardDate}>{date}</Text>
          <View style={[styles.badge, { backgroundColor: `${meta.color}22` }]}>
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
        {request.finalCost && (
          <Text style={styles.cost}>Bs. {request.finalCost}</Text>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>{request.problemDescription}</Text>

      {request.rating ? (
        <View style={styles.reviewRow}>
          <StarRating rating={request.rating} size={14} />
          {request.review && (
            <Text style={styles.reviewText} numberOfLines={1}>"{request.review}"</Text>
          )}
        </View>
      ) : request.status === 'completed' ? (
        <TouchableOpacity style={styles.reviewBtn} onPress={onReview}>
          <Text style={styles.reviewBtnText}>⭐ Calificar servicio</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function ClientHistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const [history, setHistory] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  async function loadHistory() {
    if (!user) return;
    const data = await DB.getHistory(user.id);
    setHistory(data);
    setLoading(false);
  }

  const totalSpent = history
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + (r.finalCost ?? 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{history.filter((r) => r.status === 'completed').length}</Text>
          <Text style={styles.summaryLabel}>Completados</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>Bs. {totalSpent}</Text>
          <Text style={styles.summaryLabel}>Total gastado</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {history.filter((r) => r.rating).length > 0
              ? (history.filter((r) => r.rating).reduce((s, r) => s + (r.rating ?? 0), 0) /
                 history.filter((r) => r.rating).length).toFixed(1)
              : '-'}
            {history.filter((r) => r.rating).length > 0 ? ' ⭐' : ''}
          </Text>
          <Text style={styles.summaryLabel}>Rating dado</Text>
        </View>
      </View>

      {history.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏍️</Text>
          <Text style={styles.emptyText}>Aún no tienes servicios</Text>
          <Text style={styles.emptySubtext}>Usa el botón SOS cuando necesites ayuda con tu moto</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadHistory}
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              onReview={() =>
                navigation.navigate('Review', {
                  requestId: item.id,
                  mechanicName: item.mechanicName,
                })
              }
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  summary: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  summaryLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 3 },
  summaryDivider: { width: 1, backgroundColor: Colors.border },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 30 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  photo: { width: 50, height: 50, borderRadius: Radius.full },
  cardInfo: { flex: 1, gap: 3 },
  mechanicName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  cardDate: { color: Colors.textMuted, fontSize: FontSize.xs },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  cost: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  description: { color: Colors.textSecondary, fontSize: FontSize.sm },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewText: { color: Colors.textMuted, fontSize: FontSize.xs, flex: 1 },
  reviewBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(245,158,11,0.15)',
  },
  reviewBtnText: { color: Colors.warning, fontSize: FontSize.sm, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyIcon: { fontSize: 60 },
  emptyText: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  emptySubtext: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center' },
});
