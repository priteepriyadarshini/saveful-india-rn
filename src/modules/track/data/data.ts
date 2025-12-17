import { PostMake, Survey, WeekResults } from "../types";

export const POSTMAKE = (dish?: string) => [
  {
    id: 0,
    showSurveyDishes: true,
    content: [
      {
        id: 0,
        title: `Did you enjoy your ${dish}?`,
        buttonText: [
          {
            id: 0,
            name: 'Sure did',
          },
          {
            id: 1,
            name: 'No',
          },
        ],
      },
      {
        id: 1,
        title: 'sorry to hear that',
        image: require('../../../../assets/placeholder/question-mark.png'),
        description: `So we can make it more chef’s kiss, less chef’s miss – why didn’t you like your ${dish}?`,
        buttonText: [
          {
            id: 0,
            name: 'Too bland',
          },
          {
            id: 1,
            name: 'Too spicy',
          },
          {
            id: 2,
            name: 'Too soggy',
          },
          {
            id: 3,
            name: 'Too much effort/time',
          },
          {
            id: 4,
            name: 'Just not my thing',
          },
        ],
      },
      {
        id: 2,
        title: (flavour?: string) => `fixing a ${flavour} dish`,
        description: `Often it’s the little things that can elevate a dish from average to amazing. One of those little things is the simple act of seasoning.

        By seasoning your meal with salt and pepper as you cook, you can adjust the flavours as you go instead of having to make big corrections at the end of your cook.`,
      },
    ],
  },
  // {
  //   id: 2,
  //   title: 'which ingredients did you already have?',
  //   description: 'This helps us figure out how much food you’ve saved.',
  //   buttonText: 'Next',
  //   pressableText: 'I didn’t have any of the ingredients',
  //   showSurveyIngredients: true,
  // },
  {
    id: 3,
    title: 'Got any leftovers?',
    dessciption:
      'Let us know if there’s any of your dish left and we’ll help you savour every last bit.',
    image: require('../../../../assets/placeholder/tuppleware.png'),
    buttonText: [
      {
        id: 0,
        name: 'Yes',
      },
      {
        id: 1,
        name: 'No',
      },
    ],
    showSurveyLeftovers: true,
  },
];

export const data: PostMake = {
  id: 0,
  title: 'noodle soup',
  image: {
    uri: '',
  },
  postMakeList: [
    {
      id: 0,
      title: 'enjoy',
    },
    {
      id: 1,
      title: 'ingredients',
    },
    {
      id: 2,
      title: 'leftovers',
      leftOverList: [
        {
          id: 0,
          title: 'mexican chilli',
          image: {
            uri: '',
          },
        },
        {
          id: 1,
          title: 'mexican chilli',
          image: {
            uri: '',
          },
        },
        {
          id: 2,
          title: 'mexican chilli',
          image: {
            uri: '',
          },
        },
      ],
    },
  ],
};

