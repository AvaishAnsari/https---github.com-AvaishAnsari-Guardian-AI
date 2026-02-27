"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Shield, Wifi } from "lucide-react";
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
    <div className="flex flex-col h-full cyber-card border-none shadow-sm overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-[10px] flex items-center gap-2 uppercase tracking-widest text-primary">
          <Shield className="w-3 h-3" />
          Real-Time Feed
        </h3>
        <div className="flex items-center gap-2">
           <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
           <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <AnimatePresence initial={false}>
            {transactions.slice().reverse().map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                onClick={() => onSelect(tx)}
                className={cn(
                  "group relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border border-muted bg-muted/5 hover:bg-muted/10",
                  tx.riskLevel === 'high' && "border-destructive/20 bg-destructive/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[11px] truncate max-w-[120px]">{tx.userName}</span>
                  <span className="text-[9px] font-medium text-muted-foreground opacity-70">
                    {tx.caseId} • {mounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight">
                      ₹{tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[8px] font-medium text-muted-foreground uppercase mt-0.5">
                      {tx.location}
                    </span>
                  </div>
                  <Badge 
                    variant={tx.riskLevel === 'high' ? 'destructive' : tx.riskLevel === 'medium' ? 'secondary' : 'outline'}
                    className="text-[8px] h-4 px-1.5 font-bold tracking-widest uppercase"
                  >
                    {tx.riskLevel || 'Scanning'}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
