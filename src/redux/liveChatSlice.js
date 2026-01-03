import { createSlice } from '@reduxjs/toolkit';

// Singleton audio instance
let currentAudio = null;

const initialState = {
  isLiveChatActive: false,
  isRecognizing: false,
  isWaitingForAI: false,
  isPlayingTTS: false,
  selectedVoice: 'EXAVITQu4vr4xnSDxMaL', // Hoda - Arabic voice
  justEnded: false,
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
        state.justEnded = false;
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
    ttsEnded: (state) => {
        state.isPlayingTTS = false;
        state.justEnded = true;
        currentAudio = null;
    },
    resetJustEnded: (state) => {
        state.justEnded = false;
    },
    stopTTS: (state) => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.onended = null;
            currentAudio = null;
        }
        state.isPlayingTTS = false;
        state.justEnded = false;
    },
  },
});

export const {
  toggleLiveChat,
  setRecognizing,
  setWaitingForAI,
  setPlayingTTS,
  setSelectedVoice,
  ttsEnded,
  resetJustEnded,
  stopTTS
} = liveChatSlice.actions;

export const playTTS = ({ audioUrl }) => (dispatch) => {
    dispatch(stopTTS()); // Stop any currently playing TTS
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.onended = null;
    }

    currentAudio = new Audio(audioUrl);
    dispatch(setPlayingTTS(true));

    currentAudio.play().catch(err => {
        console.error("Audio play failed:", err);
        dispatch(setPlayingTTS(false));
    });

    currentAudio.onended = () => {
        dispatch(ttsEnded());
    };
};

export default liveChatSlice.reducer;