export const SURVEY: Survey = {
  id: 0,
  title: 'Survey One',
  surveyList: [
    {
      id: 0,
      title: 'How often did you cook this week?',
      subTitle:
        'How many times did you cook any kind of meal over the past seven days?',
      image: {
        uri: require('../../../../assets/placeholder/frying-pan.png'),
      },
      name: 'cookingFrequency',
      phrase: 'times',
      buttonText: 'Next',
    },
    {
      id: 1,
      title: 'HOW MUCH SCRAPS DID YOU HAVE?',
      subTitle:
        'Thinking back to the last meal you made, how many cupfuls of scraps (peels, skins, stalks and bones) ended up in the bin or compost?',
      image: {
        uri: require('../../../../assets/placeholder/banana-peel.png'),
      },
      name: 'scraps',
      phrase: 'cupfuls',
      buttonText: 'Next',
    },
    {
      id: 2,
      title: 'HOW MUCH LEFTOVERS WEREN’T EATEN?',
      subTitle:
        'How much of the meals you made ended up in the bin or compost?',
      image: {
        uri: require('../../../../assets/placeholder/tuppleware.png'),
      },
      name: 'uneatenLeftovers',
      phrase: 'containers (500 ML)',
    },
    {
      id: 3,
      name: 'clearingout',
      title: 'What produce didn’t get SAVED?',
      image: {
        uri: require('../../../../assets/placeholder/post-fridge.png'),
      },
      subTitle:
        'The next  questions are about the food you didn’t turn into meals. ',
    },
    {
      id: 4,
      name: 'saved',
      title: 'What produce didn’t get SAVED?',
      subTitle:
        'So much food can be rescued, but not everything. What ended up in the bin or compost this week?',
      produces: [
        {
          id: 0,
          name: 'Fruit',
          image: {
            uri: require('../../../../assets/placeholder/fruit.png'),
          },
          controllerName: 'binnedFruit',
          phrase: 'pieces',
        },
        {
          id: 1,
          name: 'Veggies',
          image: {
            uri: require('../../../../assets/placeholder/veggies.png'),
          },
          controllerName: 'binnedVeggies',
          phrase: 'pieces',
        },
        {
          id: 2,
          name: 'Dairy',
          image: {
            uri: require('../../../../assets/placeholder/milk.png'),
          },
          controllerName: 'binnedDairy',
          phrase: 'kilos/litres',
        },
        {
          id: 3,
          name: 'Bread',
          image: {
            uri: require('../../../../assets/placeholder/bread.png'),
          },
          controllerName: 'binnedBread',
          phrase: 'loaves',
        },
        {
          id: 4,
          name: 'Meat',
          image: {
            uri: require('../../../../assets/placeholder/meat.png'),
          },
          controllerName: 'binnedMeat',
          phrase: 'kilos',
        },
        {
          id: 5,
          name: 'Herbs',
          image: {
            uri: require('../../../../assets/placeholder/herbs.png'),
          },
          controllerName: 'binnedHerbs',
          phrase: 'bunches',
        },
      ],
    },
    {
      id: 5,
      name: 'howMuch',
      title: 'How much was there?',
      subTitle:
        'Don’t stress, it can be tricky to stay on top of what’s in the fridge with everything life throws at you.',
    },
    {
      id: 6,
      name: 'useThisWeek',
      title: 'Anything you’re keen to use up this week?',
      subTitle:
        'Found some ingredients in your fridge that still have some life left? Let us know and we’ll suggest a few meals.',
      ingredients: [
        'Almonds',
        'Anchovies',
        'Asian greens',
        'Asparagus',
        'Bacon',
        'Balsamic vinegar',
        'Blackberry',
        'Brown rice',
        'Barley',
        'Bamboo',
        'Basil',
        'Carrot',
        'Celery',
        'Cherry',
        'Chocolate',
        'Corn',
        'Coconut milk',
      ],
    },
  ],
};

export const SAVINGS = ({
  spent,
  waste,
  co2Savings,
  co2SavingsPersonalBest,
  costSavings,
  costSavingsPersonalBest,
  foodSaved,
  foodSavedPersonalBest,
}: {
  spent: string;
  waste: string;
  co2Savings: number;
  co2SavingsPersonalBest: number | null;
  costSavings: number;
  costSavingsPersonalBest: number | null;
  foodSaved: number;
  foodSavedPersonalBest: number | null;
}): WeekResults => ({
  spent,
  waste,
  currentWeekResults: [
    {
      id: 0,
      type: 'food',
      saved: `${foodSaved.toFixed(2)}kg`,
      description:
        foodSavedPersonalBest && foodSavedPersonalBest > foodSaved
          ? `Your personal best is ${foodSavedPersonalBest}kg`
          : 'New personal best!',
      isBest: !foodSavedPersonalBest || foodSavedPersonalBest < foodSaved,
      image: {
        uri: require('../../../../assets/placeholder/apple.png'),
      },
    },
    {
      id: 1,
      type: 'dollars',
      saved: `$${costSavings.toFixed(2)}`,
      description:
        costSavingsPersonalBest && costSavingsPersonalBest > costSavings
          ? `Your personal best is $${costSavingsPersonalBest}`
          : 'New personal best!',
      isBest: !costSavingsPersonalBest || costSavingsPersonalBest < costSavings,
      image: {
        uri: require('../../../../assets/placeholder/money.png'),
      },
    },
    {
      id: 2,
      type: 'co2',
      saved: `${co2Savings.toFixed(2)}kg`,
      description:
        co2SavingsPersonalBest && co2SavingsPersonalBest > co2Savings
          ? `Your personal best is ${co2SavingsPersonalBest}kg`
          : 'New personal best!',
      isBest: !co2SavingsPersonalBest || co2SavingsPersonalBest < co2Savings,
      image: {
        uri: require('../../../../assets/placeholder/cloud.png'),
      },
    },
  ],
});

