import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import { useAppStore } from '../../store/useAppStore';

const MENU_ITEMS = [
  { icon: '🚗', label: 'Mis vehículos', desc: 'Toyota Corolla 2018' },
  { icon: '📍', label: 'Direcciones guardadas', desc: 'Casa, Trabajo...' },
  { icon: '💳', label: 'Métodos de pago', desc: 'Efectivo, Tarjeta' },
  { icon: '🔔', label: 'Notificaciones', desc: 'Activas' },
  { icon: '🔒', label: 'Privacidad', desc: 'Datos y permisos' },
  { icon: '❓', label: 'Ayuda y soporte', desc: 'Chat, FAQ' },
  { icon: '⭐', label: 'Calificar la app', desc: 'Déjanos tu opinión' },
  { icon: '📋', label: 'Términos y condiciones', desc: '' },
];

export default function ProfileScreen() {
  const { user, history } = useAppStore();

  const completedServices = history.filter((r) => r.status === 'completed').length;
  const avgRating = history.filter((r) => r.rating).length > 0
    ? (history.filter((r) => r.rating).reduce((s, r) => s + (r.rating ?? 0), 0) /
       history.filter((r) => r.rating).length).toFixed(1)
    : '5.0';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header perfil */}
        <LinearGradient
          colors={[Colors.surface, Colors.background]}
          style={styles.profileHeader}
        >
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: user.photo }} style={styles.avatar} />
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedServices}</Text>
              <Text style={styles.statLabel}>Servicios</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{avgRating} ⭐</Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2026</Text>
              <Text style={styles.statLabel}>Miembro desde</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
            <Text style={styles.editBtnText}>✏️  Editar perfil</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Vehículo */}
        <View style={styles.vehicleCard}>
          <Text style={styles.vehicleIcon}>🚗</Text>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleLabel}>Mi vehículo</Text>
            <Text style={styles.vehicleName}>{user.vehicle}</Text>
          </View>
          <TouchableOpacity style={styles.changeVehicle}>
            <Text style={styles.changeVehicleText}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        {/* Menú */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i === MENU_ITEMS.length - 1 && styles.menuItemLast]}
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.desc ? <Text style={styles.menuDesc}>{item.desc}</Text> : null}
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Cerrar sesión', '¿Estás seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: () => {} },
          ])}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>🚪  Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>MecánicosYa v1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  avatarWrapper: { position: 'relative', marginBottom: Spacing.md },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  verifiedIcon: { color: Colors.white, fontSize: 12, fontWeight: '900' },
  userName: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  userEmail: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  userPhone: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 3 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  editBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  editBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  vehicleIcon: { fontSize: 28 },
  vehicleInfo: { flex: 1 },
  vehicleLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  vehicleName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  changeVehicle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,107,53,0.15)',
  },
  changeVehicleText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700' },
  menuSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  menuDesc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  menuArrow: { color: Colors.textMuted, fontSize: 22 },
  logoutBtn: {
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutText: { color: Colors.sos, fontSize: FontSize.md, fontWeight: '700' },
  version: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', marginBottom: Spacing.sm },
});
