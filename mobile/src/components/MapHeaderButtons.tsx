import { DrawerActions } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        style={styles.button}
      >
        <Text style={styles.icon}>☰</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open filters menu"
        onPress={openRightDrawer}
        style={styles.button}
      >
        <Text style={styles.icon}>⚙</Text>
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
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  icon: {
    fontSize: 22,
    color: '#111827',
  },
});