export const RECOMMEND = [
  {
    id: 0,
    title: 'mexican chilli',
    image: {
      uri: '',
    },
  },
  {
    id: 1,
    title: 'mexican chilli',
    image: {
      uri: '',
    },
  },
  {
    id: 2,
    title: 'mexican chilli',
    image: {
      uri: '',
    },
  },
];

export const RECENTLY_COOKED = [
  {
    id: 0,
    title: 'mexican chilli',
    recipe: 'chinese',
    image: {
      uri: '',
    },
  },
  {
    id: 1,
    title: 'mexican chilli',
    recipe: 'chinese',
    image: {
      uri: '',
    },
  },
  {
    id: 2,
    title: 'mexican chilli',
    recipe: 'chinese',
    image: {
      uri: '',
    },
  },
];

export const TRACK = [
  {
    name: 'food',
    heading: 'you’ve saved',
    value: '12.5kg',
    image: {
      uri: require('../../../../assets/placeholder/bowl.png'),
    },
  },
  {
    name: 'money',
    heading: 'you’ve saved',
    value: '$183.00',
    image: {
      uri: require('../../../../assets/placeholder/bowl.png'),
    },
  },
];

export const WEEKLYSURVEY = ({
  // co2SavingsPersonalBest,
  // costSavingsPersonalBest,
  // foodSavedPersonalBest,
  co2Savings = '0',
  costSavings = '0',
  foodSaved = '0',
}: {
  co2Savings: string;
  co2SavingsPersonalBest?: string | null;
  costSavings: string;
  costSavingsPersonalBest?: string | null;
  foodSaved: string;
  foodSavedPersonalBest?: string | null;
}) => [
  {
    id: 0,
    title: 'waste',
    isBest: false,
    image: require('../../../../assets/placeholder/big-savings.png'),
    status:
      foodSaved && foodSaved.length > 0 && foodSaved?.charAt(0) === '-'
        ? 'more'
        : 'less',
    value: `${Number(foodSaved ? foodSaved?.replace(/-/g, '') : '0').toFixed(
      2,
    )}KG`,
    output: `potential ${
      foodSaved && foodSaved.length > 0 && foodSaved?.charAt(0) === '-'
        ? 'more'
        : 'less'
    } waste`,
  },
  {
    id: 1,
    title: 'savings',
    isBest: false,
    image: require('../../../../assets/placeholder/money.png'),
    status:
      costSavings && costSavings.length > 0 && costSavings?.charAt(0) === '-'
        ? 'more'
        : 'less',
    value: `$${foodSaved ? costSavings?.replace(/-/g, '') : '0'}`,
    output: `potential ${
      costSavings && costSavings.length > 0 && costSavings?.charAt(0) === '-'
        ? 'cost'
        : 'savings'
    }`,
  },
  {
    id: 2,
    title: 'co2',
    isBest: false,
    image: require('../../../../assets/placeholder/cloud.png'),
    status:
      co2Savings && co2Savings.length > 0 && co2Savings?.charAt(0) === '-'
        ? 'more'
        : 'less',
    value: `${Number(co2Savings ? co2Savings?.replace(/-/g, '') : '0').toFixed(
      2,
    )}KG`,
    output: `potential CO2 ${
      co2Savings && co2Savings.length > 0 && co2Savings?.charAt(0) === '-'
        ? 'spent'
        : 'saved'
    }`,
  },
];

