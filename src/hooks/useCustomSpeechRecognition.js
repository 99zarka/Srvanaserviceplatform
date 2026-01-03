import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for speech recognition that replaces react-speech-recognition
 * Provides better HTTPS compatibility and error handling for production environments
 */
export const useCustomSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const interimTranscriptRef = useRef('');

  // Check if browser supports Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-EG';
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        interimTranscriptRef.current = '';
        setTranscript('');
        setFinalTranscript('');
      };
      
      recognition.onend = () => {
        setIsListening(false);
        // If we have final transcript, trigger final result
        if (finalTranscript) {
          setFinalTranscript(finalTranscript);
        }
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscriptResult = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptPart = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscriptResult += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        
        if (finalTranscriptResult) {
          setFinalTranscript(finalTranscriptResult);
          interimTranscriptRef.current = '';
          setTranscript(finalTranscriptResult);
        } else {
          interimTranscriptRef.current = interimTranscript;
          setTranscript(finalTranscript + interimTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        setIsListening(false);
        setError(event.error);
        
        // Handle specific errors
        switch (event.error) {
          case 'no-speech':
            console.warn('No speech detected');
            break;
          case 'audio-capture':
            console.error('Microphone not accessible');
            break;
          case 'not-allowed':
            console.error('Microphone permission denied');
            break;
          default:
            console.error('Speech recognition error:', event.error);
        }
      };
    }
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    
    if (!window.isSecureContext) {
      setError('Speech recognition requires HTTPS');
      return;
    }
    
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (err) {
      setError('Failed to start speech recognition: ' + err.message);
    }
  }, [isSupported]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    }
  }, [isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
    interimTranscriptRef.current = '';
  }, []);

  // Abort recognition
  const abortListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.abort();
        setIsListening(false);
      } catch (err) {
        console.error('Error aborting speech recognition:', err);
      }
    }
  }, [isListening]);

  return {
    transcript,
    finalTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    abortListening,
  };
};
