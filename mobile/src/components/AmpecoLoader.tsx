import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from 'react-native';

import { AMPECO_BLUE } from '@/theme/colors';

type Props = {
  visible?: boolean;
};

export function AmpecoLoader({ visible = true }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    if (!visible) {
      scale.stopAnimation();
      opacity.stopAnimation();
      return;
    }

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.14,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.55,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [visible, scale, opacity]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Image
          source={require('@root-assets/ampeco-mark-white.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Loading"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: AMPECO_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logo: {
    width: 112,
    height: 112,
  },
});
