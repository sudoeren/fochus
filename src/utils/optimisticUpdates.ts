// Optimistic UI updates for instant feedback

export const optimisticTaskUpdate = (
  tasks: Record<string, unknown>[],
  taskId: string,
  updates: Record<string, unknown>
) => {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
  );
};

export const optimisticTaskAdd = (
  tasks: Record<string, unknown>[],
  newTask: Record<string, unknown>
) => {
  const tempTask: Record<string, unknown> = {
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

export const optimisticTaskDelete = (tasks: Record<string, unknown>[], taskId: string) => {
  return tasks.filter((task) => task.id !== taskId);
};

export const optimisticNoteUpdate = (
  notes: Record<string, unknown>[],
  noteId: string,
  updates: Record<string, unknown>
) => {
  return notes.map((note) =>
    note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note
  );
};

export const optimisticNoteAdd = (
  notes: Record<string, unknown>[],
  newNote: Record<string, unknown>
) => {
  const tempNote: Record<string, unknown> = {
    ...newNote,
    id: 'temp-' + Date.now(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isPinned: false
  };
  return [...notes, tempNote];
};

export const optimisticNoteDelete = (notes: Record<string, unknown>[], noteId: string) => {
  return notes.filter((note) => note.id !== noteId);
};
