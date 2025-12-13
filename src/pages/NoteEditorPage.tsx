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

interface NoteEditorPageProps {
    noteId?: string;
    onBack: () => void;
}

export const NoteEditorPage: React.FC<NoteEditorPageProps> = ({ noteId, onBack }) => {
    const { notes, addNote, updateNote, deleteNote } = useNotes();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [plainContent, setPlainContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [loadedNoteId, setLoadedNoteId] = useState<string | null>(null);

    // Load note data
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
                    color: 'default',
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
        }, 10000);
        return () => clearInterval(interval);
    }, [title, content, plainContent, tags]);

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden relative transition-colors">

            {/* Header - Integrated into app flow */}
            <div className="flex-none px-6 py-4 flex items-center justify-between z-20">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3">
                    {lastSaved && (
                        <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase hidden sm:block">
                            {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}'de kaydedildi
                        </span>
                    )}

                    {noteId && (
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                            title="Notu Sil"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:shadow-lg hover:scale-105 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        Kaydet
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto px-8 py-8 flex flex-col gap-6">

                    {/* Title Input */}
                    <input
                        type="text"
                        placeholder="Başlık"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-5xl font-extrabold bg-transparent border-none placeholder-zinc-300 dark:placeholder-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-0 p-0 leading-tight tracking-tight"
                    />

                    {/* Metadata Row */}
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                        {/* Date Pill */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-500 dark:text-zinc-400 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">
                                {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

                        {/* Tags */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-4 h-4 text-zinc-400" />
                            {tags.length === 0 && !tagInput && (
                                <span className="text-zinc-400 text-sm">Etiket ekle...</span>
                            )}
                            {tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-bold group cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                                    #{tag}
                                    <button onClick={() => removeTag(tag)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 ml-1"><X size={10} /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="bg-transparent border-none focus:ring-0 p-0 w-32 text-sm text-zinc-900 dark:text-zinc-300 placeholder-transparent focus:placeholder-zinc-300 dark:focus:placeholder-zinc-700 transition-all font-medium"
                                placeholder=" "
                            />
                        </div>
                    </div>

                    {/* Editor Container */}
                    <div className="min-h-[60vh] mt-4">
                        <div className="prose prose-lg dark:prose-invert max-w-none 
                            prose-p:text-zinc-600 dark:prose-p:text-zinc-400 
                            prose-headings:text-zinc-900 dark:prose-headings:text-white 
                            prose-strong:text-zinc-900 dark:prose-strong:text-white 
                            prose-a:text-indigo-500 dark:prose-a:text-indigo-400
                            prose-blockquote:border-l-4 prose-blockquote:border-zinc-200 dark:prose-blockquote:border-zinc-700
                            prose-code:text-indigo-500 dark:prose-code:text-indigo-300 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:rounded prose-code:px-1">
                            <RichTextEditor
                                value={content}
                                onChange={(val, plain) => {
                                    setContent(val);
                                    setPlainContent(plain);
                                }}
                                placeholder="Buraya yazmaya başla..."
                                className="min-h-full border-none shadow-none bg-transparent !p-0 focus:ring-0 text-zinc-600 dark:text-zinc-300 text-lg leading-relaxed"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
