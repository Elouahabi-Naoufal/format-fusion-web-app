import { useState, useEffect } from 'react';

export const useTheme = (storageKey: string) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(isDark));
  }, [isDark, storageKey]);

  const toggleTheme = () => setIsDark(!isDark);

  return { isDark, toggleTheme };
};