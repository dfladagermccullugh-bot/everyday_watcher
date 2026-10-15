'use client';

import { create } from 'zustand';

/** Transient UI state shared between views (hover sync, playback). URL holds durable state. */
type UIState = {
  hovered: string | null;
  setHovered: (id: string | null) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
  hovered: null,
  setHovered: (hovered) => set({ hovered }),
  reducedMotion: false,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
