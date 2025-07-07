import React from 'react';

interface NotificationProps {
  message: string;
  isVisible: boolean;
}

export const Notification: React.FC<NotificationProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-5 right-5 bg-green-500 text-black px-5 py-3 rounded-lg font-semibold z-50 animate-slide-in">
      {message}
    </div>
  );
};