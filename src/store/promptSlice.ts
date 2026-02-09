import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type AppMode = 'basic' | 'advanced';
type ThemeMode = 'light' | 'dark';

interface PromptState {
  mode: AppMode;
  theme: ThemeMode;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable
  }
}

const STORAGE_KEYS = {
  MODE: 'garry-micro-dev-utilities-mode',
  THEME: 'garry-micro-dev-utilities-theme',
};

function getInitialTheme(): ThemeMode {
  // Check localStorage first
  const stored = loadFromStorage<ThemeMode>(STORAGE_KEYS.THEME, null);
  if (stored) return stored;

  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  // Default to dark (matching n8n project)
  return 'dark';
}

const initialState: PromptState = {
  mode: loadFromStorage<AppMode>(STORAGE_KEYS.MODE, 'basic'),
  theme: getInitialTheme(),
};

export const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<AppMode>) => {
      state.mode = action.payload;
      saveToStorage(STORAGE_KEYS.MODE, action.payload);
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      saveToStorage(STORAGE_KEYS.THEME, action.payload);
    },
    toggleTheme: (state) => {
      const newTheme: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = newTheme;
      saveToStorage(STORAGE_KEYS.THEME, newTheme);
    },
  },
});

export const { setMode, setTheme, toggleTheme } = promptSlice.actions;
export type { AppMode, ThemeMode };
export default promptSlice.reducer;
