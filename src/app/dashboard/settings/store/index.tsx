import { create } from "zustand";

interface ImageState {
  image: File | null;
  previewUrl: string | null;
  base64String: string | null;
  logoUpdated: boolean;
  setImage: (file: File, objectUrl: string, base64: string) => void;
  setLogoUrl: (url: string) => void;
  clearImage: () => void;
  markLogoUpdated: () => void;
  resetLogoUpdated: () => void;
}

export const useSettingsImageStore = create<ImageState>((set) => ({
  image: null,
  previewUrl: null,
  base64String: null,
  logoUpdated: false,
  setImage: (file, objectUrl, base64) =>
    set({ image: file, previewUrl: objectUrl, base64String: base64 }),
  setLogoUrl: (url) =>
    set({ image: null, previewUrl: url, base64String: null }),
  clearImage: () => set({ image: null, previewUrl: null, base64String: null }),
  markLogoUpdated: () => set({ logoUpdated: true }),
  resetLogoUpdated: () => set({ logoUpdated: false }),
}));
