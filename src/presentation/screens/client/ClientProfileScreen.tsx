import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import { useAuthStore } from '../../../store/useAuthStore';
import * as DB from '../../../data/local/Database';

export default function ClientProfileScreen() {
  const { user, logout, updateProfile, refreshUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [vehicle, setVehicle] = useState(user?.vehicle ?? '');

  async function handleSave() {
    await updateProfile({ name: name.trim(), vehicle: vehicle.trim() });
    setEditing(false);
    Alert.alert('Perfil actualizado', 'Tu información fue guardada correctamente.');
  }

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => logout() },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.surface, Colors.background]} style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: user?.photo ?? '' }} style={styles.avatar} />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          <Text style={styles.userRole}>🏍️ Cliente</Text>

          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.8}
            onPress={() => setEditing(!editing)}
          >
            <Text style={styles.editBtnText}>{editing ? 'Cancelar' : '✏️  Editar perfil'}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {editing && (
          <View style={styles.editSection}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.label}>Mi moto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Honda CB 190R 2024"
              placeholderTextColor={Colors.textMuted}
              value={vehicle}
              onChangeText={setVehicle}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Vehículo */}
        <View style={styles.vehicleCard}>
          <Text style={styles.vehicleIcon}>🏍️</Text>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleLabel}>Mi moto</Text>
            <Text style={styles.vehicleName}>{user?.vehicle || 'No especificada'}</Text>
          </View>
        </View>

        {/* Menú */}
        <View style={styles.menuSection}>
          <MenuItem icon="📋" label="Mis servicios" desc={`${user?.totalServices ?? 0} servicios realizados`} />
          <MenuItem icon="💳" label="Métodos de pago" desc="Efectivo, Tarjeta" />
          <MenuItem icon="⭐" label="Calificar la app" desc="Déjanos tu opinión" />
          <MenuItem icon="❓" label="Ayuda y soporte" desc="FAQ, Chat" />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪  Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>MecánicosYa v1.0 · Solo motos 🏍️</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuDesc}>{desc}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
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
  avatarWrapper: { marginBottom: Spacing.md },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  userName: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  userPhone: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  userRole: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600', marginTop: 4 },
  editBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  editBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
  editSection: {
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600' },
  input: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: 12,
    color: Colors.text,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    padding: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
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
  vehicleIcon: { fontSize: 36 },
  vehicleInfo: { flex: 1 },
  vehicleLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
  vehicleName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
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
