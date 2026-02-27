"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Shield, Radar, Wifi, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionFeedProps {
  transactions: Transaction[];
  onSelect: (tx: Transaction) => void;
}

export function TransactionFeed({ transactions, onSelect }: TransactionFeedProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const highRiskTxs = transactions.filter(t => t.riskLevel === 'high').slice(-5);

  return (
    <div className="flex flex-col h-full cyber-card rounded-3xl overflow-hidden border-border/40">
      <div className="p-6 border-b border-border/40 bg-card/40 flex items-center justify-between overflow-hidden">
        <h3 className="font-bold text-xl flex items-center gap-3 uppercase tracking-widest text-primary shrink-0">
          <Shield className="w-7 h-7" />
          Live Feed
        </h3>
        
        <div className="flex-1 ml-8 overflow-hidden relative">
          <motion.div 
            animate={{ x: [600, -2000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-16 whitespace-nowrap"
          >
            {highRiskTxs.map(tx => (
              <span key={tx.id} className="text-base font-mono text-destructive font-black uppercase flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" />
                CRITICAL: {tx.userName} ({mounted ? `₹${tx.amount.toLocaleString()}` : "₹..."}) - {tx.riskScore}% RISK
              </span>
            ))}
            {highRiskTxs.length === 0 && (
              <span className="text-base font-mono text-emerald-500 uppercase tracking-[0.2em] opacity-40">SYSTEM_STATUS: NOMINAL // ALL_VECTORS_STABLE</span>
            )}
          </motion.div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-6">
           <Wifi className="w-6 h-6 text-emerald-500 animate-pulse" />
           <span className="text-sm font-mono text-emerald-500 uppercase tracking-widest font-bold">Live_Node</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5">
          <AnimatePresence initial={false}>
            {transactions.slice().reverse().map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                layout
                onClick={() => onSelect(tx)}
                className={cn(
                  "group relative flex flex-col p-6 rounded-2xl cursor-pointer transition-all border border-white/5 hover:border-white/10 overflow-hidden",
                  tx.riskLevel === 'high' && "bg-destructive/10 border-destructive/30 hover:bg-destructive/20 risk-glow-high",
                  tx.riskLevel === 'medium' && "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 risk-glow-medium",
                  tx.riskLevel === 'low' && "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 risk-glow-low"
                )}
              >
                {tx.riskLevel === 'high' && idx === 0 && (
                  <motion.div 
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-destructive/20 pointer-events-none"
                  />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-xl text-foreground/90 truncate max-w-[180px]">{tx.userName}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground opacity-50 uppercase tracking-widest font-bold">
                      {tx.caseId}
                    </span>
                    <span className="text-sm font-mono text-muted-foreground opacity-70 font-bold">
                      {mounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}
                    </span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black tracking-tighter">
                      {mounted ? `₹${tx.amount.toLocaleString()}` : `₹${tx.amount}`}
                    </span>
                    <span className="text-base font-mono text-muted-foreground flex items-center gap-3 mt-2 font-bold">
                      <Radar className="w-5 h-5 opacity-60" />
                      {tx.location}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Badge 
                      variant={tx.riskLevel === 'high' ? 'destructive' : tx.riskLevel === 'medium' ? 'secondary' : 'outline'}
                      className={cn(
                          "text-xs h-7 px-4 uppercase font-black tracking-widest",
                          tx.riskLevel === 'low' && "text-emerald-500 border-emerald-500/30"
                      )}
                    >
                      {tx.riskLevel || 'Scanning'}
                    </Badge>
                    {tx.riskScore !== undefined && (
                      <div className="w-24 h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-700",
                            tx.riskLevel === 'high' ? "bg-destructive" : tx.riskLevel === 'medium' ? "bg-amber-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${tx.riskScore}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {transactions.length === 0 && (
            <div className="py-32 text-center text-muted-foreground font-mono text-2xl animate-pulse">
              [ WAITING FOR NEURAL UPLINK... ]
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}