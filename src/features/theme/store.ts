import { create } from 'zustand';

export type DesignStyle = 'modern' | 'classic';
export type ColorMode = 'light' | 'dark';

interface ThemeState {
  style: DesignStyle;
  mode: ColorMode;
  setStyle: (style: DesignStyle) => void;
  setMode: (mode: ColorMode) => void;
  toggleStyle: () => void;
  toggleMode: () => void;
}

const STORAGE_KEY_STYLE = 'garage_pos_design_style';
const STORAGE_KEY_MODE = 'garage_pos_color_mode';

function applyThemeToDOM(style: DesignStyle, mode: ColorMode) {
  const root = document.documentElement;

  // Set design style attribute
  root.setAttribute('data-style', style);

  // Set dark/light class
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const savedStyle = (localStorage.getItem(STORAGE_KEY_STYLE) as DesignStyle) || 'modern';
  const savedMode = (localStorage.getItem(STORAGE_KEY_MODE) as ColorMode) || 'light';

  // Apply immediately on load
  applyThemeToDOM(savedStyle, savedMode);

  return {
    style: savedStyle,
    mode: savedMode,

    setStyle: (style) => {
      localStorage.setItem(STORAGE_KEY_STYLE, style);
      applyThemeToDOM(style, get().mode);
      set({ style });
    },

    setMode: (mode) => {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
      applyThemeToDOM(get().style, mode);
      set({ mode });
    },

    toggleStyle: () => {
      const next = get().style === 'modern' ? 'classic' : 'modern';
      get().setStyle(next);
    },

    toggleMode: () => {
      const next = get().mode === 'light' ? 'dark' : 'light';
      get().setMode(next);
    },
  };
});
