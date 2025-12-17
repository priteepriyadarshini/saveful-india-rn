import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// this way the actions and state will be typed
// e.g. dont do `const dispatch = useDispatch()` - use `const dispatch = useAppDispatch()`
// and dont do `const value = useSelector(s => s.reducer.value)` - use `const value = useAppSelector(s => s.reducer.value)`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
