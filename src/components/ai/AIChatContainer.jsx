import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import AIChatHeader from './AIChatHeader';
import AIChatMessages from './AIChatMessages';
import AIChatInput from './AIChatInput';
import { mockMessages } from './mockData';

const AIChatContainer = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && uploadedFiles.length === 0) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
      files: uploadedFiles
    };

    // Add user message
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setUploadedFiles([]);
    setIsTyping(true);

    // Simulate AI response after delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(newMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleFileUpload = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (fileIndex) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== fileIndex));
  };

  const handleQuickAction = (action) => {
    setInputText(action);
    // Auto-send for quick actions
    setTimeout(() => handleSendMessage(), 100);
  };

  const generateAIResponse = (userMessage) => {
    // Simple mock response generator based on user input
    const content = userMessage.content.toLowerCase();
    let responseText = "شكراً لسؤالك! سأساعدك في ذلك.";
    
    if (content.includes('صنبور') || content.includes('تسريب') || content.includes('ماء')) {
      responseText = "أفهم المشكلة! بالنسبة لتسريبات المياه، إليك بعض الخطوات التي يمكنك تجربتها:\n\n1. أغلق ماء الصنبور مؤقتاً\n2. جرب شد المفصل بلطف باستخدام مفتاح ربط\n3. تأكد من أن الغasket ليس تالف\n4. إذا استمر التسريب، قد تحتاج لاستبدال الغasket الداخلي";
    } else if (content.includes('كهرباء') || content.includes('مفتاح') || content.includes('تيار')) {
      responseText = "لسلامتك، أوصي باستدعاء فني كهرباء متخصص. المشاكل الكهربائية تتطلب خبرة ودقة عالية.\n\nهل ترغب في أن أوصي لك بفني كهرباء قريب منك؟";
    } else if (content.includes('دهان') || content.includes('طلاء') || content.includes('جدران')) {
      responseText = "لإصلاح مشاكل الدهانات:\n\n1. نظف السطح جيداً من الغبار\n2. املأ أي شقوق باستخدام معجون خاص\n3. ضع طبقة أولية (Primer)\n4. طبق الدهان بالطريقة الصحيحة\n\nهل ترغب في معرفة المزيد عن خطوات الدهان؟";
    } else if (content.includes('صيانة') || content.includes('تصليح')) {
      responseText = "لصيانة الأجهزة المنزلية:\n\n1. تأكد من إغلاق الجهاز عن المصدر\n2. نظف الأجزاء الظاهرة بلطف\n3. تحقق من الأسلاك والتوصيلات\n4. إذا استمرت المشكلة، قد تحتاج لفني متخصص\n\nما نوع الجهاز الذي تحتاج لصيانته؟";
    }

    return {
      id: Date.now() + 1,
      type: 'ai',
      content: responseText,
      timestamp: new Date(),
      suggestions: [
        "هل تريدني أن أوصي لك بفني متخصص؟",
        "هل ترغب في إنشاء طلب خدمة؟",
        "هل تحتاج مساعدة في شيء آخر؟"
      ]
    };
  };

  return (
    <div className="max-w-4xl mx-auto shadow-xl border-0 overflow-hidden h-full flex flex-col">
      <AIChatHeader />
      <AIChatMessages 
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />
      <AIChatInput
        inputText={inputText}
        setInputText={setInputText}
        isTyping={isTyping}
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
