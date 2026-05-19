import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { Colors } from '../theme/colors';

interface SOSButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function SOSButton({ onPress, disabled }: SOSButtonProps) {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulse1, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1.7, duration: 1200, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulse1, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(pulse2, { toValue: 1, duration: 1200, useNativeDriver: true }),
          ]),
        ])
      ).start();
    };
    if (!disabled) animate();
  }, [disabled]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[styles.ring, styles.ring2, { transform: [{ scale: pulse2 }], opacity: 0.15 }]}
      />
      <Animated.View
        style={[styles.ring, styles.ring1, { transform: [{ scale: pulse1 }], opacity: 0.25 }]}
      />
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.button, disabled && styles.disabled]}
        activeOpacity={0.85}
      >
        <Text style={styles.sosText}>SOS</Text>
        <Text style={styles.subText}>Buscar Mecánico</Text>
      </TouchableOpacity>
    </View>
  );
}

const SIZE = 160;

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE + 80,
    height: SIZE + 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.sos,
  },
  ring1: {},
  ring2: {},
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.sos,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.sos,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  disabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0,
  },
  sosText: {
    color: Colors.white,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 1,
  },
});
