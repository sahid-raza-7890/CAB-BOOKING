import React, { createContext, useContext, useEffect, useState } from 'react';
import userPreferenceService from '../services/userPreferenceService';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('Dark'); // Default to Dark as per existing design

  useEffect(() => {
    // Attempt to load from preferences API only if logged in
    const loadTheme = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return; // Not logged in, use defaults
      try {
        const prefs = await userPreferenceService.getPreferences();
        if (prefs && prefs.theme) {
          setThemeState(prefs.theme);
        }
      } catch (err) {
        // Silently ignore auth errors on login pages
        if (!err.message?.includes('401')) {
          console.error('Failed to load theme preference', err);
        }
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    // Apply theme to document
    let activeTheme = theme;
    if (theme === 'System') {
      activeTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'Light' : 'Dark';
    }

    if (activeTheme === 'Light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    try {
      await userPreferenceService.updateTheme(newTheme);
    } catch (err) {
      console.error('Failed to save theme', err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
