import OverlayPicker, {
  OverlayPickerProps,
} from '../../../modules/forms/components/OverlayPicker';
import React from 'react';
import {
  FieldValues,
  UseControllerProps,
  useController,
} from 'react-hook-form';

interface Props {
  displayNames?: { [key: string]: string };
}

type ControlledOverlayPickerProps<T extends FieldValues> = Props &
  OverlayPickerProps &
  UseControllerProps<T>;

export default function ControlledOverlayPicker<T extends FieldValues>(
  props: ControlledOverlayPickerProps<T>,
) {
  const { displayNames } = props;
  const { field } = useController(props);

  const displayValue = React.useMemo(() => {
    if (displayNames) {
      return displayNames[field.value] ?? field.value;
    }

    return field.value;
  }, [field.value, displayNames]);

  return (
    <OverlayPicker
      {...props}
      displayValue={displayValue}
      selectedValue={field.value}
      ref={field.ref}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  );
}
