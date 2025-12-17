import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_NAME_BASE = '@ab_test';

export function storageKeyNameForTest(testName: string) {
  return `${KEY_NAME_BASE}.${testName}`;
}

export type ABTestKey = 'OnboardingFootprintEstimation' | 'SomethingElse';

export const OnboardingFootprintEstimationOptions = [
  'footprint_estimation',
  'impact',
];

export async function resetTestOption(testName: string) {
  const storageKey = storageKeyNameForTest(testName);
  await AsyncStorage.removeItem(storageKey);
}

export async function getCurrentLocalTestOption(
  testName: string,
  options: string[],
) {
  // Try and load the current value from storage, and make sure its still one of the values in `options`
  const storageKey = storageKeyNameForTest(testName);
  const savedValue = await AsyncStorage.getItem(storageKey);
  let currentValue: string | undefined;
  if (savedValue) {
    currentValue = options.find(o => o === savedValue);
  }

  return currentValue;
}

export async function getLocalTestOption(testName: string, options: string[]) {
  const currentOption = await getCurrentLocalTestOption(testName, options);
  if (currentOption) return currentOption;

  // Choose a new value, save it, and return it
  const newValue = options[Math.floor(Math.random() * options.length)];
  const storageKey = storageKeyNameForTest(testName);
  await AsyncStorage.setItem(storageKey, newValue);
  return newValue;
}
