import { Dish } from '../../../modules/prep/types';

export const PREPTUTORIAL = [
  {
    id: 0,
    title: 'choose YOUR OWN ingredients',
    image: require('../../../../assets/onboarding/tutorials/Prep-01.png'),
    description:
      'You tell us what you want to cook with, not the other way around! Swipe through each row to choose the ingredients most suited to your tastebuds (and what’s already in your kitchen).',
  },
  {
    id: 1,
    title: 'Add extra flavour',
    image: require('../../../../assets/onboarding/tutorials/Prep-02.png'),
    description:
      'Tap the plus button to open up a long list of ingredients tailored to each dish. Choose your faves and add them to your meal.',
  },
  {
    id: 2,
    title: 'GET guidance on portions',
    image: require('../../../../assets/onboarding/tutorials/Prep-03.png'),
    description:
      'Above most ingredient categories, you’ll see a quantity guide. These tend to be per person (hint: they generally have a little flex in them!).',
  },
  {
    id: 3,
    title: 'Make it your own',
    image: require('../../../../assets/onboarding/tutorials/Prep-04.png'),
    description:
      'Make meals to your tastes. We’ll make some recommendations here and there, but really – it’s up to you (and your tastebuds)!',
  },
  {
    id: 4,
    title: 'get prepped first',
    image: require('../../../../assets/onboarding/tutorials/Prep-05.png'),
    description:
      'We like to have everything chopped, diced and sliced and ready to roll before we hit the big ‘make it’ button!',
  },
];

export const MAKETUTORIAL = [
  {
    id: 0,
    title: 'Ingredients at your fingertips',
    image: require('../../../../assets/onboarding/tutorials/Make-01.png'),
    description:
      'Can’t remember what you chose to use up? Simply tap the ‘ingredients’ drawer to see the ingredients you picked in prep. ',
  },
  {
    id: 1,
    title: 'SWIPE TO NAVIGATE',
    image: require('../../../../assets/onboarding/tutorials/Make-02.png'),
    description:
      'We’ve broken our frameworks down into bite-sized chunks to make them extra-easy to digest! Swipe left to progress to the next step, swipe right to return to the previous step.',
  },
  {
    id: 2,
    title: 'mini hacks',
    image: require('../../../../assets/onboarding/tutorials/Make-03.png'),
    description:
      'Look out for chef-informed ‘pro tips’ ‘mini hacks’ and ‘serving suggestions’. They help you discover sustainable chef know-how (like the fact you can save your onion skins for stocks!).',
  },
  {
    id: 3,
    title: 'complete the cook',
    image: require('../../../../assets/onboarding/tutorials/Make-04.png'),
    description:
      'Make sure you press this button at the end of every meal you make! It’ll help you see how many meals you’ve made with Saveful and how much food, money and carbon you’ve saved!',
  },
];

