'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/supabaseStorage';

interface ImageUploadProps {
  currentUrl: string;
  onUrlChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export default function ImageUpload({
  currentUrl,
  onUrlChange,
  folder = 'general',
  label = 'Imagem',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Formato não suportado. Use JPG, PNG, WebP ou GIF.');
      return;
    }

    setUploading(true);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const url = await uploadImage(file, folder);

    setUploading(false);

    if (url) {
      onUrlChange(url);
      setUrlInput(url);
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    onUrlChange(value);
    setPreview(null);
  };

  const handleRemove = () => {
    onUrlChange('');
    setUrlInput('');
    setPreview(null);
  };

  const displayUrl = preview || currentUrl;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-[10px] font-bold uppercase text-accent">{label}</label>

      {/* Current image preview */}
      {displayUrl && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 bg-secondary group">
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-accent animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Upload area */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? 'Enviando...' : 'Upload do Computador'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* URL input */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={urlInput}
            onChange={e => handleUrlChange(e.target.value)}
            placeholder="Ou cole uma URL externa..."
            className="w-full h-10 rounded-md border border-white/10 bg-background px-3 py-2 text-[11px] text-white placeholder-gray-500"
          />
        </div>
        {urlInput && (
          <button type="button" onClick={() => { navigator.clipboard.writeText(urlInput); }} className="text-[9px] text-accent hover:text-accentHover font-bold uppercase whitespace-nowrap">
            Copiar
          </button>
        )}
      </div>
    </div>
  );
}
