import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Quote, 
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string, plainText: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "İçeriğinizi yazın...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      const plainText = editorRef.current.innerText || editorRef.current.textContent || '';
      onChange(htmlContent, plainText);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Link URL\'sini girin:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const formatText = (command: string, value?: string) => {
    execCommand(command, value);
  };

  const toolbar = [
    { icon: Bold, command: 'bold', title: 'Kalın (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'İtalik (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Altı Çizili (Ctrl+U)' },
    { divider: true },
    { icon: List, command: 'insertUnorderedList', title: 'Madde İşareti' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numaralı Liste' },
    { divider: true },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Alıntı' },
    { icon: Code, command: 'formatBlock', value: 'pre', title: 'Kod Bloğu' },
    { divider: true },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Sola Hizala' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Ortala' },
    { icon: AlignRight, command: 'justifyRight', title: 'Sağa Hizala' },
    { divider: true },
    { icon: Link, command: 'link', title: 'Link Ekle' }
  ];

  // Simple Markdown-like auto-formatting
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    handleContentChange();
    
    const selection = window.getSelection();
    if (!selection || !selection.anchorNode) return;

    const anchorNode = selection.anchorNode;
    const text = anchorNode.textContent || '';
    
    // Check for markdown triggers only if we are at the end of a pattern
    if (text.endsWith(' ')) {
      let command = '';
      let value = '';
      let triggerLength = 0;

      if (text === '# ') {
        command = 'formatBlock';
        value = 'H1';
        triggerLength = 2;
      } else if (text === '## ') {
        command = 'formatBlock';
        value = 'H2';
        triggerLength = 3;
      } else if (text === '- ' || text === '* ') {
        command = 'insertUnorderedList';
        triggerLength = 2;
      } else if (text === '1. ') {
        command = 'insertOrderedList';
        triggerLength = 3;
      } else if (text === '> ') {
        command = 'formatBlock';
        value = 'blockquote';
        triggerLength = 2;
      } else if (text === '``` ') {
        command = 'formatBlock';
        value = 'pre';
        triggerLength = 4;
      }

      if (command) {
        // Remove the trigger characters
        const range = document.createRange();
        range.setStart(anchorNode, 0);
        range.setEnd(anchorNode, triggerLength);
        range.deleteContents();

        // Execute format command
        execCommand(command, value);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case 'k':
          e.preventDefault();
          insertLink();
          break;
      }
    }
  };

  return (
    <div className={`relative border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex-wrap">
        {toolbar.map((item, index) => {
          if (item.divider) {
            return (
              <div key={index} className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />
            );
          }

          const Icon = item.icon!;
          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (item.command === 'link') {
                  insertLink();
                } else {
                  formatText(item.command!, item.value);
                }
              }}
              title={item.title}
              className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] p-4 focus:outline-none text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 rich-text-editor"
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
        suppressContentEditableWarning
        data-placeholder={placeholder}
      />
    </div>
  );
};