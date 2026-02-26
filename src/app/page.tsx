
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Transaction, UserProfile, InvestigationStatus, FraudCategory, SystemConfig, UserRole } from "@/lib/types";
import { INITIAL_TRANSACTIONS, MOCK_PROFILES } from "@/lib/mock-data";
import { engineerFeatures } from "@/lib/feature-engineering";
import { calculateFraudRisk } from "@/ai/flows/ai-powered-transaction-risk-scoring-flow";
import { generateFraudExplanation } from "@/ai/flows/ai-generated-fraud-explanation-flow";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import { StatCards } from "@/components/dashboard/StatCards";
import { TransactionInputForm } from "@/components/dashboard/TransactionInputForm";
import { RiskTrendChart } from "@/components/dashboard/RiskTrendChart";
import { FraudAlertNotification } from "@/components/dashboard/FraudAlertNotification";
import { SpatialHeatmap } from "@/components/dashboard/SpatialHeatmap";
import { FraudTypology } from "@/components/dashboard/FraudTypology";
import { AdminSettings } from "@/components/dashboard/AdminSettings";
import { Button } from "@/components/ui/button";
import { Shield, Radar, Zap, ShieldAlert, Settings, ArrowRightLeft, Sun, Moon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function FraudShieldDashboard() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(MOCK_PROFILES);
  const [role, setRole] = useState<UserRole>('analyst');
  const [config, setConfig] = useState<SystemConfig>({
    thresholds: { low: 35, medium: 75, high: 90 }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return INITIAL_TRANSACTIONS.map(tx => ({
      ...tx,
      caseId: `CASE-${tx.id.split('_')[1] || Math.floor(Math.random() * 1000)}`,
      investigationStatus: tx.status === 'flagged' ? 'pending' : (tx.status === 'cleared' ? 'pending' : 'pending' as InvestigationStatus),
      category: tx.riskLevel === 'high' ? 'Behavioral Anomaly' : 'Nominal' as FraudCategory,
      confidenceScore: 85 + Math.floor(Math.random() * 10)
    }));
  });

  // Auto-select the first (usually high-risk) transaction to avoid empty center panel
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  useEffect(() => {
    if (transactions.length > 0 && !selectedTxId) {
      setSelectedTxId(transactions[transactions.length - 1].id);
    }
  }, [transactions, selectedTxId]);

  const selectedTransaction = useMemo(() => transactions.find(t => t.id === selectedTxId) || null, [transactions, selectedTxId]);
  const selectedProfile = useMemo(() => selectedTransaction ? profiles[selectedTransaction.userId] : null, [profiles, selectedTransaction]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('fraudshield-theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('fraudshield-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const deviceRegistry = useMemo(() => {
    const registry: Record<string, string[]> = {};
    transactions.forEach(tx => {
      if (!registry[tx.device]) registry[tx.device] = [];
      if (!registry[tx.device].includes(tx.userId)) registry[tx.device].push(tx.userId);
    });
    return registry;
  }, [transactions]);

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
    const isDeviceUsedByOthers = deviceRegistry[device] && deviceRegistry[device].some(uid => uid !== userId);
    engineered.deviceReuseAlert = isDeviceUsedByOthers;

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

      const recentFlags = transactions.filter(t => t.userId === userId && t.status === 'flagged' && (Date.now() - new Date(t.timestamp).getTime()) < 3600000).length;
      let finalRiskScore = scoringResult.riskScore;
      
      if (recentFlags > 1) finalRiskScore = Math.min(100, finalRiskScore + 15);
      if (isDeviceUsedByOthers) finalRiskScore = Math.min(100, finalRiskScore + 10);

      const riskLevel = finalRiskScore >= config.thresholds.high ? 'high' : finalRiskScore >= config.thresholds.medium ? 'medium' : 'low';

      const explanationResult = await generateFraudExplanation({
        userId: rawTx.userId,
        amount: rawTx.amount,
        location: rawTx.location,
        device: rawTx.device,
        timestamp: rawTx.timestamp,
        riskScore: finalRiskScore,
        reasons: {
          amountSignificantDeviation: engineered.amountRatio > 2,
          newDeviceDetected: engineered.newDevice,
          unusualTime: engineered.unusualTime,
          locationChange: engineered.locationChange,
          highFrequency: engineered.velocityAlert,
          unusualMerchant: engineered.structuringAlert || isDeviceUsedByOthers
        }
      });

      const processedTx: Transaction = {
        ...rawTx,
        riskScore: finalRiskScore,
        confidenceScore: scoringResult.confidenceScore,
        category: scoringResult.category as FraudCategory,
        riskLevel,
        riskBreakdown: scoringResult.riskBreakdown,
        explanation: explanationResult.explanation,
        status: riskLevel === 'high' ? 'flagged' : 'cleared',
        crossUserFlag: isDeviceUsedByOthers
      };

      setTransactions(prev => [...prev, processedTx]);
      setSelectedTxId(processedTx.id);

      if (riskLevel === 'high') {
        setAlertTx(processedTx);
      } else {
        toast({
          title: "Analysis Complete",
          description: `Transaction verified: ${riskLevel.toUpperCase()} risk detected.`,
        });
      }
    } catch (error) {
      toast({
        title: "Protocol Failure",
        description: "Network timeout in neural bridge.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [profiles, transactions, config, deviceRegistry]);

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
        title: "Model Adapted",
        description: "User behavioral profile updated to include new patterns.",
      });
    }

    setAlertTx(null);
    if (status === 'blocked') {
      toast({
        title: "Threat Neutralized",
        description: `Entity blocked. Intelligence shared across nodes.`,
        variant: "destructive"
      });
    }
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, analystNotes: notes } : t));
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [alertTx, setAlertTx] = useState<Transaction | null>(null);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden selection:bg-primary/30">
      <header className="flex h-16 items-center justify-between border-b border-foreground/5 px-6 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
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
              Enterprise Hub v3.2.0 | {role.replace('_', ' ')} active
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full w-8 h-8 hover:bg-foreground/5"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <div className="flex bg-foreground/5 rounded-full p-1 border border-foreground/5">
            <Button 
              variant={role === 'analyst' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-7 text-[9px] font-bold uppercase rounded-full px-4"
              onClick={() => setRole('analyst')}
            >
              Analyst
            </Button>
            <Button 
              variant={role === 'risk_manager' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-7 text-[9px] font-bold uppercase rounded-full px-4"
              onClick={() => setRole('risk_manager')}
            >
              Manager
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest h-8"
            onClick={() => handleProcessTransaction('USER_001', 95000, "Dubai", "Blackberry OS")}
            disabled={isProcessing}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Simulate_Fraud
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6">
        <div className="mx-auto max-w-[1600px] h-full flex flex-col gap-6">
          
          <StatCards transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 min-h-0">
              {role === 'risk_manager' ? (
                <AdminSettings config={config} onUpdate={setConfig} />
              ) : (
                <TransactionInputForm onAddTransaction={handleProcessTransaction} isLoading={isProcessing} />
              )}
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
                    onUpdateNotes={handleUpdateNotes}
                  />
                  <RiskTrendChart transactions={transactions} />
                </div>
                
                <div className="xl:col-span-4 space-y-6">
                  <FraudTypology transactions={transactions} />
                  
                  <motion.div className="cyber-card p-5 rounded-xl space-y-4">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                      <Radar className="w-4 h-4" />
                      Tactical Threat Radar
                    </h4>
                    <SpatialHeatmap transaction={selectedTransaction} history={transactions} />
                  </motion.div>

                  <motion.div className="cyber-card p-5 rounded-xl space-y-4">
                    <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Cross-User Intelligence
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded bg-foreground/5 border border-foreground/5 space-y-2">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase flex items-center gap-2">
                          <ArrowRightLeft className="w-3 h-3" />
                          Device Reuse Tracker
                        </span>
                        <div className="flex justify-between items-end">
                          <span className="text-xl font-bold">{Object.keys(deviceRegistry).filter(d => deviceRegistry[d].length > 1).length}</span>
                          <span className="text-[9px] text-destructive font-bold">SHARED DEVICES</span>
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
