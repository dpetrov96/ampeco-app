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
  draft: FilterSelection;
  applied: FilterSelection;
  isApplying: boolean;
};

const allFilters: FilterSelection = {
  types: [...CONNECTOR_TYPES],
  statuses: [...CONNECTOR_STATUSES],
};

const initialState: FiltersState = {
  draft: {
    types: [...allFilters.types],
    statuses: [...allFilters.statuses],
  },
  applied: {
    types: [...allFilters.types],
    statuses: [...allFilters.statuses],
  },
  isApplying: false,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDraftFilters(state, action: PayloadAction<FilterSelection>) {
      state.draft = {
        types: [...action.payload.types],
        statuses: [...action.payload.statuses],
      };
    },
    beginApplyFilters(state) {
      state.isApplying = true;
    },
    applyFilters(state) {
      state.applied = {
        types: [...state.draft.types],
        statuses: [...state.draft.statuses],
      };
    },
    finishApplyFilters(state) {
      state.isApplying = false;
    },
  },
});

export const {
  setDraftFilters,
  beginApplyFilters,
  applyFilters,
  finishApplyFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
