/**
 * 记账日期只关心"日历上的哪一天"，不关心时区。
 * 统一按 UTC 零点存取 —— 服务器时区（容器里通常是 UTC）不会让日期跨天。
 * 关键：dateStringToUtcDate 和 utcDateToDateString 必须成对使用，不要混用本地时间 API。
 */
export function dateStringToUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Date → "YYYY-MM-DD" */
export function utcDateToDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** 今天的本地日历日 → "YYYY-MM-DD"，用作表单默认值 */
export function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
