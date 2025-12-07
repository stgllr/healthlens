import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

interface UploadSectionProps {
  onImageSelected: (file: File) => void;
  isAnalyzing: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelected, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 px-4">
      <div 
        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out p-8 text-center
          ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-white hover:border-teal-400 hover:bg-slate-50'}
          ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isAnalyzing}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {isAnalyzing ? (
            <div className="animate-spin text-teal-600">
              <Loader2 className="w-12 h-12" />
            </div>
          ) : (
            <div className="bg-teal-100 p-4 rounded-full text-teal-600 group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-8 h-8" />
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-700">
              {isAnalyzing ? 'Analyzing Medication...' : 'Upload Prescription or Pill'}
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {isAnalyzing 
                ? 'Please wait while our AI reads the details securely.' 
                : 'Take a clear photo or upload an image to identify medications and get simple instructions.'}
            </p>
          </div>

          {!isAnalyzing && (
            <div className="flex items-center space-x-2 text-sm text-slate-400 font-medium pt-2">
              <ImageIcon className="w-4 h-4" />
              <span>Supports JPG, PNG, WEBP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadSection;