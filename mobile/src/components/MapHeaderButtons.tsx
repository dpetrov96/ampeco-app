import { DrawerActions } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import type { RightDrawerParamList } from '../navigation/types';

type Props = {
  navigation: DrawerNavigationProp<RightDrawerParamList, 'MapMain'>;
};

export function MapHeaderButtons({ navigation }: Props) {
  const openLeftDrawer = () => {
    navigation.getParent()?.dispatch(DrawerActions.openDrawer());
  };

  const openRightDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.row} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open settings menu"
        onPress={openLeftDrawer}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Image
          source={require('../assets/icons/settings.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open filters menu"
        onPress={openRightDrawer}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Image
          source={require('../assets/icons/filter.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C2430',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 22,
    height: 22,
  },
});
