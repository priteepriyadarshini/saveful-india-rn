const PROFILE_PHOTOS = [
  {
    id: '1',
    image: require('../../../../assets/groups/profile-green-apples.png'),
    src: '../../../../assets/groups/profile-green-apples.png',
  },
  {
    id: '2',
    image: require('../../../../assets/groups/profile-pink-limes.png'),
    src: '../../../../assets/groups/profile-pink-limes.png',
  },
];

export function randomPlaceholderProfilePhoto() {
  const randomIndex = Math.floor(Math.random() * 10) % PROFILE_PHOTOS.length;
  return PROFILE_PHOTOS[randomIndex];
}
