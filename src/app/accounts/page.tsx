import { Suspense } from "react";
import { centsToYuan } from "@/lib/money";
import { listAccountsWithBalance } from "@/server/services/account";
import { AccountForm } from "./account-form";
import { AccountRow } from "./account-row";

export default function AccountsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">账户管理</h1>
      <Suspense fallback={<p className="text-sm text-gray-500">加载中…</p>}>
        <AccountSection />
      </Suspense>
    </main>
  );
}

async function AccountSection() {
  const accounts = await listAccountsWithBalance();
  const netWorth = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <section className="space-y-4">
      <AccountForm />

      <ul className="space-y-3">
        {accounts.map((account) => (
          <AccountRow
            key={account.id}
            id={account.id}
            name={account.name}
            type={account.type}
            initialBalanceYuan={centsToYuan(account.initialBalance)}
            balance={centsToYuan(account.balance)}
          />
        ))}
        {accounts.length === 0 ? (
          <li className="text-sm text-gray-500">还没有账户</li>
        ) : null}
      </ul>

      <p className="text-sm font-medium">
        净资产合计：{centsToYuan(netWorth)} 元
      </p>
    </section>
  );
}
