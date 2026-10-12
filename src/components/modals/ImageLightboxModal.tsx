import React from 'react';
import { X } from 'lucide-react';

interface ImageLightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-in fade-in duration-200"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <img
        src={imageUrl}
        alt="Enlarged preview"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl cursor-default"
      />
    </div>
  );
};
