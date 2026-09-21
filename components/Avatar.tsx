/**
 * What this does:
 * Animated avatar component that reflects the assistant's current state.
 * Uses a color-shifting pulsing circle as a placeholder — swap in a Lottie
 * or Rive animation file later by replacing the inner View with:
 *   <LottieView source={require('../assets/avatar.json')} autoPlay loop />
 *
 * To get a free Lottie avatar animation:
 *   https://lottiefiles.com/search?q=robot+assistant
 *   Download the JSON file → place in assets/avatar-idle.json, etc.
 *
 * Props:
 *   state: 'idle' | 'listening' | 'thinking' | 'speaking'
 */

import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/theme';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AvatarProps {
  state: AvatarState;
  size?: number;
}

const STATE_CONFIG: Record<
  AvatarState,
  { color: string; emoji: string; label: string; pulseSpeed: number }
> = {
  idle: {
    color: Colors.primary,
    emoji: '🏠',
    label: 'Ready',
    pulseSpeed: 2000,
  },
  listening: {
    color: Colors.info,
    emoji: '🎙️',
    label: 'Listening...',
    pulseSpeed: 800,
  },
  thinking: {
    color: Colors.warning,
    emoji: '💭',
    label: 'Thinking...',
    pulseSpeed: 600,
  },
  speaking: {
    color: Colors.success,
    emoji: '🔊',
    label: 'Speaking...',
    pulseSpeed: 1000,
  },
};

export default function Avatar({ state, size = 120 }: AvatarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const config = STATE_CONFIG[state];

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: config.pulseSpeed / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: config.pulseSpeed / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [state, config.pulseSpeed, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: size + 24,
            height: size + 24,
            borderRadius: (size + 24) / 2,
            borderColor: config.color,
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.15],
              outputRange: [0.3, 0.1],
            }),
          },
        ]}
      />
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: config.color,
          },
        ]}
      >
        <Text style={[styles.emoji, { fontSize: size * 0.4 }]}>
          {config.emoji}
        </Text>
      </View>
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 3,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    textAlign: 'center',
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
  },
});
