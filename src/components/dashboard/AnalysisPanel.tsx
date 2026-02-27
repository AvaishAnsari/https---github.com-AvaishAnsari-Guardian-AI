
"use client";

import { useState, useEffect } from "react";
import { Transaction, UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, AlertCircle, History, FileText, Download, ShieldAlert, Cpu, Database, Activity, Fingerprint } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

interface AnalysisPanelProps {
  transaction: Transaction | null;
  profile: UserProfile | null;
  history: Transaction[];
  onAction: (id: string, status: 'blocked' | 'approved') => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function AnalysisPanel({ transaction, profile, history, onAction, onUpdateNotes }: AnalysisPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!transaction || !profile) {
    return (
      <Card className="h-full cyber-card border-dashed border-2 flex items-center justify-center min-h-[500px]">
        <div className="text-center p-12 space-y-6 opacity-40">
          <Fingerprint className="w-24 h-24 text-primary mx-auto animate-pulse-soft" />
          <p className="text-base font-mono tracking-widest uppercase">Select Case for Investigation</p>
        </div>
      </Card>
    );
  }

  const isHighRisk = transaction.riskLevel === 'high';
  const userHistory = history.filter(h => h.userId === transaction.userId).slice(-5).reverse();

  const radarData = [
    { subject: 'Volume', A: Math.min((transaction.amount / profile.averageAmount) * 20, 100) },
    { subject: 'Location', A: profile.typicalLocations.includes(transaction.location) ? 20 : 90 },
    { subject: 'Device', A: profile.typicalDevices.includes(transaction.device) ? 10 : 95 },
    { subject: 'Pattern', A: transaction.category !== 'Nominal' ? 95 : 20 },
    { subject: 'Network', A: transaction.crossUserFlag ? 95 : 10 },
  ];

  const handleDownloadReport = () => {
    toast({
      title: "Generating Report",
      description: `Fraud Intelligence Report for Case ${transaction.caseId} compiled.`,
    });
  };

  return (
    <motion.div 
      key={transaction.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <Card className="cyber-card border-border/40 overflow-hidden relative scanline">
        <CardHeader className="bg-white/5 pb-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-base font-black tracking-[0.2em] uppercase text-primary flex items-center gap-3">
                <BrainCircuit className="w-6 h-6" />
                Case Investigation Portal
              </CardTitle>
              <div className="flex gap-6">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Case_ID: <span className="text-foreground font-bold">{transaction.caseId}</span></p>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Category: <span className="text-accent font-bold">{transaction.category}</span></p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white/10" onClick={handleDownloadReport}>
                <Download className="w-5 h-5" />
              </Button>
              <Badge className={cn(
                "text-xs px-3 py-1 font-black uppercase tracking-widest",
                transaction.investigationStatus === 'confirmed_fraud' ? "bg-destructive" : transaction.investigationStatus === 'false_positive' ? "bg-emerald-500" : "bg-amber-500"
              )}>
                {transaction.investigationStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-10">
          {transaction.crossUserFlag && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive"
            >
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">NETWORK INTELLIGENCE ALERT: Suspicious Device Reuse Detected</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-8">
               <div className="relative">
                 <div className="flex justify-between items-end mb-3">
                   <div className="flex flex-col">
                     <span className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em]">Aggregate Risk Score</span>
                     <span className={cn(
                       "text-7xl font-black italic tracking-tighter",
                       isHighRisk ? "text-destructive" : "text-primary"
                     )}>{transaction.riskScore}%</span>
                   </div>
                   <div className="flex flex-col items-end">
                     <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Model Confidence</span>
                     <span className="text-2xl font-black text-accent">{transaction.confidenceScore}%</span>
                   </div>
                 </div>
                 <Progress value={transaction.riskScore} className={cn(
                     "h-3 bg-white/5",
                     isHighRisk ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
                 )} />
               </div>

               <div className="space-y-4">
                 <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Risk Variance Decomposition</h5>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Amount", val: transaction.riskBreakdown?.amountRisk || 0, max: 30 },
                      { label: "Device", val: transaction.riskBreakdown?.deviceRisk || 0, max: 15 },
                      { label: "Location", val: transaction.riskBreakdown?.locationRisk || 0, max: 15 },
                      { label: "Time", val: transaction.riskBreakdown?.timeRisk || 0, max: 10 },
                      { label: "Pattern", val: transaction.riskBreakdown?.patternRisk || 0, max: 30 },
                    ].map((factor) => (
                      <div key={factor.label} className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-mono uppercase text-muted-foreground font-bold">{factor.label}</span>
                          <span className="text-xs font-black">{factor.val}/{factor.max}</span>
                        </div>
                        <Progress value={(factor.val / factor.max) * 100} className="h-1 bg-white/5" />
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            <div className="h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 800 }} 
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                Explainability Report
              </h4>
              <div className="p-5 h-[160px] rounded-2xl bg-white/5 border border-white/5 italic text-sm text-foreground/80 leading-relaxed font-mono relative overflow-hidden overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
                {transaction.explanation || "INITIATING_EXPLANATION_ENGINE..."}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                <History className="w-5 h-5" />
                User Activity Timeline
              </h4>
              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {userHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">{mounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}</span>
                      <span className="text-sm font-black">₹{mounted ? tx.amount.toLocaleString() : tx.amount}</span>
                    </div>
                    <Badge variant={tx.riskLevel === 'high' ? 'destructive' : 'outline'} className="text-[9px] h-4.5 px-2 uppercase font-black tracking-widest">
                      {tx.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col gap-6">
            <div className="space-y-3">
               <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                 <FileText className="w-4 h-4" />
                 Analyst Investigation Notes
               </label>
               <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono min-h-[100px] focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Enter detailed case observations..."
                value={transaction.analystNotes || ""}
                onChange={(e) => onUpdateNotes(transaction.id, e.target.value)}
               />
            </div>
            {transaction.investigationStatus === 'pending' && (
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 font-black uppercase text-xs tracking-widest"
                  onClick={() => onAction(transaction.id, 'approved')}
                >
                  Approve: False Positive
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 h-12 font-black uppercase text-xs tracking-widest"
                  onClick={() => onAction(transaction.id, 'blocked')}
                >
                  Block: Confirm Fraud
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="cyber-card border-accent/20 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-accent flex items-center gap-3">
            <Cpu className="w-5 h-5" />
            AI Model Governance & Transparency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Model Type</span>
              <p className="text-sm font-black">Hybrid ML + Behavioral AI</p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Last Training</span>
              <p className="text-sm font-black">2025-05-18 04:30 UTC</p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Drift Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-sm font-black text-emerald-500 uppercase tracking-widest">Stable</p>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Uptime</span>
              <p className="text-sm font-black">99.99%</p>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-accent/10 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase font-mono font-bold tracking-widest opacity-60">
              <Database className="w-4 h-4" />
              Source: Global Intelligence Mesh
            </div>
            <div className="flex items-center gap-3 text-xs text-accent uppercase font-mono font-black animate-pulse tracking-widest">
              <Activity className="w-4 h-4" />
              Real-time weights adjusting...
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
