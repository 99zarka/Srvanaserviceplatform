import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import AIChatHeader from './AIChatHeader';
import AIChatMessages from './AIChatMessages';
import AIChatInput from './AIChatInput';
import AIOrderForm from './AIOrderForm';
import { useGetAiChatHistoryQuery, useSendAiChatMessageMutation } from '../../services/api';
import { ttsService } from '../../services/tts';
import { toast } from 'sonner';
import BASE_URL from '../../config/api';
import {
  toggleLiveChat,
  setRecognizing,
  setWaitingForAI,
  playTTS,
  stopTTS,
} from '../../redux/liveChatSlice';

const AIChatContainer = () => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [formMode, setFormMode] = useState('order');
  const [formData, setFormData] = useState(null);
  const messagesEndRef = useRef(null);
  const lastPlayedMessageId = useRef(null);

  const token = useSelector((state) => state.auth.token);
  const { isLiveChatActive, isRecognizing, isWaitingForAI, isPlayingTTS, selectedVoice } = useSelector(state => state.liveChat);

  const { data: historyData, isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory } = useGetAiChatHistoryQuery();
  const [sendChatMessage, { isLoading: isSendingMessage }] = useSendAiChatMessageMutation();

  const {
    transcript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // --- Live Chat Effects ---

  useEffect(() => {
    if (isLiveChatActive && !browserSupportsSpeechRecognition) {
      toast.error("متصفحك لا يدعم التعرف على الكلام.");
      dispatch(toggleLiveChat());
    }
  }, [isLiveChatActive, browserSupportsSpeechRecognition, dispatch]);

  useEffect(() => {
    if (isLiveChatActive) {
      if (!isWaitingForAI && !listening) {
        SpeechRecognition.startListening({ continuous: true, language: 'ar-EG' });
        dispatch(setRecognizing(true));
      }
    } else {
      if (listening) {
        SpeechRecognition.stopListening();
        dispatch(setRecognizing(false));
      }
    }
  }, [isLiveChatActive, isWaitingForAI, listening, dispatch]);
  
  useEffect(() => {
    if (finalTranscript) {
      setInputText(finalTranscript);
      handleSendMessage();
      resetTranscript();
    }
  }, [finalTranscript, resetTranscript]);

  useEffect(() => {
    if (listening && isWaitingForAI) {
      SpeechRecognition.stopListening();
      dispatch(setRecognizing(false));
    }
  }, [isWaitingForAI, listening, dispatch]);

  useEffect(() => {
    if (isLiveChatActive && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content && lastMessage.id !== lastPlayedMessageId.current) {
        lastPlayedMessageId.current = lastMessage.id;
        handlePlayTTS(lastMessage.content.reply);
      }
    }
  }, [messages, isLiveChatActive]);
  
  const handlePlayTTS = async (text) => {
    dispatch(stopTTS()); // Stop any currently playing TTS
    const audioUrl = await ttsService.textToSpeech(text, selectedVoice);
    if (audioUrl) {
      dispatch(playTTS({ audioUrl, onEnded: () => {
        if (isLiveChatActive && !isWaitingForAI) {
            SpeechRecognition.startListening({ continuous: true, language: 'ar-EG' });
            dispatch(setRecognizing(true));
        }
      }}));
    }
  };
  
  // --- Original Functions ---

  const uploadFileToBackend = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${BASE_URL}/files/upload/file/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        toast.error('فشل في رفع الملف إلى الخادم.');
        return null;
      }
      return (await response.json()).url;
    } catch (error) {
      toast.error('خطأ في رفع الملف.');
      return null;
    }
  };

  useEffect(() => {
    if (historyData) {
      setMessages(historyData.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        image_url: msg.image_url,
        file_url: msg.file_url,
      })));
    }
  }, [historyData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (startNew = false) => {
    const messageToSend = finalTranscript || inputText;
    if (!startNew && !messageToSend.trim() && uploadedFiles.length === 0) return;
    
    if (listening) {
        SpeechRecognition.stopListening();
        dispatch(setRecognizing(false));
    }

    dispatch(setWaitingForAI(true));

    let imageUrl = null;
    let fileUrl = null;
    if (uploadedFiles.length > 0) {
      const uploadPromises = uploadedFiles.map(file => uploadFileToBackend(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      imageUrl = uploadedUrls.find((url, index) => url && uploadedFiles[index].type.startsWith('image'));
      fileUrl = uploadedUrls.find((url, index) => url && !uploadedFiles[index].type.startsWith('image'));
      if (!imageUrl && !fileUrl) {
        toast.error('فشل في رفع الملفات.');
        dispatch(setWaitingForAI(false));
        return;
      }
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageToSend.trim(),
      timestamp: new Date(),
      image_url: imageUrl,
      file_url: fileUrl,
    };

    if (!startNew || messageToSend.trim() || imageUrl || fileUrl) {
      setMessages(prev => [...prev, userMessage]);
    }
    
    setInputText('');
    setUploadedFiles([]);
    resetTranscript();

    try {
      await sendChatMessage({ 
        prompt: messageToSend.trim(), 
        image_url: imageUrl, 
        file_url: fileUrl, 
        start_new: startNew 
      }).unwrap();
    } catch (error) {
      toast.error('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      dispatch(setWaitingForAI(false));
    }
  };

  const handleQuickAction = async (action) => {
    setInputText(action);
    const userMessage = { id: Date.now(), role: 'user', content: action, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    dispatch(setWaitingForAI(true));
    try {
      await sendChatMessage({ prompt: action, start_new: false }).unwrap();
    } catch (error) {
      toast.error('فشل في إرسال الإجراء السريع.');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      dispatch(setWaitingForAI(false));
    }
  };

  const handleStartNewConversation = async () => {
    dispatch(stopTTS());
    setMessages([]);
    setFormData(null);
    setShowOrderForm(false);
    setShowOfferForm(false);
    setInputText('');
    setUploadedFiles([]);
    resetTranscript();
    toast.info('جاري بدء محادثة جديدة...');
    dispatch(setWaitingForAI(true));
    
    try {
      await sendChatMessage({ prompt: '', start_new: true }).unwrap();
      toast.success('تم بدء محادثة جديدة!');
      refetchHistory(); 
    } catch (error) {
      toast.error('فشل في بدء محادثة جديدة.');
      refetchHistory();
    } finally {
      dispatch(setWaitingForAI(false));
    }
  };

  const handleShowOrderForm = (projectData = null) => {
    setFormData(projectData); setFormMode('order'); setShowOrderForm(true);
  };
  const handleShowOfferForm = (technicianId, projectData = null) => {
    setFormData(projectData); setFormMode('offer'); setShowOfferForm(true); setSelectedTechnicianId(technicianId);
  };
  const handleFormSuccess = (mode) => {
    toast.success(mode === 'order' ? 'تم إنشاء المشروع بنجاح!' : 'تم إرسال عرض السعر بنجاح!');
    setShowOrderForm(false); setShowOfferForm(false);
  };

  const currentTypingStatus = isSendingMessage || (listening && !isWaitingForAI);

  return (
    <div className="max-w-4xl mx-auto shadow-xl border-0 overflow-hidden h-full flex flex-col">
      <AIChatHeader onStartNewConversation={handleStartNewConversation} />
      {isLoadingHistory && <div className="text-center p-4">Loading...</div>}
      {historyError && <div className="text-center p-4 text-red-500">Error: {historyError.message}</div>}
      
      {!isLoadingHistory && !historyError && messages.length === 0 && (
        <div className="border-b border-gray-100 bg-gray-50 p-6" dir="rtl">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">مرحبًا بك في مساعدنا الذكي</div>
            <div className="text-gray-600 mb-4">كيف يمكنني مساعدتك اليوم؟</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {["أحتاج إلى فني صيانة", "أحتاج إلى خدمات تجميل", "أحتاج إلى خدمات تنظيف"].map((action, i) => (
                <button key={i} onClick={() => handleQuickAction(action)} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-right">
                  <div className="font-medium text-gray-900">{["صيانة منزلية", "خدمات تجميل", "خدمات تنظيف"][i]}</div>
                  <div className="text-sm text-gray-600">{["فني صيانة، كهربائي، سباك", "مصفف شعر، مكياج، تجميل", "تنظيف منازل، مكاتب، سيارات"][i]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {!isLoadingHistory && !historyError && messages.length > 0 && (
        <AIChatMessages 
          messages={messages}
          isTyping={isWaitingForAI || isSendingMessage}
          messagesEndRef={messagesEndRef}
          onShowOrderForm={handleShowOrderForm}
          onShowOfferForm={handleShowOfferForm}
        />
      )}

      <Dialog open={showOrderForm || showOfferForm} onOpenChange={() => {setShowOrderForm(false); setShowOfferForm(false);}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right" dir="rtl">{formMode === 'order' ? 'نموذج إنشاء مشروع' : 'نموذج عرض سعر'}</DialogTitle>
            <DialogDescription className="text-right" dir="rtl">{formMode === 'order' ? 'Project Creation Form' : 'Offer Form'}</DialogDescription>
          </DialogHeader>
          <AIOrderForm
            enhancedResponse={formData}
            selectedTechnicianId={selectedTechnicianId}
            onClose={() => {setShowOrderForm(false); setShowOfferForm(false);}}
            onSuccess={handleFormSuccess}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      <AIChatInput
        inputText={transcript || inputText}
        setInputText={setInputText}
        isTyping={currentTypingStatus}
        onSendMessage={handleSendMessage}
        onFileUpload={setUploadedFiles}
        uploadedFiles={uploadedFiles}
        onRemoveFile={(i) => setUploadedFiles(files => files.filter((_, idx) => idx !== i))}
        onQuickAction={handleQuickAction}
        isRecognizing={isRecognizing}
        isLiveChatActive={isLiveChatActive}
        onToggleLiveChat={() => dispatch(toggleLiveChat())}
        isListening={listening}
      />
    </div>
  );
};

export default AIChatContainer;
