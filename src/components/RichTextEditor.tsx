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
  AlignRight,
  Heading1,
  Heading2,
  CheckSquare
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
      // Only update if the logic/content is significantly different to avoid cursor jumps
      // For now, we trust the value prop if it differs
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
    { icon: Heading1, command: 'formatBlock', value: 'H1', title: 'Başlık 1' },
    { icon: Heading2, command: 'formatBlock', value: 'H2', title: 'Başlık 2' },
    { divider: true },
    { icon: Bold, command: 'bold', title: 'Kalın (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'İtalik (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Altı Çizili (Ctrl+U)' },
    { divider: true },
    { icon: List, command: 'insertUnorderedList', title: 'Madde İşareti' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numaralı Liste' },
    { icon: CheckSquare, command: 'insertInput', title: 'Onay Kutusu (Geliştirme Aşamasında)' }, // Placeholder for checklist
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
    <div className={`relative border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-1 p-2 bg-zinc-50/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 flex-wrap">
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
                } else if (item.command === 'insertInput') {
                  // Custom Logic for Checklist
                  // For now, simpler implementation via list
                  formatText('insertUnorderedList');
                } else {
                  formatText(item.command!, item.value);
                }
              }}
              title={item.title}
              className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all hover:shadow-sm"
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
        className="flex-1 min-h-[200px] p-6 focus:outline-none text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 rich-text-editor prose dark:prose-invert max-w-none"
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