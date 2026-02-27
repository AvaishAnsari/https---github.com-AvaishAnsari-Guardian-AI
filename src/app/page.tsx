
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Transaction, UserProfile, FraudCategory, SystemConfig, UserRole, RiskBreakdown } from "@/lib/types";
import { INITIAL_TRANSACTIONS, MOCK_PROFILES } from "@/lib/mock-data";
import { engineerFeatures } from "@/lib/feature-engineering";
import { calculateFraudRisk } from "@/ai/flows/ai-powered-transaction-risk-scoring-flow";
import { generateFraudExplanation } from "@/ai/flows/ai-generated-fraud-explanation-flow";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import { StatCards } from "@/components/dashboard/StatCards";
import { TransactionInputForm } from "@/components/dashboard/TransactionInputForm";
import { FraudAlertNotification } from "@/components/dashboard/FraudAlertNotification";
import { SpatialHeatmap } from "@/components/dashboard/SpatialHeatmap";
import { FraudTypology } from "@/components/dashboard/FraudTypology";
import { AdminSettings } from "@/components/dashboard/AdminSettings";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, Sun, Moon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function FraudShieldDashboard() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(MOCK_PROFILES);
  const [role, setRole] = useState<UserRole>('analyst');
  const [config, setConfig] = useState<SystemConfig>({
    thresholds: { low: 35, medium: 75, high: 90 }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return INITIAL_TRANSACTIONS.map(tx => ({
      ...tx,
      caseId: `CASE-${tx.id.split('_')[1] || Math.floor(Math.random() * 1000)}`,
      investigationStatus: tx.investigationStatus || 'pending',
      category: tx.category || (tx.riskLevel === 'high' ? 'Behavioral Anomaly' : 'Nominal'),
      confidenceScore: tx.confidenceScore || (85 + Math.floor(Math.random() * 10))
    }));
  });

  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertTx, setAlertTx] = useState<Transaction | null>(null);

  const selectedTransaction = useMemo(() => {
    return transactions.find(t => t.id === selectedTxId) || transactions[transactions.length - 1] || null;
  }, [transactions, selectedTxId]);

  const selectedProfile = useMemo(() => {
    if (!selectedTransaction) return null;
    return profiles[selectedTransaction.userId] || null;
  }, [selectedTransaction, profiles]);

  const deviceRegistry = useMemo(() => {
    const registry: Record<string, string[]> = {};
    transactions.forEach(tx => {
      if (!registry[tx.device]) registry[tx.device] = [];
      if (!registry[tx.device].includes(tx.userId)) registry[tx.device].push(tx.userId);
    });
    return registry;
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0 && !selectedTxId) {
      const highRisk = transactions.find(t => t.riskLevel === 'high');
      setSelectedTxId(highRisk ? highRisk.id : transactions[transactions.length - 1].id);
    }
  }, [transactions, selectedTxId]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleProcessTransaction = useCallback(async (userId: string, amount: number, location: string, device: string, silent = false) => {
    const profile = profiles[userId];
    if (!profile) return;

    const txId = `TX_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const initialTx: Transaction = {
      id: txId,
      caseId: `CASE-${Math.floor(Math.random() * 100000)}`,
      userId,
      userName: profile.name,
      amount,
      location,
      device,
      timestamp: new Date().toISOString(),
      beneficiaryStatus: Math.random() > 0.8 ? 'new' : 'trusted',
      status: 'pending',
      investigationStatus: 'pending'
    };

    setTransactions(prev => [...prev, initialTx]);
    
    if (!silent) {
      setIsProcessing(true);
      setSelectedTxId(txId);
    }

    try {
      const engineered = engineerFeatures(initialTx, profile, transactions);
      const isDeviceUsedByOthers = deviceRegistry[device] && deviceRegistry[device].some(uid => uid !== userId);
      engineered.deviceReuseAlert = isDeviceUsedByOthers;

      if (!silent) await new Promise(r => setTimeout(r, 1500));

      let scoringResult;
      try {
        scoringResult = await calculateFraudRisk({
          userId: initialTx.userId,
          amount: initialTx.amount,
          location: initialTx.location,
          device: initialTx.device,
          timestamp: initialTx.timestamp,
          engineeredFeatures: engineered,
          userProfile: profile
        });
      } catch (e) {
        const baseRisk = (engineered.amountRatio > 5 ? 50 : engineered.amountRatio > 2 ? 30 : 0) +
                         (engineered.newDevice ? 20 : 0) +
                         (engineered.locationChange ? 20 : 0) +
                         (engineered.velocityAlert ? 40 : 0) +
                         (engineered.newBeneficiaryAlert ? 30 : 0) +
                         (isDeviceUsedByOthers ? 15 : 0);
        
        scoringResult = {
          riskScore: Math.min(100, baseRisk),
          confidenceScore: 88,
          category: engineered.velocityAlert ? 'Velocity Risk' : engineered.newBeneficiaryAlert ? 'Pattern-Based Fraud' : 'Behavioral Anomaly',
          riskBreakdown: {
            amountRisk: Math.min(30, engineered.amountRatio * 5),
            deviceRisk: engineered.newDevice ? 15 : 2,
            locationRisk: engineered.locationChange ? 15 : 2,
            timeRisk: engineered.unusualTime ? 10 : 2,
            patternRisk: (engineered.velocityAlert ? 15 : 0) + (engineered.newBeneficiaryAlert ? 15 : 0)
          }
        };
      }

      let finalRiskScore = scoringResult.riskScore;
      const riskLevel = finalRiskScore >= config.thresholds.high ? 'high' : finalRiskScore >= config.thresholds.medium ? 'medium' : 'low';

      let explanation;
      try {
        const explanationResult = await generateFraudExplanation({
          userId: initialTx.userId,
          amount: initialTx.amount,
          location: initialTx.location,
          device: initialTx.device,
          timestamp: initialTx.timestamp,
          riskScore: finalRiskScore,
          amountRatio: engineered.amountRatio,
          reasons: {
            amountSignificantDeviation: engineered.amountRatio > 2,
            newDeviceDetected: engineered.newDevice,
            unusualTime: engineered.unusualTime,
            locationChange: engineered.locationChange,
            highFrequency: engineered.velocityAlert,
            unusualMerchant: engineered.structuringAlert || isDeviceUsedByOthers,
            newBeneficiary: engineered.newBeneficiaryAlert
          }
        });
        explanation = explanationResult.explanation;
      } catch (e) {
        explanation = `Institutional Heuristics: Flagged due to ${engineered.amountRatio.toFixed(1)}x volume deviation combined with ${[
          engineered.newDevice ? 'unrecognized device signature' : null,
          engineered.newBeneficiaryAlert ? 'new beneficiary transfer' : null,
          engineered.locationChange ? 'geographic anomaly' : null
        ].filter(Boolean).join(' and ')}.`;
      }

      const processedTx: Transaction = {
        ...initialTx,
        riskScore: finalRiskScore,
        confidenceScore: scoringResult.confidenceScore,
        category: scoringResult.category as FraudCategory,
        riskLevel,
        riskBreakdown: scoringResult.riskBreakdown as RiskBreakdown,
        explanation,
        status: riskLevel === 'high' ? 'flagged' : 'cleared',
        crossUserFlag: isDeviceUsedByOthers
      };

      setTransactions(prev => prev.map(t => t.id === txId ? processedTx : t));
      
      if (!silent) {
        if (riskLevel === 'high') {
          setAlertTx(processedTx);
        } else {
          toast({
            title: "Entity Analysis Complete",
            description: `Risk Level: ${riskLevel.toUpperCase()}. Pattern verified.`,
          });
        }
      }
    } catch (error) {
      if (!silent) {
        toast({
          title: "Protocol Interrupted",
          description: "Analysis bridge timeout. Check network status.",
          variant: "destructive",
        });
      }
    } finally {
      if (!silent) setIsProcessing(false);
    }
  }, [profiles, transactions, config, deviceRegistry]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6 && !isProcessing) {
        const userIds = Object.keys(profiles);
        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        const profile = profiles[randomUserId];
        const amount = profile.averageAmount * (0.5 + Math.random() * 0.8);
        const location = profile.typicalLocations[Math.floor(Math.random() * profile.typicalLocations.length)];
        const device = profile.typicalDevices[Math.floor(Math.random() * profile.typicalDevices.length)];
        handleProcessTransaction(randomUserId, Math.round(amount), location, device, true);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [profiles, isProcessing, handleProcessTransaction]);

  const handleAction = (id: string, status: 'blocked' | 'approved') => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.map(t => t.id === id ? { 
      ...t, 
      status, 
      investigationStatus: status === 'blocked' ? 'confirmed_fraud' : 'false_positive' 
    } : t));
    
    if (status === 'approved') {
      setProfiles(prev => {
        const user = prev[tx.userId];
        if (!user) return prev;
        const updatedTypicalLocations = [...new Set([...user.typicalLocations, tx.location])];
        const updatedTypicalDevices = [...new Set([...user.typicalDevices, tx.device])];
        return {
          ...prev,
          [tx.userId]: {
            ...user,
            typicalLocations: updatedTypicalLocations,
            typicalDevices: updatedTypicalDevices
          }
        };
      });
      toast({
        title: "Adaptive Learning Triggered",
        description: "User behavioral profile updated with new baseline data.",
      });
    }

    setAlertTx(null);
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, analystNotes: notes } : t));
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden font-bold">
      <header className="flex h-16 items-center justify-between border-b bg-card px-8 shrink-0">
        <div className="flex items-center gap-4">
          <Shield className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight text-primary uppercase leading-none">
              FraudShield AI
            </h1>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-70 font-black">
              Enterprise Hub v3.2.0 | {role === 'analyst' ? 'Analyst' : 'Risk Manager'} Active
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-[#f1f5f9] rounded-full p-1 border border-[#e2e8f0]">
            <button 
              onClick={() => setRole('analyst')}
              className={cn(
                "px-6 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                role === 'analyst' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Analyst
            </button>
            <button 
              onClick={() => setRole('risk_manager')}
              className={cn(
                "px-6 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                role === 'risk_manager' ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Manager
            </button>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-destructive/30 text-destructive hover:bg-destructive/10 text-[10px] font-black uppercase h-8"
            onClick={() => handleProcessTransaction('USER_002', 145000, "London", "vivo_x100")}
          >
            <ShieldAlert className="h-3 w-3 mr-2" />
            Simulate_Fraud
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 bg-[#f8f9fc]">
        <div className="mx-auto max-w-[1600px] h-full flex flex-col gap-6">
          <StatCards transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            {/* Left Column */}
            <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
              <TransactionInputForm 
                profiles={profiles}
                onAddTransaction={handleProcessTransaction} 
                isLoading={isProcessing} 
              />
              <div className="flex-1 min-h-0">
                <TransactionFeed 
                  transactions={transactions} 
                  onSelect={(tx) => setSelectedTxId(tx.id)} 
                />
              </div>
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-6 min-h-0">
              <AnimatePresence mode="wait">
                {role === 'analyst' ? (
                  <motion.div
                    key="analyst-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="h-full"
                  >
                    <AnalysisPanel 
                      transaction={selectedTransaction} 
                      profile={selectedProfile}
                      history={transactions}
                      onAction={handleAction}
                      onUpdateNotes={handleUpdateNotes}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="manager-view"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="h-full"
                  >
                    <div className="flex flex-col gap-6 h-full">
                      <AdminSettings config={config} onUpdate={setConfig} />
                      <div className="flex-1 cyber-card p-8 flex items-center justify-center border-dashed">
                        <div className="text-center space-y-4">
                          <Shield className="w-16 h-16 text-primary mx-auto opacity-20" />
                          <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Global Policy View</h3>
                          <p className="text-sm text-muted-foreground font-black max-w-md">The system is currently operating under institutional constraints. All behavioral profiles are being updated in real-time across the intelligence mesh.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
              <FraudTypology transactions={transactions} />
              <div className="flex-1 cyber-card p-6">
                <h4 className="text-[10px] font-black tracking-widest uppercase text-primary flex items-center gap-2 mb-4">
                  Tactical Threat Radar
                </h4>
                <SpatialHeatmap transaction={selectedTransaction} history={transactions} />
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
