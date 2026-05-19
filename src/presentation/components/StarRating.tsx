import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../theme/colors';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

function Star({ filled, size, onPress }: { filled: boolean; size: number; onPress?: () => void }) {
  const star = (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? Colors.star : Colors.card}
        stroke={filled ? Colors.star : Colors.textMuted}
        strokeWidth={1}
      />
    </Svg>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{star}</TouchableOpacity>;
  }
  return star;
}

export default function StarRating({ rating, maxStars = 5, size = 20, interactive, onRate }: StarRatingProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }, (_, i) => (
        <Star
          key={i}
          filled={i < Math.round(rating)}
          size={size}
          onPress={interactive && onRate ? () => onRate(i + 1) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 3,
  },
});