export const TIPSOFTHEWEEK = [
  {
    id: 0,
    title: 'TAKE STOCK OF YOUR SCRAPS',
    description:
      'Save your onion skins and veggie tops and tails in a ziplock bag in the freezer for a super Saveful stock.',
  },
  {
    id: 1,
    title: 'MAKE THE BEST SAVEFUL PESTO',
    description:
      'Turn those carrot tops into carrot top pesto. Just add olive oil, some nuts (cashews, pine nuts or toasted almonds all work well), any on-hand herbs (like basil and flat-leaf parsley), garlic, oil, and a bit of cheese and even spinach leaves if you have them, and pulse. Season to taste.',
  },
  {
    id: 2,
    title: 'GET AROUND RIND FOR A FLAVOUR BOOST',
    description:
      'Add parmesan rind to your stocks and bolognaise for extra depth of flavour.',
  },
  {
    id: 3,
    title: 'THROW YOURSELF A BONE – MAKE A NUTRITIOUS AND DELICIOUS BROTH',
    description:
      'Make a bone broth by saving bones from the bin and simmering them into a nutrient-rich liquid instead. It can help boost collagen, digestion and gut health.',
  },
  {
    id: 4,
    title: 'SHOP YOUR FRIDGE FIRST',
    description:
      'Make it a habit to start by fossicking through your fridge to save food and coin. Try adding ‘eat me first’ labels to your containers and write your own use-by dates on them. If the date’s approaching and it doesn’t look like you’re going to eat it – just transfer it to the freezer.',
  },
  {
    id: 5,
    title: 'REMIX YOUR MEAL',
    description:
      'Get creative with what you’ve made and give those leftovers a makeover. Roast veggies can become frittatas, bowls, curries and more. Go-to chilli becomes enchiladas, nachos and tacos! Experiment and play it your way.',
  },
  {
    id: 6,
    title: 'FREEZE FRAME',
    description:
      'If you’re finding well-intentioned leftovers aren’t getting eaten from your fridge, try freezing them first instead. Zero effort plus zero waste? Win win!',
  },
];

export const FAQ = [
  {
    id: 0,
    title: 'How much food does the average Australian waste?',
    description:
      'The average Australian wastes around 98kg of food every year^, despite 70 per cent of food binned being perfectly edible. The good news? Through small, everyday actions we can change this (and save ourselves money and time while doing it)!',
    isExpanded: false,
  },
  {
    id: 1,
    title:
      'What is the average amount of money spent on wasted food per household?',
    description:
      'The average Australian household spends around $2,500* on food that ends up in the bin. That’s the same amount as a week’s accommodation for the fam in Byron Bay. So, let’s start saving right now.',
    isExpanded: false,
  },
  {
    id: 2,
    title: 'If I put my food in the compost bin, is it waste?',
    description:
      'Technically, yes. Why? Because compost still produces methane. Check out our hack content sprinkled throughout Saveful for tips on how to use up skins, stalks, leaves, rinds and bones – and turn them into something edible.',
    isExpanded: false,
  },
  {
    id: 3,
    title: 'What happens to the food I put in the compost/FOGO bin?',
    description:
      'Putting food in the compost or Food Organics Garden Organics (FOGO) bin is better than putting it in the rubbish bin. But it still produces methane. The food in your compost or FOGO also has an energy cost (sun, water and transport). That’s why the goal is to put the food you buy into hungry tummies!',
    isExpanded: false,
  },
  {
    id: 4,
    title: 'What happens to the food I put in landfill?',
    description:
      'When your organic waste (like food, tea, coffee, and dairy) gets mixed with other types of garbage and isn’t exposed to oxygen, it produces more methane and nitrous oxide. These greenhouse gas emissions have a big impact on climate change. So, as an easy first step – you find out what your local council accepts in your FOGO bin and put what you can in there.',
    isExpanded: false,
  },
  {
    id: 5,
    title: 'I feed my leftovers to my dog, is that waste?',
    description:
      'No, surely? Yes, unfortunately. We know that your doggo is one of the most important creatures on the planet. But, according to leading food waste researchers, Fight Food Waste, all those lovely leftovers they’ve been chowing down on are technically considered food waste.',
    isExpanded: false,
  },
];
