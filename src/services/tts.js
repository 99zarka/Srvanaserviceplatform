const ELEVENLABS_API_KEY = 'sk_6af2b254e4ef6a64b39fd1b01683cba9cca513bdc0e2b0ef';

export const ttsService = {
  async textToSpeech(text, voiceId) {
    try {
      // Try ElevenLabs API first
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech.');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return audioUrl;

    } catch (error) {
      console.error('TTS Error (ElevenLabs failed):', error);
      
      // Fallback to Web Speech API
      return this.fallbackTextToSpeech(text);
    }
  },

  fallbackTextToSpeech(text) {
    try {
      // Check if browser supports Web Speech API
      const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;
      
      if (!SpeechSynthesisUtterance) {
        console.error('Web Speech API not supported for TTS fallback');
        return null;
      }

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.lang = 'ar-EG'; // Arabic
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Find Arabic voice if available
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(voice => voice.lang.includes('ar'));
      
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      // Create audio blob from the utterance
      // Note: Web Speech API doesn't directly return audio blobs,
      // so we'll create a simple audio element with synthesized speech
      const audio = new Audio();
      audio.src = '';
      
      // Use a simple text-to-speech approach by creating a temporary audio context
      // This is a basic fallback that will at least attempt to speak the text
      window.speechSynthesis.speak(utterance);
      
      // Return a promise that resolves when speaking is done
      return new Promise((resolve) => {
        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(null);
      });

    } catch (error) {
      console.error('Fallback TTS Error:', error);
      return null;
    }
  }
};
