//
// Displays a field that can be used to edit a date value using react-hook-form
// Expects you to supply it a ref to an `OverlayDatePicker` that will be used for selecting the date
///
import {
  DateFormats,
  useMemoizedDateFormatLabel,
} from '../../../common/hooks/useMemoizedDateFormatLabel';
import tw from '../../../common/tailwind';
import { OverlayDatePickerRef } from '../../../modules/forms/components/OverlayDatePicker';
import React from 'react';
import {
  FieldValues,
  Path,
  PathValue,
  UseControllerProps,
  UseFormSetValue,
  useController,
} from 'react-hook-form';
import { AccessibilityProps, Pressable, Text } from 'react-native';
import { bodyMediumRegular, subheadSmallUppercase } from '../../../theme/typography';

interface Props<T> extends AccessibilityProps {
  dateFormat?: DateFormats;
  placeholder?: string;
  onPress?: (name: Path<T>, value: Date) => void;
  onClear?: (name: Path<T>) => void;
}

export default function ControlledDateField<T extends FieldValues>({
  dateFormat,
  placeholder,
  onPress,
  onClear,
  ...props
}: Props<T> & UseControllerProps<T>) {
  const { field } = useController(props);

  const handlePress = React.useCallback(() => {
    onPress?.(props.name, field.value);
  }, [field.value, onPress, props.name]);

  const handleClear = React.useCallback(() => {
    onClear?.(props.name);
  }, [onClear, props.name]);

  const formattedValue = useMemoizedDateFormatLabel(
    field.value,
    dateFormat ?? DateFormats.DayMonthYear,
  );

  return (
    <Pressable
      accessibilityRole={props.accessibilityRole ?? 'button'}
      accessibilityHint={props.accessibilityHint ?? 'Select a date'}
      accessibilityValue={{ text: formattedValue }}
      onPress={handlePress}
      style={tw.style(
        'py-4.5 flex-row items-center justify-between overflow-hidden rounded-md border border-strokecream bg-white px-4',
      )}
    >
      {/* Field or placeholder */}
      {field.value ? (
        // Current value
        <Text
          {...props}
          style={tw.style(bodyMediumRegular, 'grow text-midgray')}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {formattedValue}
        </Text>
      ) : (
        // Placeholder
        <Text
          {...props}
          style={tw.style(bodyMediumRegular, 'grow text-stone')}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {placeholder ?? ''}
        </Text>
      )}

      {/* Show a clear button if we have a value */}
      {onClear && field.value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Clear the date"
          onPress={handleClear}
        >
          <Text
            style={tw.style(subheadSmallUppercase, 'text-eggplant underline')}
          >
            Clear
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

// Helper hook for linking this date field to a date picker
export function useControlledDatePicker<T extends FieldValues>(
  setValue: UseFormSetValue<T>,
) {
  const datePickerRef = React.useRef<OverlayDatePickerRef>(null);
  const [currentDateField, setCurrentDateField] =
    React.useState<Path<T> | null>(null);

  const onFocus = React.useCallback((name: Path<T>, value: Date) => {
    // console.log('onFocus', { name, value });
    // Update the value in the picker
    datePickerRef.current?.setValue(value);

    // Update the current date field (which will in-turn show the picker)
    setCurrentDateField(name);
  }, []);

  const onDateUpdate = React.useCallback(
    (date: PathValue<T, keyof T & Path<T>>) => {
      // console.log('onDateUpdate', { date, currentDateField });
      if (currentDateField) {
        setValue(currentDateField, date, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setCurrentDateField(null);
      }
    },
    [currentDateField, setValue],
  );

  // When the current date field changes, show or hide the picker
  React.useEffect(() => {
    if (currentDateField) {
      datePickerRef.current?.show();
    } else {
      datePickerRef.current?.hide();
    }
  }, [currentDateField]);

  const onDateClose = React.useCallback(() => {
    setCurrentDateField(null);
  }, []);

  const onClear = React.useCallback(
    (name: Path<T>) => {
      setValue(name, null as PathValue<T, keyof T & Path<T>>);
      setCurrentDateField(null);
    },
    [setValue],
  );

  return {
    datePickerRef,
    onDateUpdate,
    onDateClose,
    onFocus,
    onClear,
  };
}
