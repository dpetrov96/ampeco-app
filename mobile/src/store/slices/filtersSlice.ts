import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  CONNECTOR_STATUSES,
  CONNECTOR_TYPES,
  type ConnectorStatus,
  type ConnectorType,
} from '../../types/pin';

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
  draft: { ...allFilters, types: [...allFilters.types], statuses: [...allFilters.statuses] },
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
    toggleDraftType(state, action: PayloadAction<ConnectorType>) {
      const type = action.payload;
      if (state.draft.types.includes(type)) {
        if (state.draft.types.length === 1) {
          return;
        }
        state.draft.types = state.draft.types.filter((item) => item !== type);
      } else {
        state.draft.types.push(type);
      }
    },
    toggleDraftStatus(state, action: PayloadAction<ConnectorStatus>) {
      const status = action.payload;
      if (state.draft.statuses.includes(status)) {
        if (state.draft.statuses.length === 1) {
          return;
        }
        state.draft.statuses = state.draft.statuses.filter(
          (item) => item !== status,
        );
      } else {
        state.draft.statuses.push(status);
      }
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
    resetDraftToApplied(state) {
      state.draft = {
        types: [...state.applied.types],
        statuses: [...state.applied.statuses],
      };
    },
  },
});

export const {
  toggleDraftType,
  toggleDraftStatus,
  beginApplyFilters,
  applyFilters,
  finishApplyFilters,
  resetDraftToApplied,
} = filtersSlice.actions;

export default filtersSlice.reducer;
