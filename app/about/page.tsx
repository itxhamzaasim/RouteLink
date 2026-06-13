"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, User, Shield, GraduationCap, MapPin, Milestone } from "lucide-react";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Header />
      
      <main className="flex-grow py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-16"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Project Information
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              About RouteLink
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-neutral-600">
              A dynamic campus and corporate ride-sharing solution tailored for students and daily commuters in Lahore, Pakistan.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-8"
          >
            {/* Academic Ownership */}
            <motion.div variants={itemVariants}>
              <Card className="border-neutral-200 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <GraduationCap className="size-7" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-neutral-950">Academic Project Ownership</h2>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      This platform was researched, designed, and developed as a **Final Year Project (FYP)** submitted to the **Department of Software Engineering**.
                    </p>
                    <div className="pt-2 grid gap-3 sm:grid-cols-2 text-xs font-semibold text-neutral-800">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-brand-600" />
                        <span>Developer: Muhammad Hamza Asim</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4 text-brand-600" />
                        <span>Final Year Project (FYP)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mission Statement */}
            <motion.div variants={itemVariants}>
              <Card className="border-neutral-200 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Milestone className="size-7" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-neutral-950">Our Commuting Vision</h2>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      Daily traveling in Lahore presents massive challenges with high fuel costs, expensive commercial cabs, and traffic jams. RouteLink aims to establish a trusted university and corporate peer-to-peer network so passengers can split fuel costs in PKR (Rs.) on standard routes like:
                    </p>
                    <ul className="text-xs text-neutral-500 list-disc list-inside space-y-1 pl-2">
                      <li>Johar Town &amp; Wapda Town $\rightarrow$ FAST, LUMS, or Punjab University</li>
                      <li>DHA Lahore &amp; Gulberg $\rightarrow$ UET Lahore or Arfa Software Technology Park</li>
                      <li>Model Town &amp; Faisal Town $\rightarrow$ University of Lahore (UOL) or COMSATS</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Safety & Community Verification */}
            <motion.div variants={itemVariants}>
              <Card className="border-neutral-200 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Shield className="size-7" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-neutral-950">Trust &amp; Verification</h2>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      Safety is the cornerstone of RouteLink. The platform supports active email verifications, community driver ratings, license plate registration audits, and secure request verification routines. Users travel with peace of mind knowing their travel mates are vetted peers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
