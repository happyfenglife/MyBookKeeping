"use client";

import { useActionState } from "react";
import { ACCOUNT_TYPE_LABELS } from "@/lib/constants";
import { ACCOUNT_TYPES } from "@/lib/validation";
import { createAccountAction, type ActionState } from "./actions";

const initialState: ActionState = { ok: true };

export function AccountForm() {
  const [state, formAction, isPending] = useActionState(
    createAccountAction,
    initialState,
  );

  return (
    <div className="space-y-1">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input
          name="name"
          placeholder="账户名称"
          maxLength={20}
          className="flex-1 rounded border border-gray-400 bg-transparent px-3 py-2 text-sm"
        />
        <select
          name="type"
          defaultValue="DEBIT"
          className="rounded border border-gray-400 bg-transparent px-2 py-2 text-sm"
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type} value={type}>
              {ACCOUNT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <input
          name="initialBalanceYuan"
          defaultValue="0.00"
          className="w-28 rounded border border-gray-400 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-gray-700 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isPending ? "保存中…" : "添加"}
        </button>
      </form>
      {state.error ? (
        <p className="text-sm text-red-500">{state.error}</p>
      ) : null}
    </div>
  );
}
