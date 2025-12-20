import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Bot, Star, Shield, Zap, PlusCircle } from 'lucide-react';
import { Button } from '../ui/button'; // Import Button component

const AIChatHeader = ({ onStartNewConversation }) => { // Accept onStartNewConversation prop
  return (
    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Bot className="h-8 w-8 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">مساعد سرفانا الذكي</CardTitle>
            <CardDescription className="text-blue-100 text-base">
              خبير في حل مشاكل المنزل بسرعة ودقة
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center space-x-2"> {/* Added a div for button and existing items */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartNewConversation}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            محادثة جديدة
          </Button>
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 backdrop-blur-sm">
              <Star className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold text-secondary">دعم 24/7</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 backdrop-blur-sm">
              <Shield className="h-5 w-5 text-green-300" />
              <span className="text-sm font-semibold text-secondary">آمن وموثوق</span>
            </div>
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 backdrop-blur-sm">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold text-secondary">رد فوري</span>
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};

export default AIChatHeader;
