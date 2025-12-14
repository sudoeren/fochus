const DATE_KEYS = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'dueDate',
  'reminderAt',
  'lastCompleted',
  'nextDue',
  'startTime',
  'endTime'
]);

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export function deserializeApiDates<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(deserializeApiDates) as T;
  }

  if (!isPlainObject(input)) {
    return input;
  }

  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) {
      output[key] = value;
      continue;
    }

    if (DATE_KEYS.has(key) && typeof value === 'string') {
      const parsed = new Date(value);
      output[key] = Number.isNaN(parsed.getTime()) ? value : parsed;
      continue;
    }

    output[key] = deserializeApiDates(value as never);
  }

  return output as T;
}
