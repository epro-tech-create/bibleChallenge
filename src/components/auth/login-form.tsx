"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) return setError("Email or password is incorrect.");
    router.push("/dashboard");
    router.refresh();
  }
  return (
    <form action={submit} className="space-y-4">
      <label className="block text-sm font-bold">
        Email
        <input
          required
          name="email"
          type="email"
          className="mt-1 w-full rounded-xl border border-slate-200 p-3"
        />
      </label>
      <label className="block text-sm font-bold">
        Password
        <input
          required
          name="password"
          type="password"
          className="mt-1 w-full rounded-xl border border-slate-200 p-3"
        />
      </label>
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      <button
        disabled={loading}
        className="btn btn-primary w-full"
        type="submit"
      >
        {loading ? "Signing in…" : "Enter BibleChallenge"}
      </button>
    </form>
  );
}
