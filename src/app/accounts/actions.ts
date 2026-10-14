"use server";

import { revalidatePath } from "next/cache";
import { accountInputSchema } from "@/lib/validation";
import {
  archiveAccount,
  createAccount,
  updateAccount,
} from "@/server/services/account";

export type ActionState = { ok: boolean; error?: string };

function toMessage(error: unknown) {
  return error instanceof Error ? error.message : "操作失败";
}

function parseAccountForm(formData: FormData) {
  return accountInputSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    type: String(formData.get("type") ?? ""),
    initialBalanceYuan: String(formData.get("initialBalanceYuan") ?? "").trim(),
  });
}

export async function createAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseAccountForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    await createAccount(parsed.data);
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/accounts");
  return { ok: true };
}

export async function updateAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const parsed = parseAccountForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    await updateAccount(id, parsed.data);
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/accounts");
  return { ok: true };
}

export async function archiveAccountAction(formData: FormData): Promise<void> {
  await archiveAccount(String(formData.get("id") ?? ""));
  revalidatePath("/accounts");
}
