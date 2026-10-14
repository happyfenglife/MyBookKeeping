"use client";

import { useActionState } from "react";
import { createCategoryAction, type ActionState } from "./actions";

const initialState: ActionState = { ok: true };

export function CategoryForm({ kind }: { kind: "INCOME" | "EXPENSE" }) {
  const [state, formAction, isPending] = useActionState(
    createCategoryAction,
    initialState,
  );

  return (
    <div className="space-y-1">
      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="kind" value={kind} />
        <input
          name="name"
          placeholder="新分类名称"
          maxLength={20}
          className="flex-1 rounded border border-gray-400 bg-transparent px-3 py-2 text-sm"
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
