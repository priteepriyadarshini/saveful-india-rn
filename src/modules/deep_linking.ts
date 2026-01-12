import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const linking: LinkingOptions<any> = {
  prefixes: [
    Linking.createURL('/'),
    'saveful://',
    'https://app.saveful.com',
    'https://app.staging.saveful.com',
    'https://app.dev.saveful.com',
  ],
  config: {
    screens: {
      Root: {
        screens: {
          Make: {
            screens: {
              PrepDetail: 'make/prep/:slug',
              MakeIt: 'make/make-it/:id',
            },
          },
          Feed: {
            screens: {
              Feed: 'feed',
            },
          },
          Hack: {
            screens: {
              HacksDetail: 'hacks/:id',
            },
          },
        },
      },
    },
  },
};

export default linking;
