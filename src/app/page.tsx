"use client";

import { useState, useCallback } from "react";
import { Transaction } from "@/lib/types";
import { INITIAL_TRANSACTIONS, MOCK_PROFILES } from "@/lib/mock-data";
import { engineerFeatures, getRiskLevel } from "@/lib/feature-engineering";
import { calculateFraudRisk } from "@/ai/flows/ai-powered-transaction-risk-scoring-flow";
import { generateFraudExplanation } from "@/ai/flows/ai-generated-fraud-explanation-flow";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import { StatCards } from "@/components/dashboard/StatCards";
import { TransactionInputForm } from "@/components/dashboard/TransactionInputForm";
import { RiskTrendChart } from "@/components/dashboard/RiskTrendChart";
import { FraudAlertNotification } from "@/components/dashboard/FraudAlertNotification";
import { SpatialHeatmap } from "@/components/dashboard/SpatialHeatmap";
import { Button } from "@/components/ui/button";
import { Shield, Radar, Zap, ShieldAlert, Cpu } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function GuardianAIDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertTx, setAlertTx] = useState<Transaction | null>(null);

  const selectedTransaction = transactions.find(t => t.id === selectedTxId) || null;
  const selectedProfile = selectedTransaction ? MOCK_PROFILES[selectedTransaction.userId] : null;

  const handleProcessTransaction = useCallback(async (userId: string, amount: number, location: string, device: string) => {
    setIsProcessing(true);
    const profile = MOCK_PROFILES[userId];
    if (!profile) return;

    const rawTx: Transaction = {
      id: `TX_${Date.now()}`,
      userId,
      userName: profile.name,
      amount,
      location,
      device,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    const engineered = engineerFeatures(rawTx, profile);

    try {
      const scoringResult = await calculateFraudRisk({
        userId: rawTx.userId,
        amount: rawTx.amount,
        location: rawTx.location,
        device: rawTx.device,
        timestamp: rawTx.timestamp,
        engineeredFeatures: engineered,
        userProfile: profile
      });

      const riskScore = scoringResult.riskScore;
      const riskLevel = getRiskLevel(riskScore);

      const explanationResult = await generateFraudExplanation({
        userId: rawTx.userId,
        amount: rawTx.amount,
        location: rawTx.location,
        device: rawTx.device,
        timestamp: rawTx.timestamp,
        riskScore,
        reasons: {
          amountSignificantDeviation: engineered.amountRatio > 2,
          newDeviceDetected: engineered.newDevice,
          unusualTime: engineered.unusualTime,
          locationChange: engineered.locationChange
        }
      });

      const processedTx: Transaction = {
        ...rawTx,
        riskScore,
        riskLevel,
        riskBreakdown: scoringResult.riskBreakdown,
        explanation: explanationResult.explanation,
        status: riskLevel === 'high' ? 'flagged' : 'cleared'
      };

      setTransactions(prev => [...prev, processedTx]);
      setSelectedTxId(processedTx.id);

      if (riskLevel === 'high') {
        setAlertTx(processedTx);
      } else {
        toast({
          title: "System Status",
          description: `Transaction for ${rawTx.userName} verified successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Protocol Failure",
        description: "AI Neural Bridge disconnected during analysis.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleAction = (id: string, status: 'blocked' | 'approved') => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    setAlertTx(null);
    toast({
      title: status === 'blocked' ? "Threat Neutralized" : "Manual Override",
      description: `Action applied to transaction ${id}.`,
      variant: status === 'blocked' ? "destructive" : "default"
    });
  };

  const simulateThreat = () => {
    const userIds = Object.keys(MOCK_PROFILES);
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const profile = MOCK_PROFILES[userId];
    const suspiciousAmount = profile.averageAmount * 15;
    handleProcessTransaction(userId, suspiciousAmount, "Dubai", "Unidentified Android 4.0");
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden selection:bg-primary/30">
      <header className="flex h-16 items-center justify-between border-b border-white/5 px-6 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className="bg-primary/20 p-2 rounded-xl border border-primary/30"
          >
            <Shield className="h-6 w-6 text-primary" />
          </motion.div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase">
              Guardian AI
            </h1>
            <span className="text-[9px] font-mono text-muted-foreground tracking-[0.3em] uppercase opacity-60">
              Cyber Defense Protocol v2.5.0
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-2 border-destructive/30 hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest h-8"
            onClick={simulateThreat}
            disabled={isProcessing}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Simulate_Threat
          </Button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active_Monitor
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 relative">
        <div className="mx-auto max-w-[1600px] h-full flex flex-col gap-6 relative z-10">
          
          <StatCards transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            {/* Left Column: Feed and Inputs */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 min-h-0">
              <TransactionInputForm onAddTransaction={handleProcessTransaction} isLoading={isProcessing} />
              <div className="flex-1 min-h-0">
                <TransactionFeed 
                  transactions={transactions} 
                  onSelect={(tx) => setSelectedTxId(tx.id)} 
                />
              </div>
            </div>

            {/* Right Column: Detailed Analysis and Charts */}
            <div className="lg:col-span-8 xl:col-span-9 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-6">
                  <AnalysisPanel 
                    transaction={selectedTransaction} 
                    profile={selectedProfile} 
                  />
                  <RiskTrendChart transactions={transactions} />
                </div>
                
                {/* Tactical Sidebar */}
                <div className="xl:col-span-4 space-y-6">
                  <motion.div className="cyber-card p-5 rounded-xl space-y-4 border-border/40">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                      <Radar className="w-4 h-4" />
                      Spatial Threat Heatmap
                    </h4>
                    <SpatialHeatmap transaction={selectedTransaction} />
                  </motion.div>

                  <motion.div className="cyber-card p-5 rounded-xl space-y-4 border-border/40">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Automated Defenses
                    </h4>
                    <div className="space-y-3">
                      {selectedTransaction?.riskLevel === 'high' ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-2 rounded bg-destructive/10 border border-destructive/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0 animate-pulse" />
                             <p className="text-[9px] text-muted-foreground font-mono uppercase">Pipeline Suspended: Vector Divergence</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] font-mono text-muted-foreground uppercase text-center py-4 opacity-30">Nominal Activity</p>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FraudAlertNotification 
        transaction={alertTx} 
        onClose={() => setAlertTx(null)} 
        onAction={handleAction} 
      />
    </div>
  );
}
