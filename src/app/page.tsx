"use client";

import { useState, useEffect, useCallback } from "react";
import { Transaction, UserProfile, EngineeredFeatures } from "@/lib/types";
import { INITIAL_TRANSACTIONS, MOCK_PROFILES } from "@/lib/mock-data";
import { engineerFeatures, getRiskLevel } from "@/lib/feature-engineering";
import { calculateFraudRisk } from "@/ai/flows/ai-powered-transaction-risk-scoring-flow";
import { generateFraudExplanation } from "@/ai/flows/ai-generated-fraud-explanation-flow";
import { TransactionFeed } from "@/components/dashboard/TransactionFeed";
import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel";
import { StatCards } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/button";
import { Shield, Radar, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
      // 1. AI Scoring
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

      // 2. AI Explanation (only for medium/high risk or always for demo)
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
          title: "High Risk Detected!",
          description: `Transaction from ${rawTx.userName} flagged as high risk (${riskScore}).`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Processing Error",
        description: "Failed to perform AI risk analysis.",
        variant: "destructive",
      });
    }
  }, []);

  const simulateRandomTransaction = () => {
    setIsSimulating(true);
    const userIds = Object.keys(MOCK_PROFILES);
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const profile = MOCK_PROFILES[userId];
    
    // Randomize some variables to trigger risks
    const isSuspicious = Math.random() > 0.7;
    const amount = isSuspicious 
      ? profile.averageAmount * (Math.random() * 50 + 2) 
      : profile.averageAmount * (Math.random() * 0.5 + 0.5);
    
    const locations = ['New York', 'Dubai', 'Mumbai', 'London', 'Bangalore', 'Tokyo'];
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
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border px-6 bg-card/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Guardian AI
          </h1>
          <span className="hidden sm:inline-block ml-4 text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded border border-border">
            v2.4.1 // NEXT-GEN CYBER DEFENSE
          </span>
        </div>
        
        <div className="flex items-center gap-4">
           <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex items-center gap-2 border-primary/30 hover:bg-primary/10"
            onClick={simulateRandomTransaction}
            disabled={isSimulating}
          >
            {isSimulating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 text-primary" />}
            Simulate Ingestion
          </Button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Monitoring
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="mx-auto max-w-[1600px] h-full flex flex-col gap-6">
          
          <StatCards transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            {/* Left Feed */}
            <div className="lg:col-span-4 min-h-0">
              <TransactionFeed 
                transactions={transactions} 
                onSelect={(tx) => setSelectedTxId(tx.id)} 
              />
            </div>

            {/* Right Detailed Analysis */}
            <div className="lg:col-span-8 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 gap-6">
                <AnalysisPanel 
                  transaction={selectedTransaction} 
                  profile={selectedProfile} 
                />
                
                {/* Visual Indicators & Logic Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border p-5 rounded-xl space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Radar className="w-4 h-4 text-primary" />
                      Behavioral Deviation Heatmap
                    </h4>
                    <div className="h-40 bg-background/50 rounded-lg border border-border/50 flex items-center justify-center">
                      {selectedTransaction ? (
                        <div className="relative w-full h-full p-4 overflow-hidden">
                           <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 opacity-20">
                             {Array.from({length: 16}).map((_, i) => (
                               <div key={i} className="bg-primary/20 rounded-sm" />
                             ))}
                           </div>
                           <div className="relative z-10 flex items-center justify-center h-full">
                              <div className={cn(
                                "w-24 h-24 rounded-full border-4 flex items-center justify-center text-xs font-bold transition-all duration-500",
                                selectedTransaction.riskLevel === 'high' ? "border-destructive text-destructive scale-110" : "border-primary text-primary"
                              )}>
                                {selectedTransaction.riskLevel === 'high' ? "OUTLIER" : "NOMINAL"}
                              </div>
                           </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Historical deviation data</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-card border border-border p-5 rounded-xl space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-accent" />
                      Cyber Defense Action Logs
                    </h4>
                    <div className="space-y-3">
                      {selectedTransaction?.riskLevel === 'high' ? (
                        <>
                          <div className="flex items-start gap-2 text-xs">
                             <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1 shrink-0" />
                             <p><span className="text-muted-foreground">Action:</span> Suspended transaction TX_7882</p>
                          </div>
                          <div className="flex items-start gap-2 text-xs">
                             <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1 shrink-0" />
                             <p><span className="text-muted-foreground">Alert:</span> SMS/Email notification dispatched to user</p>
                          </div>
                          <div className="flex items-start gap-2 text-xs">
                             <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shrink-0" />
                             <p><span className="text-muted-foreground">XAI:</span> Fraud logic documentation generated</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground py-4 text-center">System idle - No high priority threats selected</p>
                      )}
                    </div>
                  </div>
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
          className="h-14 w-14 rounded-full shadow-lg shadow-primary/20"
          onClick={simulateRandomTransaction}
          disabled={isSimulating}
        >
          {isSimulating ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
}