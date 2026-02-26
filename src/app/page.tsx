
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
import { Button } from "@/components/ui/button";
import { Shield, Plus, RefreshCw, Radar, Activity, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function GuardianAIDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedTransaction = transactions.find(t => t.id === selectedTxId) || null;
  const selectedProfile = selectedTransaction ? MOCK_PROFILES[selectedTransaction.userId] : null;

  const processNewTransaction = useCallback(async (rawTx: Transaction) => {
    const profile = MOCK_PROFILES[rawTx.userId];
    if (!profile) return;

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
        explanation: explanationResult.explanation,
        status: riskLevel === 'high' ? 'flagged' : 'cleared'
      };

      setTransactions(prev => [...prev, processedTx]);

      if (riskLevel === 'high') {
        toast({
          title: "Critical Threat Alert",
          description: `Anomaly detected for ${rawTx.userName}. Execution halted.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Protocol Failure",
        description: "AI Neural Bridge disconnected during analysis.",
        variant: "destructive",
      });
    }
  }, []);

  const simulateRandomTransaction = () => {
    setIsSimulating(true);
    const userIds = Object.keys(MOCK_PROFILES);
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const profile = MOCK_PROFILES[userId];
    
    const isSuspicious = Math.random() > 0.7;
    const amount = isSuspicious 
      ? profile.averageAmount * (Math.random() * 40 + 5) 
      : profile.averageAmount * (Math.random() * 0.4 + 0.6);
    
    const locations = ['Dubai', 'Moscow', 'London', 'Unknown'];
    const location = isSuspicious && Math.random() > 0.5 
      ? locations[Math.floor(Math.random() * locations.length)] 
      : profile.typicalLocations[0];

    const newTx: Transaction = {
      id: `TX_${Date.now()}`,
      userId,
      userName: profile.name,
      amount: Math.round(amount),
      location,
      device: isSuspicious && Math.random() > 0.5 ? 'Unknown Device' : profile.typicalDevices[0],
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    processNewTransaction(newTx).finally(() => setIsSimulating(false));
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Header */}
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
              Cyber Defense Protocol v2.4.1
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex items-center gap-2 border-primary/30 hover:bg-primary/10 transition-all font-mono text-[10px] uppercase tracking-widest h-8"
            onClick={simulateRandomTransaction}
            disabled={isSimulating}
          >
            {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 text-primary" />}
            Ingest_Data
          </Button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active_Monitor
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-6 relative">
        <div className="mx-auto max-w-[1600px] h-full flex flex-col gap-6 relative z-10">
          
          <StatCards transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            {/* Left Feed */}
            <div className="lg:col-span-4 xl:col-span-3 min-h-0">
              <TransactionFeed 
                transactions={transactions} 
                onSelect={(tx) => setSelectedTxId(tx.id)} 
              />
            </div>

            {/* Right Detailed Analysis */}
            <div className="lg:col-span-8 xl:col-span-9 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8">
                  <AnalysisPanel 
                    transaction={selectedTransaction} 
                    profile={selectedProfile} 
                  />
                </div>
                
                {/* Secondary Tactical Panels */}
                <div className="xl:col-span-4 space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="cyber-card p-5 rounded-xl space-y-4 border-border/40"
                  >
                    <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                      <Radar className="w-4 h-4" />
                      Spatial Threat Heatmap
                    </h4>
                    <div className="aspect-square bg-white/5 rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] group-hover:opacity-20 transition-opacity" />
                      {selectedTransaction ? (
                        <div className="relative w-full h-full p-4 flex flex-col items-center justify-center">
                           <div className={cn(
                             "w-32 h-32 rounded-full border-2 flex items-center justify-center text-[10px] font-black italic tracking-widest transition-all duration-700",
                             selectedTransaction.riskLevel === 'high' 
                               ? "border-destructive text-destructive bg-destructive/5 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.2)]" 
                               : "border-primary text-primary bg-primary/5"
                           )}>
                             {selectedTransaction.riskLevel === 'high' ? "OUTLIER_DETECTED" : "SIGNATURE_MATCH"}
                           </div>
                           <div className="mt-4 text-[9px] font-mono text-muted-foreground opacity-60 uppercase">Vector Correlation: 0.9{selectedTransaction.riskScore}</div>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                           <Activity className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                           <p className="text-[9px] font-mono text-muted-foreground uppercase opacity-40">System Idle</p>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="cyber-card p-5 rounded-xl space-y-4 border-border/40"
                  >
                    <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Automated Defenses
                    </h4>
                    <div className="space-y-3">
                      <AnimatePresence mode="wait">
                        {selectedTransaction?.riskLevel === 'high' ? (
                          <motion.div 
                            key="threat"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="space-y-3"
                          >
                            <div className="flex items-start gap-3 p-2 rounded bg-destructive/10 border border-destructive/20">
                               <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0 animate-pulse" />
                               <div className="space-y-0.5">
                                 <p className="text-[10px] font-bold uppercase tracking-tight">Access Restricted</p>
                                 <p className="text-[9px] text-muted-foreground font-mono">Suspended transaction pipeline TX_{selectedTransaction.id.split('_')[1]}</p>
                               </div>
                            </div>
                            <div className="flex items-start gap-3 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                               <div className="space-y-0.5">
                                 <p className="text-[10px] font-bold uppercase tracking-tight">Uplink Notification</p>
                                 <p className="text-[9px] text-muted-foreground font-mono">SMS/Email encrypted dispatch sent</p>
                               </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="idle"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="py-6 text-center"
                          >
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] opacity-30">All_Systems_Nominal</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Simulate FAB */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-2xl bg-primary text-white hover:scale-105 active:scale-95 transition-transform"
          onClick={simulateRandomTransaction}
          disabled={isSimulating}
        >
          {isSimulating ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
}
