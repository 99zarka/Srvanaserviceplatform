import React, { useState } from 'react';
import { Send, Paperclip, Smile, Mic, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { quickActions } from './mockData';
import ChatFileUpload from './ChatFileUpload';
import QuickActionsBar from './QuickActionsBar';
import '../../styles/mic-animation.css'; // Import the new CSS

const AIChatInput = ({
  inputText,
  setInputText,
  isTyping,
  onSendMessage,
  onFileUpload,
  uploadedFiles,
  onRemoveFile,
  onQuickAction,
  isRecognizing,
  isLiveChatActive,
  onToggleLiveChat,
  isListening,
  isSending
}) => {
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isDraggingOverInput, setIsDraggingOverInput] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim() || uploadedFiles.length > 0) {
      onSendMessage();
      setShowQuickActions(false);
    }
  };

  const handleFileChange = (files) => {
    onFileUpload(files);
    setShowQuickActions(false);
  };

  const removeFile = (index) => {
    onRemoveFile(index);
  };

  return (
    <div className="border-t border-gray-200 bg-white relative">
      {isLiveChatActive && isListening ? (
        // Large, pulsing microphone for active live chat
        <div className="mic-center-container">
          <div className="mic-icon-wrapper mic-pulse-pop" onClick={onToggleLiveChat}>
            <Mic className="h-full w-full" />
          </div>
        </div>
      ) : (
        <>
          {/* Quick Actions Bar */}
          {showQuickActions && (
            <div className="border-b border-gray-100 bg-gray-50">
              <ScrollArea className="w-full">
                <div className="flex items-center space-x-3 p-3">
                  <QuickActionsBar onQuickAction={onQuickAction} />
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="border-b border-gray-100 bg-gray-50">
              <div className="p-3 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        {file.type?.startsWith('image/') ? (
                          <img src={file.preview || file.url} alt="" className="w-full h-full rounded object-cover" />
                        ) : (
                          <Paperclip className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{file.name}</div>
                        <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 space-y-3">
            <div className="flex items-end space-x-3">
              {/* File Upload Button */}
              <ChatFileUpload onFileUpload={handleFileChange}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2"
                  disabled={isTyping}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </ChatFileUpload>

              {/* Microphone Button */}
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 ${isLiveChatActive ? 'text-blue-500' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
                onClick={onToggleLiveChat}
              >
                <Mic className={`h-5 w-5`} /> {/* Removed animate-pulse from here */}
              </Button>

              {/* Text Input */}
              <div className="flex-1 space-y-2">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isRecognizing ? "جاري الاستماع..." : "اكتب رسالتك هنا..."}
                  rows={3}
                  className={`resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 ${
                    isDraggingOverInput ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  disabled={isTyping || isRecognizing}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOverInput(true);
                  }}
                  onDragLeave={() => setIsDraggingOverInput(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOverInput(false);
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      handleFileChange(files);
                    }
                  }}
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Shift + Enter للانتقال لسطر جديد</span>
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={(!inputText.trim() && uploadedFiles.length === 0) || isSending || isRecognizing}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الإرسال...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>إرسال</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatInput;
