"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, Activity, TrendingUp, Target, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export function StatCards({ transactions }: { transactions: any[] }) {
  const highRiskCount = transactions.filter(tx => tx.riskLevel === 'high').length;
  const totalProcessed = transactions.length;
  const confirmedFraud = transactions.filter(tx => tx.investigationStatus === 'confirmed_fraud').length;
  const falsePositives = transactions.filter(tx => tx.investigationStatus === 'false_positive').length;
  
  const detectionRate = totalProcessed > 0 ? Math.round((confirmedFraud / totalProcessed) * 100) : 0;
  const fpRate = highRiskCount > 0 ? Math.round((falsePositives / highRiskCount) * 100) : 0;

  const stats = [
    {
      title: "Total Scanned",
      value: totalProcessed,
      label: "Real-time activity",
      icon: Activity,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "Fraud Detect Rate",
      value: `${detectionRate}%`,
      label: "Confirmed attacks",
      icon: Target,
      color: "text-destructive",
      bg: "bg-destructive/10"
    },
    {
      title: "False Positive",
      value: `${fpRate}%`,
      label: "Model precision",
      icon: BarChart3,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      title: "Safe Traffic",
      value: totalProcessed - confirmedFraud,
      label: "Verified activity",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="cyber-card relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground font-mono mt-1 opacity-70 uppercase">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
