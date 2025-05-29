import React, { useRef } from "react";
import { useSettingsImageStore } from "../../store";
import { FileUpIcon, UploadIcon } from "lucide-react";

const ImageUploader: React.FC = () => {
  const { image, previewUrl, setImage, clearImage } = useSettingsImageStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Formato no soportado. Usa JPG, PNG o GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo supera el máximo de 5MB.");
      return;
    }

    // Convertir la imagen a base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setImage(file, base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleAreaClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-white w-full mx-auto cursor-pointer transition-all h-40"
      onClick={handleAreaClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <UploadIcon />
      <p className="text-base text-gray-400 text-center">
        Selecciona el archivo desde tu ordenador en JPG, PNG o GIF (Máximo 5mb).
      </p>
      <button
        type="button"
        className="flex items-center gap-2 border-2 border-orange-400 text-orange-500 rounded-lg px-6 text-sm py-2 font-medium hover:bg-orange-50 transition-all"
      >
        <FileUpIcon />
        Subir foto
      </button>
    </div>
  );
};

export default ImageUploader;
