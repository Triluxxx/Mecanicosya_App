import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';
import { Colors } from '../theme/colors';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

function WrenchIcon({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Fondo hexagonal */}
      <Path
        d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z"
        fill={Colors.primary}
      />
      {/* Llave inglesa */}
      <G transform="translate(50,50) rotate(-45) translate(-50,-50)">
        <Path
          d="M38 25C28.6 25 21 32.6 21 42C21 51.4 28.6 59 38 59C41.2 59 44.2 58 46.7 56.3L67.5 77L75 69.5L54.3 48.7C56 46.2 57 43.2 57 40C57 30.6 49.4 23 40 23C39.3 23 38.7 23 38 25Z"
          fill={Colors.white}
          opacity={0.15}
        />
        <Path
          d="M40 28C32.3 28 26 34.3 26 42C26 49.7 32.3 56 40 56C43.5 56 46.7 54.7 49.1 52.5L68 71L72 67L53.1 48.1C55.3 45.7 56.6 42.5 56.6 39C56.6 31.3 50.3 25 42.6 25C41.7 25 40.9 25.1 40 25.3V28Z"
          fill={Colors.white}
        />
        <Rect x={36} y={52} width={8} height={20} rx={4} fill={Colors.white} />
      </G>
      {/* Pin de ubicación pequeño */}
      <Circle cx={72} cy={28} r={10} fill={Colors.sos} />
      <Path
        d="M72 20C68.7 20 66 22.7 66 26C66 29.3 72 36 72 36C72 36 78 29.3 78 26C78 22.7 75.3 20 72 20Z"
        fill={Colors.white}
      />
      <Circle cx={72} cy={26} r={2.5} fill={Colors.sos} />
    </Svg>
  );
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const iconSize = size === 'sm' ? 36 : size === 'md' ? 56 : 80;
  const textSizes = {
    sm: { brand: 16, tag: 9 },
    md: { brand: 22, tag: 11 },
    lg: { brand: 32, tag: 14 },
  };

  return (
    <View style={styles.container}>
      <WrenchIcon size={iconSize} />
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.brand, { fontSize: textSizes[size].brand }]}>
            <Text style={styles.brandOrange}>Mecánicos</Text>
            <Text style={styles.brandWhite}>Ya</Text>
          </Text>
          <Text style={[styles.tagline, { fontSize: textSizes[size].tag }]}>
            Tu mecánico en minutos
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textContainer: {
    justifyContent: 'center',
  },
  brand: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandOrange: {
    color: Colors.primary,
  },
  brandWhite: {
    color: Colors.text,
  },
  tagline: {
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
});
