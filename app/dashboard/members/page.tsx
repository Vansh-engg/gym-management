"use client";

import { useEffect, useState } from "react";
import { supabase, type GymMember, type Profile } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Trash2, Loader2, UserPlus, AlertCircle, RefreshCcw, CreditCard, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Plan = {
    id: string;
    name: string;
    price: number;
    duration_days: number;
};

export default function MembersPage() {
  const [members, setMembers] = useState<GymMember[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // New member form state
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([fetchMembers(), fetchPlans(), checkRole(), fetchProfiles()]);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const checkRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        if (profile) setIsAdmin(profile.role === "ADMIN");
        else if (user.email === "admin@rkfitness.com") setIsAdmin(true);
      }
    } catch (err) {
      console.error("Error checking role:", err);
    }
  };

  const fetchPlans = async () => {
      const { data } = await supabase.from("plans").select("*").eq("is_active", true);
      if (data) {
          setPlans(data);
          if (data.length > 0) setSelectedPlanId(data[0].id);
      }
  }

  const fetchProfiles = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("role", "MEMBER");
      if (data) {
          setProfiles(data);
          if (data.length > 0) setSelectedProfileId(data[0].id);
      }
  }

  const fetchMembers = async () => {
    try {
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) setErrorMsg(error.message);
      else if (data) setMembers(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch members");
      console.error("Fetch error:", err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const plan = plans.find(p => p.id === selectedPlanId);
      if (!plan) throw new Error("Please select a plan");

      const profile = profiles.find(p => p.id === selectedProfileId);
      if (!profile) throw new Error("Please select a registered user");

      const { data: { user } } = await supabase.auth.getUser();
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.duration_days);

      // 1. Create Member
      const { data: memberData, error: memberError } = await supabase.from("members").insert([
        {
          id: profile.id, // Linking gym member ID to profile ID
          name: editingName || profile.full_name || "New Athlete",
          email: profile.email,
          plan: plan.name,
          status: "Active",
          expiry_date: expiryDate.toISOString().split('T')[0],
          created_by: user?.id,
        },
      ]).select().single();

      if (memberError) throw memberError;

      // Ensure profile name is also updated to match what the admin set
      if (editingName && editingName !== profile.full_name) {
          await supabase.from('profiles').update({ full_name: editingName }).eq('id', profile.id);
      }

      // 2. Create Initial Payment
      const { error: paymentError } = await supabase.from("payments").insert([{
          member_id: memberData.id,
          amount: plan.price,
          status: 'Paid',
          expiry_date: expiryDate.toISOString().split('T')[0],
          payment_date: new Date().toISOString()
      }]);

      if (paymentError) throw paymentError;

      setIsDialogOpen(false);
      await fetchMembers();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
      await fetchMembers();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black tracking-widest animate-pulse uppercase">Accessing Database...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <AlertCircle className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black tracking-tighter uppercase">Connection Interrupted</h3>
          <p className="max-w-xs text-muted-foreground font-medium">{errorMsg}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="gap-2 h-12 rounded-xl px-8 border-border hover:bg-muted font-bold">
          <RefreshCcw className="h-5 w-5" /> Force Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tighter text-foreground uppercase italic pb-0.5 border-b-2 border-primary w-fit">Members Hub Management</h1>
          <p className="text-muted-foreground font-bold text-base mt-2 opacity-80">Manage your elite roster and subscriptions.</p>
        </div>
        
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={<Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl h-14 px-10 shadow-[0_0_30px_rgba(214,248,54,0.4)] text-lg transition-all active:scale-95" />}>
                <UserPlus className="mr-2 h-6 w-6" /> Add Member
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-card border-border rounded-[40px] shadow-3xl overflow-hidden p-0 border-2">
              <form onSubmit={handleAddMember}>
                <div className="p-8 pb-4">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic">Register Member</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-bold text-sm">
                            Select a registered user to issue their gym pass.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <div className="grid gap-8 p-8 py-0">
                  <div className="grid gap-3">
                    <Label className="text-sm font-black tracking-widest text-primary">Select Registered User</Label>
                    <select 
                      id="profile" 
                      className="flex h-14 w-full rounded-2xl border-2 border-border bg-background px-5 py-2 text-lg font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                      value={selectedProfileId}
                      onChange={(e) => {
                          const id = e.target.value;
                          setSelectedProfileId(id);
                          const prof = profiles.find(p => p.id === id);
                          if (prof) setEditingName(prof.full_name || "");
                      }}
                    >
                      <option value="" disabled>Choose a user...</option>
                      {profiles.length === 0 ? (
                          <option disabled>No non-member users found</option>
                      ) : (
                          profiles.map(profile => (
                            <option key={profile.id} value={profile.id}>
                                {profile.full_name ? profile.full_name : `⚠️ Name Missing (${profile.email})`}
                            </option>
                          ))
                      )}
                    </select>
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-sm font-black tracking-widest text-primary">Member Full Name</Label>
                    <Input 
                      placeholder="Enter Membership Name" 
                      value={editingName} 
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-14 bg-secondary/30 border-2 border-transparent focus:border-primary/40 focus:bg-background rounded-2xl text-lg font-bold"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-sm font-black tracking-widest text-primary">Select Subscription</Label>
                    <select 
                      id="plan" 
                      className="flex h-14 w-full rounded-2xl border-2 border-border bg-background px-5 py-2 text-lg font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                    >
                      {plans.map(plan => (
                          <option key={plan.id} value={plan.id}>
                              {plan.name} - ₹{plan.price} ({plan.duration_days} Days)
                          </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="p-8">
                    <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground font-black h-14 rounded-2xl text-lg shadow-[0_0_20px_rgba(214,248,54,0.3)] group overflow-hidden relative">
                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <>
                            Activate Membership <CreditCard className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                        </>}
                    </Button>
                    </DialogFooter>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="bg-card border-border overflow-hidden rounded-[40px] shadow-3xl border-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border bg-muted/30 h-16">
                <TableHead className="font-black py-4 pl-10 text-muted-foreground uppercase tracking-widest text-[10px]">Full Name</TableHead>
                <TableHead className="font-black py-4 text-muted-foreground uppercase tracking-widest text-[10px]">Plan Type</TableHead>
                <TableHead className="font-black py-4 text-muted-foreground uppercase tracking-widest text-[10px] hidden sm:table-cell">Contact</TableHead>
                <TableHead className="font-black py-4 text-muted-foreground uppercase tracking-widest text-[10px]">Status</TableHead>
                <TableHead className="font-black py-4 text-muted-foreground uppercase tracking-widest text-[10px] hidden md:table-cell">Expiry</TableHead>
                {isAdmin && <TableHead className="text-right py-4 pr-10 text-muted-foreground uppercase tracking-widest text-[10px]">Manage</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                       <p className="text-2xl font-black italic uppercase italic">Gym is empty</p>
                       <p className="text-sm font-bold opacity-60">Ready to issue your first gym pass?</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id} className="border-border hover:bg-muted/30 transition-all group h-20">
                    <TableCell className="py-4 pl-10">
                      <div className="flex flex-col">
                        <span className="font-black text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">{member.name}</span>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest md:hidden">{member.expiry_date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-bold text-base opacity-70 italic">{member.plan}</TableCell>
                    <TableCell className="py-4 hidden sm:table-cell">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-sm text-foreground">{member.email}</span>
                            <span className="font-black text-[10px] text-muted-foreground tracking-widest uppercase">{member.phone || "No Phone"}</span>
                        </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        className={
                          member.status === "Active"
                            ? "bg-primary/10 text-primary border-primary/20 font-black h-8 px-4 rounded-full text-[10px]"
                            : member.status === "Expiring Soon"
                            ? "bg-orange-500/10 text-orange-500 border-orange-500/20 font-black h-8 px-4 rounded-full text-[10px]"
                            : "bg-red-500/10 text-red-500 border-red-500/20 font-black h-8 px-4 rounded-full text-[10px]"
                        }
                        variant="outline"
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 hidden md:table-cell font-black text-xs text-muted-foreground/80">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 opacity-30" />
                            {member.expiry_date || "UNDEFINED"}
                        </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right py-4 pr-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20" />}>
                              <MoreHorizontal className="h-6 w-6" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border rounded-2xl w-56 shadow-4xl p-2 border-2">
                            <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest opacity-50 mb-1">Administration</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer py-3 rounded-xl font-bold hover:bg-muted focus:bg-muted">Issue New Receipt</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer py-3 rounded-xl font-bold hover:bg-muted focus:bg-muted">Extend Membership</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border my-2" />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-destructive focus:bg-destructive/10 cursor-pointer py-3 rounded-xl font-black uppercase tracking-tighter"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Revoke Access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
