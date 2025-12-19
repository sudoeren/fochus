// Optimistic UI updates for instant feedback

export const optimisticTaskUpdate = (tasks: any[], taskId: string, updates: any) => {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
  );
};

export const optimisticTaskAdd = (tasks: any[], newTask: any) => {
  const tempTask = {
    ...newTask,
    id: 'temp-' + Date.now(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isCompleted: false,
    isPinned: false,
    isDeleted: false,
    order: tasks.length
  };
  return [...tasks, tempTask];
};

export const optimisticTaskDelete = (tasks: any[], taskId: string) => {
  return tasks.filter((task) => task.id !== taskId);
};

export const optimisticNoteUpdate = (notes: any[], noteId: string, updates: any) => {
  return notes.map((note) =>
    note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note
  );
};

export const optimisticNoteAdd = (notes: any[], newNote: any) => {
  const tempNote = {
    ...newNote,
    id: 'temp-' + Date.now(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isPinned: false
  };
  return [...notes, tempNote];
};

export const optimisticNoteDelete = (notes: any[], noteId: string) => {
  return notes.filter((note) => note.id !== noteId);
};
