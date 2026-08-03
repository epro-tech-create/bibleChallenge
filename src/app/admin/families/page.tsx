import { db } from "@/lib/db";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { addMember, createFamily, updateMember } from "@/app/actions";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DeleteFamilyButton } from "@/components/families/delete-family-button";
import { Plus, Users } from "lucide-react";
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
      <section className="mb-6 overflow-hidden rounded-3xl bg-[#104366] p-6 text-white shadow-lg shadow-[#104366]/15 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e2a54d]">
            Family directory
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {families.length} participating fellowship families
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
            Manage the same family directory visible to the public, including
            members and selected challengers.
          </p>
        </div>
        <Link href="/families" className="btn w-fit bg-white text-sm text-[#104366] hover:bg-blue-50">
          Preview public directory
        </Link>
        </div>
        <div className="mt-6 flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e2a54d] text-[#104366]">
            <Users size={18} />
          </span>
          <span>
            <strong className="block text-base">
              {families.reduce((total, family) => total + family._count.members, 0)}
            </strong>
            <span className="text-blue-100">members in the directory</span>
          </span>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <section className="space-y-5">
          {families.map((f) => (
            <article key={f.id} className="card overflow-hidden transition-shadow hover:shadow-lg">
              <div className="flex items-start justify-between gap-4 border-b border-[#ead4ae] bg-gradient-to-r from-[#fffaf0] to-white p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#104366] text-sm font-black text-[#e2a54d]">
                    {f.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-black text-violet-950">{f.name}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{f.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status status-${f.status}`}>
                    {f.status}
                  </span>
                  <DeleteFamilyButton familyId={f.id} familyName={f.name} />
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x border-b border-slate-100 bg-slate-50/70">
                <p className="px-5 py-3 text-sm text-slate-500">
                  <strong className="mr-1 text-[#104366]">{f._count.members}</strong>
                  members
                </p>
                <p className="px-5 py-3 text-sm text-slate-500">
                  <strong className="mr-1 text-[#104366]">{f._count.participants}</strong>
                  challengers
                </p>
              </div>
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-bold text-[#104366] marker:hidden hover:bg-[#fffaf0]">
                  <span>Manage members</span>
                  <span className="text-xs font-semibold text-slate-500 group-open:hidden">
                    Show editor
                  </span>
                  <span className="hidden text-xs font-semibold text-slate-500 group-open:inline">
                    Hide editor
                  </span>
                </summary>
                <div className="border-t bg-white">
                  {f.members.map((member) => (
                    <form
                      key={member.id}
                      action={updateMember}
                      className="grid gap-2 border-b border-slate-100 p-4 sm:grid-cols-[1fr_10rem_auto]"
                    >
                      <input type="hidden" name="memberId" value={member.id} />
                      <input
                        required
                        name="fullName"
                        defaultValue={member.fullName}
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none transition focus:border-[#104366]"
                        aria-label="Member name"
                      />
                      <input
                        name="phone"
                        defaultValue={member.phone ?? ""}
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none transition focus:border-[#104366]"
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
                  className="grid gap-2 border-t border-[#ead4ae] bg-[#fffaf0] p-4 sm:grid-cols-[1fr_10rem_auto]"
                >
                  <input type="hidden" name="familyId" value={f.id} />
                  <input
                    required
                    name="fullName"
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none transition focus:border-[#104366]"
                    placeholder="Member full name"
                  />
                  <input
                    name="phone"
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none transition focus:border-[#104366]"
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
        <form action={createFamily} className="card h-fit space-y-4 p-5 xl:sticky xl:top-6">
          <div className="flex items-center gap-3 border-b border-[#ead4ae] pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f9edd9] text-[#104366]">
              <Plus size={19} />
            </span>
            <div>
              <p className="eyebrow">Directory</p>
              <h2 className="font-bold text-violet-950">Add family</h2>
            </div>
          </div>
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
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none transition focus:border-[#104366]"
              />
            </label>
          ))}
          <button className="btn btn-primary w-full">Create family</button>
        </form>
      </div>
    </DashboardShell>
  );
}
