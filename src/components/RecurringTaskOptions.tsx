import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Repeat, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RecurringType } from '../types/index';

interface RecurringTaskOptionsProps {
  isRecurring: boolean;
  recurringType?: RecurringType;
  recurringInterval?: number;
  recurringDays?: number[];
  endDate?: Date;
  onToggleRecurring: (enabled: boolean) => void;
  onUpdatePattern: (pattern: {
    type: RecurringType;
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
  }) => void;
  className?: string;
}

export const RecurringTaskOptions: React.FC<RecurringTaskOptionsProps> = ({
  isRecurring,
  recurringType = 'DAILY',
  recurringInterval = 1,
  recurringDays = [],
  endDate,
  onToggleRecurring,
  onUpdatePattern,
  className = ''
}) => {
  const { t, i18n } = useTranslation();
  const [localType, setLocalType] = useState<RecurringType>(recurringType);
  const [localInterval, setLocalInterval] = useState(recurringInterval);
  const [localDays, setLocalDays] = useState<number[]>(recurringDays);
  const [localEndDate, setLocalEndDate] = useState<string>(
    endDate ? endDate.toISOString().split('T')[0] : ''
  );

  const dayNames = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(2024, 0, i + 1);
        return {
          id: i,
          name: date.toLocaleDateString(i18n.language, { weekday: 'short' })
        };
      }),
    [i18n.language]
  );

  const handleTypeChange = (type: RecurringType) => {
    setLocalType(type);
    if (type === 'WEEKLY' && localDays.length === 0) {
      setLocalDays([new Date().getDay()]);
    }
    updatePattern(type, localInterval, localDays, localEndDate);
  };

  const handleIntervalChange = (interval: number) => {
    setLocalInterval(interval);
    updatePattern(localType, interval, localDays, localEndDate);
  };

  const toggleDay = (dayId: number) => {
    const newDays = localDays.includes(dayId)
      ? localDays.filter((d) => d !== dayId)
      : [...localDays, dayId].sort();

    setLocalDays(newDays);
    updatePattern(localType, localInterval, newDays, localEndDate);
  };

  const handleEndDateChange = (dateStr: string) => {
    setLocalEndDate(dateStr);
    updatePattern(localType, localInterval, localDays, dateStr);
  };

  const updatePattern = (
    type: RecurringType,
    interval: number,
    days: number[],
    endDateStr: string
  ) => {
    onUpdatePattern({
      type,
      interval,
      daysOfWeek: type === 'WEEKLY' ? days : undefined,
      endDate: endDateStr ? new Date(endDateStr) : undefined
    });
  };

  const getIntervalLabel = () => {
    switch (localType) {
      case 'DAILY':
        return t('recurring.day_unit');
      case 'WEEKLY':
        return t('recurring.week_unit');
      case 'MONTHLY':
        return t('recurring.month_unit');
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('recurring.title')}
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => onToggleRecurring(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {isRecurring && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('recurring.type')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`p-2 text-xs rounded border transition-colors ${
                    localType === type
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {t(`recurring.${type.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('recurring.interval')}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('recurring.every')}
              </span>
              <input
                type="number"
                min="1"
                max="365"
                value={localInterval}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{getIntervalLabel()}</span>
            </div>
          </div>

          {localType === 'WEEKLY' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('recurring.days')}
              </label>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`p-2 text-xs rounded border transition-colors ${
                      localDays.includes(day.id)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('recurring.end_date')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={localEndDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {localEndDate && (
                <button
                  onClick={() => handleEndDateChange('')}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{t('recurring.summary')}</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {localType === 'DAILY' && t('recurring.summary_daily', { interval: localInterval })}
              {localType === 'WEEKLY' &&
                t('recurring.summary_weekly', {
                  interval: localInterval,
                  days: localDays
                    .map((d) => dayNames.find((dn) => dn.id === d)?.name ?? '')
                    .join(', ')
                })}
              {localType === 'MONTHLY' &&
                t('recurring.summary_monthly', { interval: localInterval })}
              {localEndDate &&
                t('recurring.until', {
                  date: new Date(localEndDate).toLocaleDateString(i18n.language)
                })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
