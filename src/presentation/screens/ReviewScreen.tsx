import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Spacing, Radius, FontSize } from '../theme/spacing';
import StarRating from '../components/StarRating';
import { ServiceRequestRepositoryImpl } from '../../data/repositories/ServiceRequestRepositoryImpl';
import { useAppStore } from '../../store/useAppStore';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Review'>;

const repo = new ServiceRequestRepositoryImpl();

const REVIEW_TAGS = [
  '⚡ Puntual', '👷 Profesional', '💰 Buen precio',
  '🔧 Experto', '😊 Amable', '✅ Resolvió el problema',
  '📞 Buena comunicación', '🏆 Lo recomiendo',
];

export default function ReviewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { requestId, mechanicName } = route.params;
  const { updateHistoryItem } = useAppStore();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Calificación requerida', 'Por favor selecciona una calificación con estrellas');
      return;
    }
    setLoading(true);
    await repo.submitReview(requestId, {
      requestId,
      mechanicId: '',
      userId: 'user1',
      userName: 'Sergio López',
      rating,
      comment,
      tags: selectedTags,
    });
    updateHistoryItem(requestId, { rating, review: comment });
    setLoading(false);

    Alert.alert(
      '¡Gracias por tu reseña! ⭐',
      'Tu opinión ayuda a otros usuarios a elegir mejor.',
      [{ text: 'Ir al inicio', onPress: () => navigation.navigate('MainTabs') }]
    );
  }

  const ratingMessages = ['', '😞 Muy malo', '😐 Malo', '😊 Bueno', '😃 Muy bueno', '🌟 Excelente'];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>⭐</Text>
            <Text style={styles.title}>¿Cómo estuvo el servicio?</Text>
            <Text style={styles.subtitle}>Califica a {mechanicName}</Text>
          </View>

          {/* Estrellas */}
          <View style={styles.starsSection}>
            <StarRating
              rating={rating}
              size={48}
              interactive
              onRate={setRating}
            />
            {rating > 0 && (
              <Text style={styles.ratingMessage}>{ratingMessages[rating]}</Text>
            )}
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Qué destacarías? (opcional)</Text>
            <View style={styles.tagsGrid}>
              {REVIEW_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagBtn, selectedTags.includes(tag) && styles.tagSelected]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comentario */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comentario (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Cuéntanos tu experiencia..."
              placeholderTextColor={Colors.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Botones */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.skipText}>Omitir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, rating === 0 && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading || rating === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {loading ? 'Enviando...' : 'Enviar reseña'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md },
  header: { alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.xl },
  emoji: { fontSize: 60, marginBottom: Spacing.sm },
  title: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.md, marginTop: 6, textAlign: 'center' },
  starsSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  ratingMessage: {
    color: Colors.warning,
    fontSize: FontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.md },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tagSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255,107,53,0.15)',
  },
  tagText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  tagTextSelected: { color: Colors.primary },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  skipBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  skipText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  submitBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    padding: Spacing.md,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800' },
});
