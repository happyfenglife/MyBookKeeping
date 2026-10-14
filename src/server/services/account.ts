import { DEFAULT_USER_ID } from "@/lib/constants";
import { yuanToCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import type { AccountType } from "@/lib/validation";

type AccountInput = {
  name: string;
  type: AccountType;
  initialBalanceYuan: string;
};

/**
 * 账户 + 当前余额。
 * 余额实时计算，不落库 —— 一旦存成字段，转账和编辑记录后就会不一致。
 */
export async function listAccountsWithBalance() {
  const accounts = await prisma.account.findMany({
    where: { userId: DEFAULT_USER_ID, archived: false },
    orderBy: { createdAt: "asc" },
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: DEFAULT_USER_ID },
    select: {
      type: true,
      amount: true,
      accountId: true,
      fromAccountId: true,
      toAccountId: true,
    },
  });

  const deltas = new Map<string, number>();
  const addDelta = (accountId: string | null, value: number) => {
    if (!accountId) return;
    deltas.set(accountId, (deltas.get(accountId) ?? 0) + value);
  };

  // 转账金额一次，但在两个账户上方向相反：转出账户扣、转入账户加
  for (const transaction of transactions) {
    if (transaction.type === "EXPENSE") {
      addDelta(transaction.accountId, -transaction.amount);
    } else if (transaction.type === "INCOME") {
      addDelta(transaction.accountId, transaction.amount);
    } else if (transaction.type === "TRANSFER") {
      addDelta(transaction.fromAccountId, -transaction.amount);
      addDelta(transaction.toAccountId, transaction.amount);
    }
  }

  return accounts.map((account) => ({
    ...account,
    // 库里 type 是字符串列，取值由输入校验保证，这里收敛回联合类型
    type: account.type as AccountType,
    balance: account.initialBalance + (deltas.get(account.id) ?? 0),
  }));
}

export function createAccount(data: AccountInput) {
  return prisma.account.create({
    data: {
      userId: DEFAULT_USER_ID,
      name: data.name,
      type: data.type,
      initialBalance: yuanToCents(data.initialBalanceYuan),
    },
  });
}

export async function updateAccount(id: string, data: AccountInput) {
  const result = await prisma.account.updateMany({
    where: { id, userId: DEFAULT_USER_ID, archived: false },
    data: {
      name: data.name,
      type: data.type,
      initialBalance: yuanToCents(data.initialBalanceYuan),
    },
  });
  if (result.count === 0) {
    throw new Error("账户不存在或已归档");
  }
}

export async function archiveAccount(id: string) {
  const result = await prisma.account.updateMany({
    where: { id, userId: DEFAULT_USER_ID, archived: false },
    data: { archived: true },
  });
  if (result.count === 0) {
    throw new Error("账户不存在或已归档");
  }
}
