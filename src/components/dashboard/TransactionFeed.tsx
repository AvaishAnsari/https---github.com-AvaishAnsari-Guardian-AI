
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
    <div className="flex flex-col h-full cyber-card rounded-2xl overflow-hidden border-border/40">
      <div className="p-5 border-b border-border/40 bg-card/40 flex items-center justify-between overflow-hidden">
        <h3 className="font-bold text-base flex items-center gap-2 uppercase tracking-widest text-primary shrink-0">
          <Shield className="w-5 h-5" />
          Real-time Feed
        </h3>
        
        <div className="flex-1 ml-6 overflow-hidden relative">
          <motion.div 
            animate={{ x: [400, -1500] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 whitespace-nowrap"
          >
            {highRiskTxs.map(tx => (
              <span key={tx.id} className="text-xs font-mono text-destructive font-black uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                CRITICAL: {tx.userName} (₹{mounted ? tx.amount.toLocaleString() : tx.amount}) - {tx.riskScore}% RISK
              </span>
            ))}
            {highRiskTxs.length === 0 && (
              <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest opacity-40">SYSTEM_STATUS: NOMINAL // ALL_VECTORS_STABLE</span>
            )}
          </motion.div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
           <Wifi className="w-4 h-4 text-emerald-500 animate-pulse" />
           <span className="text-[11px] font-mono text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <AnimatePresence initial={false}>
            {transactions.slice().reverse().map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                layout
                onClick={() => onSelect(tx)}
                className={cn(
                  "group relative flex flex-col p-5 rounded-xl cursor-pointer transition-all border border-white/5 hover:border-white/10 overflow-hidden",
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

                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-sm text-foreground/90 truncate max-w-[150px]">{tx.userName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground opacity-50 uppercase tracking-widest">
                      {tx.caseId}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground opacity-70">
                      {mounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}
                    </span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tighter">₹{mounted ? tx.amount.toLocaleString() : tx.amount}</span>
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-2 mt-1">
                      <Radar className="w-3.5 h-3.5 opacity-60" />
                      {tx.location}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={tx.riskLevel === 'high' ? 'destructive' : tx.riskLevel === 'medium' ? 'secondary' : 'outline'}
                      className={cn(
                          "text-[10px] h-5 px-2 uppercase font-black tracking-widest",
                          tx.riskLevel === 'low' && "text-emerald-500 border-emerald-500/30"
                      )}
                    >
                      {tx.riskLevel || 'Scanning'}
                    </Badge>
                    {tx.riskScore !== undefined && (
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
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
            <div className="py-24 text-center text-muted-foreground font-mono text-sm animate-pulse">
              [ WAITING FOR UPLINK... ]
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
