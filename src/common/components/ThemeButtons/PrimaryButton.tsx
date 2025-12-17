import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text } from 'react-native';
import { cardDrop } from '../../../theme/shadow';
import tw from '../../tailwind';
import DebouncedPressable from '../DebouncePressable';
import Loader from '../Loader/Loader';
import { CustomButtonProps } from './type';


function PrimaryButton(props: CustomButtonProps) {
  const {
    style,
    buttonTextStyle,
    buttonSize = 'medium',
    width = 'auto',
    loading = false,
    children,
    iconLeft,
    iconRight,
    disabled,
    onPress,
  } = props;

  const styles = tw.style(
    'items-center rounded-md border border-black bg-black',
    'w-auto',
    { 'border-stone bg-stone': !!disabled },
    { 'w-full': width === 'full' },
    { 'flex-row justify-center': !!iconLeft || !!iconRight },
    { 'px-2.5 py-2': buttonSize === 'small' },
    { 'px-3.5 py-3': buttonSize === 'medium' },
    { 'px-3.5 py-4': buttonSize === 'large' },
    cardDrop,
    style,
  );

  const textStyle = tw.style(
    'text-center font-sans-semibold text-white',
    buttonSize === 'small' && 'text-sm leading-4',
    buttonSize === 'medium' && 'text-base leading-tightest',
    buttonSize === 'large' && 'text-lg leading-tight',
    buttonTextStyle,
  );

  return (
    <DebouncedPressable
      accessibilityRole="button"
      style={({ pressed }) => {
        return tw.style(
          styles,
          pressed && tw`border border-[#000000]`,
          cardDrop,
        );
      }}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {!loading && iconLeft !== undefined ? (
        <Feather style={tw`mr-2.5`} name={iconLeft} size={16} color="white" />
      ) : undefined}
      <Text style={textStyle} allowFontScaling={buttonSize === 'small'}>
        {loading ? (
          <>
            {/* Render a 'space' after the loader so it takes up the same height as the text */}{' '}
            <Loader />{' '}
          </>
        ) : (
          <>{children}</>
        )}
      </Text>
      {!loading && iconRight !== undefined ? (
        <Feather style={tw`ml-2.5`} name={iconRight} size={16} color="white" />
      ) : undefined}
    </DebouncedPressable>
  );
}

export default PrimaryButton;
