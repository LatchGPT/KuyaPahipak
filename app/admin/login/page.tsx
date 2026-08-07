"use client";

import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (user) => {
      if (user && (await isAdmin(user.email))) router.replace("/admin");
    });
  }, [router]);

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-black via-slate-950 to-indigo-950 p-4 text-white">
      <Card className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <h1 className="text-xl font-bold">Admin Login</h1>
        <Input placeholder="Admin email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button
          className="w-full"
          onClick={async () => {
            if (!auth) return toast.error("Firebase auth is not configured.");
            try {
              const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
              if (!(await isAdmin(cred.user.email))) throw new Error("Not authorized");
              router.push("/admin");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Failed to sign in");
            }
          }}
        >
          Login
        </Button>
      </Card>
    </div>
  );
}
