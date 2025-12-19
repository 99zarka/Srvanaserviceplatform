import React from 'react';
import { Bot } from 'lucide-react';
import MessageFilePreview from './MessageFilePreview';
import MessageTimestamp from './MessageTimestamp';
import { Button } from '../ui/button';

const AIMessageBubble = ({ message }) => {
  const formatMessageContent = (content) => {
    if (!content) return '';
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
        <Bot className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md">
        <div className="bg-white rounded-2xl rounded-tl-sm shadow-lg border border-gray-200 p-4">
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {formatMessageContent(message.content)}
          </div>
          
          {/* File previews if any */}
          {message.files && message.files.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.files.map((file, index) => (
                <MessageFilePreview key={index} file={file} />
              ))}
            </div>
          )}
          
          {/* Suggestions/Quick replies */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              {message.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-right border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  onClick={() => message.onSuggestionClick?.(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500 text-left">
          <MessageTimestamp timestamp={message.timestamp} />
        </div>
      </div>
    </div>
  );
};

export default AIMessageBubble;
