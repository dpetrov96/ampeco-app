import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Pressable, Text } from 'react-native';

import { FilterDrawerContent } from '../components/FilterDrawerContent';
import { MapScreen } from '../screens/MapScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { LeftDrawerParamList, RightDrawerParamList } from './types';

const LeftDrawer = createDrawerNavigator<LeftDrawerParamList>();
const RightDrawer = createDrawerNavigator<RightDrawerParamList>();

function LeftDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Settings"
        onPress={() => props.navigation.navigate('Settings')}
      />
    </DrawerContentScrollView>
  );
}

function RightDrawerNavigator() {
  return (
    <RightDrawer.Navigator
      id="RightDrawer"
      drawerContent={(props) => <FilterDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'right',
        drawerType: 'front',
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
            headerLeft: () => (
              <Pressable
                onPress={() => navigation.navigate('Map')}
                style={{ paddingHorizontal: 16 }}
                accessibilityRole="button"
                accessibilityLabel="Back to map"
              >
                <Text style={{ fontSize: 16 }}>← Map</Text>
              </Pressable>
            ),
          })}
        />
      </LeftDrawer.Navigator>
    </NavigationContainer>
  );
}
