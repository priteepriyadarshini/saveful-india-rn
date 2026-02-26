const CDN_BASE = 'https://d3fg04h02j12vm.cloudfront.net/groups';

const images = [
  { uri: `${CDN_BASE}/profile-green-apples.png` },
  { uri: `${CDN_BASE}/profile-pink-limes.png` },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getGroupImage(key?: string) {
  if (!key) return images[0];
  const index = hashString(key) % images.length;
  return images[index];
}

export const groupImages = images;
