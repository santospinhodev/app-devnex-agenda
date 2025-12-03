export function timeStringToMinutes(value: string): number {
  const [hoursStr, minutesStr] = value.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(totalMinutes, 23 * 60 + 59));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}
