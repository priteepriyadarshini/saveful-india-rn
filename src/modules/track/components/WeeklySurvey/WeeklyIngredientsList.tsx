import TextBoxInput from '../../../../common/components/Form/TextBoxInput';
import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import useContent from '../../../../common/hooks/useContent';
import tw from '../../../../common/tailwind';
import { IIngredient } from '../../../../models/craft';
import TrackLinearGradient from '../../../../modules/track/components/TrackLinearGradient';
import TrackPostMakeIngredients, {
  ITrackPostMakeIngredient,
} from '../../../../modules/track/components/TrackPostMakeIngredients';
import { ISurveyList } from '../../../../modules/track/types';
import { useEffect, useState } from 'react';
import {
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { bodyMediumRegular, h6TextStyle } from '../../../../theme/typography';

interface WeeklyIngredientsListProps {
  item: ISurveyList;
  onSurveyComplete: (
    e?: React.BaseSyntheticEvent<object, any, any> | undefined,
  ) => Promise<void>;
}

type Props<T extends FieldValues> = WeeklyIngredientsListProps &
  UseControllerProps<T>;

// Controlled text input that can infer the type of the form based on the controller passed in
// This way the "name" prop will work know what types are suitable
export default function WeeklyIngredientsList<T extends FieldValues>(
  props: Props<T>,
) {
  const { item, onSurveyComplete } = props;
  const { field } = useController(props);

  const [selectedIngredients, setSelectedIngredients] = useState<
    ITrackPostMakeIngredient[]
  >([]);

  const { getIngredients } = useContent();
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);

  const getIngredientsData = async () => {
    const data = await getIngredients();

    if (data) {
      // Sort alphabetically
      setIngredients(data.sort((a, b) => a.title.localeCompare(b.title)));
    }
  };

  useEffect(() => {
    getIngredientsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onValueChecked = (value: ITrackPostMakeIngredient) => {
    const valueIndex = selectedIngredients.findIndex(x => x.id === value.id);

    if (valueIndex === -1) {
      setSelectedIngredients([...selectedIngredients, value]);
      field.onChange([...selectedIngredients, value].map(x => x.title));
    } else {
      const updatedArray = [...selectedIngredients];
      updatedArray.splice(valueIndex, 1);

      setSelectedIngredients(updatedArray);
      field.onChange(updatedArray.map(x => x.title));
    }
  };

  const [searchInput, setSearchInput] = useState<string>('');
  const filteredIngredients = ingredients.filter(item => {
    const matchInput = item.title
      .toLowerCase()
      .includes(searchInput.toLowerCase());
    const activeIngredients = selectedIngredients.some(
      selectedIngredient => selectedIngredient.id === item.id,
    );
    return activeIngredients || matchInput;
  });

  return (
    <View style={tw.style('justify-between px-10')}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw.style(`w-full pb-5`)}
      >
        <View>
          <View style={tw.style('items-center pt-8')}>
            <Text
              style={tw.style(h6TextStyle, 'pb-2 text-center text-white')}
              maxFontSizeMultiplier={1}
            >
              {item.title}
            </Text>
            <Text
              style={tw.style(bodyMediumRegular, 'pb-2 text-center text-white')}
            >
              {item.subTitle}
            </Text>
          </View>
        </View>
        <View style={tw`pt-6`}>
          <TextBoxInput
            value={searchInput}
            placeholder="Search ingredients"
            onChangeText={setSearchInput}
            iconRight="search"
          />
        </View>
        <TrackPostMakeIngredients
          list={filteredIngredients}
          selectedIngredients={selectedIngredients}
          setSelectedIngredients={onValueChecked as any}
        />
      </ScrollView>
      <View>
        <TrackLinearGradient style={'top-[-33px]'} />
        <PrimaryButton style={tw.style('mb-2')} onPress={onSurveyComplete}>
          Next
        </PrimaryButton>
      </View>
    </View>
  );
}
