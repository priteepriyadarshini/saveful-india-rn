import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  Animated,
} from 'react-native';
import {
  bodyLargeBold,
  bodyMediumBold,
  bodyMediumRegular,
  bodySmallBold,
  bodySmallRegular,
  subheadSmallUppercase,
} from '../../../theme/typography';

interface PrepServingSelectorProps {
  originalPortions: string | null;
  onConfirmServings: (servings: number) => void;
  isLoading?: boolean;
  isScaled?: boolean;
  cookingNotes?: string;
}


export function parseServingsFromPortions(portions: string | null): number {
  if (!portions) return 4;
  const trimmed = portions.trim();
  const match = trimmed.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    return num > 0 ? num : 4;
  }
  return 4;
}


export default function PrepServingSelector({
  originalPortions,
  onConfirmServings,
  isLoading = false,
  isScaled = false,
  cookingNotes,
}: PrepServingSelectorProps) {
  const originalServings = parseServingsFromPortions(originalPortions);
  const [servings, setServings] = useState(originalServings);
  const isOriginal = servings === originalServings;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLoading, pulseAnim]);

  const handleDecrement = useCallback(() => {
    if (servings > 1 && !isLoading) {
      setServings(s => s - 1);
    }
  }, [servings, isLoading]);

  const handleIncrement = useCallback(() => {
    if (servings < 20 && !isLoading) {
      setServings(s => s + 1);
    }
  }, [servings, isLoading]);

  const handleReset = useCallback(() => {
    if (!isLoading) {
      setServings(originalServings);
      onConfirmServings(originalServings);
    }
  }, [isLoading, originalServings, onConfirmServings]);

  const handleConfirm = useCallback(() => {
    if (!isLoading) {
      onConfirmServings(servings);
    }
  }, [isLoading, servings, onConfirmServings]);

  return (
    <View style={tw`mt-3 mx-4 rounded-2xl mb-2 bg-white border border-gray-200 px-4 py-3`}>
      {/* Header Row */}
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center gap-2`}>
          <Feather name="users" size={16} color={tw.color('black')} />
          <Text
            style={tw.style(subheadSmallUppercase, 'text-black')}
            maxFontSizeMultiplier={1}
          >
            Adjust Servings
          </Text>
        </View>

        {/* Reset */}
        {(isScaled || !isOriginal) && (
          <Pressable
            onPress={handleReset}
            disabled={isLoading}
            style={tw`flex-row items-center gap-1`}
            hitSlop={8}
          >
            <Feather name="rotate-ccw" size={12} color={tw.color('midgray')} />
            <Text style={tw.style(bodySmallRegular, 'text-midgray')}>
              Reset
            </Text>
          </Pressable>
        )}
      </View>

      {/* Controls Row */}
      <View style={tw`flex-row items-center justify-center gap-4 mt-3`}>
        {/* Decrement */}
        <Pressable
          onPress={handleDecrement}
          disabled={servings <= 1 || isLoading}
          style={tw.style(
            'h-10 w-10 items-center justify-center rounded-full border-2',
            servings <= 1 || isLoading
              ? 'border-gray-200 opacity-40'
              : 'border-kale',
          )}
          hitSlop={8}
        >
          <Feather
            name="minus"
            size={18}
            color={servings <= 1 || isLoading ? tw.color('gray-300') : tw.color('kale')}
          />
        </Pressable>

        {/* Serving Count Display */}
        <Animated.View
          style={[
            tw`min-w-[56px] items-center justify-center rounded-xl px-4 py-2`,
            { opacity: pulseAnim },
            !isOriginal
              ? tw`bg-[#FF6B35] bg-opacity-10`
              : tw`bg-gray-100`,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={tw.color('kale')} />
          ) : (
            <Text
              style={tw.style(bodyLargeBold, !isOriginal ? 'text-[#FF6B35]' : 'text-black', 'text-center text-2xl')}
              maxFontSizeMultiplier={1}
            >
              {servings}
            </Text>
          )}
        </Animated.View>

        {/* Increment */}
        <Pressable
          onPress={handleIncrement}
          disabled={servings >= 20 || isLoading}
          style={tw.style(
            'h-10 w-10 items-center justify-center rounded-full border-2',
            servings >= 20 || isLoading
              ? 'border-gray-200 opacity-40'
              : 'border-kale',
          )}
          hitSlop={8}
        >
          <Feather
            name="plus"
            size={18}
            color={servings >= 20 || isLoading ? tw.color('gray-300') : tw.color('kale')}
          />
        </Pressable>
      </View>

      {!isOriginal && !isScaled && (
        <Pressable
          onPress={handleConfirm}
          disabled={isLoading}
          style={tw.style(
            'mt-3 items-center justify-center rounded-xl py-2.5',
            isLoading ? 'bg-kale opacity-60' : 'bg-kale',
          )}
        >
          {isLoading ? (
            <View style={tw`flex-row items-center gap-2`}>
              <ActivityIndicator size="small" color="white" />
              <Text style={tw.style(bodyMediumBold, 'text-white')}>
                Adjusting ingredients…
              </Text>
            </View>
          ) : (
            <Text style={tw.style(bodyMediumBold, 'text-white')}>
              OK - Adjust for {servings} servings
            </Text>
          )}
        </Pressable>
      )}

      {/* Success indicator */}
      {isScaled && !isOriginal && (
        <View style={tw`mt-2 flex-row items-center justify-center gap-1.5`}>
          <Feather name="check-circle" size={14} color="#22c55e" />
          <Text style={tw.style(bodySmallBold, 'text-[#22c55e]')}>
            Ingredients adjusted for {servings} servings
          </Text>
        </View>
      )}

      {/* Cooking Notes from AI */}
      {cookingNotes && !isLoading && isScaled && (
        <Pressable
          onPress={() => setShowNotes(!showNotes)}
          style={tw`mt-2`}
        >
          <View style={tw`flex-row items-center justify-center gap-1`}>
            <Feather name="info" size={12} color={tw.color('midgray')} />
            <Text
              style={tw.style(bodySmallRegular, 'text-midgray underline')}
              maxFontSizeMultiplier={1}
            >
              {showNotes ? 'Hide cooking notes' : 'View AI cooking notes'}
            </Text>
          </View>
          {showNotes && (
            <Text
              style={tw.style(bodyMediumRegular, 'mt-1.5 text-black opacity-70 text-center')}
              maxFontSizeMultiplier={1.2}
            >
              {cookingNotes}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}
