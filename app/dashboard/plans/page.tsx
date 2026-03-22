"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Save, Trash2, Edit3, CheckCircle2, MoreVertical, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Plan = {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
    checkRole();
  }, []);

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      setIsAdmin(profile?.role === "ADMIN" || user.email === "admin@rkfitness.com");
    }
  };

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("plans").select("*").order("price", { ascending: true });
    if (!error && data) {
      setPlans(data.map(p => ({ ...p, features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || "[]") })));
    }
    setLoading(false);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan({ ...plan });
    setIsDialogOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("plans")
      .upsert({
        id: editingPlan.id || undefined,
        name: editingPlan.name,
        price: editingPlan.price,
        duration_days: editingPlan.duration_days,
        features: editingPlan.features,
        is_active: editingPlan.is_active,
      });

    if (!error) {
      setIsDialogOpen(false);
      fetchPlans();
    } else {
      alert("Error saving plan: " + error.message);
    }
    setIsSaving(false);
  };

  const addFeature = () => {
    if (editingPlan) {
      setEditingPlan({ ...editingPlan, features: [...editingPlan.features, ""] });
    }
  };

  const updateFeature = (index: number, val: string) => {
      if (editingPlan) {
          const newFeatures = [...editingPlan.features];
          newFeatures[index] = val;
          setEditingPlan({...editingPlan, features: newFeatures});
      }
  }

  const removeFeature = (index: number) => {
    if (editingPlan) {
        setEditingPlan({ ...editingPlan, features: editingPlan.features.filter((_, i) => i !== index) });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground">
            Membership Plans
          </h1>
          <p className="text-muted-foreground text-lg">Control your gym's revenue and offerings.</p>
        </div>
        {isAdmin && (
          <Button 
            onClick={() => {
              setEditingPlan({ id: "", name: "", price: 0, duration_days: 30, features: [], is_active: true });
              setIsDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 py-6 rounded-2xl h-14 text-lg shadow-[0_0_30px_rgba(214,248,54,0.4)]"
          >
            <Plus className="mr-2 h-6 w-6" /> Create Plan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <Card className="h-full bg-card border-border flex flex-col overflow-hidden rounded-[32px] shadow-2xl relative">
                {!plan.is_active && (
                   <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <Badge variant="destructive" className="h-10 px-6 text-base font-bold rounded-full">Inactive</Badge>
                   </div>
                )}
                <CardHeader className="text-center pb-8 border-b border-border/40">
                  <Badge className="mx-auto bg-primary/10 text-primary mb-4 h-8 px-4 rounded-full border border-primary/20">{plan.duration_days} Days</Badge>
                  <CardTitle className="text-3xl font-black text-foreground">{plan.name}</CardTitle>
                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-5xl font-black text-primary">₹{plan.price}</span>
                    <span className="text-sm text-muted-foreground font-bold tracking-widest uppercase mt-1">One Time Payment</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 py-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-foreground font-medium">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-8 pt-0 mt-auto">
                   {isAdmin && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleEditPlan(plan)}
                        className="w-full h-12 rounded-xl font-bold border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                      >
                         <Edit3 className="mr-2 h-4 w-4" /> Edit Plan Details
                      </Button>
                   )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-[32px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSavePlan}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">{editingPlan?.id ? "Edit Plan" : "New Plan"}</DialogTitle>
              <DialogDescription>Update the name, price, and features for this membership.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6 font-medium">
              <div className="grid gap-2">
                <Label>Plan Name</Label>
                <Input value={editingPlan?.name} onChange={(e) => setEditingPlan({...editingPlan!, name: e.target.value})} required className="bg-background h-12 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" value={editingPlan?.price} onChange={(e) => setEditingPlan({...editingPlan!, price: Number(e.target.value)})} required className="bg-background h-12 rounded-xl" />
                 </div>
                 <div className="grid gap-2">
                    <Label>Duration (Days)</Label>
                    <Input type="number" value={editingPlan?.duration_days} onChange={(e) => setEditingPlan({...editingPlan!, duration_days: Number(e.target.value)})} required className="bg-background h-12 rounded-xl" />
                 </div>
              </div>
              <div className="space-y-4">
                 <Label className="flex justify-between items-center">
                    <span>Key Features</span>
                    <Button type="button" size="sm" variant="ghost" className="h-8 text-primary hover:bg-primary/10" onClick={addFeature}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                 </Label>
                 <div className="space-y-3">
                   {editingPlan?.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-2 group">
                         <Input 
                           value={feature} 
                           onChange={(e) => updateFeature(idx, e.target.value)} 
                           className="bg-background h-10 rounded-xl flex-1" 
                           placeholder="e.g. Free Trainer Support" 
                         />
                         <Button type="button" size="icon" variant="ghost" className="h-10 w-10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeFeature(idx)}>
                            <X className="h-4 w-4" />
                         </Button>
                      </div>
                   ))}
                 </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                 <input 
                   type="checkbox" 
                   id="active" 
                   checked={editingPlan?.is_active} 
                   onChange={(e) => setEditingPlan({...editingPlan!, is_active: e.target.checked})}
                   className="h-5 w-5 rounded-lg border-border text-primary focus:ring-primary bg-background shadow-inner"
                 />
                 <Label htmlFor="active" className="cursor-pointer">Enable this plan for purchase</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSaving} className="w-full bg-primary text-primary-foreground font-black h-14 rounded-2xl text-lg mt-4 shadow-[0_0_20px_rgba(214,248,54,0.3)]">
                {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="mr-2 h-5 w-5" /> Save Changes</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
