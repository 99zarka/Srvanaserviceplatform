import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowLeft, Bot, MessageSquare, Sparkles } from 'lucide-react';
import AIChatContainer from './AIChatContainer';

const AIAssistantPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        <AIChatContainer />
      </div>
    </div>
  );
};

export default AIAssistantPage;
