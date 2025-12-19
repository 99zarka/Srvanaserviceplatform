import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import AIMessageBubble from './AIMessageBubble';
import UserMessageBubble from './UserMessageBubble';
import MessageTyping from './MessageTyping';

const AIChatMessages = ({ messages, isTyping, messagesEndRef }) => {
  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-6 space-y-6">
        {messages.map((message) => (
          message.type === 'ai' ? (
            <AIMessageBubble key={message.id} message={message} />
          ) : (
            <UserMessageBubble key={message.id} message={message} />
          )
        ))}
        {isTyping && <MessageTyping />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default AIChatMessages;
