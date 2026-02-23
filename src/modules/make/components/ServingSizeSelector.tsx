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
  bodyMediumRegular,
  bodySmallRegular,
  subheadSmallUppercase,
} from '../../../theme/typography';

interface ServingSizeSelectorProps {
  originalPortions: string | null;
  servings: number;
  onServingsChange: (servings: number) => void;
  isLoading?: boolean;
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

export default function ServingSizeSelector({
  originalPortions,
  servings,
  onServingsChange,
  isLoading = false,
  cookingNotes,
}: ServingSizeSelectorProps) {
  const originalServings = parseServingsFromPortions(originalPortions);
  const isOriginal = servings === originalServings;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showNotes, setShowNotes] = useState(false);

  // Pulse animation on loading
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
      onServingsChange(servings - 1);
    }
  }, [servings, isLoading, onServingsChange]);

  const handleIncrement = useCallback(() => {
    if (servings < 20 && !isLoading) {
      onServingsChange(servings + 1);
    }
  }, [servings, isLoading, onServingsChange]);

  const handleReset = useCallback(() => {
    if (!isLoading) {
      onServingsChange(originalServings);
    }
  }, [isLoading, onServingsChange, originalServings]);

  return (
    <View style={tw`px-4 py-3`}>
      {/* Serving Size Controls */}
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center gap-2`}>
          <Feather name="users" size={16} color={tw.color('creme')} />
          <Text
            style={tw.style(subheadSmallUppercase, 'text-strokecream')}
            maxFontSizeMultiplier={1}
          >
            Servings
          </Text>
        </View>

        <View style={tw`flex-row items-center gap-3`}>
          {/* Decrement */}
          <Pressable
            onPress={handleDecrement}
            disabled={servings <= 1 || isLoading}
            style={tw.style(
              'h-8 w-8 items-center justify-center rounded-full border',
              servings <= 1 || isLoading
                ? 'border-creme-3 opacity-40'
                : 'border-creme',
            )}
            hitSlop={8}
          >
            <Feather
              name="minus"
              size={16}
              color={tw.color('creme')}
            />
          </Pressable>

          {/* Serving Count Display */}
          <Animated.View
            style={[
              tw`min-w-[48px] items-center justify-center rounded-lg px-3 py-1`,
              { opacity: pulseAnim },
              !isOriginal
                ? tw`bg-[#FF6B35] bg-opacity-20`
                : tw`bg-creme bg-opacity-10`,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={tw.color('creme')} />
            ) : (
              <Text
                style={tw.style(bodyLargeBold, 'text-creme text-center')}
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
              'h-8 w-8 items-center justify-center rounded-full border',
              servings >= 20 || isLoading
                ? 'border-creme-3 opacity-40'
                : 'border-creme',
            )}
            hitSlop={8}
          >
            <Feather
              name="plus"
              size={16}
              color={tw.color('creme')}
            />
          </Pressable>

          {/* Reset Button */}
          {!isOriginal && (
            <Pressable
              onPress={handleReset}
              disabled={isLoading}
              style={tw`ml-1`}
              hitSlop={8}
            >
              <Feather
                name="rotate-ccw"
                size={14}
                color={tw.color('strokecream')}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Scale Indicator */}
      {!isOriginal && (
        <View style={tw`mt-1.5 flex-row items-center gap-1.5`}>
          <View style={tw`h-1.5 w-1.5 rounded-full bg-[#FF6B35]`} />
          <Text
            style={tw.style(bodySmallRegular, 'text-strokecream')}
            maxFontSizeMultiplier={1}
          >
            Scaled from {originalServings} → {servings} servings
            {isLoading ? ' (adjusting…)' : ' (AI adjusted)'}
          </Text>
        </View>
      )}

      {/* Cooking Notes from AI */}
      {cookingNotes && !isLoading && (
        <Pressable
          onPress={() => setShowNotes(!showNotes)}
          style={tw`mt-2`}
        >
          <View style={tw`flex-row items-center gap-1`}>
            <Feather name="info" size={12} color={tw.color('strokecream')} />
            <Text
              style={tw.style(bodySmallRegular, 'text-strokecream underline')}
              maxFontSizeMultiplier={1}
            >
              {showNotes ? 'Hide cooking notes' : 'View cooking notes'}
            </Text>
          </View>
          {showNotes && (
            <Text
              style={tw.style(
                bodyMediumRegular,
                'mt-1.5 text-creme opacity-80',
              )}
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
