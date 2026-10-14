"use client";

import { useActionState } from "react";
import { ACCOUNT_TYPE_LABELS } from "@/lib/constants";
import { ACCOUNT_TYPES, type AccountType } from "@/lib/validation";
import {
  archiveAccountAction,
  updateAccountAction,
  type ActionState,
} from "./actions";

const initialState: ActionState = { ok: true };

export function AccountRow({
  id,
  name,
  type,
  initialBalanceYuan,
  balance,
}: {
  id: string;
  name: string;
  type: AccountType;
  initialBalanceYuan: string;
  balance: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateAccountAction,
    initialState,
  );

  return (
    <li className="space-y-1 border-b border-gray-400/40 pb-3">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <input
          name="name"
          defaultValue={name}
          maxLength={20}
          className="flex-1 rounded border border-gray-400 bg-transparent px-3 py-2 text-sm"
        />
        <select
          name="type"
          defaultValue={type}
          className="rounded border border-gray-400 bg-transparent px-2 py-2 text-sm"
        >
          {ACCOUNT_TYPES.map((option) => (
            <option key={option} value={option}>
              {ACCOUNT_TYPE_LABELS[option]}
            </option>
          ))}
        </select>
        <input
          name="initialBalanceYuan"
          defaultValue={initialBalanceYuan}
          className="w-28 rounded border border-gray-400 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded border border-gray-400 px-3 py-2 text-sm disabled:opacity-50"
        >
          保存
        </button>
      </form>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500">当前余额：{balance} 元</span>
        <form action={archiveAccountAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded border border-red-400 px-3 py-1 text-red-500"
          >
            归档
          </button>
        </form>
      </div>

      {state.error ? (
        <p className="text-sm text-red-500">{state.error}</p>
      ) : null}
    </li>
  );
}
