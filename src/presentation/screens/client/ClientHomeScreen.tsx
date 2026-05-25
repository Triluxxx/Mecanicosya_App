import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import Logo from '../../components/Logo';
import SOSButton from '../../components/SOSButton';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAppStore } from '../../../store/useAppStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TIPS = [
  { icon: '🔌', title: 'No enciende', desc: 'Problemas de batería o encendido' },
  { icon: '🔧', title: 'Motor', desc: 'Ruidos extraños o pérdida de potencia' },
  { icon: '🛞', title: 'Llantas', desc: 'Pinchazo o desgaste de ruedas' },
  { icon: '⚡', title: 'Eléctrico', desc: 'Luces, arranque, cableado' },
];

export default function ClientHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const { history } = useAppStore();
  const lastService = history[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Logo size="sm" showText={true} />
          <TouchableOpacity onPress={() => navigation.navigate('ClientProfile' as any)}>
            <Image source={{ uri: user?.photo ?? 'https://ui-avatars.com/api/?name=User&background=FF6B35&color=fff' }} style={styles.avatar} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.greetingCard}
        >
          <Text style={styles.greeting}>Hola, {user?.name?.split(' ')[0] ?? 'Usuario'} 👋</Text>
          <Text style={styles.vehicle}>🏍️ {user?.vehicle || 'Agrega tu moto en Perfil'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user?.totalServices ?? 0}</Text>
              <Text style={styles.statLabel}>Servicios</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>4.9 ⭐</Text>
              <Text style={styles.statLabel}>Mi rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Mecánicos</Text>
            </View>
          </View>
        </LinearGradient>

        {/* SOS Section */}
        <View style={styles.sosSection}>
          <Text style={styles.sectionTitle}>¿Necesitas ayuda con tu moto?</Text>
          <Text style={styles.sectionSubtitle}>
            Presiona SOS y encontraremos un mecánico de motos disponible cerca tuyo
          </Text>
          <View style={styles.sosWrapper}>
            <SOSButton onPress={() => navigation.navigate('SOS')} />
          </View>
        </View>

        {/* Tipos de servicio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Problemas comunes en motos</Text>
          <View style={styles.tipsGrid}>
            {TIPS.map((tip) => (
              <TouchableOpacity
                key={tip.title}
                style={styles.tipCard}
                onPress={() => navigation.navigate('SOS')}
                activeOpacity={0.8}
              >
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Último servicio */}
        {lastService && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Último servicio</Text>
            <View style={styles.lastCard}>
              <Image source={{ uri: lastService.mechanicPhoto }} style={styles.mechanicPhoto} />
              <View style={styles.lastInfo}>
                <Text style={styles.lastMechanic}>{lastService.mechanicName}</Text>
                <Text style={styles.lastDesc} numberOfLines={1}>
                  {lastService.problemDescription}
                </Text>
                <View style={styles.lastMeta}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Completado ✓</Text>
                  </View>
                  <Text style={styles.lastCost}>Bs. {lastService.finalCost}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  greetingCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  greeting: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '700' },
  vehicle: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  sosSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  sosWrapper: { marginVertical: Spacing.md },
  section: { marginBottom: Spacing.xl },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tipCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
    gap: 4,
  },
  tipIcon: { fontSize: 28 },
  tipTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  tipDesc: { color: Colors.textSecondary, fontSize: FontSize.xs },
  lastCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  mechanicPhoto: { width: 55, height: 55, borderRadius: Radius.full },
  lastInfo: { flex: 1, gap: 4 },
  lastMechanic: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  lastDesc: { color: Colors.textSecondary, fontSize: FontSize.sm },
  lastMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '600' },
  lastCost: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '700' },
});
