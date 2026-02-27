
"use client";

import { useState, useEffect } from "react";
import { Transaction, UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, AlertCircle, History, FileText, Download, ShieldAlert, Cpu, Database, Activity, Fingerprint, Loader2 } from "lucide-react";
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
          <p className="text-xl font-mono tracking-widest uppercase font-black">Select Case for Investigation</p>
        </div>
      </Card>
    );
  }

  const isScanning = transaction.status === 'pending';
  const isHighRisk = transaction.riskLevel === 'high';
  const userHistory = history.filter(h => h.userId === transaction.userId).slice(-5).reverse();

  const radarData = isScanning ? [
    { subject: 'Volume', A: 50 },
    { subject: 'Location', A: 50 },
    { subject: 'Device', A: 50 },
    { subject: 'Pattern', A: 50 },
    { subject: 'Network', A: 50 },
  ] : [
    { subject: 'Volume', A: Math.min((transaction.amount / (profile.averageAmount || 1)) * 20, 100) },
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
      className="space-y-10"
    >
      <Card className="cyber-card border-border/40 overflow-hidden relative scanline">
        <CardHeader className="bg-white/5 pb-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <CardTitle className="text-xl font-black tracking-[0.2em] uppercase text-primary flex items-center gap-4">
                <BrainCircuit className="w-8 h-8" />
                Case Investigation Portal
              </CardTitle>
              <div className="flex gap-8">
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Case_ID: <span className="text-foreground font-bold">{transaction.caseId}</span></p>
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Category: <span className="text-accent font-bold">{isScanning ? "ANALYZING..." : transaction.category}</span></p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-white/10" onClick={handleDownloadReport}>
                <Download className="w-6 h-6" />
              </Button>
              <Badge className={cn(
                "text-sm px-4 py-2 font-black uppercase tracking-widest",
                transaction.investigationStatus === 'confirmed_fraud' ? "bg-destructive" : transaction.investigationStatus === 'false_positive' ? "bg-emerald-500" : "bg-amber-500"
              )}>
                {isScanning ? "SCANNING" : transaction.investigationStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-10 space-y-12">
          {transaction.crossUserFlag && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-5 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-4 text-destructive"
            >
              <ShieldAlert className="w-8 h-8 animate-pulse" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">NETWORK INTELLIGENCE ALERT: Suspicious Device Reuse Detected</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-10">
               <div className="relative">
                 <div className="flex justify-between items-end mb-4">
                   <div className="flex flex-col">
                     <span className="text-sm font-mono text-muted-foreground uppercase tracking-[0.3em]">Aggregate Risk Score</span>
                     <span className={cn(
                       "text-8xl font-black italic tracking-tighter transition-all",
                       isScanning ? "text-primary/40 animate-pulse" : isHighRisk ? "text-destructive" : "text-primary"
                     )}>
                       {isScanning ? "---" : transaction.riskScore}%
                     </span>
                   </div>
                   <div className="flex flex-col items-end">
                     <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Model Confidence</span>
                     <span className={cn(
                       "text-3xl font-black transition-all",
                       isScanning ? "text-accent/40 animate-pulse" : "text-accent"
                     )}>
                       {isScanning ? "--" : transaction.confidenceScore}%
                     </span>
                   </div>
                 </div>
                 <Progress value={isScanning ? 30 : transaction.riskScore} className={cn(
                     "h-4 bg-white/5",
                     isScanning ? "[&>div]:bg-primary/20 animate-pulse" : isHighRisk ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
                 )} />
               </div>

               <div className="space-y-6">
                 <h5 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">Risk Variance Decomposition</h5>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Amount", val: transaction.riskBreakdown?.amountRisk, max: 30 },
                      { label: "Device", val: transaction.riskBreakdown?.deviceRisk, max: 15 },
                      { label: "Location", val: transaction.riskBreakdown?.locationRisk, max: 15 },
                      { label: "Time", val: transaction.riskBreakdown?.timeRisk, max: 10 },
                      { label: "Pattern", val: transaction.riskBreakdown?.patternRisk, max: 30 },
                    ].map((factor) => (
                      <div key={factor.label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[11px] font-mono uppercase text-muted-foreground font-bold">{factor.label}</span>
                          <span className="text-sm font-black">
                            {isScanning ? "--" : factor.val}/{factor.max}
                          </span>
                        </div>
                        <Progress 
                          value={isScanning ? 20 : ((factor.val || 0) / factor.max) * 100} 
                          className={cn("h-1.5 bg-white/5", isScanning && "animate-pulse")} 
                        />
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            <div className="h-[350px] relative">
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/20 backdrop-blur-sm rounded-full">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <span className="text-sm font-mono font-black uppercase tracking-widest text-primary">Calibrating Vectors...</span>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 900 }} 
                  />
                  <Radar
                    name="Deviation"
                    dataKey="A"
                    stroke={isScanning ? "hsl(var(--primary)/0.3)" : isHighRisk ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                    fill={isScanning ? "hsl(var(--primary)/0.1)" : isHighRisk ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent flex items-center gap-4">
                <AlertCircle className="w-6 h-6" />
                Explainability Report
              </h4>
              <div className="p-6 h-[200px] rounded-2xl bg-white/5 border border-white/5 italic text-base text-foreground/80 leading-relaxed font-mono relative overflow-hidden overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
                {isScanning ? (
                  <div className="flex flex-col gap-4 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-5/6" />
                    <div className="h-4 bg-white/10 rounded w-4/6" />
                    <span className="text-xs font-black uppercase tracking-widest text-accent mt-4">Sequencing narrative nodes...</span>
                  </div>
                ) : (
                  transaction.explanation || "INITIATING_EXPLANATION_ENGINE..."
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-4">
                <History className="w-6 h-6" />
                User Activity Timeline
              </h4>
              <div className="space-y-4 max-h-[200px] overflow-y-auto pr-3 custom-scrollbar">
                {userHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-muted-foreground uppercase font-bold">{mounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}</span>
                      <span className="text-lg font-black">₹{mounted ? tx.amount.toLocaleString() : tx.amount}</span>
                    </div>
                    <Badge variant={tx.riskLevel === 'high' ? 'destructive' : 'outline'} className="text-[10px] h-6 px-3 uppercase font-black tracking-widest">
                      {tx.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col gap-8">
            <div className="space-y-4">
               <label className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-4">
                 <FileText className="w-5 h-5" />
                 Analyst Investigation Notes
               </label>
               <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-base font-mono min-h-[120px] focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Enter detailed case observations..."
                value={transaction.analystNotes || ""}
                onChange={(e) => onUpdateNotes(transaction.id, e.target.value)}
               />
            </div>
            {!isScanning && transaction.investigationStatus === 'pending' && (
              <div className="flex gap-6">
                <Button 
                  variant="outline" 
                  className="flex-1 h-16 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 font-black uppercase text-sm tracking-widest"
                  onClick={() => onAction(transaction.id, 'approved')}
                >
                  Approve: False Positive
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 h-16 font-black uppercase text-sm tracking-widest shadow-lg shadow-destructive/20"
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
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-black uppercase tracking-[0.4em] text-accent flex items-center gap-4">
            <Cpu className="w-6 h-6" />
            AI Model Governance & Transparency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Model Type</span>
              <p className="text-base font-black">Hybrid ML + Behavioral AI</p>
            </div>
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Last Training</span>
              <p className="text-base font-black">2025-05-18 04:30 UTC</p>
            </div>
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Drift Status</span>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <p className="text-base font-black text-emerald-500 uppercase tracking-widest">Stable</p>
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-muted-foreground uppercase font-bold tracking-widest">Uptime</span>
              <p className="text-base font-black">99.99%</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-accent/10 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase font-mono font-bold tracking-widest opacity-60">
              <Database className="w-5 h-5" />
              Source: Global Intelligence Mesh
            </div>
            <div className="flex items-center gap-4 text-xs text-accent uppercase font-mono font-black animate-pulse tracking-widest">
              <Activity className="w-5 h-5" />
              Real-time weights adjusting...
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
