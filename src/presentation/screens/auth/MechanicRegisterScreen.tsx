import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Spacing, Radius, FontSize } from '../../theme/spacing';
import { useAuthStore } from '../../../store/useAuthStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SPECIALTIES_LIST = [
  'Motor 4T', 'Motor 2T', 'Electricidad', 'Frenos', 'Suspensión',
  'Llantas', 'Cadena/Transmisión', 'Carburador', 'Inyección', 'Diagnóstico',
  'Reprogramación', 'Cambio de aceite', 'Alineación',
];

const VEHICLE_TYPES = [
  'Deportiva', 'Naked', 'Touring', 'Custom/Chopper',
  'Scooter', 'Enduro/Trail', 'Motomoto', 'Todos los tipos',
];

export default function MechanicRegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { registerMechanic, user } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [ruc, setRuc] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleSpecialty(s: string) {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((t) => t !== s) : [...prev, s]
    );
  }

  function toggleVehicleType(v: string) {
    setVehicleTypes((prev) =>
      prev.includes(v) ? prev.filter((t) => t !== v) : [...prev, v]
    );
  }

  async function handleSubmit() {
    if (!name.trim()) { Alert.alert('Error', 'Ingresa tu nombre'); return; }
    if (specialties.length === 0) { Alert.alert('Error', 'Selecciona al menos una especialidad'); return; }
    if (vehicleTypes.length === 0) { Alert.alert('Error', 'Selecciona al menos un tipo de moto'); return; }
    if (!yearsExperience || !pricePerHour) {
      Alert.alert('Error', 'Completa años de experiencia y precio por hora');
      return;
    }

    setLoading(true);
    await registerMechanic({
      name: name.trim(),
      ruc: ruc.trim(),
      specialties,
      vehicleTypes,
      yearsExperience,
      pricePerHour,
      bio: bio.trim(),
    });
    setLoading(false);
    // Navigation handled by auth store (user.role === 'mechanic')
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.icon}>🔧</Text>
            <Text style={styles.title}>Completa tu perfil</Text>
            <Text style={styles.subtitle}>
              Esta información aparecerá a los clientes
            </Text>
          </View>

          {/* Nombre */}
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.textMuted}
          />

          {/* RUC */}
          <Text style={styles.label}>
            RUC (opcional) <Text style={styles.labelHint}>- te da insignia verificada ✓</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="12345678901234"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            maxLength={14}
            value={ruc}
            onChangeText={setRuc}
          />
          {ruc.trim().length > 0 && (
            <View style={styles.verifiedBanner}>
              <Text style={styles.verifiedText}>✓ Obtendrás la insignia de verificado</Text>
            </View>
          )}

          {/* Especialidades */}
          <Text style={styles.label}>Especialidades</Text>
          <View style={styles.tagsGrid}>
            {SPECIALTIES_LIST.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.tag, specialties.includes(s) && styles.tagSelected]}
                onPress={() => toggleSpecialty(s)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tagText, specialties.includes(s) && styles.tagTextSelected]}>
                  🔧 {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tipos de moto */}
          <Text style={styles.label}>Tipos de moto que atiendes</Text>
          <View style={styles.tagsGrid}>
            {VEHICLE_TYPES.map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.tag, vehicleTypes.includes(v) && styles.tagSelected]}
                onPress={() => toggleVehicleType(v)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tagText, vehicleTypes.includes(v) && styles.tagTextSelected]}>
                  🏍️ {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Años y precio */}
          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Años de exp.</Text>
              <TextInput
                style={styles.input}
                placeholder="5"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={yearsExperience}
                onChangeText={setYearsExperience}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Precio/hr (S/.)</Text>
              <TextInput
                style={styles.input}
                placeholder="80"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={pricePerHour}
                onChangeText={setPricePerHour}
              />
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.label}>Sobre ti</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Cuéntales a los clientes sobre tu experiencia..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
            value={bio}
            onChangeText={setBio}
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>✅ Completar registro</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl, gap: Spacing.sm },
  header: { alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  icon: { fontSize: 48 },
  title: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.sm },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  labelHint: { color: Colors.success, fontWeight: '400' },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 14,
    color: Colors.text,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  verifiedBanner: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
  },
  verifiedText: { color: Colors.success, fontSize: FontSize.sm, fontWeight: '600' },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tagSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255,107,53,0.15)',
  },
  tagText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600' },
  tagTextSelected: { color: Colors.primary },
  rowInputs: { flexDirection: 'row', gap: Spacing.sm },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '800' },
});
