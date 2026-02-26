"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Transaction, UserProfile, InvestigationStatus, FraudCategory } from "@/lib/types";
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
import { Shield, Radar, Zap, ShieldAlert, History } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function FraudShieldDashboard() {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(MOCK_PROFILES);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Add caseId and investigationStatus to initial data
    return INITIAL_TRANSACTIONS.map(tx => ({
      ...tx,
      caseId: `CASE-${tx.id.split('_')[1] || Math.floor(Math.random() * 1000)}`,
      investigationStatus: tx.status === 'flagged' ? 'pending' : 'pending' as InvestigationStatus,
      category: tx.riskLevel === 'high' ? 'Behavioral Anomaly' : 'Nominal' as FraudCategory,
      confidenceScore: 85 + Math.floor(Math.random() * 10)
    }));
  });
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertTx, setAlertTx] = useState<Transaction | null>(null);

  const selectedTransaction = useMemo(() => transactions.find(t => t.id === selectedTxId) || null, [transactions, selectedTxId]);
  const selectedProfile = useMemo(() => selectedTransaction ? profiles[selectedTransaction.userId] : null, [profiles, selectedTransaction]);

  const handleProcessTransaction = useCallback(async (userId: string, amount: number, location: string, device: string) => {
    setIsProcessing(true);
    const profile = profiles[userId];
    if (!profile) return;

    const rawTx: Transaction = {
      id: `TX_${Date.now()}`,
      caseId: `CASE-${Math.floor(Math.random() * 100000)}`,
      userId,
      userName: profile.name,
      amount,
      location,
      device,
      timestamp: new Date().toISOString(),
      status: 'pending',
      investigationStatus: 'pending'
    };

    const engineered = engineerFeatures(rawTx, profile, transactions);

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
          locationChange: engineered.locationChange,
          highFrequency: engineered.velocityAlert,
          unusualMerchant: engineered.structuringAlert
        }
      });

      const processedTx: Transaction = {
        ...rawTx,
        riskScore,
        confidenceScore: scoringResult.confidenceScore,
        category: scoringResult.category as FraudCategory,
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
  }, [profiles, transactions]);

  // Adaptive Learning: Feedback loop to update profiles
  const updateProfileLearning = useCallback((userId: string, location: string, device: string) => {
    setProfiles(prev => {
      const profile = prev[userId];
      if (!profile) return prev;
      
      const updatedLocations = Array.from(new Set([...profile.typicalLocations, location]));
      const updatedDevices = Array.from(new Set([...profile.typicalDevices, device]));
      
      return {
        ...prev,
        [userId]: {
          ...profile,
          typicalLocations: updatedLocations,
          typicalDevices: updatedDevices
        }
      };
    });
    toast({
      title: "Model Adaptive Learning",
      description: `Behavioral profile for user updated with new verified vectors.`,
    });
  }, []);

  const handleAction = (id: string, status: 'blocked' | 'approved') => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.map(t => t.id === id ? { 
      ...t, 
      status, 
      investigationStatus: status === 'blocked' ? 'confirmed_fraud' : 'false_positive' 
    } : t));
    
    if (status === 'approved' && tx) {
      updateProfileLearning(tx.userId, tx.location, tx.device);
    }

    setAlertTx(null);
    toast({
      title: status === 'blocked' ? "Threat Neutralized" : "Manual Override",
      description: `Action applied to transaction ${id}.`,
      variant: status === 'blocked' ? "destructive" : "default"
    });
  };

  const simulatePatternFraud = () => {
    const userId = 'USER_001';
    const profile = profiles[userId];
    // Rapid small amounts (Structuring)
    handleProcessTransaction(userId, 200, "Mumbai", "iPhone 15");
    setTimeout(() => handleProcessTransaction(userId, 200, "Mumbai", "iPhone 15"), 500);
    setTimeout(() => handleProcessTransaction(userId, 200, "Mumbai", "iPhone 15"), 1000);
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
              FraudShield AI
            </h1>
            <span className="text-[9px] font-mono text-muted-foreground tracking-[0.3em] uppercase opacity-60">
              Enterprise Operations Hub v3.1.0
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 border-primary/30 hover:bg-primary/10 transition-all font-mono text-[10px] uppercase tracking-widest h-8"
            onClick={simulatePatternFraud}
            disabled={isProcessing}
          >
            <History className="h-3.5 w-3.5" />
            Simulate_Pattern
          </Button>
           <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-2 border-destructive/30 hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest h-8"
            onClick={() => handleProcessTransaction('USER_002', 25000, "Dubai", "Unidentified Linux VM")}
            disabled={isProcessing}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Simulate_Attack
          </Button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Adaptive_Learning_On
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 relative">
        <div className="mx-auto max-w-[1600px] h-full flex flex-col gap-6 relative z-10">
          
          <StatCards transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 min-h-0">
              <TransactionInputForm onAddTransaction={handleProcessTransaction} isLoading={isProcessing} />
              <div className="flex-1 min-h-0">
                <TransactionFeed 
                  transactions={transactions} 
                  onSelect={(tx) => setSelectedTxId(tx.id)} 
                />
              </div>
            </div>

            <div className="lg:col-span-8 xl:col-span-9 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-6">
                  <AnalysisPanel 
                    transaction={selectedTransaction} 
                    profile={selectedProfile}
                    history={transactions}
                    onAction={handleAction}
                  />
                  <RiskTrendChart transactions={transactions} />
                </div>
                
                <div className="xl:col-span-4 space-y-6">
                  <motion.div className="cyber-card p-5 rounded-xl space-y-4 border-border/40">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                      <Radar className="w-4 h-4" />
                      Sector Threat Analysis
                    </h4>
                    <SpatialHeatmap transaction={selectedTransaction} history={transactions} />
                  </motion.div>

                  <motion.div className="cyber-card p-5 rounded-xl space-y-4 border-border/40">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Operational Intelligence
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded bg-white/5 border border-white/5 space-y-1">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">Model Confidence avg.</span>
                        <div className="flex justify-between items-end">
                          <span className="text-xl font-bold">91.4%</span>
                          <span className="text-[9px] text-emerald-500">+1.2%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded bg-white/5 border border-white/5 space-y-1">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">Active Alerts</span>
                        <div className="flex justify-between items-end">
                          <span className="text-xl font-bold text-destructive">{transactions.filter(t => t.investigationStatus === 'pending' && t.riskLevel === 'high').length}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">Awaiting Action</span>
                        </div>
                      </div>
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
