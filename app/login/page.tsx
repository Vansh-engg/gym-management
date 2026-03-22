"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dumbbell, ArrowRight, Mail, Lock, Loader2, Chrome, ShieldCheck, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName,
              role: role,
            }
          }
        });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else if (!isLogin) {
      setError("Please check your email for the confirmation link!");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-border border-2 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2.5rem] p-1">
          <div className="bg-background/80 rounded-[2.3rem] p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4">
               <motion.div 
                 whileHover={{ scale: 1.05, rotate: 5 }}
                 className="h-16 w-16 bg-primary/10 rounded-[20px] flex items-center justify-center border-2 border-primary/20 shadow-glow"
               >
                 <Dumbbell className="h-8 w-8 text-primary" />
               </motion.div>
               <div className="space-y-1">
                  <h1 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">
                    {isLogin ? `${role} LOGIN` : "CREATE PROFILE"}
                  </h1>
                  <p className="text-muted-foreground font-bold text-xs max-w-[240px]">
                    {isLogin ? `Access your ${role.toLowerCase()} command center.` : "Join the world's most elite fitness club."}
                  </p>
               </div>
            </div>

            {/* Role Switcher (Only on Login) */}
            {isLogin && (
              <div className="flex p-1 bg-muted rounded-xl border-2 border-border/50">
                <button
                  onClick={() => setRole("MEMBER")}
                  className={cn(
                    "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    role === "MEMBER" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Member
                </button>
                <button
                  onClick={() => setRole("ADMIN")}
                  className={cn(
                    "flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    role === "ADMIN" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Admin
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-12 bg-card hover:bg-muted border-2 border-border rounded-xl gap-3 text-sm font-black transition-all shadow-sm active:scale-95"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="h-5 w-5 text-primary" />
                <span>Sign in with Google</span>
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-border" /></div>
                <div className="relative flex justify-center text-[10px]"><span className="bg-background px-4 text-muted-foreground font-black uppercase tracking-[0.2em] italic opacity-60 text-[9px]">Authentication</span></div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="relative group">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder="Your Full Name"
                          className="pl-12 h-12 bg-card border-2 border-transparent focus:border-primary/40 focus:bg-background rounded-xl font-bold text-sm"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder={role === "ADMIN" ? "Admin Identifier" : "Username / Email"}
                    className="pl-12 h-12 bg-card border-2 border-transparent focus:border-primary/40 focus:bg-background rounded-xl font-bold text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    placeholder="Access Code"
                    className="pl-12 h-12 bg-card border-2 border-transparent focus:border-primary/40 focus:bg-background rounded-xl font-bold text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-xl bg-destructive/10 text-destructive text-[11px] font-black border-2 border-destructive/20 flex items-center gap-2 italic"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl text-base uppercase italic shadow-lg hover:shadow-primary/40 transition-all active:scale-95 group mt-2"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                       {isLogin ? "Bypass Security" : "Register Access"}
                       <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center gap-6 text-center pt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-widest border-b-2 border-transparent hover:border-primary pb-1"
              >
                {isLogin ? "Request New Membership" : "Return to Headquarters"}
              </button>
              
              {isLogin && role === "ADMIN" && (
                <div className="flex flex-col gap-1 items-center opacity-40 hover:opacity-100 transition-opacity">
                   <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Testing Environment</div>
                   <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-full">
                     ID: admin@rkfitness.com / PWD: admin12345
                   </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
