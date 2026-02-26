"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Shield, Radar, Wifi } from "lucide-react";
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

  return (
    <div className="flex flex-col h-full cyber-card rounded-xl overflow-hidden border-border/40">
      <div className="p-4 border-b border-border/40 bg-card/40 flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-widest text-primary">
          <Shield className="w-4 h-4" />
          Neural Link Feed
        </h3>
        <div className="flex items-center gap-2">
           <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
           <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-tighter">Live</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <AnimatePresence initial={false}>
            {transactions.slice().reverse().map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                layout
                onClick={() => onSelect(tx)}
                className={cn(
                  "group relative flex flex-col p-3 rounded-lg cursor-pointer transition-all border border-white/5 hover:border-white/10",
                  tx.riskLevel === 'high' && "bg-destructive/5 border-destructive/20 hover:bg-destructive/10 risk-glow-high",
                  tx.riskLevel === 'medium' && "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 risk-glow-medium",
                  tx.riskLevel === 'low' && "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 risk-glow-low"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-foreground/80 truncate max-w-[120px]">{tx.userName}</span>
                  <span className="text-[10px] font-mono text-muted-foreground opacity-60">
                    {mounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tighter">₹{tx.amount.toLocaleString()}</span>
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <Radar className="w-2.5 h-2.5 opacity-50" />
                      {tx.location}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge 
                      variant={tx.riskLevel === 'high' ? 'destructive' : tx.riskLevel === 'medium' ? 'secondary' : 'outline'}
                      className={cn(
                          "text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter",
                          tx.riskLevel === 'low' && "text-emerald-500 border-emerald-500/30"
                      )}
                    >
                      {tx.riskLevel || 'Scanning'}
                    </Badge>
                    {tx.riskScore !== undefined && (
                      <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
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
            <div className="py-20 text-center text-muted-foreground font-mono text-xs animate-pulse">
              [ WAITING FOR UPLINK... ]
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
