import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  CONNECTOR_STATUSES,
  CONNECTOR_TYPES,
  type ConnectorStatus,
  type ConnectorType,
} from '@/types/pin';

export type FilterSelection = {
  types: ConnectorType[];
  statuses: ConnectorStatus[];
};

type FiltersState = {
  applied: FilterSelection;
  /** Selection waiting to be committed after the apply overlay/drawer close. */
  pending: FilterSelection | null;
  isApplying: boolean;
};

const allFilters: FilterSelection = {
  types: [...CONNECTOR_TYPES],
  statuses: [...CONNECTOR_STATUSES],
};

const initialState: FiltersState = {
  applied: {
    types: [...allFilters.types],
    statuses: [...allFilters.statuses],
  },
  pending: null,
  isApplying: false,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    /** Drawer commits local UI selection and asks MapScreen to apply it. */
    requestApplyFilters(state, action: PayloadAction<FilterSelection>) {
      state.pending = {
        types: [...action.payload.types],
        statuses: [...action.payload.statuses],
      };
      state.isApplying = true;
    },
    /** MapScreen commits pending → applied once the UI has settled. */
    commitApplyFilters(state) {
      if (state.pending) {
        state.applied = {
          types: [...state.pending.types],
          statuses: [...state.pending.statuses],
        };
        state.pending = null;
      }
    },
    finishApplyFilters(state) {
      state.isApplying = false;
    },
  },
});

export const {
  requestApplyFilters,
  commitApplyFilters,
  finishApplyFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
