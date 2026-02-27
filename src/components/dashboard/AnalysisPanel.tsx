"use client";

import { useState, useEffect } from "react";
import { Transaction, UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, Loader2, Download, Info, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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
      <Card className="h-full cyber-card border-dashed flex items-center justify-center min-h-[500px]">
        <div className="text-center opacity-40">
          <BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest">Select Case for Investigation</p>
        </div>
      </Card>
    );
  }

  const isScanning = transaction.status === 'pending';
  const userHistory = history.filter(h => h.userId === transaction.userId).slice(-5).reverse();

  return (
    <Card className="h-full cyber-card border-none shadow-sm flex flex-col relative overflow-hidden">
      <CardHeader className="border-b px-8 py-6 flex flex-row items-center justify-between shrink-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold tracking-widest uppercase text-primary flex items-center gap-3">
            <BrainCircuit className="w-4 h-4" />
            Case Investigation Portal
          </CardTitle>
          <div className="flex gap-4 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            <span>Case_ID: <span className="text-foreground">{transaction.caseId}</span></span>
            <span>Category: <span className="text-primary">{isScanning ? "Analyzing..." : transaction.category}</span></span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
          <Badge className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-3",
            transaction.investigationStatus === 'confirmed_fraud' ? "bg-destructive" : transaction.investigationStatus === 'false_positive' ? "bg-emerald-500" : "bg-amber-500"
          )}>
            {isScanning ? "Pending" : transaction.investigationStatus.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1 space-y-8 w-full">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mb-4">Aggregate Risk Score</span>
              <div className="flex items-baseline gap-8">
                <span className={cn(
                  "text-7xl font-bold tracking-tighter italic",
                  isScanning ? "text-muted animate-pulse" : transaction.riskLevel === 'high' ? "text-destructive" : "text-primary"
                )}>
                  {isScanning ? "---" : `${transaction.riskScore}%`}
                </span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Model Confidence</span>
                  <span className="text-2xl font-bold text-primary/60">{isScanning ? "--" : `${transaction.confidenceScore}%`}</span>
                </div>
              </div>
              <Progress value={isScanning ? 30 : transaction.riskScore} className="h-2 mt-4 bg-muted" />
            </div>

            <div className="space-y-4">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block">Risk Variance Decomposition</span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Amount", val: transaction.riskBreakdown?.amountRisk, max: 30 },
                  { label: "Device", val: transaction.riskBreakdown?.deviceRisk, max: 15 },
                  { label: "Location", val: transaction.riskBreakdown?.locationRisk, max: 15 },
                  { label: "Time", val: transaction.riskBreakdown?.timeRisk, max: 10 },
                  { label: "Pattern", val: transaction.riskBreakdown?.patternRisk, max: 30 },
                ].map((f) => (
                  <div key={f.label} className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tighter">
                      <span className="text-muted-foreground">{f.label}</span>
                      <span>{isScanning ? "--" : `${f.val}/${f.max}`}</span>
                    </div>
                    <Progress value={isScanning ? 20 : ((f.val || 0) / f.max) * 100} className="h-1 bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-48 h-48 bg-destructive/5 rounded-full flex items-center justify-center border border-destructive/10 relative overflow-hidden">
             {/* Mocking the polygon area in the screenshot */}
             <div className="w-32 h-32 bg-destructive/20 clip-polygon animate-pulse" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
             {isScanning && <Loader2 className="w-8 h-8 text-destructive animate-spin absolute" />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Info className="w-3 h-3" />
              Explainability Report
            </h4>
            <div className="p-4 rounded-xl bg-muted/30 text-[11px] leading-relaxed font-medium italic border text-muted-foreground min-h-[120px]">
              {isScanning ? "Generating neural narrative..." : transaction.explanation}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Clock className="w-3 h-3" />
              User Activity Timeline
            </h4>
            <div className="space-y-3">
              {userHistory.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground font-bold">{mounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}</span>
                  <span className="font-bold">₹{tx.amount.toLocaleString()}</span>
                  <Badge variant={tx.riskLevel === 'high' ? 'destructive' : 'secondary'} className="text-[8px] px-1.5 h-4">
                    {tx.riskLevel?.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-8 border-t">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            Analyst Investigation Notes
          </h4>
          <textarea 
            className="w-full bg-muted/20 border rounded-xl p-4 text-[11px] min-h-[100px] focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            placeholder="Enter case notes..."
            value={transaction.analystNotes || ""}
            onChange={(e) => onUpdateNotes(transaction.id, e.target.value)}
          />
        </div>

        {!isScanning && transaction.investigationStatus === 'pending' && (
          <div className="flex gap-4 pt-6">
            <Button 
              variant="outline" 
              className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest"
              onClick={() => onAction(transaction.id, 'approved')}
            >
              Approve Case
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 h-12 text-[10px] font-bold uppercase tracking-widest"
              onClick={() => onAction(transaction.id, 'blocked')}
            >
              Block Case
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
