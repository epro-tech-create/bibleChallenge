import { db } from "@/lib/db";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { addMember, createFamily, updateMember } from "@/app/actions";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DeleteFamilyButton } from "@/components/families/delete-family-button";
export const dynamic = "force-dynamic";
export default async function FamiliesPage() {
  await requireRole("ADMIN");
  const families = await db.family.findMany({
    include: {
      members: { orderBy: { fullName: "asc" } },
      _count: { select: { members: true, participants: true } },
    },
    orderBy: { name: "asc" },
  });
  return (
    <DashboardShell title="Fellowship Families" role="ADMIN">
      <section className="mb-6 grid gap-4 rounded-2xl border border-[#e2a54d]/30 bg-[#fffaf0] p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="eyebrow">Family directory</p>
          <h2 className="mt-1 text-xl font-black text-[#104366]">
            {families.length} participating fellowship families
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage the same family directory visible to the public, including
            members and selected challengers.
          </p>
        </div>
        <Link href="/families" className="btn btn-ghost w-fit text-sm">
          Preview public directory
        </Link>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <section className="space-y-5">
          {families.map((f) => (
            <article key={f.id} className="card overflow-hidden">
              <div className="flex items-center justify-between border-b p-5">
                <div>
                  <p className="font-bold text-violet-950">{f.name}</p>
                  <p className="text-sm text-slate-500">
                    DITSCF · {f._count.members} members ·{" "}
                    {f._count.participants} challengers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status status-${f.status}`}>
                    {f.status}
                  </span>
                  <DeleteFamilyButton familyId={f.id} familyName={f.name} />
                </div>
              </div>
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between border-b px-5 py-3 text-sm font-bold text-[#104366] marker:hidden">
                  Manage members
                  <span className="text-xs font-semibold text-slate-500 group-open:hidden">
                    Show editor
                  </span>
                  <span className="hidden text-xs font-semibold text-slate-500 group-open:inline">
                    Hide editor
                  </span>
                </summary>
                <div className="divide-y">
                  {f.members.map((member) => (
                    <form
                      key={member.id}
                      action={updateMember}
                      className="grid gap-2 p-4 sm:grid-cols-[1fr_10rem_auto]"
                    >
                      <input type="hidden" name="memberId" value={member.id} />
                      <input
                        required
                        name="fullName"
                        defaultValue={member.fullName}
                        className="rounded-lg border p-2 text-sm"
                        aria-label="Member name"
                      />
                      <input
                        name="phone"
                        defaultValue={member.phone ?? ""}
                        className="rounded-lg border p-2 text-sm"
                        placeholder="Phone"
                      />
                      <button className="btn btn-ghost text-sm">Update</button>
                    </form>
                  ))}
                  {!f.members.length && (
                    <p className="p-4 text-sm text-slate-500">
                      No members have been added yet.
                    </p>
                  )}
                </div>
                <form
                  action={addMember}
                  className="grid gap-2 border-t bg-slate-50 p-4 sm:grid-cols-[1fr_10rem_auto]"
                >
                  <input type="hidden" name="familyId" value={f.id} />
                  <input
                    required
                    name="fullName"
                    className="rounded-lg border p-2 text-sm"
                    placeholder="Member full name"
                  />
                  <input
                    name="phone"
                    className="rounded-lg border p-2 text-sm"
                    placeholder="Phone"
                  />
                  <button className="btn btn-primary text-sm">
                    Add member
                  </button>
                </form>
              </details>
            </article>
          ))}
        </section>
        <form action={createFamily} className="card h-fit space-y-3 p-5">
          <h2 className="font-bold text-violet-950">Add family</h2>
          {[
            ["name", "Family name", "text"],
            ["phone", "Phone", "tel"],
            ["email", "Email", "email"],
          ].map(([name, label, type]) => (
            <label key={name} className="block text-xs font-bold">
              {label}
              <input
                required
                name={name}
                type={type}
                className="mt-1 w-full rounded-lg border p-2.5 text-sm"
              />
            </label>
          ))}
          <button className="btn btn-primary w-full">Create family</button>
        </form>
      </div>
    </DashboardShell>
  );
}
