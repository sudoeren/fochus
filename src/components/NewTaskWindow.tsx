import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, CheckCircle2 } from 'lucide-react';
import { Task } from '../types/index';
import { useTasks } from '../hooks/useTasks';
import { useTaskLists } from '../hooks/useTaskLists';
import { triggerInstantRefresh } from '../utils/refreshUtils';

interface NewTaskWindowProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Partial<Task>;
}

export const NewTaskWindow: React.FC<NewTaskWindowProps> = ({ isOpen, onClose, initialData }) => {
    const { addTask, updateTask } = useTasks();
    const { taskLists } = useTaskLists();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<string>('');
    const [isPinned, setIsPinned] = useState(false);
    const [listId, setListId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '');
                setDescription(initialData.description || '');
                setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
                setIsPinned(initialData.isPinned || false);
                setListId(initialData.listId || null);
            } else {
                // Reset fields when opening fresh
                setTitle('');
                setDescription('');
                setDueDate('');
                setIsPinned(false);
                setListId(null);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title.trim()) return;

        try {
            if (initialData && initialData.id) {
                await updateTask(initialData.id, {
                    title,
                    description,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    isPinned,
                    listId: listId || undefined
                });
            } else {
                await addTask({
                    title,
                    description,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    listId: listId || undefined
                });
            }
            triggerInstantRefresh();
            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-zinc-900 dark:text-zinc-100">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg transform rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl transition-all flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {initialData?.id ? 'Görevi Düzenle' : 'Yeni Görev'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="space-y-2 group">
                        <input
                            type="text"
                            placeholder="Ne yapılması gerekiyor?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-xl font-medium bg-transparent border-b border-transparent focus:border-zinc-200 dark:focus:border-zinc-700 placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-0 px-0 py-2 transition-colors"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <textarea
                            placeholder="Detaylar, notlar..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[120px] text-base resize-none bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-4 border border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-200 dark:focus:border-zinc-700 placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all"
                        />
                    </div>

                    {/* Quick Actions / Options */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button
                            onClick={() => (document.getElementById('date-picker') as HTMLInputElement)?.showPicker()}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${dueDate ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                        >
                            <Calendar size={16} />
                            {dueDate ? new Date(dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : 'Tarih'}
                            <input
                                id="date-picker"
                                type="date"
                                className="sr-only"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </button>

                        <button
                            onClick={() => setIsPinned(!isPinned)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${isPinned ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                        >
                            <Flag size={16} className={isPinned ? 'fill-current' : ''} />
                            {isPinned ? 'Öncelikli' : 'Öncelik'}
                        </button>

                        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

                        <select
                            value={listId || ''}
                            onChange={(e) => setListId(e.target.value || null)}
                            className="bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium px-3 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none hover:border-zinc-300 dark:hover:border-zinc-600"
                        >
                            <option value="">Liste Seç (Genel)</option>
                            {taskLists.map(list => (
                                <option key={list.id} value={list.id}>{list.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle2 size={16} />
                        {initialData?.id ? 'Değişiklikleri Kaydet' : 'Görevi Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
};
