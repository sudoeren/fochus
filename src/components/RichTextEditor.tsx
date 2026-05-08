import React, { useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useTranslation } from 'react-i18next';
import {} from // Icons removed
'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string, plainText: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = ''
}) => {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      // Sanitize content before setting innerHTML to prevent XSS
      editorRef.current.innerHTML = DOMPurify.sanitize(value);
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
    const url = prompt(t('note_editor.link_url') || 'Enter link URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const formatText = (command: string, value?: string) => {
    execCommand(command, value);
  };

  // Toolbar definition removed

  // Simple Markdown-like auto-formatting
  const handleInput = (_e: React.FormEvent<HTMLDivElement>) => {
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
    <div
      className={`relative border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 flex flex-col ${className}`}
    >
      {/* Toolbar */}
      {/* Toolbar removed */}

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
