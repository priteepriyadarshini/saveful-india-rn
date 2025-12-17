import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import ErrorMessage from '../../../modules/forms/components/ErrorMessage';
import React from 'react';
import {
  FieldError,
  FieldValues,
  Path,
  UseControllerProps,
  useController,
} from 'react-hook-form';
import {
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { bodyLargeRegular } from '../../../theme/typography';

interface ControlledTextInputProps<T> {
  containerStyle?: ViewStyle;
  placeholderOnTop?: boolean;
  onReturnKeyPressed?: (name: Path<T>) => void;
  error?: FieldError;
  textStyles?: ViewStyle | TextStyle;
  postText?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

type Props<T extends FieldValues> = TextInputProps &
  ControlledTextInputProps<T> &
  UseControllerProps<T>;

// Controlled text input that can infer the type of the form based on the controller passed in
// This way the "name" prop will work know what types are suitable
export default function CenteredTextInput<T extends FieldValues>(
  props: Props<T>,
) {
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const {
    containerStyle,
    error,
    secureTextEntry,
    textStyles,
    multiline = false,
    numberOfLines = 1,
  } = props;

  const { field } = useController(props);
  const { onReturnKeyPressed } = props;

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const showSecureEntry = secureTextEntry && !showPassword;

  const onBlur = () => {
    setIsFocused(false);

    field.onBlur();
  };

  const onSubmitEditing = React.useCallback(() => {
    onReturnKeyPressed?.(field.name);
  }, [field.name, onReturnKeyPressed]);

  return (
    <View style={tw.style(containerStyle)}>
      <View
        style={tw.style(
          `py-4.5 overflow-hidden rounded-md border border-strokecream bg-white px-4`,
          { 'border-black': isFocused },
          { 'border-validation': error !== undefined },
        )}
      >
        <View style={tw`flex-row items-center`}>
          <TextInput
            {...props}
            ref={field.ref}
            style={tw.style(
              bodyLargeRegular,
              'grow text-center text-midgray',
              textStyles,
            )}
            placeholderTextColor={tw.color('stone')}
            value={field.value?.toString()}
            secureTextEntry={showSecureEntry}
            onChangeText={field.onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={onBlur}
            onSubmitEditing={onSubmitEditing}
            multiline={multiline}
            numberOfLines={numberOfLines}
          />

          {props.postText && (
            <Text style={tw`text-midgray`}>{props.postText}</Text>
          )}

          {secureTextEntry ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color={tw.color('black')}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
      <ErrorMessage centered errors={error} />
    </View>
  );
}
