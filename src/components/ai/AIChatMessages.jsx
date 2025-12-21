import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import AIMessageBubble from './AIMessageBubble';
import UserMessageBubble from './UserMessageBubble';
import MessageTyping from './MessageTyping';

const AIChatMessages = ({ 
  messages, 
  isTyping, 
  messagesEndRef,
  onEditProjectData,
  onPostProject,
  onDirectHire,
  onShowOrderForm,
  onShowOfferForm,
  selectedTechnicianId,
  onTechnicianSelect
}) => {
  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-6 space-y-6">
        {messages.map((message) => (
          message.role === 'assistant' ? (
            <AIMessageBubble 
              key={message.id} 
              message={message}
              onEditProjectData={onEditProjectData}
              onPostProject={onPostProject}
              onDirectHire={onDirectHire}
              onShowOrderForm={onShowOrderForm}
              onShowOfferForm={onShowOfferForm}
              selectedTechnicianId={selectedTechnicianId}
              onTechnicianSelect={onTechnicianSelect}
            />
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
