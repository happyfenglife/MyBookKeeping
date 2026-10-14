import { z } from "zod";

export const ACCOUNT_TYPES = ["CASH", "DEBIT", "CREDIT", "OTHER"] as const;
export const CATEGORY_KINDS = ["INCOME", "EXPENSE"] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

/** 名称：1~20 字。调用方需先 trim，否则全空格能绕过 min(1) */
export const nameSchema = z
  .string()
  .min(1, "名称不能为空")
  .max(20, "名称最长 20 个字符");

/** 金额输入：来自表单的字符串，最多两位小数 */
export const moneyInputSchema = z
  .string()
  .regex(/^-?\d+(\.\d{1,2})?$/, "金额格式不正确，最多两位小数");

export const categoryCreateSchema = z.object({
  name: nameSchema,
  kind: z.enum(CATEGORY_KINDS),
});

export const categoryRenameSchema = z.object({
  name: nameSchema,
});

export const accountInputSchema = z.object({
  name: nameSchema,
  type: z.enum(ACCOUNT_TYPES),
  // 字段名带上单位，避免和数据库里的「分」混淆
  initialBalanceYuan: moneyInputSchema,
});
