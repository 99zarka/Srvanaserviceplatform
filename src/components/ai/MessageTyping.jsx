import React from 'react';
import { Bot } from 'lucide-react';

const MessageTyping = () => {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
        <Bot className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md">
        <div className="bg-white rounded-2xl rounded-tl-sm shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-gray-500">جاري الكتابة...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageTyping;
