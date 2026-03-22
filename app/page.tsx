"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dumbbell, ArrowRight, Play, Server, Zap, Globe } from "lucide-react";
import { motion, Variants } from "framer-motion";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Dynamic Background optimized for performance */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-50%] left-[-20%] w-[100vw] h-[100vw] rounded-full bg-[radial-gradient(circle,rgba(214,248,54,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-[-50%] right-[-20%] w-[100vw] h-[100vw] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.06)_0%,transparent_50%)]" />
      </div>

      {/* Header */}
      <header className="px-6 h-20 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-foreground transition-transform hover:scale-105 group">
          <Dumbbell className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform duration-300" />
          <span>RK <span className="text-primary">FITNESS</span></span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block">
            Member Login
          </Link>
          <Link 
            href="/login" 
            className={cn(
              buttonVariants({ variant: "default" }), 
              "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 transition-all hover:shadow-[0_0_20px_rgba(214,248,54,0.4)]"
            )}
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 z-10">
        {/* Hero Section */}
        <section className="w-full min-h-[90vh] flex items-center justify-center relative px-4 py-20 lg:py-32 overflow-hidden">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>
          
          {/* Animated Bodybuilder Outline Sketch */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              x: ["0%", "-2%", "0%"],
              y: ["0%", "2%", "0%"],
            }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
            className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('/bodybuilder-sketch.png')] bg-[length:auto_85%] md:bg-contain bg-center bg-no-repeat"
          />
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="container max-w-6xl flex flex-col items-center text-center space-y-8 z-10"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 shadow-[0_0_8px_rgba(214,248,54,0.8)] animate-pulse"></span>
              The Operating System for Elite Gyms
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl text-foreground">
              Push Limits. <br className="hidden md:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#a3e635] to-[#2dd4bf]">Scale Faster.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-medium tracking-wide">
              Leave the paperwork behind. RK Fitness delivers a hyper-optimized management suite to handle your memberships, tracking, and payments seamlessly.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto pt-8">
              <Link 
                href="/login" 
                className={cn(
                  buttonVariants({ size: "lg" }), 
                  "group h-14 rounded-full px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-bold hover:shadow-[0_0_30px_rgba(214,248,54,0.5)] transition-all ease-out w-full sm:w-auto overflow-hidden relative"
                )}
              >
                <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-[30deg] -translate-x-[200%] group-hover:translate-x-[400%] transition-transform duration-700"></div>
                Launch Dashboard <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="#features" 
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }), 
                  "h-14 rounded-full px-8 text-base font-semibold border-border hover:bg-muted hover:text-foreground transition-colors w-full sm:w-auto"
                )}
              >
                <Play className="mr-2 h-5 w-5 text-primary" />
                See How It Works
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Showcase */}
        <section id="features" className="w-full py-24 bg-card/40 border-y border-border/50">
          <div className="container px-4 md:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">Next-Gen Architecture</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg font-medium">
                Engineered for maximum speed, security, and aesthetics to make managing your gym a completely frictionless experience.
              </p>
            </motion.div>
            
            <div className="grid max-w-6xl mx-auto gap-6 lg:grid-cols-3">
              {[
                { title: "Lightning Fast API", desc: "Built with Next.js 15 App Router providing sub-50ms render times and server-actions.", icon: <Server className="w-7 h-7 text-primary" /> },
                { title: "Global CDN", desc: "Your data is distributed globally ensuring no matter where your members are, pages load instantly.", icon: <Globe className="w-7 h-7 text-primary" /> },
                { title: "Real-time Processing", desc: "Payments, updates, and webhook callbacks process absolutely continuously in Real-time.", icon: <Zap className="w-7 h-7 text-primary" /> },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-start space-y-4 p-8 rounded-[24px] bg-card border border-border/60 hover:border-primary/40 transition-colors shadow-sm"
                >
                  <div className="p-3 rounded-2xl bg-secondary border border-border">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="w-full py-12 flex flex-col items-center justify-center border-t border-border bg-background z-10">
        <div className="container px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-foreground" />
            <span className="font-bold text-lg tracking-tight text-foreground">RK FITNESS</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">© {new Date().getFullYear()} RK Fitness. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
