import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Save,
    Clock,
    Tag,
    Trash2,
    X,
    MoreHorizontal
} from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { RichTextEditor } from '../components/RichTextEditor';
import clsx from 'clsx';

interface NoteEditorPageProps {
    noteId?: string;
    onBack: () => void;
}

export const NoteEditorPage: React.FC<NoteEditorPageProps> = ({ noteId, onBack }) => {
    const { notes, addNote, updateNote, deleteNote } = useNotes();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // HTML content
    const [plainContent, setPlainContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [loadedNoteId, setLoadedNoteId] = useState<string | null>(null);

    // Load note data only once when noteId changes
    useEffect(() => {
        if (noteId && noteId !== loadedNoteId) {
            const existingNote = notes.find(n => n.id === noteId);
            if (existingNote) {
                setTitle(existingNote.title);
                setContent(existingNote.content);
                setPlainContent(existingNote.plainContent || '');
                setTags(existingNote.tags || []);
                setLastSaved(existingNote.updatedAt);
                setLoadedNoteId(noteId);
            }
        }
    }, [noteId, notes, loadedNoteId]);

    const handleSave = async () => {
        if (!noteId && !title.trim() && !plainContent.trim()) return;

        try {
            if (noteId) {
                await updateNote(noteId, {
                    title,
                    content,
                    plainContent,
                    tags,
                    updatedAt: new Date()
                });
            } else {
                await addNote({
                    title,
                    content,
                    plainContent,
                    tags,
                    color: 'default', // Force default color
                    isPinned: false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            setLastSaved(new Date());
        } catch (error) {
            console.error('Save error:', error);
        }
    };

    const handleDelete = async () => {
        if (noteId && confirm('Bu notu silmek istediğinizden emin misiniz?')) {
            await deleteNote(noteId);
            onBack();
        }
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Auto-save
    useEffect(() => {
        const interval = setInterval(() => {
            if (title || plainContent) {
                handleSave();
            }
        }, 10000); // 10s auto-save
        return () => clearInterval(interval);
    }, [title, content, plainContent, tags]);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-black/20">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                        title="Geri"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Notu Düzenle
                        </span>
                        {lastSaved && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                                Kaydedildi: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {noteId && (
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            title="Notu Sil"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}

                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
                    >
                        <Save className="w-4 h-4" />
                        Kaydet
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-8 py-12 flex flex-col gap-8">

                    {/* Title Input */}
                    <input
                        type="text"
                        placeholder="Başlık"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-5xl font-bold bg-transparent border-none placeholder-zinc-300 dark:placeholder-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-0 p-0 leading-tight tracking-tight"
                    />

                    {/* Metadata Bar (Tags) */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>

                        {/* Tags Input Area */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium group">
                                    #{tag}
                                    <button onClick={() => removeTag(tag)} className="text-zinc-400 hover:text-red-500 transition-colors"><X size={12} /></button>
                                </span>
                            ))}
                            <div className="relative group">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Etiket ekle..."
                                    className="bg-transparent border-none focus:ring-0 py-1.5 pl-9 w-32 text-sm placeholder-zinc-400 hover:placeholder-zinc-500 focus:placeholder-zinc-300 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rich Text Editor - Distraction Free */}
                    <div className="flex-1 min-h-[50vh] prose prose-lg dark:prose-invert max-w-none">
                        <RichTextEditor
                            value={content}
                            onChange={(val, plain) => {
                                setContent(val);
                                setPlainContent(plain);
                            }}
                            placeholder="Hikayeni anlatmaya başla..."
                            className="min-h-full border-none shadow-none bg-transparent !p-0 focus:ring-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
