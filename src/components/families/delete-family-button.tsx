"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteFamily } from "@/app/actions";

export function DeleteFamilyButton({
  familyId,
  familyName,
}: {
  familyId: string;
  familyName: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          window.confirm(
            `Delete ${familyName}? This also removes its members, participants, and scores.`,
          )
        )
          startTransition(async () => {
            const formData = new FormData();
            formData.set("familyId", familyId);
            await deleteFamily(formData);
          });
      }}
      className="btn border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
    >
      <Trash2 size={15} />
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
