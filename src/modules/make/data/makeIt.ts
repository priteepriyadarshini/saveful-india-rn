export interface MakeItProps {
  id: string;
  heading: string;
  info?: {
    icon: 'zap' | 'star';
    heading: string;
    description: string;
    sponsor?: string;
    image?: {
      uri: string;
    };
  };
  ingredients?: {
    id: string;
    name: string;
    quantity: string;
    type?: string;
  }[];
}

const MAKE_IT: MakeItProps[] = [
  {
    id: '1',
    heading:
      'Add a good glug of oil to a large saucepan and warm over medium-high heat.',
  },
  {
    id: '2',
    heading:
      'Stir your aromatics into the heated oil and add a pinch of salt. Cook, stirring occasionally until soft - about 3-4 minutes.',
    ingredients: [
      {
        id: '1',
        name: 'Red onion, brown onion, Shallot',
        quantity: '1 medium',
        type: 'Chopped',
      },
      {
        id: '2',
        name: 'Fresh garlic or garlic paste',
        quantity: '1 medium',
        type: 'Crushed, minced or finely grated. If using paste use 2 tsp.',
      },
      {
        id: '1',
        name: 'Carrot',
        quantity: '1',
        type: 'Finely grated or chopped in a food processor',
      },
    ],
  },
  {
    id: '3',
    heading:
      'Add your spices to your tender aromatics. Stir to lightly toast and release the aromas.\n\nYour kitchen will be smelling heavenly by now!',
    ingredients: [
      {
        id: '1',
        name: 'Ground cumin',
        quantity: '2 tbsp',
      },
      {
        id: '2',
        name: 'Ground coriander',
        quantity: '2 tbsp',
      },
      {
        id: '1',
        name: 'Smoked paprika',
        quantity: '1',
      },
    ],
  },
  {
    id: '4',
    heading:
      'Time for the chilli. Add a little or a lot, depending on your taste - simply stir into the aromatics and cook for another minute or two.',
    info: {
      icon: 'zap',
      heading: 'Mini hack',
      description:
        'A chilli is a great way to sneak in extra veg for fussy kids - you can add them after the onion and garlic are cooked off. Be sure to chop or grate your extra veg very finely to aid in the subterfuge!',
      sponsor: 'sponsored by',
      image: {
        uri: require('../../../../assets/brands/birds-eye.png'),
      },
    },
    ingredients: [
      {
        id: '1',
        name: 'Ground cumin',
        quantity: '2 tbsp',
      },
      {
        id: '2',
        name: 'Ground coriander',
        quantity: '2 tbsp',
      },
      {
        id: '1',
        name: 'Smoked paprika',
        quantity: '1',
      },
    ],
  },
  {
    id: '5',
    heading:
      'Add your protein to the pan. Stir to break up and brown well.\n\nIf using tofu, stir it in and coat with the spices.',
  },
  {
    id: '6',
    heading:
      'Add your extra veggies (like canned legumes, including their water) to the pan and stir to combine.',
  },
  {
    id: '7',
    heading:
      'Add the canned tomatoes. Fill the can with water to get the last little bits of tomatoey goodness from the can, add to the chilli mixture and stir to combine.',
    info: {
      icon: 'star',
      heading: 'Pro tip',
      description:
        'If you’re using tofu or cauliflower, you may need to add more liquid as the mixture cooks, as they’ll absorb more than mince.',
    },
  },
  {
    id: '8',
    heading:
      'Bring to a simmer and cook, stirring occasionally, until thick and well-flavoured.',
  },
  {
    id: '9',
    heading:
      'Squeeze in the juice of a lime or add a dash of vinegar and simmer for another minute or two. Taste and check the seasoning and add more salt, pepper or acidity to taste.',
  },
  {
    id: '10',
    heading:
      'That’s it! Time to eat!\n\nDon’t forget to take a photo of your delicious creation.',
    info: {
      icon: 'star',
      heading: 'Serving suggestions',
      description:
        'Chilli is best friends with things like sour cream or yoghurt; coriander; pickled jalapeños or chilli sauce; avocado or guac; grated cheddar or crumbled feta.',
    },
  },
];

export default MAKE_IT;
