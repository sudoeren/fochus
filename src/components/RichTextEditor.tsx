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

  const formatText = (command: string) => {
    execCommand(command);
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
    <div className={`relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 flex-wrap">
        {toolbar.map((item, index) => {
          if (item.divider) {
            return (
              <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1" />
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
                  formatText(item.command!);
                }
              }}
              title={item.title}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
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
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] p-4 focus:outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 rich-text-editor"
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
