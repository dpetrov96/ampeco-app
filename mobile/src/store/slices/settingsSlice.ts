import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { PinStyle } from '@/types/settings';

type SettingsState = {
  pinStyle: PinStyle;
};

const initialState: SettingsState = {
  pinStyle: 'pin',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setPinStyle(state, action: PayloadAction<PinStyle>) {
      state.pinStyle = action.payload;
    },
  },
});

export const { setPinStyle } = settingsSlice.actions;

export default settingsSlice.reducer;
