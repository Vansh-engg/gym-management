"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Save } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Profile Settings
        </h1>
        <p className="text-muted-foreground">Manage your personal information.</p>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your profile details and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name
            </label>
            <Input 
              id="name" 
              defaultValue="Admin User" 
              className="bg-background border-border focus-visible:ring-primary h-12" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address <span className="text-xs text-muted-foreground font-normal">(Read Only)</span>
            </label>
            <Input 
              id="email" 
              defaultValue="admin@rkfitness.com" 
              disabled 
              className="bg-muted cursor-not-allowed border-border focus-visible:ring-transparent text-muted-foreground h-12" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium leading-none text-foreground flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </label>
            <Input 
              id="phone" 
              defaultValue="+91 98765 43210" 
              className="bg-background border-border focus-visible:ring-primary h-12" 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-6 border-t border-border mt-4">
          <Button className="bg-primary hover:bg-primary/90 text-white font-semibold h-11 px-8 gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>
      
      {/* Danger Zone */}
      <Card className="bg-card border-destructive/20 mt-8">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <p className="font-semibold text-foreground">Delete Account</p>
              <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <Button variant="destructive" className="mt-4 sm:mt-0">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
