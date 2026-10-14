"use server";

import { revalidatePath } from "next/cache";
import { transactionInputSchema } from "@/lib/validation";
import { createTransaction } from "@/server/services/transaction";

export type ActionState = { ok: boolean; error?: string };

export async function createTransactionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const type = String(formData.get("type") ?? "");
  const noteText = String(formData.get("note") ?? "").trim();

  const common = {
    type,
    amountYuan: String(formData.get("amountYuan") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    note: noteText === "" ? undefined : noteText,
  };

  // 按类型只取该类型应有的字段，其余字段根本不进 raw，避免脏数据混入
  const raw =
    type === "TRANSFER"
      ? {
          ...common,
          fromAccountId: String(formData.get("fromAccountId") ?? ""),
          toAccountId: String(formData.get("toAccountId") ?? ""),
        }
      : {
          ...common,
          categoryId: String(formData.get("categoryId") ?? ""),
          accountId: String(formData.get("accountId") ?? ""),
        };

  const parsed = transactionInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    await createTransaction(parsed.data);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "保存失败",
    };
  }

  revalidatePath("/transactions");
  // 余额是实时算出来的，记完一笔账户页必须一起刷新，否则看到的还是旧余额
  revalidatePath("/accounts");
  return { ok: true };
}
