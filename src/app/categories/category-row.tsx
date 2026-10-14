"use client";

import { useActionState } from "react";
import {
  archiveCategoryAction,
  renameCategoryAction,
  type ActionState,
} from "./actions";

const initialState: ActionState = { ok: true };

export function CategoryRow({ id, name }: { id: string; name: string }) {
  const [state, formAction, isPending] = useActionState(
    renameCategoryAction,
    initialState,
  );

  return (
    <li className="space-y-1">
      <div className="flex items-center gap-2">
        <form action={formAction} className="flex flex-1 items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <input
            name="name"
            defaultValue={name}
            maxLength={20}
            className="flex-1 rounded border border-gray-400 bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded border border-gray-400 px-3 py-2 text-sm disabled:opacity-50"
          >
            保存
          </button>
        </form>

        <form action={archiveCategoryAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded border border-red-400 px-3 py-2 text-sm text-red-500"
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
