import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import * as DB from '../../data/local/Database';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Payment'>;

const PAYMENT_METHODS = [
  { id: 'cash' as const, label: 'Efectivo', icon: '💵', desc: 'Paga en mano al mecánico' },
  { id: 'card' as const, label: 'Tarjeta', icon: '💳', desc: 'Visa / Mastercard / Débito' },
  { id: 'transfer' as const, label: 'Transferencia', icon: '📱', desc: 'QR o transferencia bancaria' },
];

export default function PaymentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { requestId, estimatedCost } = route.params;

  const [selected, setSelected] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [loading, setLoading] = useState(false);

  const serviceFee = Math.round(estimatedCost * 0.05);
  const total = estimatedCost + serviceFee;

  async function handlePay() {
    setLoading(true);
    await DB.updateRequest(requestId, {
      status: 'completed',
      paymentMethod: selected,
      finalCost: total,
      paymentStatus: 'paid',
      completedAt: new Date().toISOString(),
    });
    setLoading(false);

    const req = await DB.getRequestById(requestId);
    Alert.alert(
      '¡Pago exitoso! 🎉',
      `Tu pago de S/. ${total} fue procesado.`,
      [
        {
          text: 'Calificar servicio',
          onPress: () => navigation.replace('Review', {
            requestId,
            mechanicName: req?.mechanicName ?? 'el mecánico',
          }),
        },
        {
          text: 'Ir al inicio',
          onPress: () => navigation.navigate('ClientTabs' as any),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Resumen del pago</Text>
          <Text style={styles.subtitle}>🏍️ Servicio completado ✓</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Desglose</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Servicio mecánico</Text>
            <Text style={styles.rowValue}>S/. {estimatedCost}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Comisión (5%)</Text>
            <Text style={styles.rowValue}>S/. {serviceFee}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>S/. {total}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodCard, selected === m.id && styles.methodSelected]}
              onPress={() => setSelected(m.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodLabel, selected === m.id && { color: Colors.primary }]}>{m.label}</Text>
                <Text style={styles.methodDesc}>{m.desc}</Text>
              </View>
              <View style={[styles.radio, selected === m.id && styles.radioSelected]}>
                {selected === m.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          onPress={handlePay} disabled={loading} activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.payBtnText}>Confirmar pago · S/. {total}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md },
  header: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  subtitle: { color: Colors.success, fontSize: FontSize.md, marginTop: 6, fontWeight: '600' },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  cardTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  rowValue: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  totalLabel: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  totalValue: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: '900' },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.md },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 2, borderColor: Colors.border, gap: Spacing.md,
  },
  methodSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(255,107,53,0.08)' },
  methodIcon: { fontSize: 28 },
  methodInfo: { flex: 1 },
  methodLabel: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  methodDesc: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: Colors.textMuted, alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  footer: { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  payBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full, padding: Spacing.md,
    alignItems: 'center',
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800' },
});
