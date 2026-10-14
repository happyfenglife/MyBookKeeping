/** v1 单用户，所有数据都挂在这个用户下；v2 接入登录后改由会话决定 */
import type { AccountType } from "@/lib/validation";

export const DEFAULT_USER_ID = "default-user";

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CASH: "现金",
  DEBIT: "储蓄卡",
  CREDIT: "信用卡",
  OTHER: "其他",
};