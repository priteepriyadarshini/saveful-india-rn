import CheckGroup from '../../../common/components/Form/CheckGroup';
import useContent from '../../../common/hooks/useContent';
import tw from '../../../common/tailwind';
import { IIngredient } from '../../../models/craft';
import { lineTwoTheme } from '../../../modules/feed/utils/ingredientTheme';
import React, { useEffect } from 'react';
import { ImageBackground, ImageRequireSource, Text, View } from 'react-native';
import { bodyLargeBold, h5TextStyle } from '../../../theme/typography';

export default function ReadyToCook({
  id,
  title,
  ingredientTheme,
}: IIngredient) {
  const [itemKind, setItemKind] = React.useState<string[]>([]);

  const heroImageBGSrc: ImageRequireSource = lineTwoTheme(ingredientTheme);

  const { getIngredients } = useContent();
  const [ingredients, setIngredients] = React.useState<IIngredient[]>();

  const getIngredientsData = async () => {
    const data = await getIngredients();

    if (data) {
      setIngredients(data);
    }
  };

  useEffect(() => {
    getIngredientsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // All ingredients which have this ingredient as a parent
  const childIngredients = ingredients?.filter(
    (ingredient: IIngredient) =>
      ingredient.parentIngredient.length > 0 &&
      ingredient.parentIngredient[0].id === id,
  );

  if (!childIngredients || childIngredients.length === 0) return null;

  return (
    <View style={tw`relative w-full items-center p-5 pb-6 pt-7`}>
      <View style={tw.style('z-10 w-full items-center')}>
        <Text style={tw.style(h5TextStyle, 'text-center')}>Ready to cook?</Text>
        <Text
          style={tw.style(bodyLargeBold, 'mb-5 mt-1 text-center text-midgray')}
        >
          What kind do you have?
        </Text>
        <CheckGroup
          values={[
            { id, title },
            ...childIngredients.map(item => ({
              id: item.id,
              title: item.title,
            })),
          ]}
          selectedValues={itemKind}
          setSelectedValues={values => setItemKind(values)}
        />
      </View>
      <ImageBackground
        style={tw`absolute -bottom-10 left-0 right-0 h-full items-center`}
        source={heroImageBGSrc}
        imageStyle={{
          resizeMode: 'cover',
        }}
      ></ImageBackground>
    </View>
  );
}
