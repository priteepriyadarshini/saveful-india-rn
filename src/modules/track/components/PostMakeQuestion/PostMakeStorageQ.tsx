import { Feather } from '@expo/vector-icons';
import PrimaryButton from '../../../../common/components/ThemeButtons/PrimaryButton';
import SecondaryButton from '../../../../common/components/ThemeButtons/SecondaryButton';
import tw from '../../../../common/tailwind';
import { STORAGE_OPTIONS, formatUseByLabel } from '../../data/data';
import {
  useAddInventoryItemMutation,
  useEstimateShelfLifeMutation,
} from '../../../inventory/api/inventoryApi';
import { StorageLocation, InventoryItemSource } from '../../../inventory/api/types';
import type { ShelfLifeEstimate } from '../../../inventory/api/types';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import {
  h6TextStyle,
  bodyMediumRegular,
  bodyMediumBold,
  bodySmallRegular,
  subheadMediumUppercase,
} from '../../../../theme/typography';
import { cardDrop } from '../../../../theme/shadow';

interface Props {
  dishName: string;
  dishId: string;
  onStorageSelected: (storageKey: string) => void;
}

export default function PostMakeStorageQ({
  dishName,
  dishId,
  onStorageSelected,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [shelfLife, setShelfLife] = useState<ShelfLifeEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [addInventoryItem, { isLoading: isAddingItem }] = useAddInventoryItemMutation();
  const [estimateShelfLife] = useEstimateShelfLifeMutation();

  const storageMap: Record<string, StorageLocation> = {
    pantry: StorageLocation.PANTRY,
    fridge: StorageLocation.FRIDGE,
    freezer: StorageLocation.FREEZER,
  };

  const storageIcons: Record<string, keyof typeof Feather.glyphMap> = {
    pantry: 'archive',
    fridge: 'box',
    freezer: 'thermometer',
  };

  const handleSelect = async (storageKey: string) => {
    setSelected(storageKey);
    setShelfLife(null);
    setIsEstimating(true);

    const [shelfLifeResult] = await Promise.allSettled([
      estimateShelfLife({
        dishName,
        storageLocation: storageMap[storageKey] || StorageLocation.FRIDGE,
      }).unwrap(),
      addInventoryItem({
        name: `${dishName} (leftover)`,
        quantity: 1,
        unit: 'portion',
        storageLocation: storageMap[storageKey] || StorageLocation.FRIDGE,
        source: InventoryItemSource.RECIPE,
      }).unwrap().catch((err) => {
        console.warn('[PostMakeStorageQ] Failed to add to inventory:', err);
      }),
    ]);

    if (shelfLifeResult.status === 'fulfilled' && shelfLifeResult.value) {
      const estimate = shelfLifeResult.value;
      setShelfLife(estimate);

      try {
        await addInventoryItem({
          name: `${dishName} (leftover)`,
          quantity: 0, 
          unit: 'portion',
          storageLocation: storageMap[storageKey] || StorageLocation.FRIDGE,
          source: InventoryItemSource.RECIPE,
          expiresAt: estimate.useByDate,
        }).unwrap();
      } catch {}
    } else {
     
      const option = STORAGE_OPTIONS.find((o) => o.key === storageKey);
      const days = option?.shelfLifeDays ?? 3;
      const fallbackDate = new Date();
      fallbackDate.setDate(fallbackDate.getDate() + days);
      setShelfLife({
        shelfLifeDays: days,
        useByDate: fallbackDate.toISOString(),
        confidence: 0.3,
        storageTip: option?.tip || 'Store in a sealed airtight container.',
        warningSign: 'Discard if you notice off smells, sliminess, or mould.',
      });
    }

    setIsEstimating(false);
  };

  const handleNext = () => {
    if (selected) {
      onStorageSelected(selected);
    }
  };

  const selectedOption = STORAGE_OPTIONS.find((o) => o.key === selected);

  return (
    <View style={tw`h-full w-full justify-between`}>
      <ScrollView contentContainerStyle={tw`px-5 pb-10`}>
        <Animatable.View animation="fadeIn" duration={400} useNativeDriver>
          <Image
            style={tw`mx-auto mb-4 h-[160px] w-[160px]`}
            resizeMode="contain"
            source={{ uri: 'https://d3fg04h02j12vm.cloudfront.net/placeholder/fridge.png' }}
            accessibilityIgnoresInvertColors
          />

          <Text
            style={tw.style(h6TextStyle, 'pb-2 text-center text-white')}
            maxFontSizeMultiplier={1}
          >
            Where will you store your leftovers?
          </Text>

          <Text
            style={tw.style(bodyMediumRegular, 'pb-4 text-center text-white')}
          >
            {`We'll add your ${dishName} leftovers to your pantry tracker so nothing goes to waste.`}
          </Text>

          <View style={tw`pt-2`}>
            {STORAGE_OPTIONS.map((option) => (
              <SecondaryButton
                key={option.id}
                style={tw.style(
                  'mb-2',
                  selected === option.key ? 'bg-black' : '',
                )}
                buttonTextStyle={tw.style(
                  selected === option.key ? 'text-white' : '',
                )}
                onPress={() => handleSelect(option.key)}
                loading={isEstimating && selected === option.key}
                disabled={isEstimating || isAddingItem}
                iconLeft={storageIcons[option.key]}
              >
                {option.label}
              </SecondaryButton>
            ))}
          </View>

          {/* AI loading state */}
          {selected && isEstimating && (
            <Animatable.View animation="fadeIn" duration={300} useNativeDriver>
              <View style={tw`items-center py-6`}>
                <ActivityIndicator color="white" size="small" />
                <Text
                  style={tw.style(
                    bodySmallRegular,
                    'pt-2 text-center text-white/70',
                  )}
                >
                  Estimating shelf life for {dishName}...
                </Text>
              </View>
            </Animatable.View>
          )}

          {selectedOption && shelfLife && !isEstimating && (
            <Animatable.View
              animation="fadeInUp"
              duration={400}
              useNativeDriver
            >
              {/* Use-by card */}
              <View
                style={[
                  tw.style(
                    'mt-4 rounded-xl border border-strokecream bg-white px-5 py-4',
                  ),
                  cardDrop,
                ]}
              >
                <View style={tw`flex-row items-center`}>
                  <View
                    style={tw`h-10 w-10 items-center justify-center rounded-full bg-chilli/10`}
                  >
                    <Feather
                      name={shelfLife.shelfLifeDays <= 3 ? 'clock' : 'calendar'}
                      size={20}
                      color="#FF623A"
                    />
                  </View>
                  <View style={tw`ml-3 flex-1`}>
                    <Text
                      style={tw.style(bodyMediumBold)}
                      maxFontSizeMultiplier={1}
                    >
                      {formatUseByLabel(
                        shelfLife.shelfLifeDays,
                        shelfLife.useByDate,
                      )}
                    </Text>
                    <Text
                      style={tw.style(
                        bodySmallRegular,
                        'pt-0.5 text-midgray',
                      )}
                    >
                      {shelfLife.shelfLifeDays <= 7
                        ? "We'll remind you before it expires"
                        : `Stored on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </Text>
                  </View>
                </View>
                {shelfLife.confidence >= 0.6 && (
                  <View
                    style={tw`mt-3 flex-row items-center rounded-lg bg-eggplant/8 px-3 py-2`}
                  >
                    <Feather name="cpu" size={14} color="#4B2176" />
                    <Text
                      style={tw.style(
                        bodySmallRegular,
                        'ml-2 flex-1 text-eggplant',
                      )}
                    >
                      AI-estimated for {dishName}
                    </Text>
                  </View>
                )}
              </View>

              {/* Storage tip card */}
              <View
                style={[
                  tw.style(
                    'mt-3 rounded-xl border border-strokecream bg-white px-5 py-4',
                  ),
                  cardDrop,
                ]}
              >
                <Text
                  style={tw.style(
                    subheadMediumUppercase,
                    'pb-2 text-center text-midgray',
                  )}
                  maxFontSizeMultiplier={1}
                >
                  Storage tip
                </Text>
                <View style={tw`border-b border-strokecream pb-2`} />
                <View style={tw`flex-row items-center pt-3`}>
                  <View
                    style={tw`h-10 w-10 items-center justify-center rounded-full bg-mint/20`}
                  >
                    <Feather
                      name={storageIcons[selected || 'fridge'] || 'box'}
                      size={18}
                      color="#3A7E52"
                    />
                  </View>
                  <View style={tw`ml-3 flex-1`}>
                    <Text style={tw.style(bodyMediumBold)}>
                      {selectedOption.label}
                    </Text>
                    <Text
                      style={tw.style(
                        bodySmallRegular,
                        'pt-1 text-midgray',
                      )}
                    >
                      {shelfLife.storageTip}
                    </Text>
                  </View>
                </View>
              </View>

              {shelfLife.warningSign && (
                <View
                  style={[
                    tw.style(
                      'mt-3 rounded-xl border border-strokecream bg-white px-5 py-4',
                    ),
                    cardDrop,
                  ]}
                >
                  <View style={tw`flex-row items-start`}>
                    <View
                      style={tw`mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-chilli`}
                    >
                      <Feather
                        name="alert-triangle"
                        size={16}
                        color="#FFFCF9"
                      />
                    </View>
                    <View style={tw`ml-3 flex-1`}>
                      <Text style={tw.style(bodyMediumBold, 'text-chilli')}>
                        When to discard
                      </Text>
                      <Text
                        style={tw.style(bodySmallRegular, 'pt-1 text-black')}
                      >
                        {shelfLife.warningSign}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </Animatable.View>
          )}
        </Animatable.View>
      </ScrollView>

      {selected && shelfLife && !isEstimating && (
        <Animatable.View animation="fadeInUp" duration={300} useNativeDriver>
          <View style={tw`px-5`}>
            <PrimaryButton
              style={tw.style('mb-2')}
              buttonSize="large"
              onPress={handleNext}
              iconRight="arrow-right"
            >
              Next
            </PrimaryButton>
          </View>
        </Animatable.View>
      )}
    </View>
  );
}
