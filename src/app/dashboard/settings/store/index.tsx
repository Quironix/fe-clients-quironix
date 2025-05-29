import { create } from "zustand";

interface ImageState {
  image: File | null;
  previewUrl: string | null;
  base64String: string | null;
  setImage: (file: File | null, base64String?: string) => void;
  clearImage: () => void;
  setBase64String: (base64String: string) => void;
}

export const useSettingsImageStore = create<ImageState>((set) => ({
  image: null,
  previewUrl: null,
  base64String: null,
  setImage: (file, base64String) => {
    if (file) {
      const url = URL.createObjectURL(file);
      set({ image: file, previewUrl: url, base64String: base64String || null });
    } else {
      set({ image: null, previewUrl: null, base64String: null });
    }
  },
  clearImage: () => set({ image: null, previewUrl: null, base64String: null }),
  setBase64String: (base64String) =>
    set({ base64String, previewUrl: base64String }),
}));
