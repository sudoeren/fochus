// Global refresh utilities - Optimized and Clean
// Removed aggressive polling to stop console noise and performance issues

export const refreshAllTasks = () => {
  window.dispatchEvent(new CustomEvent('refresh-tasks'));
};

export const refreshAllNotes = () => {
  window.dispatchEvent(new CustomEvent('refresh-notes'));
};

export const refreshAll = () => {
  refreshAllTasks();
  refreshAllNotes();
};

// Polling removed - relying on optimistic updates and manual triggers
export const setupFastPolling = () => {
  // No-op to keep compatibility with existing calls
};

export const triggerInstantRefresh = () => {
  refreshAll();
};

export default {
  refreshAllTasks,
  refreshAllNotes,
  refreshAll,
  setupFastPolling,
  triggerInstantRefresh
};