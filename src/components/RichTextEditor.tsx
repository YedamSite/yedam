'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import SafeImage from '@/components/SafeImage';
import { uploadImage } from '@/lib/supabaseStorage';
import {
  Bold, Italic, Underline, List, ListOrdered, Link2, Image as ImageIcon,
  Heading1, Heading2, Heading3, Quote, Minus, Code, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  folder?: string;
}

function ToolbarButton({ 
  onClick, 
  title, 
  active, 
  children 
}: { 
  onClick: () => void; 
  title: string; 
  active?: boolean; 
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors text-xs
        ${active 
          ? 'bg-accent text-background' 
          : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, folder = 'blog' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInternalUpdate = useRef(false);
  const savedSelection = useRef<Range | null>(null);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0);
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedSelection.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedSelection.current);
    }
  }, []);

  // Sync external value into editor (only when it changes from outside)
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      const current = editorRef.current.innerHTML;
      if (current !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = prompt('URL do link:', 'https://');
    if (url) exec('createLink', url);
  }, [exec]);

  const insertImage = useCallback(async (file: File) => {
    const url = await uploadImage(file, folder);
    if (url) {
      exec('insertImage', url);
    }
  }, [exec, folder]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await insertImage(file);
    e.target.value = '';
  }, [insertImage]);

  const formatBlock = useCallback((tag: string) => {
    exec('formatBlock', tag);
  }, [exec]);

  const isActive = useCallback((command: string) => {
    try {
      return document.queryCommandState(command);
    } catch { return false; }
  }, []);

  return (
    <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden bg-black/20 focus-within:border-accent transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-white/10 bg-black/20">
        {/* Headings */}
        <ToolbarButton onClick={() => formatBlock('h1')} title="Título 1">
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('h2')} title="Título 2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock('h3')} title="Título 3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Text style */}
        <ToolbarButton onClick={() => exec('bold')} title="Negrito (Ctrl+B)" active={isActive('bold')}>
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')} title="Itálico (Ctrl+I)" active={isActive('italic')}>
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('underline')} title="Sublinhado (Ctrl+U)" active={isActive('underline')}>
          <Underline className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Alignment */}
        <ToolbarButton onClick={() => exec('justifyLeft')} title="Alinhar à esquerda">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyCenter')} title="Centralizar">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyRight')} title="Alinhar à direita">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Text Color */}
        <label 
          title="Cor do Texto" 
          className="w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer hover:bg-white/10"
          onMouseDown={() => saveSelection()}
        >
          <input 
            type="color" 
            className="opacity-0 w-0 h-0 absolute"
            onChange={(e) => {
              editorRef.current?.focus();
              restoreSelection();
              document.execCommand('styleWithCSS', false, 'true');
              exec('foreColor', e.target.value);
            }}
          />
          <div className="w-4 h-4 rounded border border-white/20 overflow-hidden flex flex-col items-center justify-center bg-transparent pointer-events-none">
             <span className="text-[10px] font-bold leading-none text-white font-serif -mt-[1px]">A</span>
             <div className="w-full h-1 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 mt-auto"></div>
          </div>
        </label>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Lists */}
        <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Lista com marcadores">
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('insertOrderedList')} title="Lista numerada">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Other */}
        <ToolbarButton onClick={() => formatBlock('blockquote')} title="Citação">
          <Quote className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('formatBlock', 'pre')} title="Bloco de código">
          <Code className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('insertHorizontalRule')} title="Divisor">
          <Minus className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Link & Image */}
        <ToolbarButton onClick={insertLink} title="Inserir link">
          <Link2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Inserir imagem">
          <ImageIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[200px] max-h-[500px] overflow-y-auto p-4 text-[12px] text-white leading-relaxed outline-none
          prose prose-invert prose-sm max-w-none
          [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4
          [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4
          [&_h3]:text-base [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-3
          [&_p]:mb-3 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
          [&_li]:mb-1
          [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/70 [&_blockquote]:mb-3
          [&_pre]:bg-black/40 [&_pre]:p-3 [&_pre]:rounded [&_pre]:text-[11px] [&_pre]:mb-3
          [&_a]:text-accent [&_a]:underline
          [&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-3
          [&_hr]:border-white/10 [&_hr]:my-4"
        data-placeholder={placeholder || 'Escreva o conteúdo do artigo aqui...'}
        style={{ 
          caretColor: 'white',
        }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,0.3);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
