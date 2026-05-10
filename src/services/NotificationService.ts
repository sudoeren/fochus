import { NotificationOptions } from '../types/index';
import i18n from '../i18n';

class NotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  isAvailable(): boolean {
    return this.isSupported;
  }

  getPermission(): NotificationPermission {
    this.permission = this.isSupported ? Notification.permission : 'denied';
    return this.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Bu tarayıcı bildirim desteklemiyor');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Bildirim izni reddedildi');
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  async show(options: NotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      console.warn('Bildirim gösterilemiyor: İzin yok');
      return;
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon.png',
      silent: options.silent || false,
      tag: options.tag || 'fokus-app',
      requireInteraction: true
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    notification.onclick = () => {
      // Focus the app window
      notification.close();
    };
  }

  async showTaskReminder(taskTitle: string, dueDate?: Date): Promise<void> {
    const body = dueDate
      ? i18n.t('notifications.due_date', {
          date: dueDate.toLocaleDateString(),
          time: dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      : i18n.t('notifications.task_reminder');

    await this.show({
      title: `📋 ${taskTitle}`,
      body,
      tag: 'task-reminder'
    });
  }

  async showNoteReminder(noteTitle: string): Promise<void> {
    await this.show({
      title: `📝 ${noteTitle}`,
      body: i18n.t('notifications.note_reminder'),
      tag: 'note-reminder'
    });
  }

  async showRecurringTaskReminder(taskTitle: string): Promise<void> {
    await this.show({
      title: `🔄 ${taskTitle}`,
      body: i18n.t('notifications.recurring_reminder'),
      tag: 'recurring-task'
    });
  }

  scheduleReminder(date: Date, callback: () => void): number {
    const now = new Date();
    const delay = date.getTime() - now.getTime();

    if (delay <= 0) {
      callback();
      return -1;
    }

    return window.setTimeout(callback, delay);
  }

  cancelReminder(id: number): void {
    if (id > 0) {
      clearTimeout(id);
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();
