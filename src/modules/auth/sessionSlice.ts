import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Session } from '../../models/Session';
import {
  clearSessionDataFromStorage,
  loadSessionDataFromStorage,
  saveSessionDataToStorage,
} from '../../modules/auth/storage';
// import SocketManager from 'modules/socket/SocketManager';

export type AuthState = Session;

const initialState = {} as AuthState;

async function sessionDataUpdateHook(session?: Session) {
  console.debug(
    'Developer: If you need to store the session data outside of the store too, this is a good place to do that',
  );

  // Do any work you want to do on logout here...
  if (!session) {
    console.debug(
      'Developer: Make sure to clear things you want to clear on logout here.',
    );

    // UXCamManager.shared.onLogout();

    // Disconnect the websocket
    // SocketManager.shared.disconnect();
  } else {
    // SocketManager.shared.connect(session.access_token ?? '');
  }

  // Example:
  // SessionManager.shared.updateSessionData(session);
}

// Loads the session data from storage and updates the store
export const loadSessionData = createAsyncThunk<Session | undefined>(
  'session/loadSessionData',
  async (_, _thunkApi) => {
    const session = await loadSessionDataFromStorage();
    // console.debug('loaded session', session);
    await sessionDataUpdateHook(session);
    return session;
  },
);

// Saves the session data to storage and updates the store
export const saveSessionData = createAsyncThunk<Session, Session>(
  'session/saveSessionData',
  async (session, _thunkApi) => {
    // console.debug('saving session', session);
    await saveSessionDataToStorage(session);
    await sessionDataUpdateHook(session);
    return session;
  },
);

// Remove the session data from storage and reset the store
export const clearSessionData = createAsyncThunk<void, void>(
  'session/clearSessionData',
  async (_, _thunkApi) => {
    // Remove session data from storage
    await clearSessionDataFromStorage();
    await sessionDataUpdateHook(undefined);
  },
);

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    updateSession(state, action) {
      state.access_token = action.payload?.access_token ?? undefined;
      state.refresh_token = action.payload?.refresh_token ?? undefined;
    },
  },
  extraReducers: builder => {
    // Loading
    builder.addCase(loadSessionData.fulfilled, (state, action) => {
      if (action.payload) {
        state.access_token = action.payload?.access_token;
        state.refresh_token = action.payload?.refresh_token;
      }
    });

    // Saving
    builder.addCase(saveSessionData.fulfilled, (state, action) => {
      state.access_token = action.payload?.access_token;
      state.refresh_token = action.payload?.refresh_token;
    });

    // Clearing
    builder.addCase(clearSessionData.fulfilled, state => {
      state.access_token = undefined;
      state.refresh_token = undefined;
    });
  },
});

// Action creators are generated for each case reducer function
export const { updateSession } = sessionSlice.actions;

export default sessionSlice.reducer;
