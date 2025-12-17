const bgTheme = (ingredientTheme: string | null) => {
  switch (ingredientTheme) {
    case 'red':
      return 'bg-[#FFF5E7]';
    case 'pink':
      return 'bg-[#FFF3FC]';
    case 'purple':
      return 'bg-[#F5F1FF]';
    case 'green':
      return 'bg-[#EFFFDC]';
    case 'yellow':
      return 'bg-[#FFF9D8]';
    case 'orange':
      return 'bg-[#FFF2DF]';
    default:
      return 'bg-[#FFF5E7]';
  }
};

const heroTheme = (ingredientTheme: string | null) => {
  switch (ingredientTheme) {
    case 'red':
      return require('../../../../assets/ingredients/hero-red.png');

    case 'pink':
      return require('../../../../assets/ingredients/hero-pink.png');

    case 'purple':
      return require('../../../../assets/ingredients/hero-purple.png');

    case 'green':
      return require('../../../../assets/ingredients/hero-green.png');

    case 'yellow':
      return require('../../../../assets/ingredients/hero-yellow.png');

    case 'orange':
      return require('../../../../assets/ingredients/hero-orange.png');

    default:
      return require('../../../../assets/ingredients/hero-red.png');
  }
};

const lineOneTheme = (ingredientTheme: string | null) => {
  switch (ingredientTheme) {
    case 'red':
      return require('../../../../assets/ribbons/ingredients-ribbons/chilli.png');
    case 'pink':
      return require('../../../../assets/ribbons/ingredients-ribbons/radish.png');
    case 'purple':
      return require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light.png');
    case 'green':
      return require('../../../../assets/ribbons/ingredients-ribbons/mint.png');
    case 'yellow':
      return require('../../../../assets/ribbons/ingredients-ribbons/lemon.png');
    case 'orange':
      return require('../../../../assets/ribbons/ingredients-ribbons/orange.png');
    default:
      return require('../../../../assets/ribbons/ingredients-ribbons/chilli.png');
  }
};

const lineTwoTheme = (ingredientTheme: string | null) => {
  switch (ingredientTheme) {
    case 'red':
      return require('../../../../assets/ribbons/ingredients-ribbons/chilli2.png');
    case 'pink':
      return require('../../../../assets/ribbons/ingredients-ribbons/radish2.png');
    case 'purple':
      return require('../../../../assets/ribbons/ingredients-ribbons/eggplant-light2.png');
    case 'green':
      return require('../../../../assets/ribbons/ingredients-ribbons/mint2.png');
    case 'yellow':
      return require('../../../../assets/ribbons/ingredients-ribbons/lemon2.png');
    case 'orange':
      return require('../../../../assets/ribbons/ingredients-ribbons/orange2.png');
    default:
      return require('../../../../assets/ribbons/ingredients-ribbons/chilli2.png');
  }
};

export { bgTheme, heroTheme, lineOneTheme, lineTwoTheme };
