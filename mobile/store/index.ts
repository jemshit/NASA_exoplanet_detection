import { configureStore, createSlice } from '@reduxjs/toolkit';

// Placeholder slice to fix the "valid reducer" error
const appSlice = createSlice({
  name: 'app',
  initialState: {
    initialized: true,
  },
  reducers: {},
});

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

