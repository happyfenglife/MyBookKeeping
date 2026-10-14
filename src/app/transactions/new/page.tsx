import { Suspense } from "react";
import { listAccounts } from "@/server/services/account";
import { listCategories } from "@/server/services/category";
import { TransactionForm } from "./transaction-form";

export default function NewTransactionPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">记一笔</h1>
      <Suspense fallback={<p className="text-sm text-gray-500">加载中…</p>}>
        <FormSection />
      </Suspense>
    </main>
  );
}

async function FormSection() {
  const [categories, accounts] = await Promise.all([
    listCategories(),
    listAccounts(),
  ]);

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        请先在「账户」页至少创建一个账户。
      </p>
    );
  }

  // 只传需要的字段：不要把 Date 等对象塞进客户端组件
  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
    kind: category.kind,
  }));

  return <TransactionForm categories={categoryOptions} accounts={accounts} />;
}
