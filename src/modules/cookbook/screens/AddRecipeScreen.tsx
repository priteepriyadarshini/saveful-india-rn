import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import tw from '../../../common/tailwind';
import FocusAwareStatusBar from '../../../common/components/FocusAwareStatusBar';
import {
  h6TextStyle,
  bodyMediumRegular,
  bodyMediumBold,
  subheadMediumUppercase,
} from '../../../theme/typography';
import { useAddRecipeFromLinkMutation } from '../api/cookbookApi';
import { CookbookStackParamList } from '../navigation/CookbookNavigation';

type InputMode = 'youtube' | 'text';

const SUPPORTED_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'www.youtube.com',
  'm.youtube.com',
];

function isValidYoutubeLink(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return SUPPORTED_DOMAINS.some(
      (d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`),
    );
  } catch {
    return false;
  }
}

export default function AddRecipeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CookbookStackParamList>>();
  const [inputMode, setInputMode] = useState<InputMode>('youtube');
  const [link, setLink] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [addRecipe, { isLoading }] = useAddRecipeFromLinkMutation();
  const [submitted, setSubmitted] = useState(false);
  const [showQueuedModal, setShowQueuedModal] = useState(false);
  const linkInputRef = useRef<TextInput>(null);
  const textInputRef = useRef<TextInput>(null);

  const handleSwitchMode = useCallback((mode: InputMode) => {
    setInputMode(mode);
    setSubmitted(false);
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const { Clipboard: RNClipboard } = require('react-native');
      const text = RNClipboard?.getString ? await RNClipboard.getString() : '';
      if (text) {
        if (inputMode === 'youtube') {
          setLink(text);
        } else {
          setRecipeText((prev) => (prev ? `${prev}\n${text}` : text));
        }
      }
    } catch {
    }
  }, [inputMode]);

  const handleGenerate = useCallback(async () => {
    Keyboard.dismiss();

    let message = '';

    if (inputMode === 'youtube') {
      message = link.trim();
      if (!message) {
        Alert.alert('Missing Link', 'Please paste a YouTube recipe link.');
        return;
      }
      if (!isValidYoutubeLink(message)) {
        Alert.alert('Invalid Link', 'Please paste a valid YouTube link.');
        return;
      }
    } else {
      message = recipeText.trim();
      if (!message) {
        Alert.alert('Missing Recipe', 'Please enter the recipe details.');
        return;
      }
      if (message.length < 30) {
        Alert.alert('Too Short', 'Please provide more recipe details (name, ingredients, steps).');
        return;
      }
    }

    try {
      const result = await addRecipe({ message }).unwrap();

      if (result.success && result.queued) {
        if (inputMode === 'youtube') setLink('');
        else setRecipeText('');
        setShowQueuedModal(true);
      } else if (result.success && result.data) {
        if (inputMode === 'youtube') setLink('');
        else setRecipeText('');
        navigation.replace('CookbookRecipeDetail', { id: result.data._id, initialRecipe: result.data });
      } else {
        Alert.alert(
          'Generation Failed',
          result.message || 'Could not generate recipe. Please try again.',
        );
      }
    } catch (error: any) {
      const rawServerMsg = error?.data?.message ?? error?.error ?? error?.message;
      const serverMsg =
        typeof rawServerMsg === 'string'
          ? rawServerMsg
          : Array.isArray(rawServerMsg)
            ? rawServerMsg.filter(Boolean).join(', ')
            : '';
      Alert.alert('Error', serverMsg || 'Something went wrong. Please try again.');
    }
  }, [inputMode, link, recipeText, addRecipe, navigation]);

  const currentValue = inputMode === 'youtube' ? link : recipeText;
  const isInputEmpty = !currentValue.trim();

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={['top']}>
      <FocusAwareStatusBar statusBarStyle="dark" />

      {/* Recipe Queued Modal */}
      <Modal
        visible={showQueuedModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={tw`flex-1 bg-black/50 items-center justify-center px-8`}>
          <View style={tw`bg-white rounded-2xl p-6 w-full items-center`}>
            <View style={tw`w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4`}>
              <Feather name="bell" size={28} color={tw.color('green-600') || '#16A34A'} />
            </View>
            <Text style={tw.style(bodyMediumBold, 'text-gray-900 text-center text-base mb-3')}>
              Your recipe is getting generated!
            </Text>
            <Text style={tw.style(bodyMediumRegular, 'text-stone text-center leading-5 mb-6')}>
              Please wait while we are doing it. You will be notified once your recipe is ready in your cookbook.
            </Text>
            <Pressable
              onPress={() => {
                setShowQueuedModal(false);
                navigation.replace('CookbookHome');
              }}
              style={tw`bg-green-600 py-3.5 px-10 rounded-full`}
            >
              <Text style={tw.style(bodyMediumBold, 'text-white')}>
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={tw`flex-row items-center px-5 pt-3 pb-2`}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={tw`w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-3`}
        >
          <Feather name="arrow-left" size={20} color={tw.color('green-600') || '#16A34A'} />
        </Pressable>
        <Text style={tw.style(h6TextStyle, 'text-gray-900 flex-1')}>
          Add Recipe
        </Text>
      </View>

      {/* Mode Tabs */}
      <View style={tw`flex-row mx-5 mb-1 bg-gray-100 rounded-xl p-1`}>
        <Pressable
          onPress={() => handleSwitchMode('youtube')}
          style={tw.style(
            'flex-1 flex-row items-center justify-center py-2.5 rounded-lg',
            inputMode === 'youtube' ? 'bg-white shadow-sm' : '',
          )}
          disabled={isLoading}
        >
          <Feather
            name="youtube"
            size={14}
            color={inputMode === 'youtube' ? (tw.color('eggplant-vibrant') || '#7E42FF') : (tw.color('stone') || '#8A8A8A')}
          />
          <Text
            style={tw.style(
              subheadMediumUppercase,
              'ml-1.5',
              inputMode === 'youtube' ? 'text-eggplant-vibrant' : 'text-stone',
            )}
          >
            YouTube Link
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleSwitchMode('text')}
          style={tw.style(
            'flex-1 flex-row items-center justify-center py-2.5 rounded-lg',
            inputMode === 'text' ? 'bg-white shadow-sm' : '',
          )}
          disabled={isLoading}
        >
          <Feather
            name="file-text"
            size={14}
            color={inputMode === 'text' ? (tw.color('eggplant-vibrant') || '#7E42FF') : (tw.color('stone') || '#8A8A8A')}
          />
          <Text
            style={tw.style(
              subheadMediumUppercase,
              'ml-1.5',
              inputMode === 'text' ? 'text-eggplant-vibrant' : 'text-stone',
            )}
          >
            Recipe Info
          </Text>
        </Pressable>
      </View>

      <ImageBackground
        style={tw`flex-1`}
        source={require('../../../../assets/ribbons/lemon.png')}
      >
        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={tw`flex-1`}
            contentContainerStyle={tw`px-5 pt-4 pb-10`}
            keyboardShouldPersistTaps="handled"
          >
            {inputMode === 'youtube' ? (
              <>
                {/* YouTube Mode */}
                <Text style={tw.style(bodyMediumBold, 'text-gray-900 mb-2')}>
                  Paste a Recipe Link
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-gray-500 mb-5 leading-5')}>
                  Copy a recipe link from YouTube and SavefulAI will
                  extract all the ingredients, steps, and details for you.
                </Text>

                {/* Link Input */}
                <View style={tw`bg-white rounded-lg border border-gray-100 p-1 shadow-sm`}>
                  <View style={tw`flex-row items-center`}>
                    <Feather
                      name="link-2"
                      size={18}
                      color={tw.color('stone')}
                      style={tw`ml-3`}
                    />
                    <TextInput
                      ref={linkInputRef}
                      style={tw`flex-1 font-sans text-sm text-black py-3.5 px-3`}
                      placeholder="https://youtu.be/..."
                      placeholderTextColor={tw.color('stone')}
                      value={link}
                      onChangeText={setLink}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      returnKeyType="go"
                      onSubmitEditing={handleGenerate}
                      editable={!isLoading}
                    />
                    {link.length > 0 && !isLoading && (
                      <Pressable onPress={() => setLink('')} style={tw`mr-2`}>
                        <Feather name="x-circle" size={18} color={tw.color('stone')} />
                      </Pressable>
                    )}
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Recipe Text Mode */}
                <Text style={tw.style(bodyMediumBold, 'text-gray-900 mb-2')}>
                  Enter Recipe Details
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-gray-500 mb-5 leading-5')}>
                  Paste or type your recipe - name, ingredients with quantities, and
                  cooking steps. SavefulAI will structure it for you.
                </Text>

                {/* Multiline Text Input */}
                <View style={tw`bg-white rounded-lg border border-gray-100 shadow-sm`}>
                  <TextInput
                    ref={textInputRef}
                    style={[
                      tw`font-sans text-sm text-black px-4 pt-3.5 pb-3.5`,
                      { minHeight: 200, textAlignVertical: 'top' },
                    ]}
                    placeholder={
                      'Recipe Name: Butter Chicken\n\nIngredients:\n• 500g chicken\n• 2 tbsp butter\n• 1 cup cream\n• ...\n\nSteps:\n1. Marinate chicken...\n2. Cook the sauce...'
                    }
                    placeholderTextColor={tw.color('stone')}
                    value={recipeText}
                    onChangeText={setRecipeText}
                    multiline
                    numberOfLines={10}
                    autoCapitalize="sentences"
                    autoCorrect
                    returnKeyType="default"
                    editable={!isLoading}
                    scrollEnabled={false}
                  />
                  {recipeText.length > 0 && !isLoading && (
                    <Pressable
                      onPress={() => setRecipeText('')}
                      style={tw`absolute top-2 right-2`}
                    >
                      <Feather name="x-circle" size={18} color={tw.color('stone')} />
                    </Pressable>
                  )}
                </View>
                {recipeText.length > 0 && (
                  <Text style={tw.style(bodyMediumRegular, 'text-[10px] text-stone mt-1 text-right')}>
                    {recipeText.length} characters
                  </Text>
                )}
              </>
            )}

            {/* Paste from Clipboard */}
            <Pressable
              onPress={handlePaste}
              style={tw`mt-3 self-start flex-row items-center`}
              disabled={isLoading}
            >
              <Feather name="clipboard" size={14} color={tw.color('eggplant-vibrant') || '#7E42FF'} />
              <Text style={tw.style(subheadMediumUppercase, 'text-eggplant-vibrant ml-1')}>
                Paste from clipboard
              </Text>
            </Pressable>

            {/* Submitted State — recipe queued */}
            {submitted && (
              <View style={tw`items-center mt-8`}>
                <View style={tw`w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4`}>
                  <Feather name="bell" size={28} color={tw.color('green-600') || '#16A34A'} />
                </View>
                <Text style={tw.style(bodyMediumBold, 'text-green-700 text-center')}>
                  Recipe is being generated!
                </Text>
                <Text style={tw.style(bodyMediumRegular, 'text-stone mt-2 text-center leading-5 px-4')}>
                  SavefulAI is working on your recipe in the background. We'll send you a notification when it's ready in your cookbook.
                </Text>
                <Pressable
                  onPress={() => navigation.replace('CookbookHome')}
                  style={tw`mt-6 bg-green-600 py-3.5 px-8 rounded-full flex-row items-center justify-center`}
                >
                  <Feather name="arrow-left" size={18} color="#fff" />
                  <Text style={tw.style(bodyMediumBold, 'text-white ml-2')}>
                    Back to Cookbook
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setSubmitted(false);
                    setLink('');
                    setRecipeText('');
                  }}
                  style={tw`mt-3`}
                >
                  <Text style={tw.style(bodyMediumBold, 'text-eggplant-vibrant')}>
                    Add Another Recipe
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Loading State */}
            {isLoading && !submitted && (
              <View style={tw`items-center mt-8`}>
                <ActivityIndicator size="large" color={tw.color('green-600') || '#16A34A'} />
                <Text style={tw.style(bodyMediumBold, 'text-green-700 mt-4 text-center')}>
                  {inputMode === 'youtube' ? 'Submitting your recipe link...' : 'Submitting your recipe...'}
                </Text>
              </View>
            )}

            {/* Generate Button */}
            {!isLoading && !submitted && (
              <Pressable
                onPress={handleGenerate}
                style={tw`mt-8 bg-green-600 py-4 rounded-full flex-row items-center justify-center`}
                disabled={isInputEmpty}
              >
                <Feather name="zap" size={20} color="#fff" />
                <Text style={tw.style(bodyMediumBold, 'text-white ml-2')}>
                  Generate Recipe
                </Text>
              </Pressable>
            )}

            {!submitted && (
              <View style={tw`mt-8 bg-white border border-gray-100 rounded-lg p-4 shadow-sm`}>
                <Text style={tw.style(bodyMediumBold, 'text-gray-900 mb-3')}>
                  Tips
                </Text>
                {inputMode === 'youtube' ? (
                  <>
                    <View style={tw`mb-2`}>
                      <Text style={tw.style(bodyMediumRegular, 'text-[11px] text-stone leading-4')}>
                        • Make sure the link is a cooking/recipe video
                      </Text>
                    </View>
                    <View style={tw`mb-2`}>
                      <Text style={tw.style(bodyMediumRegular, 'text-[11px] text-stone leading-4')}>
                        • YouTube Shorts and full videos are both supported
                      </Text>
                    </View>
                    <View style={tw`mb-2`}>
                      <Text style={tw.style(bodyMediumRegular, 'text-[11px] text-stone leading-4')}>
                        • Best results come from clear recipe videos with visible steps
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={tw`mb-2`}>
                      <Text style={tw.style(bodyMediumRegular, 'text-[11px] text-stone leading-4')}>
                        • Include the recipe name, full ingredient list with quantities, and all steps
                      </Text>
                    </View>
                    <View style={tw`mb-2`}>
                      <Text style={tw.style(bodyMediumRegular, 'text-[11px] text-stone leading-4')}>
                        • The more detail you provide, the better the result
                      </Text>
                    </View>
                    <View style={tw`mb-2`}>
                      <Text style={tw.style(bodyMediumRegular, 'text-[11px] text-stone leading-4')}>
                        • Works great with recipes copied from websites or written from memory
                      </Text>
                    </View>
                  </>
                )}
                <View>
                  <Text style={tw.style(bodyMediumRegular, 'text-[11px] text-stone leading-4')}>
                    • You can generate up to 3 recipes total
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}
