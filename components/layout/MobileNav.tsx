"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Dumbbell, CreditCard, Settings } from 'lucide-react';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface MobileNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MobileNav({ className, ...props }: MobileNavProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (profile) setIsAdmin(profile.role === 'ADMIN');
        else if (user.email === 'admin@rkfitness.com') setIsAdmin(true);
      }
    }
    checkRole();
  }, []);

  const allLinks = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
    { name: 'Members', href: '/dashboard/members', icon: Users, adminOnly: true },
    { name: 'Plans', href: '/dashboard/plans', icon: Dumbbell, adminOnly: true },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, adminOnly: true },
    { name: 'Profile', href: '/dashboard/profile', icon: Settings, adminOnly: false },
  ];

  const links = allLinks.filter(link => !link.adminOnly || isAdmin);

  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 z-50 flex h-20 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.5)] justify-around items-center px-2 pb-safe", className)} {...props}>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <link.icon className={cn("h-6 w-6 mb-1", isActive && "text-primary filter drop-shadow-[0_0_8px_rgba(197,99,12,0.8)]")} />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
