let _module: any = null;
let _useSpeechRecognitionEvent: (event: string, handler: (...args: any[]) => void) => void =
  (_event, _handler) => {
  };
let _isAvailable = false;

try {
  const mod = require('expo-speech-recognition');
  _module = mod.ExpoSpeechRecognitionModule;
  _useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
  _isAvailable = true;
} catch (error) {
  console.warn('Speech recognition module not available:', error);
}

export const ExpoSpeechRecognitionModule = _module;
export const useSpeechRecognitionEvent = _useSpeechRecognitionEvent;
export const isSpeechRecognitionAvailable = _isAvailable;
