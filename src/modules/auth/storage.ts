import * as SecureStore from 'expo-secure-store';
import { Session } from '../../models/Session';

const SessionStorageKey = 'Session';

// Save session to storage
export async function saveSessionDataToStorage(session: Session) {
  return SecureStore.setItemAsync(SessionStorageKey, JSON.stringify(session));
}

// Load session from storage
export async function loadSessionDataFromStorage() {
  const json = await SecureStore.getItemAsync(SessionStorageKey);

  if (!json) return undefined;

  return JSON.parse(json) as Session;
}

// Delete the session from storage
export async function clearSessionDataFromStorage() {
  return SecureStore.deleteItemAsync(SessionStorageKey);
}
