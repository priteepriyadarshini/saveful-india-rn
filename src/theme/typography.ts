import tw from "../common/tailwind";

const h1TextStyle =
  'font-sans-bold text-5xl leading-xtratight uppercase text-black';
const h2TextStyle =
  'font-sans-bold text-4.5xl leading-xtratight uppercase text-black';
const h3TextStyle =
  'font-sans-bold text-3.5xl leading-tightest uppercase text-black';
const h4TextStyle =
  'font-sans-bold text-[1.75rem] leading-tightest uppercase text-black';
const h5TextStyle =
  'font-sans-bold text-2.5xl leading-tightest uppercase text-black';
const h6TextStyle =
  'font-sans-bold text-1.5xl leading-tighter uppercase text-black';
const h7TextStyle =
  'font-sans-bold text-xl leading-tighter uppercase text-black';

const bodyLargeRegular = 'font-sans text-lg leading-tightest text-black';
const bodyLargeMedium =
  'font-sans-semibold text-lg leading-tightest text-black';
const bodyLargeBold = 'font-sans-bold text-lg leading-tightest text-black';
const bodyMediumRegular = 'font-sans text-base leading-tightest text-black';
const bodyMediumBold =
  'font-sans-semibold text-base leading-tightest text-black';
const bodySmallRegular = 'font-sans text-sm leading-tightest text-black';
const bodySmallBold = 'font-sans-semibold text-sm leading-tightest text-black';

const subheadLarge = 'font-sans-bold text-2.5xl leading-tighter text-black';
const subheadMedium = 'font-sans-bold text-1.5xl leading-tightest text-black';
const subheadSmall = 'font-sans-semibold text-1.5xl leading-tighter text-black';
const subheadLargeUppercase =
  'font-sans-semibold text-sm leading-tighter tracking-widest uppercase text-black';
const subheadMediumUppercase =
  'font-sans-semibold text-xs leading-tighter tracking-widest uppercase text-black';
const subheadSmallUppercase =
  'font-sans-semibold text-[10px] leading-tighter tracking-widest uppercase text-black';

const labelLarge = 'font-sans-semibold text-base leading-tightest text-black';

const counterLarge = 'font-sans-bold text-7xl leading-tighter';

const tagStyles = {
  em: tw.style('font-sans-italic'),
  strong: tw.style('font-sans-bold'),
  b: tw.style('font-sans-bold'),
  p: tw.style(bodyMediumRegular),
  h1: tw.style(h1TextStyle),
  h2: tw.style(h2TextStyle),
  h3: tw.style(h3TextStyle),
  h4: tw.style(h4TextStyle),
  h5: tw.style(h5TextStyle),
  h6: tw.style(h6TextStyle),
  h7: tw.style(h7TextStyle),
  ul: tw.style('right-5'),
  li: tw.style('flex'),
};

export {
  bodyLargeBold,
  bodyLargeMedium,
  bodyLargeRegular,
  bodyMediumBold,
  bodyMediumRegular,
  bodySmallBold,
  bodySmallRegular,
  counterLarge,
  h1TextStyle,
  h2TextStyle,
  h3TextStyle,
  h4TextStyle,
  h5TextStyle,
  h6TextStyle,
  h7TextStyle,
  labelLarge,
  subheadLarge,
  subheadLargeUppercase,
  subheadMedium,
  subheadMediumUppercase,
  subheadSmall,
  subheadSmallUppercase,
  tagStyles,
};
