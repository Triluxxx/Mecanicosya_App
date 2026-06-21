import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import { useAuthStore } from '../../store/useAuthStore';
import { ApiClient } from '../../data/remote/ApiClient';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CLIENT_BENEFITS = {
  normal: [
    'Botón SOS con asignación automática del mecánico más cercano',
    'Historial de servicios',
    'Pago en efectivo, tarjeta, Yape o Plin',
  ],
  premium: [
    'Prioridad de atención: tu SOS se asigna primero',
    'No pagas el cargo de "Desbloquear experto" (S/. 5) en cada solicitud',
    'Descuentos en repuestos (llantas, cámaras, cadenas, etc.)',
    'Soporte prioritario 24/7',
  ],
};

const MECHANIC_BENEFITS = {
  normal: [
    'Recibes solicitudes de fallas comunes: llanta baja, batería, cambio de aceite, cadena',
    'Apareces en el listado según cercanía y disponibilidad',
    'Puedes publicar repuestos en tu propio catálogo',
  ],
  expert: [
    'Badge visible "🔧 Experto" — más confianza para el cliente',
    'Recibes además solicitudes de remolque/grúa y fallas complejas',
    'Prioridad de matching frente a mecánicos normales',
    'Requiere contar con vehículo de carga/grúa declarado en tu perfil',
  ],
};

export default function BenefitsScreen() {
  const navigation = useNavigation<Nav>();
  const { user, updateProfile, isMechanic, syncBackendId } = useAuthStore();

  const currentPlan = user?.plan;
  const isPremiumOrExpert = currentPlan === 'premium' || currentPlan === 'expert';

  function mirrorSubscription(plan: 'premium' | 'expert') {
    syncBackendId()
      .then((userId) => {
        if (!userId) return;
        return ApiClient.createSubscription({ userId, plan });
      })
      .catch((e) => console.warn('No se pudo replicar la suscripción en el backend real:', e));
  }

  async function handleUpgrade() {
    if (!user) return;

    if (isMechanic) {
      if (!user.hasTowingVehicle) {
        Alert.alert(
          'Necesitas vehículo de carga',
          'Para pasar a Experto primero declara que cuentas con vehículo de carga/grúa desde tu perfil.'
        );
        return;
      }
      await updateProfile({ plan: 'expert', badge: user.badge || 'FORMAL' });
      mirrorSubscription('expert');
      Alert.alert('¡Listo!', 'Ahora eres un mecánico Experto. Suscripción: S/. 20/mes.');
    } else {
      await updateProfile({ plan: 'premium' });
      mirrorSubscription('premium');
      Alert.alert('¡Listo!', 'Ahora tienes el plan Premium. Suscripción: S/. 15/mes.');
    }
  }

  const normalItems = isMechanic ? MECHANIC_BENEFITS.normal : CLIENT_BENEFITS.normal;
  const topItems = isMechanic ? MECHANIC_BENEFITS.expert : CLIENT_BENEFITS.premium;
  const topLabel = isMechanic ? 'Experto' : 'Premium';
  const topPrice = isMechanic ? 'S/. 20/mes' : 'S/. 15/mes';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Beneficios</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Normal</Text>
          {normalItems.map((item) => (
            <View key={item} style={styles.itemRow}>
              <Text style={styles.itemIcon}>✓</Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.cardTop]}>
          <View style={styles.cardTopHeader}>
            <Text style={styles.cardTitleTop}>{topLabel}</Text>
            <Text style={styles.priceTag}>{topPrice}</Text>
          </View>
          {topItems.map((item) => (
            <View key={item} style={styles.itemRow}>
              <Text style={[styles.itemIcon, { color: Colors.primary }]}>★</Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}

          {isPremiumOrExpert ? (
            <View style={styles.activeBanner}>
              <Text style={styles.activeBannerText}>✓ Ya tienes este plan activo</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade} activeOpacity={0.85}>
              <Text style={styles.upgradeBtnText}>Mejorar a {topLabel}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: Colors.text, fontSize: 20 },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  scroll: { padding: Spacing.md, gap: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardTop: { borderColor: Colors.primary, borderWidth: 2 },
  cardTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800', marginBottom: 4 },
  cardTopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitleTop: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  priceTag: {
    backgroundColor: 'rgba(255,107,53,0.15)', color: Colors.primary,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
    fontSize: FontSize.sm, fontWeight: '700',
  },
  itemRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  itemIcon: { color: Colors.success, fontSize: FontSize.sm, fontWeight: '800' },
  itemText: { color: Colors.textSecondary, fontSize: FontSize.sm, flex: 1, lineHeight: 20 },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    padding: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  upgradeBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },
  activeBanner: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  activeBannerText: { color: Colors.success, fontSize: FontSize.sm, fontWeight: '700' },
});
