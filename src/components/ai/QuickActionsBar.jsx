import React from 'react';
import { quickActions } from './mockData';
import { Button } from '../ui/button';

const QuickActionsBar = ({ onQuickAction }) => {
  return (
    <div className="flex items-center space-x-2 min-w-max">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onQuickAction(action.label)}
          className="flex items-center space-x-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 text-sm font-medium"
        >
          <span className="text-lg">{action.icon}</span>
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickActionsBar;
