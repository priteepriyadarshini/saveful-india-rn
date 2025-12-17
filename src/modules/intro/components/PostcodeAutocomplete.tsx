import { skipToken } from '@reduxjs/toolkit/query';
import DebouncedPressable from '../../../common/components/DebouncePressable';
import useDebounce from '../../../common/hooks/useDebounce';
import tw from '../../../common/tailwind';
import { useCombobox } from 'downshift';
import {
  useLazyGetLocationQuery,
  useSearchLocationsQuery,
} from '../../../modules/intro/api/api';
import { LocationMetadata } from '../../../modules/intro/api/types';
import React, { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Text, TextInput, View, ViewStyle } from 'react-native';
import { bodyMediumRegular, bodySmallRegular } from '../../../theme/typography';

// Uses the Addressfinder.com.au to search locations only (not addresses)
// ads an option that their widget doesn't have, to exclude localities that do not have postcodes
export default function PostcodeAutocomplete({
  selectedLocation,
  setSelectedLocation,
  initialValue = '',
  setValue,
  containerStyle,
  textStyles,
}: {
  selectedLocation: LocationMetadata | null;
  setSelectedLocation: (location: LocationMetadata | null) => void;
  initialValue?: string;
  setValue: UseFormSetValue<any>;
  containerStyle?: ViewStyle;
  textStyles?: ViewStyle;
}) {
  // The current search term
  const [search, setSearch] = useState<string>(initialValue);

  // Debounce the search term to avoid too many requests
  const debouncedSearch = useDebounce<string>(search);

  // Fetch the autocomplete data using the current search, if any
  const { data, isLoading, isFetching } = useSearchLocationsQuery(
    debouncedSearch
      ? { search: debouncedSearch, postcodesOnly: true }
      : skipToken,
  );

  // Lazy query to fetch the full location data when one is selected
  const [getLocation] = useLazyGetLocationQuery();

  const items = data ?? [];

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    setInputValue,
    selectedItem,
    // highlightedIndex,
    // getItemProps,
    closeMenu,
  } = useCombobox({
    selectedItem: selectedLocation,
    items,
    // onSelectedItemChange: ({ selectedItem }) => {
    // console.log('selected', selectedItem);
    // // If no item selected, clear it
    // if (!selectedItem) {
    //   onSelectedLocation(null);
    //   return;
    // }
    // Otherwise fetch the location (or get from cache)
    // getLocation({ id: selectedItem.id }, true)
    //   .then(({ data }) => {
    //     // Update the selected location
    //     onSelectedLocation(data ?? null);
    //   })
    //   .catch(_e => {
    //     // I don't know what to do here :D
    //   });
    // },
    itemToString: item => (item ? item.full_location : ''),
    onInputValueChange: ({ inputValue }) => setSearch(inputValue ?? ''),
  });

  useEffect(() => {
    if (initialValue !== '') setInputValue(`${initialValue}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={tw.style('relative', containerStyle)}>
      <View
        style={tw.style(
          'overflow-hidden rounded-md border border-strokecream bg-white px-4 py-3',
        )}
      >
        <TextInput
          style={tw.style(bodyMediumRegular, 'grow text-midgray', textStyles)}
          placeholderTextColor={tw.color('midgray')}
          {...getInputProps()}
          keyboardType="numeric"
          placeholder="Enter your postcode"
          returnKeyType="done"
        />
        {isLoading || isFetching ? (
          <>{/* <Spinner className="text-green-500" /> */}</>
        ) : null}
      </View>

      <View
        {...getMenuProps()}
        style={tw.style(
          `mt-1 w-full rounded-md border border-strokecream bg-white`,
        )}
      >
        {isOpen
          ? items.map((item, index) => (
              <DebouncedPressable
                key={item.id}
                onPress={() => {
                  getLocation({ id: item.id }, true)
                    .then(({ data }) => {
                      setSelectedLocation(data ?? null);
                      if (data) {
                        setValue('postcode', data.postcode);
                        setValue('suburb', data.locality_name);
                      }
                      closeMenu();
                      // Keyboard.dismiss();
                    })
                    .catch(_e => {
                      closeMenu();
                      // Keyboard.dismiss();
                    });
                }}
                style={tw.style(
                  `p-3`,
                  index === items.length - 1
                    ? ''
                    : 'border-b border-strokecream',
                  selectedItem?.full_location === item.full_location
                    ? 'bg-radish'
                    : '',
                )}
                // {...getItemProps({
                //   item,
                //   index,
                // })}
              >
                <Text style={tw.style(bodySmallRegular)}>
                  {item.full_location}
                </Text>
              </DebouncedPressable>
            ))
          : null}
      </View>
    </View>
  );
}
