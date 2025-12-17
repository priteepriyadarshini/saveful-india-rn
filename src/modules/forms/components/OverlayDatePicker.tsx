//
// Uses react-native-community/datetimepicker and wraps it in a way that is a bit easier to use
// Displays an overlay situation on iOS with cancel and done buttons
//
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import tw from '../../../common/tailwind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface OverlayDatePickerProps {
  initialDate?: Date;
  onDateUpdate?: (date: Date) => void;
  onClose?: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

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

export interface OverlayDatePickerRef {
  show: () => void;
  hide: () => void;
  setValue: (date: Date) => void;
}

const OverlayDatePicker = React.forwardRef<
  OverlayDatePickerRef,
  OverlayDatePickerProps
>(
  (
    {
      initialDate,
      onDateUpdate,
      onClose,
      minimumDate,
      maximumDate,
    }: OverlayDatePickerProps,
    ref,
  ) => {
    const [open, setOpen] = React.useState<boolean>(false);

    const [dateState, setDateState] = useState<Date | null>(null);

    const dateValue = useMemo(() => {
      return dateState || initialDate || new Date();
    }, [dateState, initialDate]);

    // Setup the fade animation for iOS
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
    useEffect(() => {
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

    // Interface for the date picker as a ref
    React.useImperativeHandle(ref, () => ({
      show: () => {
        setOpen(true);
      },
      hide: () => {
        setOpen(false);
      },
      setValue: (date: Date) => {
        setDateState(date);
      },
    }));

    if (Platform.OS === 'android') {
      if (!open) {
        return null;
      }
      return (
        <DateTimePicker
          value={dateValue}
          mode="date"
          is24Hour={false}
          display="spinner"
          onChange={(_event: DateTimePickerEvent, date?: Date | undefined) => {
            // console.log('selectedDate', { event, date });
            if (date) {
              onDateUpdate?.(date);
            } else {
              onClose?.();
            }
            setOpen(false);
          }}
          // style={.datePicker}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      );
    }
    return (
      <View
        style={styles.datePickerContainer}
        pointerEvents={open ? 'auto' : 'none'}
      >
        {/* Background fill that fades in */}
        <Animated.View
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
                onPress={() => {
                  onClose?.();
                  setOpen(false);
                }}
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
                  onPress={() => {
                    // if no state value set, check initial prop values, and nothing else default to today date
                    const currentvalue = dateState || initialDate;
                    if (currentvalue) {
                      onDateUpdate?.(currentvalue);
                    } else {
                      onClose?.();
                    }
                    setOpen(false);
                  }}
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
            <DateTimePicker
              value={dateValue}
              mode="date"
              is24Hour={true}
              display="spinner"
              onChange={(
                _event: DateTimePickerEvent,
                date?: Date | undefined,
              ) => {
                setDateState(date ?? null);
              }}
              style={styles.datePicker}
              textColor="black"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          </View>
        </Animated.View>
      </View>
    );
  },
);

export default OverlayDatePicker;
