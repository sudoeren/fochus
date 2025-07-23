import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Pin, Calendar, X } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';

export const Notes: React.FC = () => {
  const { notes, loading, addNote, updateNote, deleteNote, pinNote } = useNotes();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    // Notes sayfalandığında otomatik olarak notları yükle
  }, []);

  const handleSaveNote = async () => {
    if (!newNote.title.trim()) return;

    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          title: newNote.title,
          content: newNote.content
        });
      } else {
        await addNote({
          title: newNote.title,
          content: newNote.content
        });
      }

      // Modal'ı kapat ve formu temizle
      setShowAddModal(false);
      setEditingNote(null);
      setNewNote({ title: '', content: '' });
    } catch (error) {
      console.error('Not kaydedilirken hata:', error);
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content
    });
    setShowAddModal(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error('Not silinirken hata:', error);
      }
    }
  };

  const handlePinNote = async (noteId: string, isPinned: boolean) => {
    try {
      await pinNote(noteId, !isPinned);
    } catch (error) {
      console.error('Not sabitlenirken hata:', error);
    }
  };

  // Pinli notları üstte göster
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Notlar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notlarım</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {notes.length} not • Ctrl+K ile arama yapabilirsiniz
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Not
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              data-note-id={note.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow relative group"
            >
              {/* Pin Button */}
              <button
                onClick={() => handlePinNote(note.id, note.isPinned || false)}
                className={`absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                  note.isPinned 
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 opacity-100' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
                title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
              >
                <Pin className={`w-3 h-3 ${note.isPinned ? 'fill-current' : ''}`} />
              </button>

              {/* Note Content */}
              <div className="pr-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 flex items-center gap-2">
                  {note.isPinned && (
                    <Pin className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                  {note.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-4">
                  {note.content || 'İçerik yok...'}
                </p>
                
                {/* Date */}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-3 h-3 mr-1" />
                  {note.createdAt.toLocaleDateString('tr-TR')}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Henüz notunuz yok
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              İlk notunuzu oluşturmak için "Yeni Not" butonuna tıklayın.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              İlk Notumu Oluştur
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Add/Edit Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingNote ? 'Notu Düzenle' : 'Yeni Not Oluştur'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingNote ? 'Mevcut notunuzu düzenleyin' : 'Yeni bir not oluşturun'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingNote(null);
                  setNewNote({ title: '', content: '' });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Not Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                           placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Notunuza bir başlık verin..."
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Not İçeriği
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                           placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                  placeholder="Notunuzun içeriğini buraya yazın..."
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingNote(null);
                  setNewNote({ title: '', content: '' });
                }}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 
                         hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!newNote.title.trim()}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 
                         disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium
                         disabled:text-gray-500 dark:disabled:text-gray-400"
              >
                {editingNote ? 'Notu Güncelle' : 'Notu Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
