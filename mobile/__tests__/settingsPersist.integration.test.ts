import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  commitApplyFilters,
  finishApplyFilters,
  requestApplyFilters,
} from '@/store/slices/filtersSlice';
import { setPinStyle } from '@/store/slices/settingsSlice';
import {
  createPersistedTestStore,
  flushPersistWrites,
  waitForRehydrate,
} from '@/test/createTestStore';
import { ConnectorStatus, ConnectorType } from '@/types/pin';

describe('settings persistence (integration)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('restores pin style after a new store bootstrap (app restart)', async () => {
    const first = createPersistedTestStore();
    await waitForRehydrate(first.persistor);

    expect(first.store.getState().settings.pinStyle).toBe('pin');

    first.store.dispatch(setPinStyle('dot'));
    await flushPersistWrites();

    first.persistor.pause();

    const second = createPersistedTestStore();
    await waitForRehydrate(second.persistor);

    expect(second.store.getState().settings.pinStyle).toBe('dot');
  });

  it('does not persist filter selections across restart', async () => {
    const first = createPersistedTestStore();
    await waitForRehydrate(first.persistor);

    first.store.dispatch(
      requestApplyFilters({
        types: [ConnectorType.Type2],
        statuses: [ConnectorStatus.Available],
      }),
    );
    first.store.dispatch(commitApplyFilters());
    first.store.dispatch(finishApplyFilters());
    first.store.dispatch(setPinStyle('dot'));
    await flushPersistWrites();
    first.persistor.pause();

    const second = createPersistedTestStore();
    await waitForRehydrate(second.persistor);

    expect(second.store.getState().settings.pinStyle).toBe('dot');
    expect(second.store.getState().filters.applied.types.length).toBeGreaterThan(
      1,
    );
  });
});
