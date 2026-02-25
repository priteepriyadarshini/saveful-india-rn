import { PostMake, Survey, WeekResults } from "../types";

export const IMPROVEMENT_REASONS = [
  { id: 0, label: 'Too bland', key: 'bland' },
  { id: 1, label: 'Too spicy', key: 'spicy' },
  { id: 2, label: 'Too complex / time-consuming', key: 'complex' },
  { id: 3, label: 'Ingredients hard to find', key: 'ingredients' },
  { id: 4, label: 'Not my taste', key: 'taste' },
] as const;

export const PORTION_OPTIONS = [
  { id: 0, label: 'Too much', key: 'too_much' },
  { id: 1, label: 'Just right', key: 'just_right' },
  { id: 2, label: 'Not enough', key: 'not_enough' },
] as const;

export const STORAGE_OPTIONS = [
  {
    id: 0,
    label: 'Pantry',
    key: 'pantry' as const,
    shelfLifeDays: 2,
    tip: 'Store in airtight containers in a cool, dry place. Best consumed within 1-2 days.',
    icon: require('../../../../assets/placeholder/frying-pan.png'),
  },
  {
    id: 1,
    label: 'Fridge',
    key: 'fridge' as const,
    shelfLifeDays: 3,
    tip: 'Store in a sealed container. Best consumed within 3 days.',
    icon: require('../../../../assets/placeholder/fridge.png'),
  },
  {
    id: 2,
    label: 'Freezer',
    key: 'freezer' as const,
    shelfLifeDays: 90,
    tip: 'Store in an airtight container or freezer bag. Good for up to 3 months.',
    icon: require('../../../../assets/placeholder/fridge.png'),
  },
] as const;

/**
 * Builds a user-friendly "use by" label from an AI shelf-life estimate.
 */
export function formatUseByLabel(shelfLifeDays: number, useByDate: string): string {
  const expiresAt = new Date(useByDate);
  if (shelfLifeDays <= 1) {
    return 'Use by tomorrow';
  } else if (shelfLifeDays <= 7) {
    const dayName = expiresAt.toLocaleDateString('en-US', { weekday: 'long' });
    return `Use by ${dayName} (${shelfLifeDays} days)`;
  } else if (shelfLifeDays <= 30) {
    const dateStr = expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Use within ${shelfLifeDays} days (by ${dateStr})`;
  } else {
    const months = Math.round(shelfLifeDays / 30);
    const dateStr = expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Use within ~${months} month${months > 1 ? 's' : ''} (by ${dateStr})`;
  }
}

export type PostMakeSurveyStep =
  | 'improvement'
  | 'portion'
  | 'leftover_ask'
  | 'storage'
  | 'makeover'
  | 'done_no_leftover';

