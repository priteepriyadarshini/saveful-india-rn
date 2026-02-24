import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
  isSpeechRecognitionAvailable,
} from '../utils/speechRecognition';
import tw from '../../../common/tailwind';
import { useNavigation } from '@react-navigation/native';
import {
  bodyMediumRegular,
  bodyMediumBold,
  h6TextStyle,
} from '../../../theme/typography';
import {
  useVoiceAddMutation,
  useVoiceConfirmMutation,
} from '../api/inventoryApi';
import {
  ParsedVoiceItem,
  StorageLocation,
  InventoryItemSource,
} from '../api/types';
import useRecipeMatchNotification from '../hooks/useRecipeMatchNotification';

const STORAGE_OPTIONS: { key: StorageLocation; label: string; icon: string }[] = [
  { key: StorageLocation.FRIDGE, label: 'Fridge', icon: 'snow-outline' },
  { key: StorageLocation.FREEZER, label: 'Freezer', icon: 'cube-outline' },
  { key: StorageLocation.PANTRY, label: 'Pantry', icon: 'file-tray-stacked-outline' },
  { key: StorageLocation.OTHER, label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function VoiceAddScreen() {
  const navigation = useNavigation<any>();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedVoiceItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [voiceAdd, { isLoading: isParsing }] = useVoiceAddMutation();
  const [voiceConfirm, { isLoading: isConfirming }] = useVoiceConfirmMutation();
  const { notifyIfNewMatches } = useRecipeMatchNotification();

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results?.[0]?.transcript) {
      setTranscript(event.results[0].transcript);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    console.warn('Speech recognition error:', event.error, event.message);
  });


  const startListening = useCallback(async () => {
    if (!isSpeechRecognitionAvailable || !ExpoSpeechRecognitionModule) {
      Alert.alert('Not Available', 'Speech recognition requires a development build.');
      return;
    }
    try {
      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is needed for voice input.',
        );
        return;
      }

      setIsListening(true);
      setTranscript('');
      setParsedItems([]);

      ExpoSpeechRecognitionModule.start({
        lang: 'en-IN',
        interimResults: true,
        continuous: true,
      });
    } catch (error) {
      setIsListening(false);
      Alert.alert('Error', 'Speech recognition is not available on this device.');
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (ExpoSpeechRecognitionModule) {
      ExpoSpeechRecognitionModule.stop();
    }
  }, []);

  const handleParse = useCallback(async () => {
    const text = transcript || manualText;
    if (!text.trim()) {
      Alert.alert('Empty Input', 'Please speak or type your ingredients first.');
      return;
    }

    try {
      const result = await voiceAdd({ transcript: text.trim() }).unwrap();
      setParsedItems(result.parsedItems);
    } catch (error) {
      Alert.alert('Error', 'Failed to parse ingredients. Please try again.');
    }
  }, [transcript, manualText, voiceAdd]);

  const updateParsedItem = (index: number, updates: Partial<ParsedVoiceItem>) => {
    setParsedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
    setEditingIndex(null);
  };

  const removeParsedItem = (index: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== index));
  };


  const handleConfirm = useCallback(async () => {
    if (parsedItems.length === 0) return;

    try {
      await voiceConfirm({
        items: parsedItems.map((item) => ({
          ingredientId: item.ingredientId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          storageLocation: item.storageLocation,
          expiresAt: item.expiresAt,
          source: InventoryItemSource.VOICE,
        })),
      }).unwrap();

      // Check for new recipe matches in the background
      notifyIfNewMatches().catch(() => {});

      Alert.alert(
        'Added!',
        `${parsedItems.length} item(s) added to your kitchen inventory.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add items. Please try again.');
    }
  }, [parsedItems, voiceConfirm, navigation, notifyIfNewMatches]);

  return (
    <SafeAreaView style={tw`flex-1 bg-creme`} edges={['top']}>
      {/* Header */}
      <View style={tw`px-5 pt-3 pb-3 flex-row items-center bg-white border-b border-strokecream`}>
        <Pressable onPress={() => navigation.goBack()} style={tw`mr-3`}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <View style={tw`flex-1`}>
          <Text style={tw.style(h6TextStyle, 'text-gray-900')}>
            Add by Voice
          </Text>
          <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-xs')}>
            Speak your ingredients and review before adding
          </Text>
        </View>
      </View>

      <ImageBackground
        style={tw`flex-1`}
        source={require('../../../../assets/ribbons/lemon.png')}
      >
        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`px-5 pt-4 pb-20`}
          keyboardShouldPersistTaps="handled"
        >
          {/* Voice Input Section */}
          <View style={tw`items-center mb-4 rounded-2xl border border-strokecream bg-white px-4 py-5`}> 
            {isSpeechRecognitionAvailable ? (
              <>
                <Pressable
                  onPress={isListening ? stopListening : startListening}
                  style={tw.style(
                    'w-28 h-28 rounded-full items-center justify-center border-4',
                    isListening
                      ? 'bg-red-100 border-red-200'
                      : 'bg-eggplant border-eggplant-vibrant',
                  )}
                >
                  <Ionicons
                    name={isListening ? 'stop' : 'mic'}
                    size={42}
                    color={isListening ? '#EF4444' : 'white'}
                  />
                </Pressable>
                <Text style={tw.style(bodyMediumBold, 'text-gray-800 mt-3 text-center')}>
                  {isListening ? 'Listening now…' : 'Tap to start voice input'}
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-gray-500 mt-1 text-center text-xs')}>
                  {isListening
                    ? 'Tap again to stop and parse'
                    : 'Say all ingredients in one sentence'}
                </Text>
              </>
            ) : (
              <View style={tw`bg-amber-50 rounded-xl px-4 py-3 w-full border border-amber-200`}>
                <View style={tw`flex-row items-center gap-2 mb-1`}>
                  <Ionicons name="warning-outline" size={18} color="#D97706" />
                  <Text style={tw.style(bodyMediumBold, 'text-amber-700 text-sm')}>
                    Voice input unavailable
                  </Text>
                </View>
                <Text style={tw.style(bodyMediumRegular, 'text-amber-600 text-xs')}>
                  Speech recognition requires a development build. Use text input below instead.
                </Text>
              </View>
            )}
            <Text style={tw.style(bodyMediumRegular, 'text-gray-400 text-xs mt-2 text-center')}>
              e.g. "2 kg tomatoes, 500 g paneer, 1 litre milk"
            </Text>
          </View>

        {/* Transcript Display */}
          {transcript ? (
            <View style={tw`bg-white border border-strokecream rounded-xl p-4 mb-4`}>
            <Text style={tw.style(bodyMediumRegular, 'text-gray-400 text-xs mb-1')}>
              I heard:
            </Text>
            <Text style={tw.style(bodyMediumBold, 'text-gray-800')}>
              "{transcript}"
            </Text>
            </View>
          ) : null}

        {/* Manual Text Input (fallback) */}
          <View style={tw`mb-4`}>
            <Text style={tw.style(bodyMediumRegular, 'text-gray-600 text-xs mb-1')}>
              Or type manually:
            </Text>
            <TextInput
              value={manualText}
              onChangeText={setManualText}
              placeholder="2 kg tomatoes, 500g paneer, 1L milk..."
              placeholderTextColor="#9CA3AF"
              multiline
              style={tw.style(
                bodyMediumRegular,
                'bg-white border border-strokecream rounded-xl px-4 py-3 text-gray-800 min-h-[64px]',
              )}
            />
          </View>

        {/* Parse Button */}
          {parsedItems.length === 0 && (
            <Pressable
              onPress={handleParse}
              disabled={isParsing || (!transcript && !manualText.trim())}
              style={tw.style(
                'rounded-xl py-3.5 items-center mb-6',
                isParsing || (!transcript && !manualText.trim())
                  ? 'bg-gray-200'
                  : 'bg-eggplant',
              )}
            >
            {isParsing ? (
              <View style={tw`flex-row items-center gap-2`}>
                <ActivityIndicator size="small" color="white" />
                <Text style={tw.style(bodyMediumBold, 'text-white')}>
                  AI is parsing...
                </Text>
              </View>
            ) : (
              <View style={tw`flex-row items-center gap-2`}>
                <Ionicons
                  name="sparkles-outline"
                  size={16}
                  color={!transcript && !manualText.trim() ? '#9CA3AF' : 'white'}
                />
                <Text
                  style={tw.style(
                    bodyMediumBold,
                    !transcript && !manualText.trim()
                      ? 'text-gray-400'
                      : 'text-white',
                  )}
                >
                  Parse Ingredients
                </Text>
              </View>
            )}
            </Pressable>
          )}

        {/* Parsed Items List */}
          {parsedItems.length > 0 && (
            <View>
            <Text style={tw.style(bodyMediumBold, 'text-gray-800 mb-3')}>
              Found {parsedItems.length} item(s) - review & confirm:
            </Text>

            {parsedItems.map((item, index) => (
              <ParsedItemCard
                key={index}
                item={item}
                index={index}
                isEditing={editingIndex === index}
                onEdit={() => setEditingIndex(index)}
                onUpdate={(updates) => updateParsedItem(index, updates)}
                onRemove={() => removeParsedItem(index)}
              />
            ))}

            {/* Confirm All Button */}
            <Pressable
              onPress={handleConfirm}
              disabled={isConfirming}
              style={tw.style(
                'rounded-xl py-3.5 items-center mt-4',
                isConfirming ? 'bg-gray-200' : 'bg-eggplant',
              )}
            >
              {isConfirming ? (
                <View style={tw`flex-row items-center gap-2`}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={tw.style(bodyMediumBold, 'text-white')}>
                    Adding...
                  </Text>
                </View>
              ) : (
                <View style={tw`flex-row items-center gap-2`}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                  <Text style={tw.style(bodyMediumBold, 'text-white')}>
                    Add All to Kitchen
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Re-parse Button */}
            <Pressable
              onPress={() => {
                setParsedItems([]);
                setTranscript('');
                setManualText('');
              }}
              style={tw`items-center mt-3 py-2`}
            >
              <Text style={tw.style(bodyMediumRegular, 'text-eggplant-vibrant')}>
                Start Over
              </Text>
            </Pressable>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

function ParsedItemCard({
  item,
  index,
  isEditing,
  onEdit,
  onUpdate,
  onRemove,
}: {
  item: ParsedVoiceItem;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<ParsedVoiceItem>) => void;
  onRemove: () => void;
}) {
  const [editQuantity, setEditQuantity] = useState(String(item.quantity));
  const [editUnit, setEditUnit] = useState(item.unit);
  const [editStorage, setEditStorage] = useState(item.storageLocation);

  const confidenceColor =
    item.confidence >= 0.8
      ? '#22C55E'
      : item.confidence >= 0.5
        ? '#F59E0B'
        : '#EF4444';

  if (isEditing) {
    return (
      <View style={tw`bg-white rounded-xl p-4 mb-2 border border-strokecream`}>
        <Text style={tw.style(bodyMediumBold, 'text-gray-800 mb-2')}>
          Edit: {item.name}
        </Text>

        <View style={tw`flex-row gap-2 mb-2`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-xs text-gray-500 mb-1`}>Quantity</Text>
            <TextInput
              value={editQuantity}
              onChangeText={setEditQuantity}
              keyboardType="decimal-pad"
              style={tw.style(
                bodyMediumRegular,
                'bg-white rounded-lg px-3 py-2 border border-gray-200',
              )}
            />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-xs text-gray-500 mb-1`}>Unit</Text>
            <TextInput
              value={editUnit}
              onChangeText={setEditUnit}
              style={tw.style(
                bodyMediumRegular,
                'bg-white rounded-lg px-3 py-2 border border-gray-200',
              )}
            />
          </View>
        </View>

        <Text style={tw`text-xs text-gray-500 mb-1`}>Storage</Text>
        <View style={tw`flex-row gap-1.5 mb-3`}>
          {STORAGE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => setEditStorage(opt.key)}
              style={tw.style(
                'flex-1 py-2 rounded-lg items-center border',
                editStorage === opt.key
                  ? 'bg-eggplant border-eggplant'
                  : 'bg-white border-strokecream',
              )}
            >
              <Text
                style={tw.style(
                  'text-xs',
                  editStorage === opt.key ? 'text-white' : 'text-gray-600',
                )}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={tw`flex-row gap-2`}>
          <Pressable
            onPress={() =>
              onUpdate({
                quantity: parseFloat(editQuantity) || item.quantity,
                unit: editUnit || item.unit,
                storageLocation: editStorage,
              })
            }
            style={tw`flex-1 bg-eggplant rounded-lg py-2 items-center`}
          >
            <Text style={tw.style(bodyMediumBold, 'text-white text-sm')}>Save</Text>
          </Pressable>
          <Pressable
            onPress={() => onUpdate({})}
            style={tw`flex-1 bg-gray-200 rounded-lg py-2 items-center`}
          >
            <Text style={tw.style(bodyMediumRegular, 'text-gray-600 text-sm')}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={tw`bg-white border border-strokecream rounded-xl p-3 mb-2 flex-row items-center`}>
      <View style={tw`flex-1`}>
        <View style={tw`flex-row items-center gap-1.5`}>
          <Text style={tw.style(bodyMediumBold, 'text-gray-800')}>
            {item.name}
          </Text>
          <View
            style={[
              tw`w-2 h-2 rounded-full`,
              { backgroundColor: confidenceColor },
            ]}
          />
        </View>
        <Text style={tw.style(bodyMediumRegular, 'text-gray-500 text-xs')}>
          {item.quantity} {item.unit} · {STORAGE_OPTIONS.find((o) => o.key === item.storageLocation)?.label || item.storageLocation}
          {' · '}
          Expires: {new Date(item.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </Text>
      </View>

      <View style={tw`flex-row gap-1`}>
        <Pressable
          onPress={onEdit}
          style={tw`w-8 h-8 items-center justify-center rounded-full bg-blue-50`}
        >
          <Ionicons name="pencil-outline" size={14} color="#3B82F6" />
        </Pressable>
        <Pressable
          onPress={onRemove}
          style={tw`w-8 h-8 items-center justify-center rounded-full bg-red-50`}
        >
          <Ionicons name="close-outline" size={16} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  );
}
