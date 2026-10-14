import { DEFAULT_USER_ID } from "@/lib/constants";
import { dateStringToUtcDate } from "@/lib/date";
import { yuanToCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import type { TransactionInput } from "@/lib/validation";

export async function createTransaction(data: TransactionInput) {
  const amount = yuanToCents(data.amountYuan);
  const date = dateStringToUtcDate(data.date);
  const note = data.note ?? null;

  if (data.type === "TRANSFER") {
    await assertAccount(data.fromAccountId, "转出账户");
    await assertAccount(data.toAccountId, "转入账户");

    return prisma.transaction.create({
      data: {
        userId: DEFAULT_USER_ID,
        type: "TRANSFER",
        amount,
        date,
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        note,
      },
    });
  }

  await assertAccount(data.accountId, "账户");
  await assertCategoryMatches(data.categoryId, data.type);

  return prisma.transaction.create({
    data: {
      userId: DEFAULT_USER_ID,
      type: data.type,
      amount,
      date,
      categoryId: data.categoryId,
      accountId: data.accountId,
      note,
    },
  });
}

async function assertAccount(accountId: string, label: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: DEFAULT_USER_ID, archived: false },
    select: { id: true },
  });
  if (!account) {
    throw new Error(`${label}不存在或已归档`);
  }
}

/**
 * 这里是本步最该理解的分工：
 * 格式校验（金额是不是数字、日期格式对不对）在 Zod，边界层就能拦；
 * 而"这个分类是不是支出分类"只有查库才知道 —— 业务规则归 service。
 */
async function assertCategoryMatches(
  categoryId: string,
  kind: "EXPENSE" | "INCOME",
) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: DEFAULT_USER_ID, archived: false },
    select: { kind: true },
  });
  if (!category) {
    throw new Error("分类不存在或已归档");
  }
  if (category.kind !== kind) {
    throw new Error("分类类型与记录类型不匹配");
  }
}
