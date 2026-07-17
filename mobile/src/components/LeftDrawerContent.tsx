import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export function LeftDrawerContent(props: DrawerContentComponentProps) {
  const goSettings = () => {
    props.navigation.navigate('Settings');
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      <Text style={styles.heading}>Menu</Text>

      <View style={styles.card}>
        <Pressable
          onPress={goSettings}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Image
            source={require('@/assets/icons/settings.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <View style={styles.textBlock}>
            <Text style={styles.label}>Settings</Text>
            <Text style={styles.sublabel}>Pin style and preferences</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#F2F2F7',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  pressed: {
    backgroundColor: '#F7F7F8',
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 14,
    tintColor: '#111111',
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  sublabel: {
    marginTop: 2,
    fontSize: 13,
    color: '#8E8E93',
  },
  chevron: {
    fontSize: 28,
    lineHeight: 28,
    color: '#C7C7CC',
    fontWeight: '300',
    marginLeft: 8,
  },
});
