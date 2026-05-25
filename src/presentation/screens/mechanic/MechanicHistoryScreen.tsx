import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import { useAuthStore } from '../../../store/useAuthStore';
import { ServiceRequest } from '../../../data/local/Database';
import * as DB from '../../../data/local/Database';

const STATUS_COLORS: Record<string, string> = {
  completed: Colors.success,
  cancelled: Colors.sos,
  pending: Colors.warning,
  accepted: Colors.info,
  in_route: Colors.info,
  in_progress: Colors.info,
};

export default function MechanicHistoryScreen() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  async function loadHistory() {
    if (!user) return;
    const data = await DB.getHistory(user.id);
    setHistory(data);
  }

  const completed = history.filter((r) => r.status === 'completed');
  const totalEarned = completed.reduce((sum, r) => sum + (r.finalCost ?? 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{completed.length}</Text>
          <Text style={styles.summaryLabel}>Completados</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>Bs. {totalEarned}</Text>
          <Text style={styles.summaryLabel}>Total ganado</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {completed.filter((r) => r.rating).length > 0
              ? (completed.filter((r) => r.rating).reduce((s, r) => s + (r.rating ?? 0), 0) /
                 completed.filter((r) => r.rating).length).toFixed(1)
              : '5.0'
            } ⭐
          </Text>
          <Text style={styles.summaryLabel}>Rating recibido</Text>
        </View>
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔧</Text>
          <Text style={styles.emptyText}>Sin servicios todavía</Text>
          <Text style={styles.emptySubtext}>Actívate en línea para recibir solicitudes</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardDesc}>🏍️ {item.problemDescription}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] ?? Colors.textMuted) + '22' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] ?? Colors.textMuted }]}>
                    {item.status === 'completed' ? 'Completado' : item.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              {item.finalCost && (
                <Text style={styles.cardCost}>💰 Bs. {item.finalCost}</Text>
              )}
              {item.rating && (
                <Text style={styles.cardRating}>⭐ {item.rating}/5 {item.review ? `- "${item.review}"` : ''}</Text>
              )}
            </View>
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
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDesc: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600', flex: 1 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  cardDate: { color: Colors.textMuted, fontSize: FontSize.xs },
  cardCost: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
  cardRating: { color: Colors.warning, fontSize: FontSize.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyIcon: { fontSize: 60 },
  emptyText: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  emptySubtext: { color: Colors.textSecondary, fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: 40 },
});
