import { Platform } from 'react-native';

const getDeepLink = (path = '') => {
  const scheme = 'saveful';
  const prefix =
    Platform.OS === 'android' ? `${scheme}://app/` : `${scheme}://app`;
  return prefix + path;
};

const SchemeHelper = {
  getDeepLink,
};

export default SchemeHelper;
