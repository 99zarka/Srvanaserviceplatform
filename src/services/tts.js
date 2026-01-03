const ELEVENLABS_API_KEY = 'sk_6b5a0a4fc6e2d6c6624ea79e77ade5cbd557016ede453457';

export const ttsService = {
  async textToSpeech(text, voiceId) {
    try {
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
      console.error('TTS Error:', error);
      return null;
    }
  }
};
