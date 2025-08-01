// Browser cache system for instant UI updates

const CACHE_KEYS = {
  TASKS: 'fokus_tasks_cache',
  NOTES: 'fokus_notes_cache',
  LAST_UPDATE: 'fokus_last_update'
};

export const cacheData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Cache write failed:', error);
  }
};

export const getCachedData = (key: string, maxAge: number = 30000) => { // 30 seconds max age
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    
    if (age > maxAge) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Cache read failed:', error);
    return null;
  }
};

export const invalidateCache = (key?: string) => {
  if (key) {
    localStorage.removeItem(key);
  } else {
    // Clear all cache
    Object.values(CACHE_KEYS).forEach(cacheKey => {
      localStorage.removeItem(cacheKey);
    });
  }
};

export const cacheTasks = (tasks: any[]) => {
  cacheData(CACHE_KEYS.TASKS, tasks);
};

export const getCachedTasks = () => {
  return getCachedData(CACHE_KEYS.TASKS, 10000); // 10 seconds max age for tasks
};

export const cacheNotes = (notes: any[]) => {
  cacheData(CACHE_KEYS.NOTES, notes);
};

export const getCachedNotes = () => {
  return getCachedData(CACHE_KEYS.NOTES, 10000); // 10 seconds max age for notes
};

export { CACHE_KEYS };
