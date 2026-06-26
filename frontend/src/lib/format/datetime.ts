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

export function toLocalDateTimeInputValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}
