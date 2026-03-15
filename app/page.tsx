"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Zap,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

const features = [
  {
    icon: Target,
    title: "AI Internship Matching",
    description:
      "Get personalized internship recommendations based on your profile, skills, and goals.",
  },
  {
    icon: Zap,
    title: "Eligibility Prediction",
    description:
      "Know your fit before you apply. Our AI scores your eligibility and highlights gaps.",
  },
  {
    icon: BookOpen,
    title: "Personalized Learning Portal",
    description:
      "Curated courses and resources to bridge skill gaps and level up fast.",
  },
  {
    icon: GraduationCap,
    title: "Career Guidance",
    description:
      "From resume tips to interview prep, get AI-powered guidance at every step.",
  },
];

const testimonials = [
  {
    quote:
      "InterGenie matched me with 3 internships I’d never have found on my own. Landed one within a month.",
    author: "Priya S.",
    role: "CS undergrad",
  },
  {
    quote:
      "The eligibility score and learning suggestions actually made sense. No more blind applications.",
    author: "Rahul M.",
    role: "Final year, ECE",
  },
  {
    quote:
      "Clean UI, fast results, and the learning portal is legit. Feels like a real product.",
    author: "Ananya K.",
    role: "Aspiring data scientist",
  },
];

const footerLinks = [
  { label: "Internships", href: "/internships" },
  { label: "Learning", href: "/learning" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-fuchsia-500/10 blur-[80px]" />
      </div>

      {/* Hero */}
      <section className="relative px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div variants={item} className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-powered career platform
            </span>
          </motion.div>
          <motion.h1
            variants={item}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            Your AI Career{" "}
            <span className="gradient-text">Copilot</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Find internships, improve skills, and accelerate your career with
            AI-powered recommendations.
          </motion.p>
          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="min-w-[180px] shadow-lg hover:shadow-glow-sm">
              <Link href="/internships" className="flex items-center gap-2">
                Find Internships
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[180px] glass">
              <Link href="/learning" className="flex items-center gap-2">
                Explore Learning Portal
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for your journey
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              One platform to discover internships, predict fit, and upskill with
              curated learning.
            </p>
          </motion.div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-glow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Loved by students
          </motion.h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
              >
                <Quote className="h-8 w-8 text-primary/40" />
                <p className="mt-4 text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 font-medium">{t.author}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            InterGenie
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} InterGenie. Your AI career copilot.
        </p>
      </footer>
    </div>
  );
}
