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
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full border-2 border-primary/20 p-0 overflow-hidden hover:border-primary/50 transition-all" />}>
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle className="h-6 w-6 text-primary" />
              )}
              <span className="sr-only">Toggle user menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 border-border bg-card shadow-2xl rounded-2xl p-2">
            <DropdownMenuLabel className="p-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-black uppercase tracking-tighter text-foreground italic">
                  {user?.user_metadata?.full_name || "New Athlete"}
                </p>
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
