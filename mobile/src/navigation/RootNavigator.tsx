import {
  createDrawerNavigator,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Pressable, Text } from 'react-native';

import { FilterDrawerContent } from '../components/FilterDrawerContent';
import { LeftDrawerContent } from '../components/LeftDrawerContent';
import { MapScreen } from '../screens/MapScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { LeftDrawerParamList, RightDrawerParamList } from './types';

const LeftDrawer = createDrawerNavigator<LeftDrawerParamList>();
const RightDrawer = createDrawerNavigator<RightDrawerParamList>();

function RightDrawerNavigator() {
  return (
    <RightDrawer.Navigator
      id="RightDrawer"
      drawerContent={(props: DrawerContentComponentProps) => (
        <FilterDrawerContent {...props} />
      )}
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
        drawerContent={(props) => <LeftDrawerContent {...props} />}
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
          options={({ navigation }) => ({
            title: 'Settings',
            headerStyle: { backgroundColor: '#F2F2F7' },
            headerShadowVisible: false,
            headerLeft: () => (
              <Pressable
                onPress={() => navigation.navigate('Map')}
                style={{ paddingHorizontal: 16 }}
                accessibilityRole="button"
                accessibilityLabel="Back to map"
              >
                <Text style={{ fontSize: 16, color: '#0E60C3' }}>← Map</Text>
              </Pressable>
            ),
          })}
        />
      </LeftDrawer.Navigator>
    </NavigationContainer>
  );
}
