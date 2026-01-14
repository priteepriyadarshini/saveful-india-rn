import { useEffect, useRef, useState, useCallback } from 'react';
import * as Speech from 'expo-speech';

interface MakeItStep {
  id: string;
  title: string;
  stepInstructions?: string;
  hackOrTip?: Array<{
    id: string;
    title?: string | null;
    description?: string | null;
  }>;
  ingredients?: Array<{
    id: string;
    title: string;
    quantity?: string;
  }>;
}

/**
 * Custom hook for text-to-speech functionality in MakeIt carousel
 * Reads out the content of the current carousel item
 */
export function useMakeItTTS(
  currentIndex: number,
  steps: MakeItStep[],
  isEnabled: boolean
) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const previousIndexRef = useRef<number>(-1);
  const previousEnabledRef = useRef<boolean>(false);
  const previousTitleRef = useRef<string>('');
  const previousIngredientsRef = useRef<string>('');

  // Extract clean text from HTML
  const stripHTML = useCallback((html: string): string => {
    return html
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }, []);

  // Extract text content from the current step
  const extractStepText = useCallback((step: MakeItStep, includeSectionTitle: boolean, includeIngredients: boolean): string => {
    if (!step) return '';

    let text = '';

    // Only add section/component title if it changed from previous step
    if (includeSectionTitle && step.title) {
      text += `${step.title}. `;
    }

    // Add step instructions
    if (step.stepInstructions) {
      const cleanInstructions = stripHTML(step.stepInstructions);
      text += `${cleanInstructions}. `;
    }

    // Add ingredients only if they changed from previous step
    if (includeIngredients && step.ingredients && step.ingredients.length > 0) {
      text += 'Ingredients needed: ';
      step.ingredients.forEach((ingredient, idx) => {
        text += `${ingredient.quantity ? ingredient.quantity + ' of ' : ''}${ingredient.title}`;
        if (idx < step.ingredients!.length - 1) {
          text += ', ';
        }
      });
      text += '. ';
    }

    // Add hack or tip if present
    if (step.hackOrTip && step.hackOrTip.length > 0) {
      const tip = step.hackOrTip[0];
      if (tip.title) {
        text += `Tip: ${tip.title}. `;
      }
      if (tip.description) {
        const cleanDescription = stripHTML(tip.description);
        text += cleanDescription;
      }
    }

    return text.trim();
  }, [stripHTML]);

  // Stop speaking
  const stopSpeaking = useCallback(async () => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }, []);

  // Speak the given text
  const speak = useCallback(async (text: string) => {
    if (!text) return;

    try {
      // Stop any ongoing speech first
      await Speech.stop();
      
      setIsSpeaking(true);

      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9, // Slightly slower for better comprehension
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Error speaking:', error);
      setIsSpeaking(false);
    }
  }, []);

  // Read current step when index changes or when TTS is enabled
  useEffect(() => {
    const hasIndexChanged = currentIndex !== previousIndexRef.current;
    const hasEnabledChanged = isEnabled !== previousEnabledRef.current;
    const justEnabled = isEnabled && hasEnabledChanged;
    
    const currentStep = steps && steps[currentIndex];
    const currentTitle = currentStep?.title || '';
    const titleChanged = currentTitle !== previousTitleRef.current;
    
    // Create a string representation of ingredients for comparison
    const currentIngredientsKey = currentStep?.ingredients
      ?.map(ing => `${ing.id}-${ing.quantity}`)
      .sort()
      .join('|') || '';
    const ingredientsChanged = currentIngredientsKey !== previousIngredientsRef.current;
    
    previousIndexRef.current = currentIndex;
    previousEnabledRef.current = isEnabled;
    previousTitleRef.current = currentTitle;
    previousIngredientsRef.current = currentIngredientsKey;

    // Speak if: (1) just enabled TTS, or (2) already enabled and swiped to new page
    if (isEnabled && (justEnabled || hasIndexChanged) && currentStep) {
      // Only include section title if it changed or TTS was just enabled
      const includeSectionTitle = justEnabled || titleChanged;
      // Only include ingredients if they changed or TTS was just enabled
      const includeIngredients = justEnabled || ingredientsChanged;
      const stepText = extractStepText(currentStep, includeSectionTitle, includeIngredients);
      speak(stepText);
    } else if (!isEnabled) {
      stopSpeaking();
    }
  }, [currentIndex, isEnabled, steps, extractStepText, speak, stopSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return {
    isSpeaking,
    speak,
    stopSpeaking,
  };
}
