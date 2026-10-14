import { Suspense } from "react";
import { listCategories } from "@/server/services/category";
import { CategoryForm } from "./category-form";
import { CategoryRow } from "./category-row";

// 注意：本项目开启了 cacheComponents，不要写 `export const dynamic`，
// 动态数据靠 Suspense 边界声明（见下方 CategorySections）
export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">分类管理</h1>
      <Suspense fallback={<p className="text-sm text-gray-500">加载中…</p>}>
        <CategorySections />
      </Suspense>
    </main>
  );
}

async function CategorySections() {
  const categories = await listCategories();
  const expenseCategories = categories.filter(
    (category) => category.kind === "EXPENSE",
  );
  const incomeCategories = categories.filter(
    (category) => category.kind === "INCOME",
  );

  return (
    <>
      <Section title="支出分类" kind="EXPENSE" categories={expenseCategories} />
      <Section title="收入分类" kind="INCOME" categories={incomeCategories} />
    </>
  );
}

function Section({
  title,
  kind,
  categories,
}: {
  title: string;
  kind: "INCOME" | "EXPENSE";
  categories: { id: string; name: string }[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <CategoryForm kind={kind} />
      <ul className="space-y-2">
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            id={category.id}
            name={category.name}
          />
        ))}
        {categories.length === 0 ? (
          <li className="text-sm text-gray-500">还没有分类</li>
        ) : null}
      </ul>
    </section>
  );
}
