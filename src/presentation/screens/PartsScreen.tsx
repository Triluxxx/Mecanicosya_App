import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import PartCard from '../components/PartCard';
import { Part, PartCategory } from '../../domain/entities/Part';
import { PartRepositoryImpl } from '../../data/repositories/PartRepositoryImpl';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const partRepository = new PartRepositoryImpl();

const CATEGORIES: { key: PartCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'llanta', label: '🛞 Llantas' },
  { key: 'camara', label: '⭕ Cámaras' },
  { key: 'cadena', label: '⛓️ Cadenas' },
  { key: 'aceite', label: '🛢️ Aceite' },
  { key: 'frenos', label: '🛑 Frenos' },
  { key: 'otro', label: '🔩 Otros' },
];

export default function PartsScreen() {
  const navigation = useNavigation<Nav>();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<PartCategory | 'all'>('all');

  useEffect(() => {
    partRepository.getAll().then((data) => {
      setParts(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => (category === 'all' ? parts : parts.filter((p) => p.category === category)),
    [parts, category]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Repuestos</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(c) => c.key}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, category === item.key && styles.filterChipActive]}
            onPress={() => setCategory(item.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, category === item.key && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <PartCard part={item} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay repuestos en esta categoría todavía.</Text>
          }
        />
      )}
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
  filters: { paddingHorizontal: Spacing.md, gap: 8, paddingBottom: Spacing.sm },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  filterChipTextActive: { color: Colors.white },
  list: { padding: Spacing.md },
  empty: { color: Colors.textMuted, fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.xl },
});
