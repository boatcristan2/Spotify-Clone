import { useState, useCallback } from 'react';

export interface NavigationState {
  view: 'home' | 'search' | 'library';
  searchQuery?: string;
  searchResults?: any[];
}

export const useNavigationHistory = () => {
  const [history, setHistory] = useState<NavigationState[]>([{ view: 'home' }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  const pushState = useCallback((state: NavigationState) => {
    setHistory(prev => {
      // Remove any forward history when pushing new state
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(state);
      return newHistory;
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (canGoBack) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [canGoBack, history, currentIndex]);

  const goForward = useCallback(() => {
    if (canGoForward) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [canGoForward, history, currentIndex]);

  const getCurrentState = useCallback(() => {
    return history[currentIndex];
  }, [history, currentIndex]);

  return {
    canGoBack,
    canGoForward,
    pushState,
    goBack,
    goForward,
    getCurrentState,
    history,
    currentIndex
  };
};