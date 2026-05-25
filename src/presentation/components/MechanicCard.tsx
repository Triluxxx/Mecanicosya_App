import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import StarRating from './StarRating';
import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import { User } from '../../data/local/Database';

interface MechanicCardProps {
  mechanic: User & { distanceKm?: number; etaMinutes?: number };
  onPress: () => void;
  onRequest?: () => void;
  compact?: boolean;
}

export default function MechanicCard({ mechanic, onPress, onRequest, compact }: MechanicCardProps) {
  const distance = (mechanic as any).distanceKm ?? 1.5;
  const eta = (mechanic as any).etaMinutes ?? 10;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.8}>
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: mechanic.photo }} style={styles.photo} />
        {mechanic.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name}>{mechanic.name}</Text>
          {mechanic.verified ? (
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>Verificado</Text>
            </View>
          ) : (
            <View style={[styles.badge, mechanic.status === 'online' ? styles.badgeGreen : styles.badgeGray]}>
              <Text style={styles.badgeText}>
                {mechanic.status === 'online' ? 'Disponible' : 'Ocupado'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.ratingRow}>
          <StarRating rating={mechanic.rating ?? 5} size={14} />
          <Text style={styles.ratingText}>{(mechanic.rating ?? 5).toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({mechanic.totalReviews})</Text>
          {mechanic.yearsExperience > 0 && (
            <Text style={styles.years}>{mechanic.yearsExperience} años exp.</Text>
          )}
        </View>

        <View style={styles.specialties}>
          {mechanic.specialties?.slice(0, compact ? 2 : 3).map((s) => (
            <View key={s} style={styles.tag}>
              <Text style={styles.tagText}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Distancia</Text>
            <Text style={styles.metaValue}>{distance} km</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Llega en</Text>
            <Text style={[styles.metaValue, { color: Colors.warning }]}>{eta} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Precio/hr</Text>
            <Text style={[styles.metaValue, { color: Colors.primary }]}>Bs. {mechanic.pricePerHour}</Text>
          </View>
          {onRequest && (
            <TouchableOpacity onPress={onRequest} style={styles.requestBtn}>
              <Text style={styles.requestBtnText}>Solicitar</Text>
            </TouchableOpacity>
          )}
        </View>
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
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  verifiedIcon: { color: Colors.white, fontSize: 10, fontWeight: '900' },
  info: { flex: 1, gap: 5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeGreen: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeGreenText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '600' },
  badgeGray: { backgroundColor: Colors.card },
  badgeText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  reviewCount: { color: Colors.textSecondary, fontSize: FontSize.xs },
  years: { color: Colors.textMuted, fontSize: FontSize.xs, marginLeft: 4 },
  specialties: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  tag: {
    backgroundColor: 'rgba(255,107,53,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tagText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '600' },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 },
  metaItem: { alignItems: 'center' },
  metaLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '500' },
  metaValue: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700' },
  requestBtn: {
    marginLeft: 'auto',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
  },
  requestBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700' },
});
