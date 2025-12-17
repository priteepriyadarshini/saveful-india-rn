import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '../../store/hooks';
import { RootState } from '../../store/store';

const LOCAL_STORAGE_KEY = 'FeatureFlags';

enum FeatureFlagKey {
  ShortDebugLongPress = 'ShortDebugLongPress',
  FakeLogin = 'FakeLogin',
  AddToRecentWhenViewingMerchantDetail = 'AddToRecentWhenViewingMerchantDetail',
  ShowCarbonProgressControls = 'ShowCarbonProgressControls',
  AlllowCreateTransaction = 'AllowCreateTransaction',
  AlertOnTrackingEvent = 'AlertOnTrackingEvent',
  AlertOnTrackingIdentify = 'AlertOnTrackingIdentify',
  AlertOnTrackingScreen = 'AlertOnTrackingScreen',
  // OTPTwoFactor = 'OTPTwoFactor',
  DisableTransactionsClaim = 'DisableTransactionsClaim',
  UXCamDebug = 'UXCamDebug',
  ForceOnboardingFootprintEstimation = 'ForceOnboardingFootprintEstimation',
  DebugWebsocket = 'DebugWebsocket',
}

export interface FeatureFlags {
  [flag: string]: boolean | undefined;
}

function processFlags(flags: FeatureFlags): FeatureFlags {
  return {
    [FeatureFlagKey.ShortDebugLongPress]:
      flags[FeatureFlagKey.ShortDebugLongPress] ?? false,
    [FeatureFlagKey.FakeLogin]: flags[FeatureFlagKey.FakeLogin] ?? false,
    [FeatureFlagKey.AddToRecentWhenViewingMerchantDetail]:
      flags[FeatureFlagKey.AddToRecentWhenViewingMerchantDetail] ?? false,
    [FeatureFlagKey.ShowCarbonProgressControls]:
      flags[FeatureFlagKey.ShowCarbonProgressControls] ?? false,
    [FeatureFlagKey.AlllowCreateTransaction]:
      flags[FeatureFlagKey.AlllowCreateTransaction] ?? false,
    [FeatureFlagKey.AlertOnTrackingEvent]:
      flags[FeatureFlagKey.AlertOnTrackingEvent] ?? false,
    [FeatureFlagKey.AlertOnTrackingIdentify]:
      flags[FeatureFlagKey.AlertOnTrackingIdentify] ?? false,
    [FeatureFlagKey.AlertOnTrackingScreen]:
      flags[FeatureFlagKey.AlertOnTrackingScreen] ?? false,
    // [FeatureFlagKey.OTPTwoFactor]: flags[FeatureFlagKey.OTPTwoFactor] ?? false,
    [FeatureFlagKey.DisableTransactionsClaim]:
      flags[FeatureFlagKey.DisableTransactionsClaim] ?? false,
    [FeatureFlagKey.UXCamDebug]: flags[FeatureFlagKey.UXCamDebug] ?? false,
    [FeatureFlagKey.ForceOnboardingFootprintEstimation]:
      flags[FeatureFlagKey.ForceOnboardingFootprintEstimation] ?? false,
    [FeatureFlagKey.DebugWebsocket]:
      flags[FeatureFlagKey.DebugWebsocket] ?? false,
  };
}

async function getFlagsFromLocalStorage(): Promise<FeatureFlags> {
  let lStorage = {};
  try {
    const item = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
    lStorage = item ? JSON.parse(item) : {};
  } catch (e) {
    lStorage = {};
  }
  return processFlags(lStorage);
}

async function updateFlag(
  flag: FeatureFlagKey,
  value: boolean,
): Promise<FeatureFlags> {
  // Get the flags
  let flags = await getFlagsFromLocalStorage();
  // Update the flags
  flags = { ...flags, [flag]: value };
  // Save the flags
  await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flags));
  // Return the flags
  return flags;
}

async function getFlagState(flag: string): Promise<boolean> {
  const flags = await getFlagsFromLocalStorage();
  if (Object.prototype.hasOwnProperty.call(flags, flag)) {
    return flags[flag] ?? false;
  }
  return false;
}

export default function useFeatureFlag(
  flag: FeatureFlagKey,
  defaultValue = false,
) {
  return useAppSelector(
    (state: RootState) => state.featureFlags.flags[flag] || defaultValue,
  );
}

export {
  FeatureFlagKey,
  LOCAL_STORAGE_KEY,
  getFlagState,
  getFlagsFromLocalStorage,
  updateFlag,
};