export const POSTMAKE = (_dish?: string) => [] as any[];
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
  currencySymbol = '₹',
}: {
  spent: string;
  waste: string;
  co2Savings: number;
  co2SavingsPersonalBest: number | null;
  costSavings: number;
  costSavingsPersonalBest: number | null;
  foodSaved: number;
  foodSavedPersonalBest: number | null;
  currencySymbol?: string;
}): WeekResults => ({
  spent,
  waste,
  co2: co2Savings.toString(),
  currencySymbol,
  currentWeekResults: [
    {
      id: 0,
      type: 'food',
      saved: `${(foodSaved / 1000).toFixed(2)}kg`,
      description:
        foodSavedPersonalBest && foodSavedPersonalBest >= foodSaved
          ? `Your personal best is ${(foodSavedPersonalBest / 1000).toFixed(2)}kg`
          : 'New personal best!',
      isBest: !foodSavedPersonalBest || foodSavedPersonalBest < foodSaved,
      image: {
        uri: require('../../../../assets/placeholder/apple.png'),
      },
    },
    {
      id: 1,
      type: 'dollars',
      saved: `${currencySymbol}${costSavings.toFixed(2)}`,
      description:
        costSavingsPersonalBest && costSavingsPersonalBest >= costSavings
          ? `Your personal best is ${currencySymbol}${costSavingsPersonalBest.toFixed(2)}`
          : 'New personal best!',
      isBest: !costSavingsPersonalBest || costSavingsPersonalBest < costSavings,
      image: {
        uri: require('../../../../assets/placeholder/money.png'),
      },
    },
    {
      id: 2,
      type: 'co2',
      saved: `${(co2Savings / 1000).toFixed(2)}kg`,
      description:
        co2SavingsPersonalBest && co2SavingsPersonalBest >= co2Savings
          ? `Your personal best is ${(co2SavingsPersonalBest / 1000).toFixed(2)}kg`
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
  currencySymbol = '$',
}: {
  co2Savings: string;
  co2SavingsPersonalBest?: string | null;
  costSavings: string;
  costSavingsPersonalBest?: string | null;
  foodSaved: string;
  foodSavedPersonalBest?: string | null;
  currencySymbol?: string;
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
    value: `${(Number(foodSaved ? foodSaved?.replace(/-/g, '') : '0') / 1000).toFixed(
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
    value: `${currencySymbol}${Math.abs(Number(costSavings || 0)).toFixed(2)}`,
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
    value: `${(Number(co2Savings ? co2Savings?.replace(/-/g, '') : '0') / 1000).toFixed(
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
      "Make it a habit to start by fossicking through your fridge to save food and coin. Try adding ‘eat me first’ labels to your containers and write your own use-by dates on them. If the date's approaching and it doesn't look like you're going to eat it – just transfer it to the freezer.",
  },
  {
    id: 5,
    title: 'REMIX YOUR MEAL',
    description:
      "Get creative with what you've made and give those leftovers a makeover. Roast veggies can become frittatas, bowls, curries and more. Go-to chilli becomes enchiladas, nachos and tacos! Experiment and play it your way.",
  },
  {
    id: 6,
    title: 'FREEZE FRAME',
    description:
      "If you're finding well-intentioned leftovers aren't getting eaten from your fridge, try freezing them first instead. Zero effort plus zero waste? Win win!",
  },
];

export const FAQ = [
  {
    id: 0,
    title: 'How much food does the average person waste?',
    description:
      'According to the UN Environment Programme^, roughly 1 billion tonnes of food is wasted globally every year — around 132kg per person — despite much of it being perfectly edible. The good news? Through small, everyday actions we can all change this (and save ourselves money and time while doing it)!',
    isExpanded: false,
  },
  {
    id: 1,
    title:
      'What is the average amount of money spent on wasted food per household?',
    description:
      "Households around the world spend hundreds to thousands of dollars every year on food that ends up in the bin. Every bit of food you save means real money back in your pocket \u2013 so let's start saving right now.",
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
      "Putting food in the compost or Food Organics Garden Organics (FOGO) bin is better than putting it in the rubbish bin. But it still produces methane. The food in your compost or FOGO also has an energy cost (sun, water and transport). That's why the goal is to put the food you buy into hungry tummies!",
    isExpanded: false,
  },
  {
    id: 4,
    title: 'What happens to the food I put in landfill?',
    description:
      "When your organic waste (like food, tea, coffee, and dairy) gets mixed with other types of garbage and isn't exposed to oxygen, it produces more methane and nitrous oxide. These greenhouse gas emissions have a big impact on climate change. So, as an easy first step – you find out what your local council accepts in your FOGO bin and put what you can in there.",
    isExpanded: false,
  },
  {
    id: 5,
    title: 'I feed my leftovers to my dog, is that waste?',
    description:
      "No, surely? Yes, unfortunately. We know that your doggo is one of the most important creatures on the planet. But, according to leading food waste researchers, Fight Food Waste, all those lovely leftovers they've been chowing down on are technically considered food waste.",
    isExpanded: false,
  },
];
