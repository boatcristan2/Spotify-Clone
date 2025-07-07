import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  }, []);

  return { notification, isVisible, showNotification };
};