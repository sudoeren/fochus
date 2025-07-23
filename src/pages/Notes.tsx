import React, { useState } from 'react';
import { Plus, Tag, Calendar, FileText, Edit, Trash2, Pin } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';

export const Notes: React.FC = () => {
  const { notes, loading, addNote, updateNote, deleteNote, pinNote } = useNotes();
  const [selectedTag, setSelectedTag] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });

  // Filter by selected tag only
  const filteredNotes = selectedTag 
    ? notes.filter(note => {
        try {
          const tags = JSON.parse(note.tags || '[]') as string[];
          return tags.includes(selectedTag);
        } catch {
          return false;
        }
      })
    : notes;
  const allTags = Array.from(new Set(notes.flatMap(note => {
    try {
      return JSON.parse(note.tags || '[]') as string[];
    } catch {
      return [];
    }
  })));

  const handleSaveNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    if (editingNote) {
      await updateNote(editingNote, newNote);
      setEditingNote(null);
    } else {
      await addNote(newNote);
    }

    setNewNote({ title: '', content: '', tags: [] });
    setShowAddModal(false);
  };

  const handleEditNote = (note: any) => {
    setNewNote({
      title: note.title,
      content: note.content,
      tags: note.tags
    });
    setEditingNote(note.id);
    setShowAddModal(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      await deleteNote(id);
    }
  };

  const handleAddTag = (tagInput: string) => {
    const newTags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    setNewNote(prev => ({
      ...prev,
      tags: [...new Set([...prev.tags, ...newTags])]
    }));
  };

  const removeTag = (tagToRemove: string) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Notlar
        </h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Not</span>
        </button>
      </div>

      {/* Filtreleme */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative">
          <Tag className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="">Tüm Etiketler</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notlar Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div 
              key={note.id} 
              data-note-id={note.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {note.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {note.content}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {(() => {
                  try {
                    const tags = JSON.parse(note.tags || '[]') as string[];
                    return tags.map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ));
                  } catch {
                    return null;
                  }
                })()}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{note.createdAt.toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {selectedTag ? 'Seçili etikete uygun not bulunamadı' : 'Henüz not eklenmemiş'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingNote ? 'Notu Düzenle' : 'Yeni Not'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingNote(null);
                  setNewNote({ title: '', content: '', tags: [] });
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Başlık
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Not başlığı..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İçerik
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                  placeholder="Not içeriği..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Etiketler
                </label>
                <input
                  type="text"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Etiket eklemek için yazın ve Enter'a basın (virgülle ayırabilirsiniz)"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {newNote.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingNote(null);
                  setNewNote({ title: '', content: '', tags: [] });
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!newNote.title.trim() || !newNote.content.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                         text-white rounded-lg transition-colors"
              >
                {editingNote ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
