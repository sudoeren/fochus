import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Save,
    Clock,
    Tag,
    Trash2,
    X
} from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { RichTextEditor } from '../components/RichTextEditor';

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
        // Allow saving empty note if it already exists (updating)
        // But if creating new, need at least title or content
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

    // Auto-save every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (title || plainContent) {
                handleSave();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [title, content, plainContent, tags]);

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                        title="Geri"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            {title || 'Adsız Not'}
                        </span>
                        {lastSaved && (
                            <span className="text-xs text-zinc-400">
                                Son düzenleme: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Tags Display/Edit Area could go here or in body. Let's put simplified actions here. */}
                    {noteId && (
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Sil"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}

                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-2" />

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                    >
                        <Save className="w-4 h-4" />
                        Kaydet
                    </button>
                </div>
            </header>

            {/* Main Content Area - Centered Paper Layout */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-8 sm:px-10 sm:py-12 flex flex-col gap-6">

                    {/* Title Input */}
                    <input
                        type="text"
                        placeholder="Not Başlığı"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-4xl sm:text-5xl font-extrabold bg-transparent border-none placeholder-zinc-300 dark:placeholder-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-0 p-0 leading-tight"
                    />

                    {/* Metadata Bar (Tags) */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Clock className="w-4 h-4" />
                            <span>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />

                        {/* Tags Input Area */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-zinc-400" />
                            {tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs">
                                    #{tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Etiket ekle..."
                                className="bg-transparent border-none focus:ring-0 p-0 w-24 text-sm placeholder-zinc-400 hover:placeholder-zinc-500 focus:placeholder-zinc-300 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div className="flex-1 min-h-[60vh] -mx-4 sm:mx-0">
                        <RichTextEditor
                            value={content}
                            onChange={(val, plain) => {
                                setContent(val);
                                setPlainContent(plain);
                            }}
                            placeholder="Düşüncelerinizi yazın..."
                            className="min-h-full border-none shadow-none bg-transparent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
