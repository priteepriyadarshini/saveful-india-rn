export const DIETARIES = [
  'Vegetarian',
  'Vegan',
  'Dairy-free',
  'Nut-free',
  'Gluten-free',
  'Low FODMAP',
];

const DISHES_CDN = 'https://d3fg04h02j12vm.cloudfront.net/dishes';

export const FAVOURITE_DISHES = [
  {
    id: '1',
    title: 'pasta with tomato sauce',
    image: { uri: `${DISHES_CDN}/pasta-tomato.png` },
  },
  {
    id: '2',
    title: 'coconut curry',
    image: { uri: `${DISHES_CDN}/coconut-curry.png` },
  },
  {
    id: '3',
    title: 'fried rice',
    image: { uri: `${DISHES_CDN}/fried-rice.png` },
  },
  {
    id: '4',
    title: 'pancakes',
    image: { uri: `${DISHES_CDN}/pancakes.png` },
  },
];

export const WEEK_PLANNER = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'I don’t have a set day',
];

const ONBOARDING_CDN = 'https://d3fg04h02j12vm.cloudfront.net/onboarding';

export const SAVED_ITEMS = [
  {
    id: '1',
    title: 'Carrot tops',
    image: { uri: `${ONBOARDING_CDN}/saved-items/carrots.png` },
  },
  {
    id: '2',
    title: 'Potato peel',
    image: { uri: `${ONBOARDING_CDN}/saved-items/potato.png` },
  },
  {
    id: '3',
    title: 'Floppy celery',
    image: { uri: `${ONBOARDING_CDN}/saved-items/celery.png` },
  },
  {
    id: '4',
    title: 'Leftovers',
    image: { uri: `${ONBOARDING_CDN}/saved-items/tupperware.png` },
  },
  {
    id: '5',
    title: 'Scraps for the dog',
    image: { uri: `${ONBOARDING_CDN}/saved-items/dog.png` },
  },
  {
    id: '6',
    title: 'Bones',
    image: { uri: `${ONBOARDING_CDN}/saved-items/bones.png` },
  },
];

const ONBOARDING = (firstName?: string) => [
  {
    id: 1,
    welcomeMessage: `Welcome ${firstName ?? ''} 👋`,
    subHeading: 'Let’s get to know you (and your household).',
    description:
      'Your answers will help us plate up a customised Saveful experience.',
    image: { uri: `${ONBOARDING_CDN}/01.png` },
    buttonText: 'Let’s go',
  },
  {
    id: 2,
    heading: 'Where are you located?',
    showPostcode: true,
    description:
      'Your location information helps us provide localized suggestions.',
    image: { uri: `${ONBOARDING_CDN}/02.png` },
    buttonText: 'Next',
    showPostcodeInput: true,
  },
  {
    id: 3,
    heading: 'Who do you usually cook for?',
    buttonText: 'That’s it',
    showPeopleInput: true,
  },
  {
    id: 4,
    heading: 'Got any dietaries?',
    description:
      'Let us know which of the following apply to some or all of your fam.',
    buttonText: 'That’s it',
    showDietaryInput: true,
  },
  // {
  //   id: 5,
  //   heading: 'Nom nom or no no?',
  //   description:
  //     'Order these dishes from most drool-worthy to least to help us build a picture of your tastebuds.',
  //   buttonText: 'Next',
  //   showFavouriteDishes: true,
  // },
  {
    id: 6,
    heading: 'When do you PLAN food FOR THE WEEK?',
    description:
      'We’ve all got that one day when we get ready for the week ahead. When’s yours?',
    buttonText: 'Next',
    showWeekPlanner: true,
  },
  {
    id: 7,
    heading: (day?: string) =>
      `${
        day === 'i don’t have a set day'
          ? 'WE’RE NOT ALL PLANNERS. BUT, WE CAN ALL BE SAVERS!'
          : `GREAT! We’ll check in on ${day}`
      }`,
    buttonText: 'Next',
    image: { uri: `${ONBOARDING_CDN}/day-result.png` },
    description: (day?: string) =>
      `${
        day?.toLowerCase() === 'i don’t have a set day'
          ? `We’ll check back in a week to ask a few quick questions and give you tailored tips to help you save food, time and money.`
          : 'We’ll ask a few quick questions and give you tailored tips to help you save food, time and money.'
      }`,

    showDayResult: true,
  },
  // {
  //   id: 8,
  //   heading: 'Which of these can be saved?',
  //   description:
  //     'Select all the items you can turn into something scrumptious.',
  //   buttonText: 'That’s it',
  //   showSavedItems: true,
  // },
  // {
  //   id: 9,
  //   heading: (value?: boolean) =>
  //     `${value ? 'THAT’S RIGHT!' : 'Trick question!'}`,
  //   subHeading: 'You can save them all.',
  //   description:
  //     'You can save them all. Kitchen scraps, last night’s leftovers and imperfect produce can all be transformed into moreish meals and we’re here to show you how.',
  //   buttonText: 'That’s it',
  //   showSavedResult: true,
  // },
  {
    id: 10,
    bigHeading: 'May we send you little nudges?',
    subDescription:
      'We’d love to help you save even more food, money and stress. No spam, ever.',

    buttonText: 'Turn on notifications',
    image: require('../../../../assets/placeholder/notification.png'),
    showNotifications: true,
  },
];

export default ONBOARDING;
