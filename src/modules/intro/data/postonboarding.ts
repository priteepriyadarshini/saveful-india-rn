export const POSTONBOARDING = [
  {
    id: 0,
    progressBar: true,
    heading: 'May we send you little nudges?',
    subHeading: `We’d love to help you save even more food, money and stress. No spam, ever.`,
    image: {
      uri: require('../../../../assets/placeholder/notification.png'),
    },
    buttonText: 'Turn on notifications',
  },
  {
    id: 1,
    progressBar: false,
    heading: 'Link a Qantas account',
    subHeading: 'Get rewarded for sustainable choices.',
    image: {
      uri: require('../../../../assets/placeholder/qantas-logo.png'),
    },
    buttonText: 'Link your Qantas account',
    contentList: [
      {
        id: 0,
        heading: 'for frequent flYers',
        subHeading:
          'Frequent Flyers can earn another Green Leaf and more Qantas points.',
      },
      {
        id: 1,
        heading: 'for qantas staff',
        subHeading:
          'Help us reach our sustainability targets and track our overall food waste.',
      },
    ],
  },
  {
    id: 2,
    progressBar: false,
    heading: 'Connect your Qantas account',
    subHeading: 'Link up your account so we can reduce our impact, together.',
    image: {
      uri: require('../../../../assets/placeholder/leaf.png'),
    },
    buttonText: 'Link your Qantas account',
  },
];
