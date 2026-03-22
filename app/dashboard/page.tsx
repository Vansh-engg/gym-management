"use client";

import { useEffect, useState } from "react";
import { supabase, type Profile, type GymMember } from "@/lib/supabase";
import { Loader2, ArrowUpRight, Crown, Clock, CreditCard, ShieldCheck, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", revenue: 4000, members: 240 },
  { name: "Feb", revenue: 3000, members: 221 },
  { name: "Mar", revenue: 5000, members: 250 },
  { name: "Apr", revenue: 7000, members: 280 },
  { name: "May", revenue: 6000, members: 265 },
  { name: "Jun", revenue: 9000, members: 310 },
  { name: "Jul", revenue: 11000, members: 350 },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [member, setMember] = useState<GymMember | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalRevenue: 0,
    activePlans: 0,
    expiringSoon: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
          setProfile(profileData);

          const isEmail = profileData?.full_name?.includes("@");
          const isPlaceholder = profileData?.full_name === "New Athlete";
          if (!profileData?.full_name || isEmail || isPlaceholder) {
            setShowOnboarding(true);
          }

          if (profileData?.role === "ADMIN") {
            // Fetch Admin Stats
            const [membersRes, revenueRes, activeRes, expiringRes] = await Promise.all([
              supabase.from('members').select('*', { count: 'exact', head: true }),
              supabase.from('payments').select('amount').eq('status', 'Paid'),
              supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
              supabase.from('members').select('*', { count: 'exact', head: true })
                .lte('expiry_date', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                .gte('expiry_date', new Date().toISOString().split('T')[0])
            ]);

            const revenue = revenueRes.data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
            
            setStats({
              totalMembers: membersRes.count || 0,
              totalRevenue: revenue,
              activePlans: activeRes.count || 0,
              expiringSoon: expiringRes.count || 0,
            });

            // Basic Chart Data Aggregation (Current Month Focus)
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const currMonth = new Date().getMonth();
            const dummyChart = months.map((m, i) => ({
                name: m,
                revenue: i === currMonth ? revenue : (i < currMonth ? Math.floor(revenue * 0.8 / (currMonth || 1)) : 0),
                members: i === currMonth ? (membersRes.count || 0) : (i < currMonth ? Math.floor((membersRes.count || 0) * (0.5 + i/12)) : 0)
            }));
            setChartData(dummyChart);
          }

          if (profileData?.role === "MEMBER") {
            const { data: memberData } = await supabase.from("members").select("*").eq("id", user.id).maybeSingle();
            setMember(memberData);
          }
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !profile) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: newName }).eq('id', profile.id);
      if (!error) {
        setProfile({ ...profile, full_name: newName });
        setShowOnboarding(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card border-2 border-primary/20 rounded-[40px] p-10 shadow-glow"
        >
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Users className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase italic">Almost There!</h2>
              <p className="text-muted-foreground font-bold">
                Please enter your full name to complete your profile registration.
              </p>
            </div>
            <form onSubmit={handleSaveName} className="w-full space-y-4">
              <Input
                placeholder="Your Full Name"
                className="h-14 bg-secondary/30 border-2 border-transparent focus:border-primary/40 focus:bg-background rounded-2xl text-lg font-bold text-center"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <Button type="submit" disabled={isSaving} className="w-full h-14 bg-primary text-primary-foreground font-black rounded-2xl text-lg uppercase italic shadow-lg">
                {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : "Complete Registration"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Member View
  if (profile?.role === "MEMBER") {
    if (!member) {
      return (
        <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6">
          <div className="p-6 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-glow">
            <ShieldCheck className="h-16 w-16" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic uppercase italic">Registration Pending</h2>
            <p className="text-muted-foreground max-w-sm font-bold text-lg">
              You are registered in our system but don't have an active gym membership.
              Please visit the front desk to activate your fitness journey.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground uppercase italic pb-1 border-b-4 border-primary w-fit">
          Athlete Dashboard
        </h1>
        <p className="text-muted-foreground font-bold text-sm md:text-xl mt-2 leading-tight">
          Welcome back, <span className="text-foreground">{member.name || profile.full_name}</span>.
        </p>
      </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-card border-2 border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Crown className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-muted-foreground uppercase tracking-widest text-xs font-black">Plan Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="text-3xl md:text-5xl font-black text-primary italic uppercase break-words">{member.plan}</div>
                <Badge className="bg-primary/20 text-primary font-black px-2 md:px-4 h-7 md:h-8 text-[10px] md:text-xs shrink-0">{member.status}</Badge>
              </div>
              <div className="space-y-2 pt-4 border-t border-border/50">
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-2">
                       <Clock className="h-4 w-4" /> Expires On
                    </span>
                    <span className="font-black text-foreground">{member.expiry_date}</span>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border border-2 rounded-[40px]">
            <CardHeader>
              <CardTitle className="text-muted-foreground uppercase tracking-widest text-xs font-black">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
               <div className="space-y-1">
                  <div className="text-3xl font-black text-foreground uppercase">12</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Sessions This Month</div>
               </div>
               <div className="space-y-1">
                  <div className="text-3xl font-black text-foreground uppercase italic text-primary">02</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Days Since Last Visit</div>
               </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border border-2 rounded-[30px] p-6 md:p-10 text-center space-y-4">
             <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Your Fitness Journey</h3>
             <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl mx-auto">
                Track your progress, view your training history, and manage your membership. 
                New features are arriving soon to help you push your limits.
             </p>
             <div className="flex justify-center pt-2">
                <Button className="bg-primary text-primary-foreground font-black px-6 md:px-10 h-14 rounded-xl md:rounded-2xl group w-full md:w-auto">
                   View Training History <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
             </div>
        </Card>
      </div>
    );
  }

  // Admin View
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase italic pb-1 border-b-2 border-primary w-fit">
          Admin Overview
        </h1>
        <p className="text-muted-foreground font-bold text-sm md:text-base mt-1 opacity-80">
          Welcome back, <span className="text-foreground">Command Center</span>.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border border-2 rounded-[30px] shadow-sm hover:shadow-glow transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Total Members
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter">{stats.totalMembers}</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-wider">
              Total registered athletes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border border-2 rounded-[30px] shadow-sm hover:shadow-glow transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-wider">
              Total lifetime revenue
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border border-2 rounded-[30px] shadow-sm hover:shadow-glow transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Active Plans
            </CardTitle>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter">{stats.activePlans}</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-wider">
              Currently active subs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-destructive/20 border-2 rounded-[30px] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Expiring Soon
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tighter italic">{stats.expiringSoon}</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-wider">
              Within next 3 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1 bg-card border-border border-2 rounded-[30px] md:rounded-[40px] overflow-hidden">
          <CardHeader className="p-5 md:p-8 pb-2">
            <CardTitle className="text-base md:text-lg font-black uppercase tracking-tighter italic">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', border: '2px solid var(--border)' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'black', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card border-border border-2 rounded-[30px] md:rounded-[40px] overflow-hidden">
          <CardHeader className="p-5 md:p-8 pb-2">
            <CardTitle className="text-base md:text-lg font-black uppercase tracking-tighter italic">Membership Growth</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D6F836" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D6F836" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--foreground)', border: '2px solid var(--border)' }}
                  itemStyle={{ color: "#D6F836", fontWeight: 'black', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="members" stroke="#D6F836" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
