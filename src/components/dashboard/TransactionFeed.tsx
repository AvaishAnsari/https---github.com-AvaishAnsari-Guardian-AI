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
      <div className="p-5 border-b flex items-center justify-between bg-muted/5">
        <h3 className="font-black text-[11px] flex items-center gap-2 uppercase tracking-widest text-primary">
          <Shield className="w-4 h-4" />
          Real-Time Feed
        </h3>
        <div className="flex items-center gap-2">
           <Wifi className="w-4 h-4 text-emerald-500 animate-pulse" />
           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-4">
          <AnimatePresence initial={false}>
            {transactions.slice().reverse().map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                onClick={() => onSelect(tx)}
                className={cn(
                  "group relative flex flex-col p-5 rounded-2xl cursor-pointer transition-all border-2 border-muted bg-muted/5 hover:bg-muted/10",
                  tx.riskLevel === 'high' && "border-destructive/30 bg-destructive/5"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-[13px] truncate max-w-[140px] uppercase">{tx.userName}</span>
                  <span className="text-[10px] font-black text-muted-foreground opacity-70">
                    {tx.caseId} • {mounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tight leading-none">
                      ₹{mounted ? tx.amount.toLocaleString() : tx.amount}
                    </span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase mt-1">
                      {tx.location}
                    </span>
                  </div>
                  <Badge 
                    variant={tx.riskLevel === 'high' ? 'destructive' : tx.riskLevel === 'medium' ? 'secondary' : 'outline'}
                    className="text-[9px] h-5 px-2 font-black tracking-widest uppercase border-2"
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
