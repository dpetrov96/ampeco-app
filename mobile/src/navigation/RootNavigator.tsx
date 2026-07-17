import {
  createDrawerNavigator,
  type DrawerNavigationProp,
} from '@react-navigation/drawer';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { FilterDrawerContent } from '@/components/FilterDrawerContent';
import { LeftDrawerContent } from '@/components/LeftDrawerContent';
import type { LeftDrawerParamList, RightDrawerParamList } from '@/navigation/types';
import { MapScreen } from '@/screens/MapScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { AMPECO_BLUE } from '@/theme/colors';

const LeftDrawer = createDrawerNavigator<LeftDrawerParamList>();
const RightDrawer = createDrawerNavigator<RightDrawerParamList>();

function SettingsBackButton() {
  const navigation =
    useNavigation<DrawerNavigationProp<LeftDrawerParamList>>();

  return (
    <Pressable
      onPress={() => navigation.navigate('Map')}
      style={styles.backButton}
      accessibilityRole="button"
      accessibilityLabel="Back to map"
    >
      <Text style={styles.backText}>← Map</Text>
    </Pressable>
  );
}

function RightDrawerNavigator() {
  return (
    <RightDrawer.Navigator
      id="RightDrawer"
      drawerContent={FilterDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerType: 'front',
        drawerStyle: {
          width: '86%',
          backgroundColor: '#F2F2F7',
        },
      }}
    >
      <RightDrawer.Screen name="MapMain" component={MapScreen} />
    </RightDrawer.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <LeftDrawer.Navigator
        id="LeftDrawer"
        drawerContent={LeftDrawerContent}
        screenOptions={{
          drawerPosition: 'left',
          drawerType: 'front',
          drawerStyle: {
            width: '82%',
            backgroundColor: '#F2F2F7',
          },
        }}
      >
        <LeftDrawer.Screen
          name="Map"
          component={RightDrawerNavigator}
          options={{
            title: 'Map',
            headerShown: false,
          }}
        />
        <LeftDrawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerStyle: { backgroundColor: '#F2F2F7' },
            headerShadowVisible: false,
            headerLeft: SettingsBackButton,
          }}
        />
      </LeftDrawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 16,
  },
  backText: {
    fontSize: 16,
    color: AMPECO_BLUE,
  },
});
