import React, { ReactNode } from "react";
import { subheadMediumUppercase } from "../../../theme/typography";
import tw from "../../tailwind";
import DebouncedPressable from "../DebouncePressable";
import Loader from "../Loader/Loader";
import { Text } from "react-native";

export default function EggplantButton({
  children,
  onPress,
  loading = false,
  
}: {
  children?: ReactNode;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <DebouncedPressable
      onPress={onPress}
      style={tw.style(
        'w-auto grow items-center gap-2.5 rounded-full border border-eggplant bg-white px-4 py-2.5',
      )}
    >
      <Text style={tw.style(subheadMediumUppercase, 'text-eggplant')}>
        {loading ? (
          <>
            {/* Render a 'space' after the loader so it takes up the same height as the text */}{' '}
            <Loader type="dark" />{' '}
          </>
        ) : (
          <>{children}</>
        )}
      </Text>
    </DebouncedPressable>
  );
}
