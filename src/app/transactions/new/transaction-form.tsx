"use client";

import { useActionState, useState, type ReactNode } from "react";
import { todayDateString } from "@/lib/date";
import { createTransactionAction, type ActionState } from "./actions";

type CategoryOption = { id: string; name: string; kind: string };
type AccountOption = { id: string; name: string };

const TYPE_OPTIONS = [
  { value: "EXPENSE", label: "支出" },
  { value: "INCOME", label: "收入" },
  { value: "TRANSFER", label: "转账" },
] as const;

type FormType = (typeof TYPE_OPTIONS)[number]["value"];

const initialState: ActionState = { ok: true };
const inputClass =
  "w-full rounded border border-gray-400 bg-transparent px-3 py-2 text-sm";

export function TransactionForm({
  categories,
  accounts,
}: {
  categories: CategoryOption[];
  accounts: AccountOption[];
}) {
  const [type, setType] = useState<FormType>("EXPENSE");
  const [state, formAction, isPending] = useActionState(
    createTransactionAction,
    initialState,
  );

  // 只有当前类型的分类才出现在下拉里 —— 这一步就挡住了"支出的钱记到收入分类"
  const availableCategories = categories.filter(
    (category) => category.kind === type,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex gap-2">
        {TYPE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer rounded border px-4 py-2 text-sm ${
              type === option.value
                ? "border-gray-700 font-semibold"
                : "border-gray-400"
            }`}
          >
            <input
              type="radio"
              name="type"
              value={option.value}
              checked={type === option.value}
              onChange={() => setType(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>

      {type === "TRANSFER" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="转出账户">
            <select
              name="fromAccountId"
              className={inputClass}
              defaultValue={accounts[0]?.id ?? ""}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="转入账户">
            <select
              name="toAccountId"
              className={inputClass}
              defaultValue={accounts[1]?.id ?? ""}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="分类">
            <select name="categoryId" className={inputClass}>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="账户">
            <select
              name="accountId"
              className={inputClass}
              defaultValue={accounts[0]?.id ?? ""}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="金额（元）">
          <input
            name="amountYuan"
            inputMode="decimal"
            placeholder="0.00"
            className={inputClass}
          />
        </Field>
        <Field label="日期">
          <input
            type="date"
            name="date"
            defaultValue={todayDateString()}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="备注（可选）">
        <input name="note" maxLength={100} className={inputClass} />
      </Field>

      {state.error ? (
        <p className="text-sm text-red-500">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-700 px-5 py-2 text-sm text-white disabled:opacity-50"
      >
        {isPending ? "保存中…" : "保存"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-gray-500">{label}</span>
      {children}
    </label>
  );
}
