"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { isAdmin } from "@/lib/firestore";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (user) => {
      if (user && (await isAdmin(user.email))) router.replace("/admin");
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      return toast.error("Please fill in both email and password.");
    }
    if (!auth) return toast.error("Firebase auth is not configured.");

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!(await isAdmin(cred.user.email))) {
        throw new Error("You do not have store administrator permissions.");
      }
      toast.success("Welcome back, Admin!");
      router.push("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-black via-neutral-950 to-red-950/30 p-4 text-white">
      <Card className="w-full max-w-md space-y-5 border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 backdrop-blur shadow-2xl">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </a>
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center text-center pt-2">
          <Logo />
          <h1 className="text-2xl font-black text-white mt-4 tracking-tight">Admin Portal</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Sign in with your store credentials to access inventory and sales management.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Email Address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="admin@kuyapahipak.com"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-black/50 border-neutral-700 text-white focus-visible:ring-red-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="••••••••••••"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-black/50 border-neutral-700 text-white focus-visible:ring-red-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-5 text-sm font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500/30 text-white transition mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
              </span>
            ) : (
              "Sign In to Dashboard →"
            )}
          </Button>
        </form>

        <div className="text-center pt-2">
          <a href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition">
            ← Return to Public Catalog
          </a>
        </div>
      </Card>
    </div>
  );
}
