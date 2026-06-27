const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "full",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTimeLong(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatSlotCardDateTime(value: string): string {
  const date = new Date(value);
  const weekday = new Intl.DateTimeFormat("fr-FR", { weekday: "short" })
    .format(date)
    .replace(/\.$/, "")
    .toUpperCase();
  const dayMonth = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  })
    .format(date)
    .toUpperCase();
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(":", "h");

  return `${weekday}. ${dayMonth} • ${time}`;
}

function formatTimeShort(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(":", "h");
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isTomorrow(date: Date, now: Date): boolean {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

export function formatSessionTimeRange(
  scheduledAt: string,
  durationMinutes: number,
  now: Date = new Date(),
): string {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const startTime = formatTimeShort(start);
  const endTime = formatTimeShort(end);

  if (isSameDay(start, now)) {
    return `Aujourd'hui ${startTime} - ${endTime}`;
  }

  if (isTomorrow(start, now)) {
    return `Demain ${startTime} - ${endTime}`;
  }

  const dayLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(start);

  return `${dayLabel} ${startTime} - ${endTime}`;
}

export function toLocalDateTimeInputValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function localDateTimeInputToUtcIso(value: string): string {
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const local = new Date(year, month - 1, day, hour, minute);
  return local.toISOString();
}

export function nextDefaultSlotStart(): Date {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return date;
}
