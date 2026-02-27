
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
          <p className="text-3xl font-mono tracking-widest uppercase font-black">Select Case for Investigation</p>
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
        <CardHeader className="bg-white/5 pb-8 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <CardTitle className="text-3xl font-black tracking-[0.2em] uppercase text-primary flex items-center gap-5">
                <BrainCircuit className="w-12 h-12" />
                Case Investigation Portal
              </CardTitle>
              <div className="flex gap-12">
                <p className="text-xl font-mono text-muted-foreground uppercase tracking-widest font-bold">Case_ID: <span className="text-foreground">{transaction.caseId}</span></p>
                <p className="text-xl font-mono text-muted-foreground uppercase tracking-widest font-bold">Category: <span className="text-accent">{isScanning ? "ANALYZING..." : transaction.category}</span></p>
              </div>
            </div>
            <div className="flex gap-6">
              <Button variant="ghost" size="icon" className="h-16 w-16 hover:bg-white/10" onClick={handleDownloadReport}>
                <Download className="w-8 h-8" />
              </Button>
              <Badge className={cn(
                "text-lg px-8 py-4 font-black uppercase tracking-widest",
                transaction.investigationStatus === 'confirmed_fraud' ? "bg-destructive" : transaction.investigationStatus === 'false_positive' ? "bg-emerald-500" : "bg-amber-500"
              )}>
                {isScanning ? "SCANNING" : transaction.investigationStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-12 space-y-16">
          {transaction.crossUserFlag && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-6 text-destructive"
            >
              <ShieldAlert className="w-12 h-12 animate-pulse" />
              <span className="text-xl font-black uppercase tracking-[0.2em]">NETWORK INTELLIGENCE ALERT: Suspicious Device Reuse Across Users</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
               <div className="relative">
                 <div className="flex justify-between items-end mb-8">
                   <div className="flex flex-col">
                     <span className="text-lg font-mono text-muted-foreground uppercase tracking-[0.3em] font-bold">Neural Risk Score</span>
                     <span className={cn(
                       "text-[10rem] font-black italic tracking-tighter leading-none transition-all",
                       isScanning ? "text-primary/40 animate-pulse" : isHighRisk ? "text-destructive" : "text-primary"
                     )}>
                       {isScanning ? "---" : transaction.riskScore}%
                     </span>
                   </div>
                   <div className="flex flex-col items-end pb-4">
                     <span className="text-lg font-mono text-muted-foreground uppercase tracking-widest font-bold">Model Confidence</span>
                     <span className={cn(
                       "text-6xl font-black transition-all",
                       isScanning ? "text-accent/40 animate-pulse" : "text-accent"
                     )}>
                       {isScanning ? "--" : transaction.confidenceScore}%
                     </span>
                   </div>
                 </div>
                 <Progress value={isScanning ? 30 : transaction.riskScore} className={cn(
                     "h-8 bg-white/5",
                     isScanning ? "[&>div]:bg-primary/20 animate-pulse" : isHighRisk ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
                 )} />
               </div>

               <div className="space-y-8">
                 <h5 className="text-base font-black text-muted-foreground uppercase tracking-[0.3em]">Adaptive Factor Contribution Weights</h5>
                 <div className="grid grid-cols-2 gap-8">
                    {[
                      { label: "Volume Ratio", val: transaction.riskBreakdown?.amountRisk, max: 30 },
                      { label: "Device Integrity", val: transaction.riskBreakdown?.deviceRisk, max: 15 },
                      { label: "Spatial Cluster", val: transaction.riskBreakdown?.locationRisk, max: 15 },
                      { label: "Temporal Baseline", val: transaction.riskBreakdown?.timeRisk, max: 10 },
                      { label: "Stream Patterns", val: transaction.riskBreakdown?.patternRisk, max: 30 },
                    ].map((factor) => (
                      <div key={factor.label} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-sm font-mono uppercase text-muted-foreground font-black tracking-widest">{factor.label}</span>
                          <span className="text-xl font-black">
                            {isScanning ? "--" : `${Math.round(((factor.val || 0) / factor.max) * 100)}%`}
                          </span>
                        </div>
                        <Progress 
                          value={isScanning ? 20 : ((factor.val || 0) / factor.max) * 100} 
                          className={cn("h-3 bg-white/5", isScanning && "animate-pulse")} 
                        />
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            <div className="h-[550px] relative">
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/20 backdrop-blur-sm rounded-full">
                  <div className="flex flex-col items-center gap-8">
                    <Loader2 className="w-20 h-20 text-primary animate-spin" />
                    <span className="text-xl font-mono font-black uppercase tracking-widest text-primary">Scanning Neural Vectors...</span>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 18, fontWeight: 900 }} 
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
            <div className="space-y-10">
              <h4 className="text-2xl font-black uppercase tracking-[0.2em] text-accent flex items-center gap-6">
                <AlertCircle className="w-10 h-10" />
                Explainable AI (XAI) Narrative
              </h4>
              <div className="p-10 h-[300px] rounded-2xl bg-white/5 border border-white/5 italic text-xl text-foreground/90 leading-relaxed font-mono relative overflow-hidden overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 w-3 h-full bg-accent" />
                {isScanning ? (
                  <div className="flex flex-col gap-8 animate-pulse">
                    <div className="h-6 bg-white/10 rounded w-full" />
                    <div className="h-6 bg-white/10 rounded w-5/6" />
                    <div className="h-6 bg-white/10 rounded w-4/6" />
                    <span className="text-base font-black uppercase tracking-widest text-accent mt-8">Decoding anomaly clusters...</span>
                  </div>
                ) : (
                  transaction.explanation || "WAITING_FOR_NLG_STREAM..."
                )}
              </div>
            </div>

            <div className="space-y-10">
              <h4 className="text-2xl font-black uppercase tracking-[0.2em] text-primary flex items-center gap-6">
                <History className="w-10 h-10" />
                Entity Behavior Baseline
              </h4>
              <div className="space-y-8 max-h-[300px] overflow-y-auto pr-6 custom-scrollbar">
                {userHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-8 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-base font-mono text-muted-foreground uppercase font-black">{mounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}</span>
                      <span className="text-3xl font-black">₹{mounted ? tx.amount.toLocaleString() : tx.amount}</span>
                    </div>
                    <Badge variant={tx.riskLevel === 'high' ? 'destructive' : 'outline'} className="text-base h-10 px-8 uppercase font-black tracking-widest">
                      {tx.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-16 border-t border-white/5 flex flex-col gap-12">
            <div className="space-y-8">
               <label className="text-xl font-black uppercase tracking-widest text-muted-foreground flex items-center gap-6">
                 <FileText className="w-10 h-10" />
                 Analyst Investigative Commentary
               </label>
               <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-10 text-xl font-mono min-h-[180px] focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Log critical evidence and pattern observations here..."
                value={transaction.analystNotes || ""}
                onChange={(e) => onUpdateNotes(transaction.id, e.target.value)}
               />
            </div>
            {!isScanning && transaction.investigationStatus === 'pending' && (
              <div className="flex gap-10">
                <Button 
                  variant="outline" 
                  className="flex-1 h-24 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 font-black uppercase text-xl tracking-widest"
                  onClick={() => onAction(transaction.id, 'approved')}
                >
                  Approve Case (Model Adaptation)
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 h-24 font-black uppercase text-xl tracking-widest shadow-2xl shadow-destructive/30"
                  onClick={() => onAction(transaction.id, 'blocked')}
                >
                  Block Case (Confirm Fraud)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="cyber-card border-accent/20 bg-accent/5">
        <CardHeader className="pb-8">
          <CardTitle className="text-xl font-black uppercase tracking-[0.4em] text-accent flex items-center gap-6">
            <Cpu className="w-10 h-10" />
            Adaptive Model Governance & Transparency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            <div className="space-y-6">
              <span className="text-sm font-mono text-muted-foreground uppercase font-black tracking-widest">Engine Mode</span>
              <p className="text-2xl font-black">Hybrid Behavioral + Rule</p>
            </div>
            <div className="space-y-6">
              <span className="text-sm font-mono text-muted-foreground uppercase font-black tracking-widest">Learning Status</span>
              <p className="text-2xl font-black">Active (Adaptive)</p>
            </div>
            <div className="space-y-6">
              <span className="text-sm font-mono text-muted-foreground uppercase font-black tracking-widest">Drift Integrity</span>
              <div className="flex items-center gap-5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.7)]" />
                <p className="text-2xl font-black text-emerald-500 uppercase tracking-widest">STABLE</p>
              </div>
            </div>
            <div className="space-y-6">
              <span className="text-sm font-mono text-muted-foreground uppercase font-black tracking-widest">Last Profile Update</span>
              <p className="text-2xl font-black">Real-time (Stream)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
