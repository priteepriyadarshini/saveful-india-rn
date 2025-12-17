import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  FeatureFlagKey,
  FeatureFlags,
  getFlagsFromLocalStorage,
  updateFlag,
} from '../../modules/developer/featureFlags';

export interface FeatureFlagsState {
  flags: FeatureFlags;
}

export const loadFeatureFlags = createAsyncThunk<FeatureFlags>(
  'featureFlags/loadFlags',
  async (_param, _thunkApi) => {
    const flags = await getFlagsFromLocalStorage();
    return flags;
  },
);

export interface UpdateFeatureFlagParams {
  flag: FeatureFlagKey;
  value: boolean;
}
export const updateFeatureFlag = createAsyncThunk(
  'featureFlags/updateFlag',
  async (params: UpdateFeatureFlagParams, _) => {
    const flags = await updateFlag(params.flag, params.value);
    return flags;
  },
);

const initialState: FeatureFlagsState = {
  flags: {},
};

const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      loadFeatureFlags.fulfilled,
      (state, action: PayloadAction<FeatureFlags>) => {
        state.flags = action.payload;
      },
    );
    builder.addCase(
      updateFeatureFlag.fulfilled,
      (state, action: PayloadAction<FeatureFlags>) => {
        state.flags = action.payload;
      },
    );
  },
});

export default featureFlagsSlice;
