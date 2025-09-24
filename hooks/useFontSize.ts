import { useState, useEffect, useCallback } from 'react';

const FONT_SIZE_KEY = 'ai-chat-font-size';
const DEFAULT_FONT_SIZE = 16; // default size in pixels

export const useFontSize = (): [number, (size: number) => void] => {
  const [fontSize, setFontSizeState] = useState<number>(() => {
    try {
      const savedSize = localStorage.getItem(FONT_SIZE_KEY);
      return savedSize ? parseInt(savedSize, 10) : DEFAULT_FONT_SIZE;
    } catch {
      return DEFAULT_FONT_SIZE;
    }
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--chat-font-size', `${fontSize}px`);
    try {
      localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
    } catch (error) {
        console.error("Failed to save font size to localStorage:", error);
    }
  }, [fontSize]);

  const setFontSize = useCallback((size: number) => {
    setFontSizeState(size);
  }, []);

  return [fontSize, setFontSize];
};
