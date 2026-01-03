import { createSlice } from '@reduxjs/toolkit';

// Singleton audio instance
let currentAudio = null;

const initialState = {
  isLiveChatActive: false,
  isRecognizing: false,
  isWaitingForAI: false,
  isPlayingTTS: false,
  selectedVoice: 'EXAVITQu4vr4xnSDxMaL', // Hoda - Arabic voice
  
};

const liveChatSlice = createSlice({
  name: 'liveChat',
  initialState,
  reducers: {
    toggleLiveChat(state) {
      state.isLiveChatActive = !state.isLiveChatActive;
      if (!state.isLiveChatActive && currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        state.isPlayingTTS = false;
      }
    },
    setRecognizing(state, action) {
      state.isRecognizing = action.payload;
    },
    setWaitingForAI(state, action) {
      state.isWaitingForAI = action.payload;
    },
    setPlayingTTS(state, action) {
        state.isPlayingTTS = action.payload;
    },
    setSelectedVoice(state, action) {
        state.selectedVoice = action.payload;
    },
    playTTS: (state, action) => {
        const { audioUrl, onEnded } = action.payload;

        if (currentAudio) {
            currentAudio.pause();
            currentAudio.onended = null;
        }

        currentAudio = new Audio(audioUrl);
        state.isPlayingTTS = true;

        currentAudio.play().catch(err => {
            console.error("Audio play failed:", err);
            state.isPlayingTTS = false;
        });

        currentAudio.onended = () => {
            state.isPlayingTTS = false;
            if (onEnded) {
                onEnded();
            }
            currentAudio = null;
        };
    },
    stopTTS: (state) => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.onended = null; 
            currentAudio = null;
        }
        state.isPlayingTTS = false;
    },
  },
});

export const {
  toggleLiveChat,
  setRecognizing,
  setWaitingForAI,
  setPlayingTTS,
  setSelectedVoice,
  playTTS,
  stopTTS
} = liveChatSlice.actions;

export default liveChatSlice.reducer;
