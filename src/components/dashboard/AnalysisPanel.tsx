"use client";

import { Transaction, UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Info, MapPin, Smartphone, Clock, AlertCircle, Fingerprint, BrainCircuit, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';

interface AnalysisPanelProps {
  transaction: Transaction | null;
  profile: UserProfile | null;
}

export function AnalysisPanel({ transaction, profile }: AnalysisPanelProps) {
  if (!transaction || !profile) {
    return (
      <Card className="h-full cyber-card border-dashed border-2 flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 space-y-4 opacity-40">
          <Fingerprint className="w-16 h-16 text-primary mx-auto animate-pulse-soft" />
          <p className="text-sm font-mono tracking-widest uppercase">Awaiting Signature Input</p>
        </div>
      </Card>
    );
  }

  const isHighRisk = transaction.riskLevel === 'high';

  const radarData = [
    { subject: 'Volume', A: Math.min((transaction.amount / profile.averageAmount) * 20, 100), fullMark: 100 },
    { subject: 'Location', A: profile.typicalLocations.includes(transaction.location) ? 20 : 90, fullMark: 100 },
    { subject: 'Device', A: profile.typicalDevices.includes(transaction.device) ? 10 : 95, fullMark: 100 },
    { subject: 'Temporal', A: 50, fullMark: 100 },
    { subject: 'Frequency', A: transaction.riskScore! > 50 ? 80 : 30, fullMark: 100 },
  ];

  const breakdown = transaction.riskBreakdown || {
    amountRisk: 0,
    deviceRisk: 0,
    locationRisk: 0,
    timeRisk: 0
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <Card className="cyber-card border-border/40 overflow-hidden relative scanline">
        <CardHeader className="bg-white/5 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-black tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                Risk Intelligence Matrix
              </CardTitle>
              <p className="text-[10px] font-mono text-muted-foreground opacity-60">THREAT_VECTOR_ID: {transaction.id}</p>
            </div>
            <Badge className={cn(
              "text-[10px] px-2 py-0.5 font-bold uppercase tracking-tighter",
              transaction.status === 'blocked' ? "bg-destructive" : transaction.status === 'approved' ? "bg-emerald-500" : isHighRisk ? "bg-destructive" : "bg-primary"
            )}>
              {transaction.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Score Visualization */}
            <div className="space-y-6">
               <div className="relative">
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Global Risk Probability</span>
                   <span className={cn(
                     "text-5xl font-black italic tracking-tighter",
                     isHighRisk ? "text-destructive" : "text-primary"
                   )}>{transaction.riskScore}%</span>
                 </div>
                 <Progress value={transaction.riskScore} className={cn(
                     "h-2 bg-white/5",
                     isHighRisk ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
                 )} />
               </div>

               {/* Risk Breakdown */}
               <div className="space-y-3">
                 <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Risk Variance Decomposition</h5>
                 <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Amount", val: breakdown.amountRisk, max: 40 },
                      { label: "Device", val: breakdown.deviceRisk, max: 20 },
                      { label: "Location", val: breakdown.locationRisk, max: 20 },
                      { label: "Time", val: breakdown.timeRisk, max: 20 },
                    ].map((factor) => (
                      <div key={factor.label} className="p-2 rounded bg-white/5 border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] font-mono uppercase text-muted-foreground">{factor.label}</span>
                          <span className="text-[9px] font-bold">{factor.val}/{factor.max}</span>
                        </div>
                        <Progress value={(factor.val / factor.max) * 100} className="h-0.5 bg-white/5" />
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            {/* Radar Analysis */}
            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700 }} 
                  />
                  <Radar
                    name="Deviation"
                    dataKey="A"
                    stroke={isHighRisk ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                    fill={isHighRisk ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Explainability Report
            </h4>
            <div className="p-4 rounded-lg bg-white/5 border border-white/5 italic text-xs text-foreground/80 leading-relaxed font-mono relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
              {transaction.explanation || "INITIATING_EXPLANATION_ENGINE..."}
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest opacity-60">Behavioral Fingerprint Check</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: MapPin, label: "GEO_LOCATION", val: transaction.location, ok: profile.typicalLocations.includes(transaction.location) },
                { icon: Smartphone, label: "DEVICE_ID", val: transaction.device, ok: profile.typicalDevices.includes(transaction.device) },
                { icon: Clock, label: "TIME_WINDOW", val: `${profile.typicalTimeRange.start}-${profile.typicalTimeRange.end}`, ok: true },
              ].map((item, i) => (
                <div key={i} className="p-2.5 rounded border border-white/5 bg-white/5 space-y-2">
                  <div className="flex items-center gap-2 opacity-50">
                    <item.icon className="w-3 h-3" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-tighter">{item.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold truncate max-w-[80px]">{item.val}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.ok ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
