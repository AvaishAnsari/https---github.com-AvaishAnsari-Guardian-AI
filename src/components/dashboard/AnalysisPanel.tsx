"use client";

import { useState, useEffect } from "react";
import { Transaction, UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Smartphone, Clock, AlertCircle, Fingerprint, BrainCircuit, History, FileText, Download, ShieldAlert, Cpu, Database, Activity } from "lucide-react";
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
      className="space-y-6"
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
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={handleDownloadReport}>
                <Download className="w-4 h-4" />
              </Button>
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
          {transaction.crossUserFlag && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-2 bg-destructive/10 border border-destructive/20 rounded flex items-center gap-2 text-destructive"
            >
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">NETWORK INTELLIGENCE ALERT: Suspicious Device Reuse Detected</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
               <div className="relative">
                 <div className="flex justify-between items-end mb-2">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Aggregate Risk Score</span>
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

               <div className="space-y-3">
                 <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Risk Variance Decomposition</h5>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: "Amount", val: transaction.riskBreakdown?.amountRisk || 0, max: 30 },
                      { label: "Device", val: transaction.riskBreakdown?.deviceRisk || 0, max: 15 },
                      { label: "Location", val: transaction.riskBreakdown?.locationRisk || 0, max: 15 },
                      { label: "Time", val: transaction.riskBreakdown?.timeRisk || 0, max: 10 },
                      { label: "Pattern", val: transaction.riskBreakdown?.patternRisk || 0, max: 30 },
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

            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                User Activity Timeline
              </h4>
              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                {userHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-mono text-muted-foreground uppercase">{mounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}</span>
                      <span className="text-[10px] font-bold">₹{mounted ? tx.amount.toLocaleString() : tx.amount}</span>
                    </div>
                    <Badge variant={tx.riskLevel === 'high' ? 'destructive' : 'outline'} className="text-[7px] h-3.5 px-1 uppercase">
                      {tx.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                 <FileText className="w-3 h-3" />
                 Analyst Investigation Notes
               </label>
               <textarea 
                className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs font-mono min-h-[60px] focus:outline-none focus:border-primary/50"
                placeholder="Enter case notes..."
                value={transaction.analystNotes || ""}
                onChange={(e) => onUpdateNotes(transaction.id, e.target.value)}
               />
            </div>
            {transaction.investigationStatus === 'pending' && (
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 font-bold uppercase text-[10px]"
                  onClick={() => onAction(transaction.id, 'approved')}
                >
                  Approve: False Positive
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 font-bold uppercase text-[10px]"
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
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            AI Model Governance & Transparency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-muted-foreground uppercase">Model Type</span>
              <p className="text-[10px] font-bold">Hybrid ML + Behavioral AI</p>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-muted-foreground uppercase">Last Training</span>
              <p className="text-[10px] font-bold">2025-05-18 04:30 UTC</p>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-muted-foreground uppercase">Drift Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                <p className="text-[10px] font-bold text-emerald-500 uppercase">Stable</p>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-muted-foreground uppercase">Uptime</span>
              <p className="text-[10px] font-bold">99.99%</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-accent/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[8px] text-muted-foreground uppercase font-mono">
              <Database className="w-3 h-3" />
              Source: Global Intelligence Mesh
            </div>
            <div className="flex items-center gap-2 text-[8px] text-accent uppercase font-mono animate-pulse">
              <Activity className="w-3 h-3" />
              Real-time weights adjusting...
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
