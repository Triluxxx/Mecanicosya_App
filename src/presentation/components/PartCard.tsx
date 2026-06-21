import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import { Part } from '../../domain/entities/Part';

const CATEGORY_LABELS: Record<Part['category'], string> = {
  llanta: '🛞 Llanta',
  camara: '⭕ Cámara',
  cadena: '⛓️ Cadena',
  aceite: '🛢️ Aceite',
  frenos: '🛑 Frenos',
  otro: '🔩 Otro',
};

interface PartCardProps {
  part: Part;
  onPress?: () => void;
}

export default function PartCard({ part, onPress }: PartCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.8}>
      <Image source={{ uri: part.photo }} style={styles.photo} />
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{part.name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{CATEGORY_LABELS[part.category]}</Text>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>{part.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.mechanicName}>Vende: {part.mechanicName}</Text>
          <Text style={styles.price}>S/. {part.price}</Text>
        </View>
        <Text style={styles.stock}>{part.stock > 0 ? `${part.stock} disponibles` : 'Sin stock'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
  },
  info: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  name: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700', flex: 1 },
  badge: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: { color: Colors.info, fontSize: FontSize.xs, fontWeight: '600' },
  description: { color: Colors.textSecondary, fontSize: FontSize.xs, lineHeight: 16 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  mechanicName: { color: Colors.textMuted, fontSize: FontSize.xs, flex: 1 },
  price: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '800' },
  stock: { color: Colors.textMuted, fontSize: 10 },
});
