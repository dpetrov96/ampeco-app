import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';

import { useAppDispatch } from '../store/hooks';
import { setIsConnected } from '../store/slices/networkSlice';

export function useNetworkSync() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = Boolean(
        state.isConnected && state.isInternetReachable !== false,
      );
      dispatch(setIsConnected(connected));
    });

    return unsubscribe;
  }, [dispatch]);
}
