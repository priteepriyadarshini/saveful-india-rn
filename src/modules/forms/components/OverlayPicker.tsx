import { Feather } from '@expo/vector-icons';
import { Portal } from '@gorhom/portal';
import { Picker, PickerProps } from '@react-native-picker/picker';
import { ItemValue } from '@react-native-picker/picker/typings/Picker';
import tw from '../../../common/tailwind';
import React from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { bodyMediumRegular } from '../../../theme/typography';

const styles = StyleSheet.create({
  datePickerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  datePickerView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerBackgroundView: {
    backgroundColor: 'white',
  },
  datePickerToolbarView: {
    height: 40,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerButtonView: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerButtonLabel: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  datePickerDoneButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  datePicker: {
    height: 270,
  },
});

// Displays the current value and functions as a button to open the picker
function OverlayPickerViewValueDisplay({
  isPlaceholder,
  children,
  onPress,
}: {
  isPlaceholder?: boolean;
  children: React.ReactNode;
  onPress: () => void;
}) {
  const isJest = process.env.JEST_WORKER_ID !== undefined;

  return (
    <Pressable
      accessibilityRole="spinbutton"
      onPress={onPress}
      style={tw.style(
        'flex-row justify-between overflow-hidden rounded-md border border-strokecream bg-white p-4',
      )}
    >
      <Text
        style={tw.style(bodyMediumRegular, 'flex-grow text-midgray', {
          'text-gray-700': isPlaceholder === true,
        })}
      >
        {children}
      </Text>
      {/* This is gross, but i just cannot get these to work in jest */}
      {isJest ? null : <Feather name="chevron-down" size={18} />}
    </Pressable>
  );
}

function ConditionalPortal({
  children,
  noPortal,
  hostName = 'FormOverlay',
}: {
  children: React.ReactNode;
  noPortal?: boolean;
  hostName?: string;
}) {
  if (noPortal) {
    return <>{children}</>;
  }
  return <Portal hostName={hostName}>{children}</Portal>;
}

export interface OverlayPickerRef {
  focus: () => void;
  blur: () => void;
}

interface Props {
  noPortal?: boolean;
  overlayPortalName?: string;
  displayValue?: string;
  customDisplayOnAndroid?: boolean;
}

export type OverlayPickerProps = Props & PickerProps;

const OverlayPicker = React.forwardRef<OverlayPickerRef, OverlayPickerProps>(
  (props, ref) => {
    const {
      placeholder,
      customDisplayOnAndroid,
      displayValue,
      selectedValue,
      overlayPortalName,
    } = props;
    const isPlaceholder =
      !displayValue && !selectedValue && placeholder !== undefined;
    // Are we open or not?
    const [open, setOpen] = React.useState<boolean>(false);

    // Our local value - we use this to keep track of the value until the user selects 'done' on iOS
    const [localValue, setLocalValue] = React.useState<ItemValue | undefined>(
      selectedValue,
    );

    // A ref to the android picker so we can display it programatically
    const androidPickerRef = React.useRef<Picker<ItemValue>>(null);

    // Setup the fade animation for iOS
    const fadeAnim = React.useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
    React.useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: open ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }, [fadeAnim, open]);

    // Dismiss keyboards when displaying the date picker
    React.useEffect(() => {
      if (open) {
        Keyboard.dismiss();
      }
    }, [open]);

    // Update the local value when the selected value changes
    React.useEffect(() => {
      setLocalValue(selectedValue);
    }, [selectedValue]);

    // Interface for the date picker as a ref
    React.useImperativeHandle(ref, () => ({
      focus: () => {
        setOpen(true);
        androidPickerRef.current?.focus();
      },
      blur: () => {
        setOpen(false);
        androidPickerRef.current?.blur();
      },
    }));

    const onOpenPressed = React.useCallback(() => {
      setOpen(true);
      androidPickerRef.current?.focus();
    }, []);

    const onValueChange = React.useCallback((value: ItemValue) => {
      setLocalValue(value);
      androidPickerRef.current?.blur();
    }, []);

    const onCancelPressed = React.useCallback(() => {
      setOpen(false);
    }, []);

    const onDonePressed = React.useCallback(() => {
      if (localValue) {
        props.onValueChange?.(localValue, -1);
      }
      setOpen(false);
    }, [localValue, props]);

    if (Platform.OS === 'android') {
      if (!customDisplayOnAndroid) {
        // When not using the custom display on android, just display the picker
        return <Picker {...props} />;
      } else {
        // Otherwise show our custom view, and then a hdiden picker
        return (
          <>
            {/* The display value */}
            <OverlayPickerViewValueDisplay
              isPlaceholder={isPlaceholder}
              onPress={onOpenPressed}
            >
              {isPlaceholder ? placeholder : String(displayValue ?? selectedValue)}
            </OverlayPickerViewValueDisplay>
            {/* The picker, hidden */}
            <Picker
              style={tw.style('hidden')}
              ref={androidPickerRef}
              {...props}
            />
          </>
        );
      }
    }
    // iOS
    return (
      <View>
        <OverlayPickerViewValueDisplay
          isPlaceholder={isPlaceholder}
          onPress={onOpenPressed}
        >
          {isPlaceholder ? placeholder : String(displayValue ?? selectedValue)}
        </OverlayPickerViewValueDisplay>
        <ConditionalPortal
          noPortal={props.noPortal}
          hostName={overlayPortalName ?? 'FormOverlay'}
        >
          <View
            style={styles.datePickerContainer}
            pointerEvents={open ? 'auto' : 'none'}
          >
            {/* Background fill that fades in */}
            <Animated.View
              testID="BackgroundFill"
              style={[
                tw.style('absolute bottom-0 left-0 right-0 top-0'),
                { opacity: fadeAnim },
              ]}
              pointerEvents="none"
            >
              {/* Colour of the fill */}
              <View style={tw.style('flex-1 bg-black opacity-50')} />
            </Animated.View>

            {/* Date picker view */}
            <Animated.View
              style={[
                styles.datePickerView,
                {
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [400, 0], // 0 : 150, 0.5 : 75, 1 : 0
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.datePickerBackgroundView]}>
                <View style={styles.datePickerToolbarView}>
                  <TouchableWithoutFeedback
                    style={styles.datePickerButtonView}
                    onPress={onCancelPressed}
                    accessibilityLabel="Cancel"
                    accessibilityHint="Cancels and closes the date picker"
                  >
                    <Text
                      allowFontScaling={false}
                      style={styles.datePickerButtonLabel}
                    >
                      Cancel
                    </Text>
                  </TouchableWithoutFeedback>
                  <View style={styles.datePickerButtonView}>
                    <TouchableWithoutFeedback
                      onPress={onDonePressed}
                      accessibilityLabel="Done"
                      accessibilityHint="Sets the date to the date selected"
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.datePickerDoneButtonLabel}
                      >
                        Done
                      </Text>
                    </TouchableWithoutFeedback>
                  </View>
                </View>
                <Picker
                  {...props}
                  selectedValue={localValue}
                  onValueChange={onValueChange}
                />
              </View>
            </Animated.View>
          </View>
        </ConditionalPortal>
      </View>
    );
  },
);

export default OverlayPicker;
