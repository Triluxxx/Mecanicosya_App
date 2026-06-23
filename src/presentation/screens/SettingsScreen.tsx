import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import { ApiClient, getApiUrl, getDefaultApiUrl, setApiUrl } from '../../data/remote/ApiClient';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const [url, setUrl] = useState('');
  const [defaultUrl, setDefaultUrl] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setUrl(getApiUrl());
    setDefaultUrl(getDefaultApiUrl());
  }, []);

  async function handleSave() {
    await setApiUrl(url);
    Alert.alert('Guardado', 'La URL del servidor fue actualizada.');
  }

  async function handleReset() {
    await setApiUrl('');
    setUrl(getDefaultApiUrl());
    Alert.alert('Restablecido', 'Se volvió a usar la URL por defecto.');
  }

  async function handleTest() {
    setTesting(true);
    try {
      await setApiUrl(url);
      const res = await ApiClient.health();
      Alert.alert('Conexión exitosa', `Servidor respondió: ${JSON.stringify(res)}`);
    } catch (e: any) {
      Alert.alert('No se pudo conectar', e?.message ?? 'Error desconocido');
    } finally {
      setTesting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configuración del servidor</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={styles.label}>URL del backend (API)</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="http://192.168.1.10:3001"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.hint}>
          Por defecto: {defaultUrl}
        </Text>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>💾  Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testBtn}
          onPress={handleTest}
          activeOpacity={0.85}
          disabled={testing}
        >
          <Text style={styles.testBtnText}>{testing ? 'Probando...' : '🔌  Probar conexión'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.85}>
          <Text style={styles.resetBtnText}>↺  Restablecer a la URL por defecto</Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Cambia esto si el backend no corre en la dirección por defecto (por ejemplo, si te
          conectas a un servidor en otra red o a una IP distinta de la de desarrollo).
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  backBtn: { paddingVertical: 4, paddingRight: 4 },
  backText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '700' },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800' },
  label: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600', marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 12,
    color: Colors.text,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: Spacing.sm },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    padding: 14,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  saveBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  testBtn: {
    borderRadius: Radius.full,
    padding: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  testBtnText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '700' },
  resetBtn: {
    borderRadius: Radius.full,
    padding: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetBtnText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  footnote: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: Spacing.lg, lineHeight: 18 },
});
