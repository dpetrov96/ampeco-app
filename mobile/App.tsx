import 'react-native-gesture-handler';

import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { useGetPinsQuery } from '@/api';
import { AmpecoLoader } from '@/components/AmpecoLoader';
import { RootNavigator } from '@/navigation/RootNavigator';
import { persistor, store } from '@/store';
import { AMPECO_BLUE } from '@/theme/colors';

const MIN_SPLASH_MS = 1400;

function AppBootstrap() {
  const { isLoading, isUninitialized, isSuccess, isError } = useGetPinsQuery();
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  const pinsSettled = isSuccess || isError;
  const showSplash =
    !minTimePassed || isUninitialized || isLoading || !pinsSettled;

  if (showSplash) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <AmpecoLoader />
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<AmpecoLoader />} persistor={persistor}>
            <AppBootstrap />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AMPECO_BLUE,
  },
});

export default App;
