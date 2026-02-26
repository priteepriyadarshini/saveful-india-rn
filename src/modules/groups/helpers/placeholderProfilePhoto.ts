const CDN_BASE = 'https://d3fg04h02j12vm.cloudfront.net/groups';

const PROFILE_PHOTOS = [
  {
    id: '1',
    image: { uri: `${CDN_BASE}/profile-green-apples.png` },
    src: `${CDN_BASE}/profile-green-apples.png`,
  },
  {
    id: '2',
    image: { uri: `${CDN_BASE}/profile-pink-limes.png` },
    src: `${CDN_BASE}/profile-pink-limes.png`,
  },
];

export function randomPlaceholderProfilePhoto() {
  const randomIndex = Math.floor(Math.random() * 10) % PROFILE_PHOTOS.length;
  return PROFILE_PHOTOS[randomIndex];
}
