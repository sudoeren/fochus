// Global refresh utilities for INSTANT real-time updates

// Trigger refresh for all tasks across the app
export const refreshAllTasks = () => {
  console.log('🔄 INSTANT refresh: All tasks');
  window.dispatchEvent(new CustomEvent('refresh-tasks'));
};

// Trigger refresh for all notes across the app
export const refreshAllNotes = () => {
  console.log('🔄 INSTANT refresh: All notes');
  window.dispatchEvent(new CustomEvent('refresh-notes'));
};

// Trigger refresh for everything
export const refreshAll = () => {
  console.log('🔄 INSTANT refresh: Everything');
  refreshAllTasks();
  refreshAllNotes();
};

// ULTRA FAST polling system for instant updates
export const setupFastPolling = () => {
  console.log('⚡ ULTRA FAST polling system başlatıldı (500ms intervals)');
  
  // Her 500ms'de bir kontrol et - ULTRA FAST!
  setInterval(() => {
    refreshAll();
  }, 500);
  
  // Sayfa değişimlerinde instant refresh - daha sık kontrol
  let lastPath = window.location.hash;
  setInterval(() => {
    if (window.location.hash !== lastPath) {
      lastPath = window.location.hash;
      console.log('⚡ Route değişti, ULTRA FAST refresh!');
      setTimeout(refreshAll, 10); // 10ms delay for ultra speed
    }
  }, 50); // Her 50ms kontrol et
};

// INSTANT refresh when data changes - ULTRA AGGRESSIVE
export const triggerInstantRefresh = () => {
  console.log('⚡ ULTRA INSTANT trigger refresh');
  
  // 5 kez ardışık refresh - kaçırma şansı yok!
  refreshAll();
  setTimeout(refreshAll, 10);
  setTimeout(refreshAll, 50);
  setTimeout(refreshAll, 100);
  setTimeout(refreshAll, 200);
  setTimeout(refreshAll, 500);
};

// Export for use in components
export default {
  refreshAllTasks,
  refreshAllNotes,
  refreshAll,
  setupFastPolling,
  triggerInstantRefresh
};
