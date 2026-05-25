import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
  TextInput, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import StarRating from '../../components/StarRating';
import { useAuthStore } from '../../../store/useAuthStore';

export default function MechanicProfileScreen() {
  const { user, logout, updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [pricePerHour, setPricePerHour] = useState(String(user?.pricePerHour ?? ''));
  const [bio, setBio] = useState(user?.bio ?? '');
  const [isOnline, setIsOnline] = useState(user?.status === 'online');

  async function handleSave() {
    await updateProfile({
      name: name.trim(),
      pricePerHour: parseInt(pricePerHour) || 0,
      bio: bio.trim(),
    });
    setEditing(false);
    Alert.alert('Perfil actualizado', 'Tu información fue guardada.');
  }

  async function toggleOnline(value: boolean) {
    setIsOnline(value);
    await updateProfile({ status: value ? 'online' : 'offline' });
  }

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro? Se cerrará tu sesión.', [
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
            {user?.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user?.name}</Text>
            {user?.verified && <Text style={styles.verifiedTag}>Verificado RUC</Text>}
          </View>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          {user?.ruc ? (
            <Text style={styles.rucText}>RUC: {user.ruc}</Text>
          ) : (
            <Text style={styles.noRuc}>Sin RUC registrado</Text>
          )}

          <View style={styles.onlineRow}>
            <Text style={[styles.onlineLabel, { color: isOnline ? Colors.success : Colors.textMuted }]}>
              {isOnline ? '🟢 Disponible para trabajar' : '⚫ No disponible'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnline}
              trackColor={{ false: Colors.card, true: 'rgba(16,185,129,0.3)' }}
              thumbColor={isOnline ? Colors.success : Colors.textMuted}
            />
          </View>

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
            <Text style={styles.label}>Precio por hora (Bs.)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={pricePerHour}
              onChangeText={setPricePerHour}
            />
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              multiline
              value={bio}
              onChangeText={setBio}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user?.totalServices ?? 0}</Text>
            <Text style={styles.statLabel}>Servicios</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <StarRating rating={user?.rating ?? 5} size={14} />
              <Text style={styles.statValue}>{user?.rating?.toFixed(1) ?? '5.0'}</Text>
            </View>
            <Text style={styles.statLabel}>{user?.totalReviews ?? 0} reseñas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>Bs. {user?.pricePerHour}</Text>
            <Text style={styles.statLabel}>Por hora</Text>
          </View>
        </View>

        {/* Especialidades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Especialidades</Text>
          <View style={styles.tags}>
            {user?.specialties?.map((s) => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tipos de moto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏍️ Tipos de moto que atiendo</Text>
          <View style={styles.tags}>
            {user?.vehicleTypes?.map((v) => (
              <View key={v} style={[styles.tag, styles.tagBlue]}>
                <Text style={[styles.tagText, { color: Colors.info }]}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bio */}
        {user?.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Sobre mí</Text>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        ) : null}

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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  verifiedIcon: { color: Colors.white, fontSize: 14, fontWeight: '900' },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userName: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  verifiedTag: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    color: Colors.success,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  userPhone: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  rucText: { color: Colors.success, fontSize: FontSize.sm, marginTop: 2, fontWeight: '600' },
  noRuc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  onlineLabel: { fontSize: FontSize.sm, fontWeight: '600' },
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
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  section: { marginHorizontal: Spacing.md, marginBottom: Spacing.lg },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  tagBlue: { backgroundColor: 'rgba(59,130,246,0.15)' },
  tagText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  bioText: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 22 },
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
