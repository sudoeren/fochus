import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, Clock, Trash2, Wrench, Copy, Download } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { RichTextEditor } from '../components/RichTextEditor';
import { useTranslation } from 'react-i18next';

interface NoteEditorPageProps {
  noteId?: string;
  onBack: () => void;
}

export const NoteEditorPage: React.FC<NoteEditorPageProps> = ({ noteId, onBack }) => {
  const { t, i18n } = useTranslation();
  const { notes, addNote, updateNote, deleteNote } = useNotes();

  // Find note from current notes array
  const currentNote = noteId ? notes.find((n) => n.id === noteId) : undefined;

  const [title, setTitle] = useState(currentNote?.title || '');
  const [content, setContent] = useState(currentNote?.content || '');
  const [plainContent, setPlainContent] = useState(currentNote?.plainContent || '');
  const [lastSaved, setLastSaved] = useState<Date | null>(
    currentNote?.updatedAt ? new Date(currentNote.updatedAt) : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [createdNoteId, setCreatedNoteId] = useState<string | null>(null);

  const tt = useCallback(
    (key: string, fallback: string) => {
      const val = t(key);
      return !val || val === key ? fallback : val;
    },
    [t]
  );

  // Sync state when notes array updates (e.g., after initial load)
  useEffect(() => {
    if (currentNote && !title && !content) {
      setTitle(currentNote.title || '');
      setContent(currentNote.content || '');
      setPlainContent(currentNote.plainContent || '');
      if (currentNote.updatedAt) {
        setLastSaved(new Date(currentNote.updatedAt));
      }
    }
  }, [currentNote]);

  const handleSave = useCallback(async () => {
    const effectiveNoteId = noteId || createdNoteId;
    if (!effectiveNoteId && !title.trim() && !plainContent.trim()) return;
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (effectiveNoteId) {
        await updateNote(effectiveNoteId, {
          title,
          content,
          plainContent,
          updatedAt: new Date()
        });
      } else {
        const newNote = await addNote({
          title,
          content,
          plainContent,
          color: 'default',
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setCreatedNoteId(newNote.id);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [noteId, createdNoteId, title, content, plainContent, isSaving, updateNote, addNote]);

  const handleDelete = async () => {
    const effectiveNoteId = noteId || createdNoteId;
    if (
      effectiveNoteId &&
      confirm(tt('note_editor.confirm_delete', 'Bu notu silmek istediğinizden emin misiniz?'))
    ) {
      await deleteNote(effectiveNoteId);
      onBack();
    }
  };

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (title || plainContent) {
        handleSave();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [handleSave, title, plainContent]);

  // ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onBack]);

  const canDelete = Boolean(noteId || createdNoteId);

  const effectiveNoteId = noteId || createdNoteId;
  const createdAtDate = useMemo(() => {
    const source = currentNote?.createdAt;
    if (!source) return null;
    const d = new Date(source as any);
    return isNaN(d.getTime()) ? null : d;
  }, [currentNote?.createdAt]);

  const updatedAtDate = useMemo(() => {
    const source = currentNote?.updatedAt;
    if (!source) return lastSaved;
    const d = new Date(source as any);
    return isNaN(d.getTime()) ? lastSaved : d;
  }, [currentNote?.updatedAt, lastSaved]);

  const wordCount = useMemo(() => {
    const text = (plainContent || '').trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }, [plainContent]);

  const charCount = useMemo(() => (plainContent || '').length, [plainContent]);

  const formatDate = (d: Date) =>
    d.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full bg-transparent text-zinc-900 dark:text-white transition-colors">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/10 dark:bg-black/10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-1 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 transition-colors"
            title={tt('common.back', 'Geri')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {title?.trim() || tt('note_editor.untitled', 'Başlıksız Not')}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              {isSaving ? (
                <span>{tt('note_editor.saving', 'Kaydediliyor…')}</span>
              ) : updatedAtDate ? (
                <span>
                  {t('note_editor.saved_at', {
                    defaultValue: 'Kaydedildi: {{time}}',
                    time: updatedAtDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  })}
                </span>
              ) : (
                <span>{tt('note_editor.not_saved_yet', 'Henüz kaydedilmedi')}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                title={tt('note_editor.delete_note', 'Notu Sil')}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:opacity-95 transition-colors disabled:opacity-50"
              title={tt('note_editor.save', 'Kaydet')}
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{tt('note_editor.save', 'Kaydet')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Editor column */}
          <div className="space-y-4">
            <div className="bg-white/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
              <input
                type="text"
                placeholder={tt('note_editor.title_placeholder', 'Başlık')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl sm:text-4xl font-extrabold bg-transparent border-none placeholder-zinc-300 dark:placeholder-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-0 p-0 leading-tight tracking-tight"
              />
            </div>

            <div className="bg-white/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
              <div
                className="prose prose-lg dark:prose-invert max-w-none 
                              prose-p:text-zinc-600 dark:prose-p:text-zinc-400 
                              prose-headings:text-zinc-900 dark:prose-headings:text-white 
                              prose-strong:text-zinc-900 dark:prose-strong:text-white 
                              prose-a:text-indigo-500 dark:prose-a:text-indigo-400
                              prose-blockquote:border-l-4 prose-blockquote:border-zinc-200 dark:prose-blockquote:border-zinc-700
                              prose-code:text-indigo-500 dark:prose-code:text-indigo-300 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:rounded prose-code:px-1"
              >
                <RichTextEditor
                  value={content}
                  onChange={(val, plain) => {
                    setContent(val);
                    setPlainContent(plain);
                  }}
                  placeholder={tt('note_editor.placeholder', 'Buraya yazmaya başla...')}
                  className="min-h-[60vh] border-none shadow-none bg-transparent !p-0 focus:ring-0 text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            <div className="bg-white/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 sm:p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>{tt('note_editor.details', 'Detaylar')}</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {tt('note_editor.created', 'Oluşturma')}
                  </span>
                  <span className="font-medium">
                    {createdAtDate ? formatDate(createdAtDate) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {tt('note_editor.updated', 'Güncelleme')}
                  </span>
                  <span className="font-medium">
                    {updatedAtDate ? formatDate(updatedAtDate) : '—'}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-zinc-200/50 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {tt('note_editor.words', 'Kelime')}
                    </span>
                    <span className="font-medium">{wordCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {tt('note_editor.characters', 'Karakter')}
                    </span>
                    <span className="font-medium">{charCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 sm:p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <Wrench className="w-4 h-4" />
                <span>{tt('note_editor.toolbox', 'Araç Kutusu')}</span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-10 px-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold inline-flex items-center justify-center gap-2 hover:opacity-95 transition-colors disabled:opacity-50"
                  title={tt('note_editor.save', 'Kaydet')}
                >
                  <Save className="w-4 h-4" />
                  {tt('note_editor.save', 'Kaydet')}
                </button>

                <button
                  onClick={async () => {
                    const ok = await copyToClipboard(plainContent || '');
                    if (!ok) alert(tt('note_editor.copy_failed', 'Kopyalanamadı'));
                  }}
                  className="h-10 px-3 rounded-xl bg-white/40 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/60 text-sm font-semibold text-zinc-900 dark:text-zinc-100 inline-flex items-center justify-center gap-2 hover:bg-white/60 dark:hover:bg-zinc-900/70 transition-colors"
                  title={tt('note_editor.copy_text', 'Metni Kopyala')}
                >
                  <Copy className="w-4 h-4" />
                  {tt('note_editor.copy_text', 'Metni Kopyala')}
                </button>

                <button
                  onClick={async () => {
                    const ok = await copyToClipboard(content || '');
                    if (!ok) alert(tt('note_editor.copy_failed', 'Kopyalanamadı'));
                  }}
                  className="h-10 px-3 rounded-xl bg-white/40 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/60 text-sm font-semibold text-zinc-900 dark:text-zinc-100 inline-flex items-center justify-center gap-2 hover:bg-white/60 dark:hover:bg-zinc-900/70 transition-colors"
                  title={tt('note_editor.copy_html', 'HTML Kopyala')}
                >
                  <Copy className="w-4 h-4" />
                  {tt('note_editor.copy_html', 'HTML Kopyala')}
                </button>

                <button
                  onClick={() => {
                    const safeTitle = (title || 'note').trim().replace(/[\\/:*?"<>|]+/g, '-');
                    downloadFile(
                      `${safeTitle}.txt`,
                      plainContent || '',
                      'text/plain;charset=utf-8'
                    );
                  }}
                  className="h-10 px-3 rounded-xl bg-white/40 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/60 text-sm font-semibold text-zinc-900 dark:text-zinc-100 inline-flex items-center justify-center gap-2 hover:bg-white/60 dark:hover:bg-zinc-900/70 transition-colors"
                  title={tt('note_editor.download_txt', 'TXT İndir')}
                >
                  <Download className="w-4 h-4" />
                  {tt('note_editor.download_txt', 'TXT İndir')}
                </button>

                <button
                  onClick={() => {
                    const safeTitle = (title || 'note').trim().replace(/[\\/:*?"<>|]+/g, '-');
                    const html = `<!doctype html><
html lang="${i18n.language === 'tr' ? 'tr' : 'en'}"><head><meta charset="utf-8" />\n<title>${safeTitle}</title></head><body>${content || ''}</body></html>`;
                    downloadFile(`${safeTitle}.html`, html, 'text/html;charset=utf-8');
                  }}
                  className="h-10 px-3 rounded-xl bg-white/40 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/60 text-sm font-semibold text-zinc-900 dark:text-zinc-100 inline-flex items-center justify-center gap-2 hover:bg-white/60 dark:hover:bg-zinc-900/70 transition-colors"
                  title={tt('note_editor.download_html', 'HTML İndir')}
                >
                  <Download className="w-4 h-4" />
                  {tt('note_editor.download_html', 'HTML İndir')}
                </button>

                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="h-10 px-3 rounded-xl bg-red-50/60 dark:bg-red-900/10 border border-red-200/50 dark:border-red-900/30 text-sm font-semibold text-red-600 dark:text-red-400 inline-flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title={tt('note_editor.delete_note', 'Notu Sil')}
                  >
                    <Trash2 className="w-4 h-4" />
                    {tt('note_editor.delete_note', 'Notu Sil')}
                  </button>
                )}

                {!effectiveNoteId && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                    {tt('note_editor.toolbox_hint', 'Not kaydedilince silme aktif olur')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
