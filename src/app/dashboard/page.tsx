import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
export default async function DashboardRedirect() {
  const session = await getSession();
  if (!session) redirect("/login");
  const path =
    session.user.role === "ADMIN"
      ? "/admin"
      : session.user.role === "FAMILY_LEADER"
        ? "/families"
        : "/participant";
  redirect(path);
}
