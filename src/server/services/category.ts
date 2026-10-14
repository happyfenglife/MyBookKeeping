import { DEFAULT_USER_ID } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { CategoryKind } from "@/lib/validation";

export function listCategories() {
  return prisma.category.findMany({
    where: { userId: DEFAULT_USER_ID, archived: false },
    orderBy: { createdAt: "asc" },
  });
}

export function createCategory(data: { name: string; kind: CategoryKind }) {
  return prisma.category.create({
    data: { userId: DEFAULT_USER_ID, name: data.name, kind: data.kind },
  });
}

/** 改名：用 updateMany + where 限定归属，update 单条无法顺便校验 userId */
export async function renameCategory(id: string, data: { name: string }) {
  const result = await prisma.category.updateMany({
    where: { id, userId: DEFAULT_USER_ID, archived: false },
    data: { name: data.name },
  });
  if (result.count === 0) {
    throw new Error("分类不存在或已归档");
  }
}

/** 归档而非删除：历史流水还要引用它，删了会让记录悬空 */
export async function archiveCategory(id: string) {
  const result = await prisma.category.updateMany({
    where: { id, userId: DEFAULT_USER_ID, archived: false },
    data: { archived: true },
  });
  if (result.count === 0) {
    throw new Error("分类不存在或已归档");
  }
}
