"use server";

import { revalidatePath } from "next/cache";
import { categoryCreateSchema, categoryRenameSchema } from "@/lib/validation";
import {
  archiveCategory,
  createCategory,
  renameCategory,
} from "@/server/services/category";

export type ActionState = { ok: boolean; error?: string };

function toMessage(error: unknown) {
  return error instanceof Error ? error.message : "操作失败";
}

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = categoryCreateSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    kind: String(formData.get("kind") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    await createCategory(parsed.data);
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/categories");
  return { ok: true };
}

export async function renameCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const parsed = categoryRenameSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    await renameCategory(id, parsed.data);
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/categories");
  return { ok: true };
}

export async function archiveCategoryAction(formData: FormData): Promise<void> {
  await archiveCategory(String(formData.get("id") ?? ""));
  revalidatePath("/categories");
}
