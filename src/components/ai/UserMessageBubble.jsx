import React from 'react';
import { User } from 'lucide-react';
import MessageFilePreview from './MessageFilePreview';
import MessageTimestamp from './MessageTimestamp';

const UserMessageBubble = ({ message }) => {
  return (
    <div className="flex items-start justify-end space-x-3">
      <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-sm shadow-lg p-4">
          <div className="leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          
          {/* File previews if any */}
          {message.files && message.files.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.files.map((file, index) => (
                <MessageFilePreview key={index} file={file} isUserMessage={true} />
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500 text-left">
          <MessageTimestamp timestamp={message.timestamp} />
        </div>
      </div>
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
        <User className="h-5 w-5 text-gray-600" />
      </div>
    </div>
  );
};

export default UserMessageBubble;
