import React from 'react';

const MessageTimestamp = ({ timestamp }) => {
  if (!timestamp) return null;

  const date = new Date(timestamp);
  const now = new Date();

  // Format time (HH:MM)
  const timeString = date.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Check if it's today
  const isToday = date.toDateString() === now.toDateString();

  // Check if it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  // Format date if not today or yesterday
  const dateString = date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  let displayText = timeString;

  if (!isToday && !isYesterday) {
    displayText = `${timeString} • ${dateString}`;
  } else if (isYesterday) {
    displayText = `${timeString} • الأمس`;
  }

  return <span>{displayText}</span>;
};

export default MessageTimestamp;
