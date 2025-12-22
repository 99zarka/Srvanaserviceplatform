import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import AIChatHeader from './AIChatHeader';
import AIChatMessages from './AIChatMessages';
import AIChatInput from './AIChatInput';
import AIOrderForm from './AIOrderForm';
import { useGetAiChatHistoryQuery, useSendAiChatMessageMutation } from '../../services/api';
import { toast } from 'sonner';
import BASE_URL from '../../config/api'; // Import BASE_URL
import { useSelector } from 'react-redux'; // Import useSelector to get token

const AIChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [formMode, setFormMode] = useState('order'); // 'order' or 'offer'
  const [formData, setFormData] = useState(null); // Store form data for the currently open form
  const messagesEndRef = useRef(null);

  const { data: historyData, isLoading: isLoadingHistory, error: historyError, refetch: refetchHistory } = useGetAiChatHistoryQuery();
  const [sendChatMessage, { isLoading: isSendingMessage }] = useSendAiChatMessageMutation();
  const token = useSelector((state) => state.auth.token); // Get token from Redux store

  // --- File Upload to Backend ---
  const uploadFileToBackend = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file); // 'file' is the field name the backend expects

    try {
      const response = await fetch(`${BASE_URL}/files/upload/file/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Include authorization token
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend file upload error:', errorData);
        toast.error('Failed to upload file to backend.');
        return null;
      }

      const data = await response.json();
      return data.url; // Expecting { "url": "..." }
    } catch (error) {
      console.error('Error uploading file to backend:', error);
      toast.error('Error uploading file.');
      return null;
    }
  };

  // Load history on initial mount
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (startNew = false) => {
    if (!startNew && !inputText.trim() && uploadedFiles.length === 0) return;

    let imageUrl = null;
    let fileUrl = null;

    if (uploadedFiles.length > 0) {
      // Upload files to backend
      const uploadPromises = uploadedFiles.map(file => uploadFileToBackend(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      // Assign first image and first other file URL
      imageUrl = uploadedUrls.find((url, index) => url && uploadedFiles[index].type.startsWith('image'));
      fileUrl = uploadedUrls.find((url, index) => url && !uploadedFiles[index].type.startsWith('image'));
      
      if (!imageUrl && !fileUrl) {
        toast.error('Failed to upload files.');
        return;
      }
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
      image_url: imageUrl,
      file_url: fileUrl,
    };

    // Optimistically add user message if not starting new or if there's actual content
    if (!startNew || inputText.trim() || imageUrl || fileUrl) {
      setMessages(prev => [...prev, userMessage]);
    }
    
    setInputText('');
    setUploadedFiles([]);

    try {
      setIsLoading(true);
      // Send message to backend
      const response = await sendChatMessage({ 
        prompt: inputText.trim(), 
        image_url: imageUrl, 
        file_url: fileUrl, 
        start_new: startNew 
      }).unwrap();

      // Enhanced response will be handled by the history refetch

      // History will be refetched automatically due to `invalidatesTags: ['AIChat']`
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
      // Revert optimistic update if necessary, or just rely on refetch to correct state
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id)); // Simple revert
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (fileIndex) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== fileIndex));
  };

  const handleQuickAction = async (action) => {
    setInputText(action);
    // Send quick action as a message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: action,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      setIsLoading(true);
      const response = await sendChatMessage({ prompt: action, start_new: false }).unwrap();

      // Enhanced response will be handled by the history refetch
    } catch (error) {
      console.error('Failed to send quick action:', error);
      toast.error('Failed to send quick action. Please try again.');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id)); // Simple revert
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversation = async () => {
    // Clear current UI messages immediately
    setMessages([]);
    setFormData(null);
    setShowOrderForm(false);
    setShowOfferForm(false);
    setSelectedTechnicianId(null);
    setFormMode('order');
    setInputText('');
    setUploadedFiles([]);
    toast.info('Starting a new conversation...');
    
    try {
      setIsLoading(true);
      // Send a message with start_new flag to backend to reset context
      // Only send if there's content, otherwise just reset locally
      if (inputText.trim() || uploadedFiles.length > 0) {
        await sendChatMessage({ prompt: inputText.trim(), start_new: true }).unwrap();
      } else {
        // For empty new conversation, just send the flag without content
        await sendChatMessage({ prompt: '', start_new: true }).unwrap();
      }
      toast.success('New conversation started!');
      // Refetch history which should now be empty or a new initial message if backend provides one
      refetchHistory(); 
    } catch (error) {
      console.error('Failed to start new conversation:', error);
      toast.error('Failed to start new conversation. Please try again.');
      // If new conversation failed, try to refetch old history or show error state
      refetchHistory();
    } finally {
      setIsLoading(false);
    }
  };


  const handleShowOrderForm = (projectData = null) => {
    setFormData(projectData);
    setFormMode('order');
    setShowOrderForm(true);
    setShowOfferForm(false);
    setSelectedTechnicianId(null);
  };

  const handleShowOfferForm = (technicianId, projectData = null) => {
    setFormData(projectData);
    setFormMode('offer');
    setShowOfferForm(true);
    setShowOrderForm(false);
    setSelectedTechnicianId(technicianId);
  };

  const handleFormSuccess = (mode, response) => {
    if (mode === 'order') {
      toast.success('تم إنشاء المشروع بنجاح!');
      setShowOrderForm(false);
    } else if (mode === 'offer') {
      toast.success('تم إرسال عرض السعر بنجاح!');
      setShowOfferForm(false);
      setSelectedTechnicianId(null);
    }
  };

  const handleFormClose = () => {
    setShowOrderForm(false);
    setShowOfferForm(false);
    setSelectedTechnicianId(null);
    setFormMode('order');
    setFormData(null);
  };

  const currentTypingStatus = isLoadingHistory || isSendingMessage || isLoading;

  return (
    <div className="max-w-4xl mx-auto shadow-xl border-0 overflow-hidden h-full flex flex-col">
      <AIChatHeader onStartNewConversation={handleStartNewConversation} />
      {isLoadingHistory && <div className="text-center p-4">Loading conversation history...</div>}
      {historyError && <div className="text-center p-4 text-red-500">Error loading history: {historyError.message}</div>}
      
      {!isLoadingHistory && !historyError && messages.length === 0 && (
        <div className="border-b border-gray-100 bg-gray-50 p-6" dir="rtl">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">مرحبًا بك في مساعدنا الذكي</div>
            <div className="text-gray-600 mb-4">كيف يمكنني مساعدتك اليوم؟</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <button 
                onClick={() => handleQuickAction("أحتاج إلى فني صيانة")}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-right"
              >
                <div className="font-medium text-gray-900">صيانة منزلية</div>
                <div className="text-sm text-gray-600">فني صيانة، كهربائي، سباك</div>
              </button>
              <button 
                onClick={() => handleQuickAction("أحتاج إلى خدمات تجميل")}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-right"
              >
                <div className="font-medium text-gray-900">خدمات تجميل</div>
                <div className="text-sm text-gray-600">مصفف شعر، مكياج، تجميل</div>
              </button>
              <button 
                onClick={() => handleQuickAction("أحتاج إلى خدمات تنظيف")}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors text-right"
              >
                <div className="font-medium text-gray-900">خدمات تنظيف</div>
                <div className="text-sm text-gray-600">تنظيف منازل، مكاتب، سيارات</div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isLoadingHistory && !historyError && messages.length > 0 && (
        <AIChatMessages 
          messages={messages}
          isTyping={currentTypingStatus}
          messagesEndRef={messagesEndRef}
          onPostProject={() => handleShowOrderForm(enhancedResponse?.project_data)}
          onDirectHire={(technicianId) => handleShowOfferForm(enhancedResponse?.project_data, technicianId)}
          onShowOrderForm={handleShowOrderForm}
          onShowOfferForm={handleShowOfferForm}
          selectedTechnicianId={selectedTechnicianId}
          onTechnicianSelect={setSelectedTechnicianId}
        />
      )}

      {/* Order Form Dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right" dir="rtl">نموذج إنشاء مشروع</DialogTitle>
            <DialogDescription className="text-right" dir="rtl">Project Creation Form</DialogDescription>
          </DialogHeader>
          <AIOrderForm
            enhancedResponse={formData}
            selectedTechnicianId={null}
            onClose={() => setShowOrderForm(false)}
            onSuccess={handleFormSuccess}
            mode="order"
          />
        </DialogContent>
      </Dialog>

      {/* Offer Form Dialog */}
      <Dialog open={showOfferForm} onOpenChange={setShowOfferForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right" dir="rtl">نموذج عرض سعر</DialogTitle>
            <DialogDescription className="text-right" dir="rtl">Offer Form</DialogDescription>
          </DialogHeader>
          <AIOrderForm
            enhancedResponse={formData}
            selectedTechnicianId={selectedTechnicianId}
            onClose={() => setShowOfferForm(false)}
            onSuccess={handleFormSuccess}
            mode="offer"
          />
        </DialogContent>
      </Dialog>

      <AIChatInput
        inputText={inputText}
        setInputText={setInputText}
        isTyping={currentTypingStatus}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        uploadedFiles={uploadedFiles}
        onRemoveFile={removeFile}
        onQuickAction={handleQuickAction}
      />
    </div>
  );
};

export default AIChatContainer;
