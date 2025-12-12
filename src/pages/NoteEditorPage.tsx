import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Save,
    Clock,
    Tag,
    Trash2,
    X,
    Palette
} from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { RichTextEditor } from '../components/RichTextEditor';
import clsx from 'clsx';

interface NoteEditorPageProps {
    noteId?: string;
    onBack: () => void;
}

const NOTE_COLORS = [
    { id: 'default', bg: 'bg-white dark:bg-zinc-950', border: 'border-zinc-200 dark:border-zinc-800' },
    { id: 'yellow', bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800/30' },
    { id: 'green', bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800/30' },
    { id: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800/30' },
    { id: 'purple', bg: 'bg-purple-50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-800/30' },
    { id: 'red', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800/30' },
];

export const NoteEditorPage: React.FC<NoteEditorPageProps> = ({ noteId, onBack }) => {
    const { notes, addNote, updateNote, deleteNote } = useNotes();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // HTML content
    const [plainContent, setPlainContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
    const [showColorPicker, setShowColorPicker] = useState(false);
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

                const color = NOTE_COLORS.find(c => c.id === existingNote.color) || NOTE_COLORS[0];
                setSelectedColor(color);

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
                    color: selectedColor.id,
                    updatedAt: new Date()
                });
            } else {
                await addNote({
                    title,
                    content,
                    plainContent,
                    tags,
                    color: selectedColor.id,
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
    }, [title, content, plainContent, tags, selectedColor]);

    return (
        <div className={clsx("h-full flex flex-col transition-colors duration-300", selectedColor.bg)}>
            {/* Header */}
            <header className={clsx(
                "sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md transition-colors duration-300",
                selectedColor.bg.replace('bg-', 'bg-opacity-80 '),
                selectedColor.border
            )}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 transition-colors"
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
                    {noteId && (
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Sil"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="p-2 rounded-lg text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            title="Renk Değiştir"
                        >
                            <Palette className="w-5 h-5" />
                        </button>
                        {showColorPicker && (
                            <div className="absolute right-0 top-full mt-2 p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 flex gap-2 animate-in fade-in slide-in-from-top-2 z-50">
                                {NOTE_COLORS.map((color) => (
                                    <button
                                        key={color.id}
                                        className={clsx(
                                            "w-6 h-6 rounded-full border border-black/10 dark:border-white/10 ring-offset-2 ring-offset-white dark:ring-offset-zinc-800 transition-all",
                                            color.bg.replace('/10', ''),
                                            selectedColor.id === color.id && "ring-2 ring-zinc-400"
                                        )}
                                        onClick={() => {
                                            setSelectedColor(color);
                                            setShowColorPicker(false);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-2" />

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
