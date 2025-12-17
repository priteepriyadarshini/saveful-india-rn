import { ImageSourcePropType } from 'react-native';

import savefulAssets from '../../../savefulAssets';

export const bundledSource = (
  url: string,
  checkBundled = true,
): ImageSourcePropType => {
  // check if our url is already in our bundled assets and return that
  // otherwise use the url as is
  // console.log(`checking ${url}`);
  if (checkBundled && savefulAssets[url]) {
    // console.log('  ..found bundled asset source');
    return savefulAssets[url] as ImageSourcePropType;
  } else {
    // console.log('  ..not bundled, pulling from URL');
    return { uri: url };
  }
};
