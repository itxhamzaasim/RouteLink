"use client";

import { motion } from "framer-motion";
import { UserPlus, UserCheck, Search, Send, Users, Wallet } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up quickly as a student or office worker using your phone number or email.",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "Complete Profile",
    description: "Verify your email and complete your profile details for community safety.",
  },
  {
    step: "03",
    icon: Search,
    title: "Offer or Search Rides",
    description: "Drivers post routes (e.g., Johar Town to LUMS). Commuters search for match listings.",
  },
  {
    step: "04",
    icon: Send,
    title: "Send Ride Request",
    description: "Select available seats and send a request directly to the driver with a single tap.",
  },
  {
    step: "05",
    icon: Users,
    title: "Travel Together",
    description: "Coordinate the pickup point (e.g., Liberty Market) and travel together comfortably.",
  },
  {
    step: "06",
    icon: Wallet,
    title: "Save Fares & Costs",
    description: "Split fuel costs in PKR, saving up to 75% compared to commercial cabs and auto-rickshaws.",
  },
] as const;

export function HowItWorks() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-neutral-900 text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            6 Simple Steps to Shared Commutes
          </h2>
          <p className="mt-4 text-neutral-400">
            RouteLink is custom-built for daily student and professional travel in Lahore.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {STEPS.map((item) => (
            <motion.div 
              key={item.step} 
              variants={itemVariants}
              className="relative flex flex-col items-center text-center p-6 bg-neutral-950/60 border border-neutral-800 rounded-2xl transition-all hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
                <item.icon className="size-6" />
              </div>
              <span className="mt-4 block text-xs font-bold uppercase tracking-wider text-brand-400">
                Step {item.step}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-neutral-100">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
