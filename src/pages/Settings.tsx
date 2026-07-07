import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  Palette,
  Command,
  Database,
  Info,
  Moon,
  Sun,
  Laptop,
  Check,
  Calendar,
  LogOut,
  Download,
  Upload,
  Shield,
  ChevronRight,
  Lock,
  Key,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sparkles,
  CheckSquare,
  Search,
  Zap,
  Globe,
  Languages,
  Users,
  UserX,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  Settings as SettingsIcon
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { cn } from '../lib/utils';
import {
  authAPI,
  notesAPI,
  pomodoroAPI,
  setAuthToken,
  tasksAPI,
  settingsAPI,
  adminAPI
} from '../services/api';
import { deserializeApiDates } from '../utils/apiTransforms';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// ... (Password Strength Code remains same)

// 6. Admin Section
interface AdminUser {
  id: string;
  username: string;
  name?: string;
  role?: string;
  createdAt: string;
  _count?: { notes?: number; tasks?: number };
}

const AdminSection = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => adminAPI.getUsers() as unknown as Promise<AdminUser[]>
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<{ allowRegistration: boolean }>({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminAPI.getSettings()
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { allowRegistration: boolean }) => adminAPI.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      alert(t('admin.user_deleted'));
    },
    onError: (err: Error) => {
      alert(err.message || t('admin.delete_failed'));
    }
  });

  const promoteUserMutation = useMutation({
    mutationFn: (id: string) => adminAPI.promoteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      alert(t('admin.user_promoted'));
    }
  });

  const handleDeleteUser = (id: string, username: string) => {
    if (confirm(t('admin.confirm_delete_user', { username }))) {
      deleteUserMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* System Settings */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            {t('admin.system_settings')}
          </h3>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-black/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-1">
              {t('admin.registration')}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('admin.registration_desc')}
            </p>
          </div>
          <button
            onClick={() =>
              updateSettingsMutation.mutate({ allowRegistration: !settings?.allowRegistration })
            }
            disabled={settingsLoading || updateSettingsMutation.isPending}
            className={cn(
              'text-3xl transition-colors',
              settings?.allowRegistration ? 'text-emerald-500' : 'text-zinc-300 dark:text-zinc-600'
            )}
          >
            {settings?.allowRegistration ? (
              <ToggleRight className="w-12 h-12" />
            ) : (
              <ToggleLeft className="w-12 h-12" />
            )}
          </button>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            {t('admin.user_management')}
          </h3>
        </div>

        <div className="space-y-4">
          {usersLoading ? (
            <div className="text-center py-4 text-zinc-500">{t('admin.loading')}</div>
          ) : (
            users.map((user: AdminUser) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-black/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                      user.role === 'ADMIN'
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-zinc-900 dark:text-white">{user.username}</h4>
                      {user.role === 'ADMIN' && (
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {user.name} • {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {t('admin.notes_label', { count: user._count?.notes || 0 })} •{' '}
                      {t('admin.tasks_label', { count: user._count?.tasks || 0 })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {user.role !== 'ADMIN' && (
                    <button
                      onClick={() => promoteUserMutation.mutate(user.id)}
                      className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 rounded-lg transition-colors"
                      title={t('admin.make_admin_title')}
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                    title={t('admin.delete_user_title')}
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

// Password strength calculator
const calculatePasswordStrength = (
  password: string
): { score: number; label: string; color: string } => {
  let score = 0;

  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  if (score <= 2) return { score: Math.min(score, 2), label: 'weak', color: 'bg-red-500' };
  if (score <= 4) return { score: Math.min(score, 4), label: 'medium', color: 'bg-yellow-500' };
  return { score, label: 'strong', color: 'bg-emerald-500' };
};

// Password Strength Indicator Component
const PasswordStrengthIndicator: React.FC<{ password: string; t: (key: string) => string }> = ({
  password,
  t
}) => {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              level <= strength.score ? strength.color : 'bg-zinc-200 dark:bg-zinc-700'
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-medium',
            strength.label === 'weak' && 'text-red-500',
            strength.label === 'medium' && 'text-yellow-500',
            strength.label === 'strong' && 'text-emerald-500'
          )}
        >
          {t(`settings.profile.password_${strength.label}`) || strength.label}
        </span>
        {strength.label === 'strong' && <Shield className="w-3.5 h-3.5 text-emerald-500" />}
      </div>
    </div>
  );
};

// --- Tab Component ---
const SettingsTab = ({
  active,
  onClick,
  icon: Icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-out whitespace-nowrap',
      active
        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md transform scale-105'
        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
    )}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

// --- Sections ---

// 1. Profile Section (Updated - Compact)
const ProfileSection = ({ bgImage }: { bgImage: string }) => {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [userData, setUserData] = useState({
    name: t('settings.profile.default_name'),
    username: t('settings.profile.default_username'),
    joinDate: new Date().toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  });
  const [stats, setStats] = useState({ tasks: 0, notes: 0, focusHoursText: '0s' });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: '', username: '' });
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [profileSaveMessage, setProfileSaveMessage] = useState<string | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const meRaw = await authAPI.me();
        const me = deserializeApiDates(meRaw) as Record<string, unknown>;

        if (cancelled) return;

        const resolvedUsername = (me?.username ?? '').toString();
        const resolvedName = (me?.name ?? '').toString().trim() || resolvedUsername;
        const createdAt = me?.createdAt ? new Date(me.createdAt as string) : new Date();

        // Only update if we have real data
        if (resolvedUsername) {
          setUserData({
            name: resolvedName || resolvedUsername,
            username: resolvedUsername,
            joinDate: createdAt.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          });
          setProfileDraft({ name: resolvedName || resolvedUsername, username: resolvedUsername });
        }

        // Load stats separately
        const [tasksRaw, notesRaw, focusRaw] = await Promise.all([
          tasksAPI.getAll().catch(() => []),
          notesAPI.getAll().catch(() => []),
          pomodoroAPI.getStats('all').catch(() => ({}))
        ]);

        if (cancelled) return;

        const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
        const notes = Array.isArray(notesRaw) ? notesRaw : [];
        const focusSeconds = Number(
          (focusRaw as { work?: { duration?: number } })?.work?.duration ?? 0
        );
        const focusHours = Number.isFinite(focusSeconds) ? focusSeconds / 3600 : 0;

        setStats({
          tasks: tasks.length,
          notes: notes.length,
          focusHoursText: `${focusHours.toFixed(1)}s`
        });
      } catch {
        // Keep defaults on failure
      }
    };

    loadProfile();

    const handleTokenChanged = () => {
      loadProfile();
    };

    window.addEventListener('auth:token-changed', handleTokenChanged);
    return () => {
      cancelled = true;
      window.removeEventListener('auth:token-changed', handleTokenChanged);
    };
  }, []);

  const handleSaveProfile = async () => {
    setProfileSaveError(null);
    setProfileSaveMessage(null);
    setIsProfileSaving(true);

    try {
      const nextName = profileDraft.name.trim();
      const nextUsername = profileDraft.username.trim();

      if (!nextName) {
        setProfileSaveError(t('settings.profile.error_name_empty') || 'Name cannot be empty');
        return;
      }

      if (!nextUsername || nextUsername.length < 3) {
        setProfileSaveError(t('settings.profile.error_username_short') || 'Username too short');
        return;
      }

      const updatedRaw = await authAPI.updateProfile({
        name: nextName,
        username: nextUsername
      } as Record<string, unknown>);

      const updated = deserializeApiDates(updatedRaw) as Record<string, unknown>;
      const resolvedUsername = (updated?.username ?? nextUsername).toString();
      const resolvedName =
        (updated?.name ?? nextName).toString().trim() ||
        resolvedUsername ||
        t('settings.profile.default_name');

      setUserData((prev) => ({
        ...prev,
        name: resolvedName,
        username: resolvedUsername
      }));
      setProfileDraft({ name: resolvedName, username: resolvedUsername });
      setIsEditingProfile(false);
      setProfileSaveMessage(t('settings.profile.success_update') || 'Profile updated');
    } catch (e) {
      setProfileSaveError(e instanceof Error ? e.message : 'Error updating profile');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm(t('settings.profile.logout_confirm') || 'Are you sure?')) {
      setAuthToken(null);
      window.dispatchEvent(new Event('auth:logout'));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage(null);
    setPasswordChangeError(null);
    setIsPasswordLoading(true);

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError(
        t('settings.profile.error_password_match') || 'Passwords do not match'
      );
      setIsPasswordLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeError(t('settings.profile.error_password_short') || 'Password too short');
      setIsPasswordLoading(false);
      return;
    }

    try {
      await authAPI.updatePassword({ currentPassword, newPassword });
      setPasswordChangeMessage(t('settings.profile.success_password') || 'Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      // Keep form open
    } catch (err) {
      setPasswordChangeError(err instanceof Error ? err.message : 'Error updating password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const isCustomBg =
    bgImage.startsWith('data:') || bgImage.startsWith('http') || bgImage.startsWith('blob:');

  const showLightBg = bgImage === 'light' || (bgImage === 'default' && !isDark);
  const showDarkBg = bgImage === 'dark' || (bgImage === 'default' && isDark);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
      {/* User Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 group relative">
        {/* Logout Button - Positioned Top Right */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/20 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-full text-white transition-all duration-300 group/logout"
          title={t('settings.profile.logout')}
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* Dynamic Background Header */}
        <div className="absolute top-0 left-0 w-full h-28 overflow-hidden">
          {' '}
          {/* Reduced height */}
          {isCustomBg ? (
            <img
              src={bgImage}
              className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity"
              alt="Profile BG"
            />
          ) : (
            <>
              <img
                src="/light.png"
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-opacity',
                  showLightBg ? 'opacity-50' : 'opacity-0'
                )}
                alt="Light BG"
              />
              <img
                src="/dark.png"
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-opacity',
                  showDarkBg ? 'opacity-50' : 'opacity-0'
                )}
                alt="Dark BG"
              />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-zinc-900" />
        </div>

        <div className="relative pt-16 px-8 pb-6 flex flex-col items-center text-center">
          {profileSaveMessage ? (
            <div className="mb-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-100 dark:border-emerald-800">
              {profileSaveMessage}
            </div>
          ) : null}

          {profileSaveError ? (
            <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold border border-red-100 dark:border-red-800">
              {profileSaveError}
            </div>
          ) : null}

          {/* Name - Click to Edit */}
          {isEditingProfile ? (
            <input
              value={profileDraft.name}
              onChange={(e) => setProfileDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder={t('settings.profile.edit_name')}
              autoFocus
              className="text-2xl font-bold text-center bg-transparent border-b-2 border-indigo-500 dark:border-indigo-400 text-zinc-900 dark:text-white outline-none mb-2 w-48"
            />
          ) : (
            <h2
              onClick={() => {
                setProfileSaveError(null);
                setProfileSaveMessage(null);
                setIsEditingProfile(true);
                setProfileDraft({ name: userData.name, username: userData.username });
              }}
              className="text-2xl font-bold text-zinc-900 dark:text-white mb-0.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Click to edit"
            >
              {userData.name}
            </h2>
          )}

          {/* Username - Click to Edit */}
          {isEditingProfile ? (
            <div className="flex items-center gap-2 mb-3">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <input
                value={profileDraft.username}
                onChange={(e) => setProfileDraft((p) => ({ ...p, username: e.target.value }))}
                placeholder={t('settings.profile.edit_username')}
                className="text-sm bg-transparent border-b border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 outline-none w-32"
              />
            </div>
          ) : (
            <p
              onClick={() => {
                setProfileSaveError(null);
                setProfileSaveMessage(null);
                setIsEditingProfile(true);
                setProfileDraft({ name: userData.name, username: userData.username });
              }}
              className="text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2 text-sm cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="Click to edit"
            >
              <User className="w-3.5 h-3.5" /> @{userData.username}
            </p>
          )}

          {/* Save/Cancel Buttons */}
          {isEditingProfile && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => {
                  setProfileSaveError(null);
                  setProfileSaveMessage(null);
                  setIsEditingProfile(false);
                  setProfileDraft({ name: userData.name, username: userData.username });
                }}
                disabled={isProfileSaving}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                {t('settings.profile.cancel')}
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isProfileSaving}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isProfileSaving ? '...' : t('settings.profile.save')}
              </button>
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-semibold border border-zinc-100 dark:border-zinc-700 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> {t('settings.profile.joined')}:{' '}
              {userData.joinDate}
            </div>
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-900 dark:text-white">{stats.tasks}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {t('settings.profile.stats_tasks')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-900 dark:text-white">{stats.notes}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {t('settings.profile.stats_notes')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-zinc-900 dark:text-white">
                {stats.focusHoursText}
              </div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {t('settings.profile.stats_focus')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t('settings.profile.security_title')}
            </h3>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-3">
          {passwordChangeMessage && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-100 dark:border-emerald-800">
              {passwordChangeMessage}
            </div>
          )}
          {passwordChangeError && (
            <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium border border-red-100 dark:border-red-800">
              {passwordChangeError}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-1">
              {t('settings.profile.current_pass')}
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 pl-10 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Key className="absolute left-3.5 top-3 w-3.5 h-3.5 text-zinc-400" />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-500 transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-1">
                {t('settings.profile.new_pass')}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="******"
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-500 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <PasswordStrengthIndicator password={newPassword} t={t} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-1">
                {t('settings.profile.confirm_pass')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  placeholder="******"
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-500 transition-colors"
                >
                  {showConfirmNewPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={isPasswordLoading}
              className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-lg hover:opacity-90 transition-opacity text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPasswordLoading ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                t('settings.profile.update_btn')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Appearance Section
const ThemeCard = ({
  label,
  icon: Icon,
  previewColors,
  isActive,
  onClick
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  previewColors: { nav: string; primary: string };
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'relative group flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-300 w-full',
      isActive
        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02] shadow-xl shadow-indigo-500/10'
        : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg'
    )}
  >
    <div className="w-full h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3 overflow-hidden relative border border-zinc-200 dark:border-zinc-700">
      <div
        className={cn(
          'absolute top-2 left-2 right-2 h-3 rounded-full opacity-50',
          previewColors.nav
        )}
      />
      <div className="absolute top-7 left-2 w-1/4 bottom-2 rounded-lg opacity-30 bg-zinc-400" />
      <div
        className="absolute top-7 right-2 left-[30%] h-10 rounded-lg opacity-80"
        style={{ background: previewColors.primary }}
      />

      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-[1px]">
          <div className="bg-indigo-600 text-white p-1.5 rounded-full shadow-lg transform scale-110">
            <Check className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>

    <div className="flex items-center gap-2">
      <div
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          isActive ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="font-bold text-xs text-zinc-900 dark:text-white">{label}</span>
    </div>
  </button>
);

const AppearanceSection = ({
  bgImage,
  onBgChange,
  isGlobalBg,
  onToggleGlobalBg
}: {
  bgImage: string;
  onBgChange: (bg: string) => void;
  isGlobalBg: boolean;
  onToggleGlobalBg: (enabled: boolean) => void;
}) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onBgChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
      {/* Language Selection */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                {t('settings.appearance.language_title')}
              </h4>
              <p className="text-xs text-zinc-500">{t('settings.appearance.language_subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => changeLanguage('tr')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-bold transition-all',
                i18n.language.startsWith('tr')
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              )}
            >
              Türkçe
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-bold transition-all',
                i18n.language.startsWith('en')
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              )}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* App Theme */}
      <div>
        <div className="text-center mb-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-0.5">
            {t('settings.appearance.app_theme')}
          </h3>
          <p className="text-xs text-zinc-500">{t('settings.appearance.app_theme_desc')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ThemeCard
            isActive={theme === 'light'}
            onClick={() => setTheme('light')}
            label={t('onboarding.light')}
            icon={Sun}
            previewColors={{ nav: 'bg-zinc-200', primary: '#4f46e5' }}
          />
          <ThemeCard
            isActive={theme === 'dark'}
            onClick={() => setTheme('dark')}
            label={t('onboarding.dark')}
            icon={Moon}
            previewColors={{ nav: 'bg-zinc-700', primary: '#6366f1' }}
          />
          <ThemeCard
            isActive={theme === 'system'}
            onClick={() => setTheme('system')}
            label={t('onboarding.system')}
            icon={Laptop}
            previewColors={{ nav: 'bg-zinc-400', primary: '#818cf8' }}
          />
        </div>
      </div>

      {/* Global Background Toggle */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-xl',
              isGlobalBg
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
            )}
          >
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
              {t('onboarding.global_bg')}
            </h4>
            <p className="text-xs text-zinc-500">{t('onboarding.global_bg_desc')}</p>
          </div>
        </div>
        <button
          onClick={() => onToggleGlobalBg(!isGlobalBg)}
          className={cn(
            'w-12 h-7 rounded-full p-1 transition-colors duration-300',
            isGlobalBg ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'
          )}
        >
          <div
            className={cn(
              'w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300',
              isGlobalBg ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>

      {/* Background Image */}
      <div>
        <div className="text-center mb-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-0.5">
            {t('settings.appearance.home_bg')}
          </h3>
          <p className="text-xs text-zinc-500">{t('settings.appearance.home_bg_desc')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ThemeCard
            isActive={bgImage === 'default' || bgImage === 'light' || bgImage === 'dark'}
            onClick={() => onBgChange('default')}
            label={t('settings.appearance.default')}
            icon={Sparkles}
            previewColors={{ nav: 'bg-zinc-400', primary: '#818cf8' }}
          />

          {/* Upload Custom Image */}
          <div className="relative group w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <ThemeCard
              isActive={bgImage !== 'light' && bgImage !== 'dark' && bgImage !== 'default'}
              onClick={() => undefined} // Controlled by input
              label={t('settings.appearance.upload')}
              icon={Upload}
              previewColors={{ nav: 'bg-emerald-200', primary: '#10b981' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Spotlight Section
const SpotlightSection = ({
  isEnabled,
  onToggle
}: {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-[2rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-24 -mb-24" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left flex-1">
            <h3 className="text-2xl font-bold mb-2">{t('settings.spotlight.enable_title')}</h3>
            <p className="text-zinc-400 text-sm mb-4">{t('settings.spotlight.enable_desc')}</p>
            <div className="flex items-center gap-2">
              <kbd className="bg-white/10 px-3 py-1.5 rounded-lg text-white font-mono text-sm border border-white/10">
                /
              </kbd>
            </div>
          </div>

          {/* Mini Preview */}
          <div className="w-full md:w-72 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl opacity-80">
            <div className="flex items-center gap-3 text-zinc-300 border-b border-white/10 pb-3 mb-3">
              <Command className="w-4 h-4" />
              <span className="text-sm">{t('settings.spotlight.search_title')}...</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-3/4 bg-white/10 rounded" />
              <div className="h-2 w-1/2 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Toggle */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'p-3 rounded-xl transition-colors',
                isEnabled
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              )}
            >
              <Command className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-zinc-900 dark:text-white">
                {t('settings.spotlight.enable_title')}
              </h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t('settings.spotlight.enable_desc')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onToggle(!isEnabled)}
            className={cn(
              'w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
              isEnabled ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300',
                isEnabled ? 'translate-x-6' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>

      {/* Tips - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-500/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
            <Search className="w-4 h-4" />
          </div>
          <h5 className="font-bold text-indigo-900 dark:text-indigo-100 mb-1">
            {t('settings.spotlight.search_title')}
          </h5>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
            {t('settings.spotlight.search_desc')}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-500/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-500/20">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
            <Zap className="w-4 h-4" />
          </div>
          <h5 className="font-bold text-purple-900 dark:text-purple-100 mb-1">
            {t('settings.spotlight.actions_title')}
          </h5>
          <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
            {t('settings.spotlight.actions_desc')}
          </p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
            <CheckSquare className="w-4 h-4" />
          </div>
          <h5 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">
            {t('settings.spotlight.tasks_title')}
          </h5>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
            {t('settings.spotlight.tasks_desc')}
          </p>
        </div>
      </div>
    </div>
  );
};

// 4. Data Section
const LAST_BACKUP_AT_KEY = 'fochus_last_backup_at';

const countBackupItems = (raw: unknown) => {
  const data = ((raw as Record<string, unknown>)?.data ?? raw) as Record<string, unknown>;
  const countArray = (key: string) => {
    const value = data?.[key];
    return Array.isArray(value) ? value.length : 0;
  };

  return {
    version: String(data?.version ?? '-'),
    notes: countArray('notes') + countArray('deletedNotes'),
    tasks: countArray('tasks') + countArray('deletedTasks'),
    taskLists: countArray('taskLists'),
    pomodoroSessions: countArray('pomodoroSessions')
  };
};

const DataSection = () => {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(() =>
    localStorage.getItem(LAST_BACKUP_AT_KEY)
  );

  const handleBackup = async () => {
    try {
      setIsBusy(true);

      const blob = await settingsAPI.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fokus-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      const now = new Date().toISOString();
      localStorage.setItem(LAST_BACKUP_AT_KEY, now);
      setLastBackupAt(now);
    } catch (error) {
      alert(error instanceof Error ? error.message : t('settings.data.backup_error'));
    } finally {
      setIsBusy(false);
    }
  };

  const handleRestoreFile = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const summary = countBackupItems(parsed);

    const ok = confirm(
      t('settings.data.restore_confirm', {
        file: file.name,
        version: summary.version,
        notes: summary.notes,
        tasks: summary.tasks,
        lists: summary.taskLists,
        sessions: summary.pomodoroSessions
      })
    );
    if (!ok) return;

    await settingsAPI.importData(parsed);

    alert(t('settings.data.restore_success'));
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const lastBackupLabel = lastBackupAt
    ? new Date(lastBackupAt).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')
    : t('settings.data.never');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;

          try {
            setIsBusy(true);
            await handleRestoreFile(file);
          } catch (error) {
            alert(error instanceof Error ? error.message : t('settings.data.restore_error'));
          } finally {
            setIsBusy(false);
          }
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={handleBackup}
          disabled={isBusy}
          className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[2.5rem] p-8 text-left transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors" />
          <Download className="w-10 h-10 text-white mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2">{t('settings.data.backup_title')}</h3>
          <p className="text-indigo-100">{t('settings.data.backup_desc')}</p>
        </button>

        <button
          onClick={handleRestoreClick}
          disabled={isBusy}
          className="group relative overflow-hidden bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] p-8 text-left border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Upload className="w-10 h-10 text-zinc-400 group-hover:text-emerald-500 mb-6 transition-colors" />
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {t('settings.data.restore_title')}
          </h3>
          <p className="text-zinc-500">{t('settings.data.restore_desc')}</p>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-5 border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-bold text-zinc-900 dark:text-white">
              {t('settings.data.last_backup')}
            </h4>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{lastBackupLabel}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-[2rem] p-5 border border-amber-100 dark:border-amber-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-amber-700 dark:text-amber-300" />
            <h4 className="font-bold text-amber-900 dark:text-amber-100">
              {t('settings.data.restore_warning_title')}
            </h4>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {t('settings.data.restore_warning_desc')}
          </p>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] p-6 flex items-start gap-4 border border-emerald-100 dark:border-emerald-500/20">
        <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm text-emerald-600 dark:text-emerald-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">
            {t('settings.data.local_title')}
          </h4>
          <p className="text-emerald-700 dark:text-emerald-300 text-sm leading-relaxed">
            {t('settings.data.local_desc')}
          </p>
        </div>
      </div>
    </div>
  );
};

// 5. About Section (Restored - Colorful & Vibrant)
import pkg from '../../package.json';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || pkg.version;

const AboutSection = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const updateStandalone = () => setIsStandalone(mediaQuery.matches);
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    updateStandalone();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    mediaQuery.addEventListener('change', updateStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      mediaQuery.removeEventListener('change', updateStandalone);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome !== 'dismissed') {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Hero Card */}
      <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-800 group">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/20 dark:group-hover:bg-indigo-500/30 transition-colors duration-700" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30 transition-colors duration-700" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden p-2">
            <img
              src={isDark ? '/logo-dark.svg' : '/logo-light.svg'}
              alt="Fochus Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-1">FOCHUS</h2>
          <span className="text-sm font-mono text-zinc-400 dark:text-zinc-500 mb-3 block">
            v{APP_VERSION}
          </span>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            {t('settings.about.desc')}
          </p>
        </div>
      </div>

      {/* Developer & Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Developer Card - Eren Çakar Special */}
        <a
          href="https://erencakar.com"
          target="_blank"
          rel="noopener noreferrer"
          className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-900 text-zinc-900 dark:text-white p-8 rounded-[2.5rem] group hover:scale-[1.02] transition-all duration-500 shadow-2xl border border-indigo-100 dark:border-zinc-800 flex flex-col justify-between min-h-[180px]"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/30 dark:from-indigo-600/20 via-purple-200/30 dark:via-purple-600/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-300/30 dark:bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-400/40 dark:group-hover:bg-indigo-500/30 transition-colors" />

          <div className="relative z-10 flex justify-between items-start">
            <div className="p-3 bg-white/80 dark:bg-white/10 rounded-2xl shadow-sm backdrop-blur-sm border border-indigo-200 dark:border-white/10 text-indigo-600 dark:text-indigo-300">
              <Globe className="w-6 h-6" />
            </div>
            <div className="p-2 bg-white/60 dark:bg-white/5 rounded-full text-indigo-400 dark:text-white/50 group-hover:text-indigo-600 dark:group-hover:text-white group-hover:bg-white dark:group-hover:bg-white/20 transition-all">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          <div className="relative z-10 mt-auto">
            <h4 className="text-3xl font-bold tracking-tight mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-200 transition-colors">
              Eren Çakar
            </h4>
            <p className="text-sm text-indigo-600/70 dark:text-zinc-400 font-medium tracking-wide">
              erencakar.com
            </p>
          </div>
        </a>

        {/* Links Column */}
        <div className="flex flex-col gap-4">
          {/* GitHub Link */}
          <a
            href="https://github.com/sudoeren/fochus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-8 rounded-[2rem] flex items-center justify-between group hover:scale-[1.02] transition-transform duration-300 shadow-xl shadow-zinc-900/10"
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/10 dark:bg-black/10 rounded-full">
                <svg
                  className="w-8 h-8 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.26.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.28-1.575 3.285-1.26 3.285-1.26.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-xl">{t('settings.about.source_code')}</h4>
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  {t('settings.about.view_github')}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t('settings.about.star')}
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 opacity-50 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-300">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white">
              {t('settings.about.install_title')}
            </h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {isStandalone
                ? t('settings.about.install_installed')
                : t('settings.about.install_desc')}
            </p>
          </div>
        </div>
        <button
          onClick={handleInstall}
          disabled={!installPrompt || isStandalone}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
        >
          <Download className="w-4 h-4" />
          {isStandalone ? t('settings.about.installed') : t('settings.about.install')}
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---

interface SettingsProps {
  bgImage?: string;
  onBgChange?: (bg: string) => void;
  isGlobalBg: boolean;
  onToggleGlobalBg: (enabled: boolean) => void;
  isSpotlightEnabled: boolean;
  onToggleSpotlight: (enabled: boolean) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  bgImage = 'light',
  onBgChange = () => {},
  isGlobalBg,
  onToggleGlobalBg,
  isSpotlightEnabled,
  onToggleSpotlight
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch current user to check role
  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => authAPI.me()
  });

  const isAdmin = (currentUser as Record<string, unknown>)?.role === 'ADMIN';

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSection bgImage={bgImage} />;
      case 'appearance':
        return (
          <AppearanceSection
            bgImage={bgImage}
            onBgChange={onBgChange}
            isGlobalBg={isGlobalBg}
            onToggleGlobalBg={onToggleGlobalBg}
          />
        );
      case 'spotlight':
        return <SpotlightSection isEnabled={isSpotlightEnabled} onToggle={onToggleSpotlight} />;
      case 'data':
        return <DataSection />;
      case 'admin':
        return isAdmin ? <AdminSection /> : <ProfileSection bgImage={bgImage} />;
      case 'about':
        return <AboutSection />;
      default:
        return <ProfileSection bgImage={bgImage} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Area - Fixed at top */}
      <div className="flex-none pt-8 pb-6 px-6 lg:px-10 flex flex-col items-center z-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6">
          {t('settings.title')}
        </h1>

        {/* Segmented Control Navigation */}
        <div className="p-1 bg-white dark:bg-zinc-900 rounded-full shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex flex-wrap justify-center gap-1">
          <SettingsTab
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon={User}
            label={t('settings.tabs.profile')}
          />
          <SettingsTab
            active={activeTab === 'appearance'}
            onClick={() => setActiveTab('appearance')}
            icon={Palette}
            label={t('settings.tabs.appearance')}
          />
          <SettingsTab
            active={activeTab === 'spotlight'}
            onClick={() => setActiveTab('spotlight')}
            icon={Command}
            label={t('settings.tabs.spotlight')}
          />
          <SettingsTab
            active={activeTab === 'data'}
            onClick={() => setActiveTab('data')}
            icon={Database}
            label={t('settings.tabs.data')}
          />
          {isAdmin && (
            <SettingsTab
              active={activeTab === 'admin'}
              onClick={() => setActiveTab('admin')}
              icon={Shield}
              label={t('settings.tabs.admin')}
            />
          )}
          <SettingsTab
            active={activeTab === 'about'}
            onClick={() => setActiveTab('about')}
            icon={Info}
            label={t('settings.tabs.about')}
          />
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-10">
        <div className="max-w-4xl mx-auto py-4">{renderContent()}</div>
      </div>
    </div>
  );
};
