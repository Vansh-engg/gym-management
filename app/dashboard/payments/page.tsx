"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar, 
  User, 
  ArrowUpRight, 
  CreditCard,
  Zap,
  Bell
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, subDays, addDays, isBefore } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type PaymentAlert = {
    id: string;
    members: {
        id: string;
        name: string;
        email: string;
    };
    amount: number;
    status: "Paid" | "Pending" | "Overdue";
    expiry_date: string;
};

export default function PaymentsPage() {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchPayments();
    checkRole();
  }, []);

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      setIsAdmin(profile?.role === "ADMIN" || user.email === "admin@rkfitness.com");
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    // Fetch recent payments and member info
    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        status,
        expiry_date,
        members (
            id,
            name,
            email
        )
      `)
      .order("expiry_date", { ascending: true });

    if (!error && data) {
      setAlerts(data as any);
    }
    setLoading(false);
  };

  const overdue = alerts.filter(a => isBefore(new Date(a.expiry_date), new Date()) && a.status !== 'Paid');
  const expiringSoon = alerts.filter(a => {
      const date = new Date(a.expiry_date);
      return isAfter(date, new Date()) && isBefore(date, addDays(new Date(), 3)) && a.status !== 'Paid';
  });
  const recent = alerts.filter(a => a.status === 'Paid').slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground">
            Revenue & Alerts
          </h1>
          <p className="text-muted-foreground text-lg font-medium">Track your subscriptions and cashflow in real-time.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl flex flex-col items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Monthly Revenue</span>
                <span className="text-2xl font-black text-foreground">₹{alerts.filter(a => a.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
            </div>
        </div>
      </div>

      {/* Grid of Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overdue Alerts */}
        <Card className="lg:col-span-2 bg-card border-border border-l-8 border-l-destructive rounded-[32px] overflow-hidden shadow-2xl">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border/40 font-heading">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-black flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        Critical Overdue
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-bold">Immediate attention required for these members.</CardDescription>
                </div>
                <Badge variant="destructive" className="h-8 px-4 rounded-full text-sm font-bold">{overdue.length} ALERTS</Badge>
           </CardHeader>
           <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 border-border font-bold">
                                <TableHead className="py-4 pl-8">Member</TableHead>
                                <TableHead className="py-4">Expired On</TableHead>
                                <TableHead className="py-4 text-right">Outstanding</TableHead>
                                <TableHead className="py-4 text-right pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overdue.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <CheckCircle2 className="h-8 w-8 text-primary opacity-50" />
                                            <p className="font-bold">No overdue accounts!</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                overdue.map((alert) => (
                                    <TableRow key={alert.id} className="border-border hover:bg-destructive/5 transition-colors group">
                                        <TableCell className="py-5 pl-8">
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground text-lg group-hover:text-destructive transition-colors">{alert.members.name}</span>
                                                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{alert.members.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5 font-bold h-7 px-3">
                                                {alert.expiry_date}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-5 text-right font-black text-foreground">₹{alert.amount}</TableCell>
                                        <TableCell className="py-5 text-right pr-8">
                                            <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl h-9">
                                                Settle Now
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
           </CardContent>
        </Card>

        {/* Expiring Soon Sidebar */}
        <Card className="bg-card border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col border-t-8 border-t-orange-500">
           <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Expiring Soon
              </CardTitle>
              <CardDescription className="text-muted-foreground font-bold">Renew in next 3 days</CardDescription>
           </CardHeader>
           <CardContent className="flex-1 space-y-6 pt-2">
              <AnimatePresence>
                 {expiringSoon.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Zap className="h-8 w-8 mx-auto opacity-20 mb-2" />
                        <p className="text-sm font-bold">All clear for now!</p>
                    </div>
                 ) : (
                    expiringSoon.map((alert, i) => (
                        <motion.div 
                          key={alert.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-5 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between hover:bg-muted/60 transition-colors"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-foreground">{alert.members.name}</span>
                                <span className="text-xs font-black text-orange-500 uppercase tracking-widest mt-1">Ends on {alert.expiry_date}</span>
                            </div>
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-primary hover:bg-primary/10 rounded-xl">
                                <ArrowUpRight className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    ))
                 )}
              </AnimatePresence>
           </CardContent>
           <div className="p-8 border-t border-border/40 mt-auto bg-muted/20">
              <Button variant="ghost" className="w-full text-muted-foreground font-bold hover:text-foreground">View All Active Subs</Button>
           </div>
        </Card>
      </div>

      {/* Transaction History Overview */}
      <Card className="bg-card border-border rounded-[32px] shadow-2xl overflow-hidden border-b-8 border-b-primary/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-black flex items-center gap-2 tracking-tighter uppercase">
            <CreditCard className="h-6 w-6 text-primary" />
            Recent Inflow
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
               {recent.map((payment) => (
                  <TableRow key={payment.id} className="border-border hover:bg-muted/10 transition-all border-none">
                     <TableCell className="py-6 pl-8 w-12">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-5 w-5" />
                        </div>
                     </TableCell>
                     <TableCell className="py-6 font-black text-lg">
                        {payment.members.name}
                     </TableCell>
                     <TableCell className="py-6 text-muted-foreground font-medium">
                        Monthly Membership Renewed
                     </TableCell>
                     <TableCell className="py-6 text-right font-black text-primary text-xl pr-8">
                        + ₹{payment.amount}
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
