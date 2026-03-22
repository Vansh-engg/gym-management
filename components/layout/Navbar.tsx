"use client";

import { Bell, Search, UserCircle, LogOut, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setProfile(data);
      }
    }
    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch profile asynchronously without blocking the user state
        const { data } = await supabase.from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
          
        if (data) setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
    // Hard redirect to clear all client-side state
    window.location.href = "/login";
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile Title (hidden on md) */}
        <div className="md:hidden font-bold tracking-tight text-primary text-xl">
          RK FITNESS
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members, plans..."
              className="w-full bg-background pl-9 md:w-[300px] lg:w-[400px] border-none ring-1 ring-border/50 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="rounded-full border-2 border-primary/20 p-0 overflow-hidden hover:border-primary/50 transition-all h-10 w-10">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle className="h-6 w-6 text-primary" />
              )}
            </Button>
          }>
              <span className="sr-only">Toggle user menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 border-border bg-card shadow-2xl rounded-2xl p-2 mt-2">
            <DropdownMenuLabel className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between gap-2">
                   <p className="text-sm font-black uppercase tracking-tighter text-foreground italic truncate max-w-[140px]">
                     {profile?.full_name || user?.user_metadata?.full_name || (user?.email === 'admin@rkfitness.com' ? 'Admin Chief' : user?.email?.split('@')[0]) || "Athlete"}
                   </p>
                   {profile?.role && (
                     <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] border border-primary/20 shrink-0">
                       {profile.role}
                     </div>
                   )}
                </div>
                <p className="text-[10px] font-bold text-muted-foreground truncate opacity-70">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border opacity-50" />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer rounded-xl py-3 font-bold text-xs uppercase tracking-widest">
              <Settings className="mr-3 h-4 w-4 text-primary" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border opacity-50" />
            <DropdownMenuItem 
              className="text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl py-3 font-black text-xs uppercase tracking-[0.2em] italic" 
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Terminate Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
