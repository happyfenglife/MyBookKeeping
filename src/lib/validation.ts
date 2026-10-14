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

import { yuanToCents } from "@/lib/money";

export const TRANSACTION_TYPES = ["EXPENSE", "INCOME", "TRANSFER"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/** amount 恒为正，方向由 type 决定 —— 所以这里必须是正数 */
export const positiveMoneyInputSchema = moneyInputSchema.refine(
  (value) => yuanToCents(value) > 0,
  "金额必须大于 0",
);

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "请选择日期");

const transactionCommonFields = {
  amountYuan: positiveMoneyInputSchema,
  date: dateStringSchema,
  note: z.string().max(100, "备注最长 100 字").optional(),
};

export const transactionInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("EXPENSE"),
    ...transactionCommonFields,
    categoryId: z.string().min(1, "请选择分类"),
    accountId: z.string().min(1, "请选择账户"),
  }),
  z.object({
    type: z.literal("INCOME"),
    ...transactionCommonFields,
    categoryId: z.string().min(1, "请选择分类"),
    accountId: z.string().min(1, "请选择账户"),
  }),
  z
    .object({
      type: z.literal("TRANSFER"),
      ...transactionCommonFields,
      fromAccountId: z.string().min(1, "请选择转出账户"),
      toAccountId: z.string().min(1, "请选择转入账户"),
    })
    .refine((data) => data.fromAccountId !== data.toAccountId, {
      message: "转出账户与转入账户不能相同",
      path: ["toAccountId"],
    }),
]);

export type TransactionInput = z.infer<typeof transactionInputSchema>;
