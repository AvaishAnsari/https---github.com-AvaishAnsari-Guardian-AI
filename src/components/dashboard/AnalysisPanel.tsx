"use client";

import { Transaction, UserProfile, InvestigationStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Info, MapPin, Smartphone, Clock, AlertCircle, Fingerprint, BrainCircuit, ShieldAlert, History, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { format } from "date-fns";

interface AnalysisPanelProps {
  transaction: Transaction | null;
  profile: UserProfile | null;
  history: Transaction[];
  onAction: (id: string, status: 'blocked' | 'approved') => void;
}

export function AnalysisPanel({ transaction, profile, history, onAction }: AnalysisPanelProps) {
  if (!transaction || !profile) {
    return (
      <Card className="h-full cyber-card border-dashed border-2 flex items-center justify-center min-h-[400px]">
        <div className="text-center p-8 space-y-4 opacity-40">
          <Fingerprint className="w-16 h-16 text-primary mx-auto animate-pulse-soft" />
          <p className="text-sm font-mono tracking-widest uppercase">Select Case for Investigation</p>
        </div>
      </Card>
    );
  }

  const isHighRisk = transaction.riskLevel === 'high';
  const userHistory = history.filter(h => h.userId === transaction.userId).slice(-5).reverse();

  const radarData = [
    { subject: 'Volume', A: Math.min((transaction.amount / profile.averageAmount) * 20, 100), fullMark: 100 },
    { subject: 'Location', A: profile.typicalLocations.includes(transaction.location) ? 20 : 90, fullMark: 100 },
    { subject: 'Device', A: profile.typicalDevices.includes(transaction.device) ? 10 : 95, fullMark: 100 },
    { subject: 'Pattern', A: transaction.category === 'Pattern-Based Fraud' ? 95 : 20, fullMark: 100 },
    { subject: 'Temporal', A: 40, fullMark: 100 },
  ];

  const breakdown = transaction.riskBreakdown || {
    amountRisk: 0,
    deviceRisk: 0,
    locationRisk: 0,
    timeRisk: 0,
    patternRisk: 0
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
                Case Investigation Portal
              </CardTitle>
              <div className="flex gap-4">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Case_ID: <span className="text-foreground">{transaction.caseId}</span></p>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Category: <span className="text-accent">{transaction.category}</span></p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={cn(
                "text-[9px] px-2 py-0.5 font-bold uppercase",
                transaction.investigationStatus === 'confirmed_fraud' ? "bg-destructive" : transaction.investigationStatus === 'false_positive' ? "bg-emerald-500" : "bg-amber-500"
              )}>
                {transaction.investigationStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Score Visualization */}
            <div className="space-y-6">
               <div className="relative">
                 <div className="flex justify-between items-end mb-2">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Global Risk Probability</span>
                     <span className={cn(
                       "text-5xl font-black italic tracking-tighter",
                       isHighRisk ? "text-destructive" : "text-primary"
                     )}>{transaction.riskScore}%</span>
                   </div>
                   <div className="flex flex-col items-end">
                     <span className="text-[9px] font-mono text-muted-foreground uppercase">Model Confidence</span>
                     <span className="text-xl font-bold text-accent">{transaction.confidenceScore}%</span>
                   </div>
                 </div>
                 <Progress value={transaction.riskScore} className={cn(
                     "h-2 bg-white/5",
                     isHighRisk ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
                 )} />
               </div>

               {/* Risk Breakdown */}
               <div className="space-y-3">
                 <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Risk Variance Decomposition</h5>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: "Amount", val: breakdown.amountRisk, max: 30 },
                      { label: "Device", val: breakdown.deviceRisk, max: 15 },
                      { label: "Location", val: breakdown.locationRisk, max: 15 },
                      { label: "Time", val: breakdown.timeRisk, max: 10 },
                      { label: "Pattern", val: breakdown.patternRisk || 0, max: 30 },
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
            <div className="h-[240px] relative">
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* AI Reasoning */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Explainability Report
              </h4>
              <div className="p-4 h-[120px] rounded-lg bg-white/5 border border-white/5 italic text-xs text-foreground/80 leading-relaxed font-mono relative overflow-hidden overflow-y-auto">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                {transaction.explanation || "INITIATING_EXPLANATION_ENGINE..."}
              </div>
            </div>

            {/* Transaction Timeline */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                User Activity Timeline
              </h4>
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                {userHistory.map((tx, i) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-mono text-muted-foreground uppercase">{format(new Date(tx.timestamp), 'HH:mm:ss')}</span>
                      <span className="text-[10px] font-bold">₹{tx.amount.toLocaleString()}</span>
                    </div>
                    <Badge variant={tx.riskLevel === 'high' ? 'destructive' : 'outline'} className="text-[7px] h-3.5 px-1 uppercase">
                      {tx.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest opacity-60">Identity & Pattern Vectors</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { icon: MapPin, label: "GEO_LOCATION", val: transaction.location, ok: profile.typicalLocations.includes(transaction.location) },
                { icon: Smartphone, label: "DEVICE_ID", val: transaction.device, ok: profile.typicalDevices.includes(transaction.device) },
                { icon: Clock, label: "TIME_WINDOW", val: `${profile.typicalTimeRange.start}-${profile.typicalTimeRange.end}`, ok: true },
                { icon: History, label: "PATTERN_VLD", val: transaction.category === 'Nominal' ? "Valid" : "Anomaly", ok: transaction.category === 'Nominal' },
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

          {/* Analyst Workflow */}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                 <FileText className="w-3 h-3" />
                 Analyst Investigation Notes
               </label>
               <textarea 
                className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs font-mono min-h-[60px] focus:outline-none focus:border-primary/50"
                placeholder="Enter case notes..."
                defaultValue={transaction.analystNotes}
               />
            </div>
            {transaction.investigationStatus === 'pending' && (
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 font-bold uppercase text-[10px]"
                  onClick={() => onAction(transaction.id, 'approved')}
                >
                  Confirm: False Positive
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 font-bold uppercase text-[10px]"
                  onClick={() => onAction(transaction.id, 'blocked')}
                >
                  Confirm: Fraudulent
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
