import { ImageSourcePropType } from 'react-native';

// Updated to use backend API URLs directly instead of bundled Craft CMS assets
export const bundledSource = (
  url: string,
  checkBundled = true, // Kept for backward compatibility but not used
): ImageSourcePropType => {
  // Load all images from backend API URLs
  return { uri: url };
};
