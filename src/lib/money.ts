/**
 * 元 → 分。
 * 特意用字符串解析，而不是 Number(v) * 100 —— 浮点误差会让 1.15 * 100 变成 114.999…，
 * 记账系统里这种误差不可接受。
 */
export function yuanToCents(input: string): number {
  const text = input.trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(text)) {
    throw new Error(`金额格式不正确：${input}`);
  }
  const negative = text.startsWith("-");
  const [intPart, decimalPart = ""] = text.replace("-", "").split(".");
  const cents = Number(intPart) * 100 + Number(decimalPart.padEnd(2, "0"));
  return negative ? -cents : cents;
}

/** 分 → 元，固定两位小数，用于展示 */
export function centsToYuan(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(cents));
  const yuan = Math.floor(abs / 100);
  const fen = abs % 100;
  return `${sign}${yuan}.${String(fen).padStart(2, "0")}`;
}