export const data: Dish = {
  id: 0,
  name: 'Noodle Soup',
  preparation: {
    id: 0,
    portion: 'Two',
    prepTime: {
      time: 20,
      format: 'min',
    },
  },
  uri: '',
  sticker: {
    uri: '',
  },
  info: [
    {
      id: 0,
      title: 'ABOUT THIS DISH',
      readMore: {
        readMoreTitle: 'About this meal',
        readMoreSubTitle: `Love noodles? Love soup? This one’s for you, but also for anyone who maintains a soup isn’t an entire meal – we’ll win you over!`,
        readMoreDescription: `Think pho, ramen, laksa, Jewish penicillin, Italian stracciatella – what’s not to love about a bowl of slippery noodles, tender vegetables and meat (or chicken, tofu, seafood or fish) swimming in a flavour-filled broth?
      
There is so much room to riff and play at every turn. Choose any type of noodle you like – rice, wheat or egg, thick or thin. Think soba, udon, ramen; even spaghetti, fettuccine or tagliatelle will fit the bill (as any historically-minded food buff will tell you, noodles travelled to Italy via Marco Polo, so technically they really are a noodle!).
              
Your broth can be vego, chicken, beef, or seafood-based; enriched with coconut milk, or flavoured with aromatics or pastes (miso paste or curry paste come to mind). A cup and a half of broth per person is a generous serve.
              
The veg component is totally determined by what you feel like and what you have to hand – allow a cup of vegetables per person.
              
In terms of protein, the world’s your oyster. It’s worth noting that there are slightly different approaches and timing depending on your protein. 50-60 grams per person is plenty, but if you don't have anything to hand, increase the amount of veg you’re using.`,
      },
      description: `Love noodles? Love soup? This one’s for you, but also for anyone who maintains a soup isn’t an entire meal - we’ll win you over! After all, so any cultures have a signature noodle soup.`,
    },
    {
      id: 1,
      borderColor: 'black',
      backgroundColor: 'mint',
      description: `Have some leftover bread? Toss it in olive oil and garlic and scatter it on the very top. It'll toast up into crunchy deliciousness.`,
      icon: 'zap',
      title: 'MINIHACK',
    },
    {
      id: 2,
      title: 'SAVING THIS DISH',
      uri: '',
      description: [
        {
          title: 'In the freezer',
          description: 'Store in an airtight container for up to 3 months.',
        },
        {
          title: 'In the fridge',
          description: 'Use within 3 days.',
        },
      ],
    },
  ],
  flavors: [
    {
      id: 0,
      flavor: 'chinese',
      ingredients: [
        {
          id: 0,
          name: 'oils & aromatics',
          list: [
            {
              id: 0,
              instructions: 'A splash',
              item: ['Vegetable Oil', 'Canola Oil', 'Grape Oil'],
            },
            {
              id: 1,
              instructions: '1, sliced',
              item: ['Brown Onion', 'Red Onion', 'Shallots'],
            },
          ],
          extras: {
            id: 0,
            phrase: 'extra flavour',
            selection: 'multiple',
            subtitle: 'add some flavour',
            list: [
              {
                id: 0,
                item: 'Fresh garlic',
                instructions: '1-2 cloves, crushed',
              },
              {
                id: 1,
                item: 'Fresh ginger',
                instructions: '1-2 ginger, crushed',
              },
              {
                id: 2,
                item: 'Garlic paste',
                instructions: '1 sprig, finely chopped',
              },
              {
                id: 3,
                item: 'Ginger paste',
                instructions: 'finely chopped',
              },
            ],
          },
        },
        {
          id: 1,
          name: 'broth',
          list: [
            {
              id: 0,
              instructions: 'A splash',
              item: ['Vegetable Oil', 'Canola Oil', 'Grape Oil'],
            },
          ],
        },
        {
          id: 2,
          name: 'vegetables',
          info: '60g dried noodles or 100g fresh noodles per person.',
          list: [
            {
              id: 5,
              instructions: 'A splash',
              item: ['Egg noodles', 'Spaghetti', 'Fettuccine'],
            },
          ],
        },
        {
          id: 3,
          name: 'vegetables',
          info: 'Aim for about 1 cup per person',
          recommendation: {
            requirement: 'strongly recommended',
            requiredCondition: 'Choose at least 1',
          },
          extras: {
            id: 2,
            selection: 'multiple',
            phrase: 'your veggies',
            subtitle: 'add some veggies',
            subinfo: 'Aim for about 1 cup per person',
            list: [
              {
                id: 0,
                item: 'Beetroot greens',
                instructions: '',
              },
              {
                id: 1,
                item: 'Broccoli',
                instructions: '',
              },
              {
                id: 2,
                item: 'Broccolini',
                instructions: '',
              },
              {
                id: 3,
                item: 'Cabbage',
                instructions: '',
              },
              {
                id: 4,
                item: 'Capsicum',
                instructions: '',
              },
              {
                id: 5,
                item: 'Carrot',
                instructions: 'Sliced or diced',
              },
              {
                id: 6,
                item: 'Celery',
                instructions: 'Sliced or diced',
              },
              {
                id: 7,
                item: 'Corn',
                instructions: '',
              },
              {
                id: 8,
                item: 'Fresh fennel',
                instructions: 'Finely sliced',
              },
              {
                id: 9,
                item: 'Green beans',
                instructions: '',
              },
            ],
          },
        },
        {
          id: 4,
          name: 'protein',
          info: 'Add a maximum of one protein (if you want to)',
          recommendation: {
            requirement: 'optional',
            requiredCondition: 'Choose 1 protein',
          },
          extras: {
            id: 3,
            phrase: 'some protein',
            selection: 'single',
            subtitle: 'add some veggies',
            subinfo: 'Choose 1 protein',
            list: [
              {
                id: 0,
                item: 'Beef tenderloin',
                instructions: 'Shredded or sliced',
              },
              {
                id: 1,
                item: 'Boneless pork chop',
                instructions: 'Shredded or sliced',
              },
              {
                id: 2,
                item: 'Firm tofu',
                instructions: 'Shredded or sliced',
              },
              {
                id: 3,
                item: 'Firm white fish',
                instructions: '',
              },
              {
                id: 4,
                item: 'Frozen peeled prawns',
                instructions: '',
              },
              {
                id: 5,
                item: 'Green prawns',
                instructions: 'Sliced or diced',
              },
              {
                id: 6,
                item: 'Pork tenderloin',
                instructions: 'Sliced or diced',
              },
              {
                id: 7,
                item: 'Roast beef',
                instructions: '',
              },
              {
                id: 8,
                item: 'Roast chicken',
                instructions: 'Shredded or sliced',
              },
              {
                id: 9,
                item: 'Roast pork',
                instructions: '',
              },
            ],
          },
        },
        {
          id: 5,
          name: 'finishing moves',
          info: 'Add a few extras to take this dish from good to great',
          recommendation: {
            requirement: 'optional',
            requiredCondition:
              'Add extras like acidity, crunch, heat and herbs.',
          },
          extras: {
            id: 4,
            phrase: 'some finishing moves',
            selection: 'single',
            subtitle: 'add some finishing moves',
            list: [
              {
                id: 0,
                item: 'Asian greens',
                instructions: 'To taste',
              },
              {
                id: 1,
                item: 'Baby spinach',
                instructions: 'To taste',
              },
              {
                id: 2,
                item: 'Rocket',
                instructions: 'To taste',
              },
              {
                id: 3,
                item: 'Lemon juice',
                instructions: 'To taste',
              },
              {
                id: 4,
                item: 'Rice vinegar',
                instructions: '',
              },
              {
                id: 5,
                item: 'Chinkiang vinegar (black vinegar)',
                instructions: 'To taste',
              },
              {
                id: 6,
                item: 'Soft boiled egg',
                instructions: 'To taste',
              },
              {
                id: 7,
                item: 'Chilli oil',
                instructions: '',
              },
              {
                id: 8,
                item: 'Chopped herbs',
                instructions: 'To taste',
              },
              {
                id: 9,
                item: 'Kimchi',
                instructions: '',
              },
            ],
          },
        },
      ],
    },
    {
      id: 1,
      flavor: 'italian',
      ingredients: [
        {
          id: 0,
          name: 'oils & aromatics',
          list: [
            {
              id: 0,
              instructions: 'A splash',
              item: ['Vegetable Oil', 'Canola Oil', 'Grape Oil'],
            },
            {
              id: 1,
              instructions: '1, sliced',
              item: ['Brown Onion', 'Red Onion', 'Shallots'],
            },
          ],
          extras: {
            id: 0,
            phrase: 'extra flavour',
            selection: 'multiple',
            subtitle: 'add some flavour',
            list: [
              {
                id: 0,
                item: 'Fresh garlic',
                instructions: '1-2 cloves, crushed',
              },
              {
                id: 1,
                item: 'Fresh ginger',
                instructions: '1-2 ginger, crushed',
              },
              {
                id: 2,
                item: 'Rosemary',
                instructions: '1 sprig, finely chopped',
              },
              {
                id: 3,
                item: 'Thyme',
                instructions: 'finely chopped',
              },
            ],
          },
        },
        {
          id: 1,
          name: 'broth',
          list: [
            {
              id: 0,
              instructions: 'A splash',
              item: ['Vegetable Oil', 'Canola Oil', 'Grape Oil'],
            },
          ],
        },
        {
          id: 2,
          name: 'vegetables',
          info: '60g dried noodles or 100g fresh noodles per person.',
          list: [
            {
              id: 5,
              instructions: 'A splash',
              item: ['Egg noodles', 'Spaghetti', 'Fettuccine'],
            },
          ],
        },
        {
          id: 3,
          name: 'vegetables',
          info: 'Aim for about 1 cup per person',
          recommendation: {
            requirement: 'strongly recommended',
            requiredCondition: 'Choose at least 1',
          },
          extras: {
            id: 2,
            selection: 'multiple',
            phrase: 'your veggies',
            subtitle: 'add some veggies',
            subinfo: 'Aim for about 1 cup per person',
            list: [
              {
                id: 0,
                item: 'Beetroot greens',
                instructions: '',
              },
              {
                id: 1,
                item: 'Broccoli',
                instructions: '',
              },
              {
                id: 2,
                item: 'Broccolini',
                instructions: '',
              },
              {
                id: 3,
                item: 'Cabbage',
                instructions: '',
              },
              {
                id: 4,
                item: 'Capsicum',
                instructions: '',
              },
              {
                id: 5,
                item: 'Carrot',
                instructions: 'Sliced or diced',
              },
              {
                id: 6,
                item: 'Celery',
                instructions: 'Sliced or diced',
              },
              {
                id: 7,
                item: 'Corn',
                instructions: '',
              },
              {
                id: 8,
                item: 'Fresh fennel',
                instructions: 'Finely sliced',
              },
              {
                id: 9,
                item: 'Green beans',
                instructions: '',
              },
            ],
          },
        },
        {
          id: 4,
          name: 'protein',
          info: 'Add a maximum of one protein (if you want to)',
          recommendation: {
            requirement: 'optional',
            requiredCondition: 'Choose 1 protein',
          },
          extras: {
            id: 3,
            phrase: 'some protein',
            selection: 'single',
            subtitle: 'add some veggies',
            subinfo: 'Aim for about 1 cup per person',
            list: [
              {
                id: 0,
                item: 'Beef tenderloin',
                instructions: 'Shredded or sliced',
              },
              {
                id: 1,
                item: 'Boneless pork chop',
                instructions: 'Shredded or sliced',
              },
              {
                id: 2,
                item: 'Firm tofu',
                instructions: 'Shredded or sliced',
              },
              {
                id: 3,
                item: 'Firm white fish',
                instructions: '',
              },
              {
                id: 4,
                item: 'Frozen peeled prawns',
                instructions: '',
              },
              {
                id: 5,
                item: 'Green prawns',
                instructions: 'Sliced or diced',
              },
              {
                id: 6,
                item: 'Pork tenderloin',
                instructions: 'Sliced or diced',
              },
              {
                id: 7,
                item: 'Roast beef',
                instructions: '',
              },
              {
                id: 8,
                item: 'Roast chicken',
                instructions: 'Shredded or sliced',
              },
              {
                id: 9,
                item: 'Roast pork',
                instructions: '',
              },
            ],
          },
        },
        {
          id: 5,
          name: 'finishing moves',
          info: 'Add a few extras to take this dish from good to great',
          recommendation: {
            requirement: 'optional',
            requiredCondition:
              'Add extras like acidity, crunch, heat and herbs.',
          },
          extras: {
            id: 4,
            phrase: 'some finishing moves',
            selection: 'single',
            subtitle: 'add some finishing moves',
            list: [
              {
                id: 0,
                item: 'Asian greens',
                instructions: 'To taste',
              },
              {
                id: 1,
                item: 'Baby spinach',
                instructions: 'To taste',
              },
              {
                id: 2,
                item: 'Rocket',
                instructions: 'To taste',
              },
              {
                id: 3,
                item: 'Lemon juice',
                instructions: 'To taste',
              },
              {
                id: 4,
                item: 'Rice vinegar',
                instructions: '',
              },
              {
                id: 5,
                item: 'Chinkiang vinegar (black vinegar)',
                instructions: 'To taste',
              },
              {
                id: 6,
                item: 'Soft boiled egg',
                instructions: 'To taste',
              },
              {
                id: 7,
                item: 'Chilli oil',
                instructions: '',
              },
              {
                id: 8,
                item: 'Chopped herbs',
                instructions: 'To taste',
              },
              {
                id: 9,
                item: 'Kimchi',
                instructions: '',
              },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      flavor: 'laksa',
      ingredients: [],
    },
    {
      id: 3,
      flavor: 'ramen',
      ingredients: [],
    },
    {
      id: 4,
      flavor: 'tom-yum',
      ingredients: [],
    },
  ],
};
