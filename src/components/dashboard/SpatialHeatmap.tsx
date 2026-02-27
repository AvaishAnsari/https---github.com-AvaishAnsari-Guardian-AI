"use client";

import { useMemo } from "react";
import { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SpatialHeatmapProps {
  transaction: Transaction | null;
  history: Transaction[];
}

export function SpatialHeatmap({ transaction, history }: SpatialHeatmapProps) {
  const historicalPings = useMemo(() => {
    return history.slice(-30).map(tx => {
      const hash = tx.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return {
        id: tx.id,
        x: hash % 10,
        y: (hash >> 3) % 10,
        risk: tx.riskLevel,
        label: tx.userName
      };
    });
  }, [history]);

  const activeCoord = useMemo(() => {
    if (!transaction) return null;
    const hash = transaction.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      x: hash % 10,
      y: (hash >> 3) % 10
    };
  }, [transaction]);

  return (
    <div className="space-y-6">
      <div className="relative aspect-square w-full bg-muted/20 rounded-2xl border-2 border-border overflow-hidden group">
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-border/20" />
          ))}
        </div>

        {historicalPings.map((p) => (
          <div 
            key={p.id}
            style={{ left: `${p.x * 10}%`, top: `${p.y * 10}%` }}
            className="absolute w-[10%] h-[10%] flex items-center justify-center opacity-40"
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              p.risk === 'high' ? "bg-destructive" : p.risk === 'medium' ? "bg-amber-500" : "bg-primary"
            )} />
          </div>
        ))}

        {activeCoord && (
          <motion.div 
            key={transaction?.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              left: `${activeCoord.x * 10}%`, 
              top: `${activeCoord.y * 10}%` 
            }}
            className="absolute w-[10%] h-[10%] flex items-center justify-center z-20"
          >
            <div className={cn(
              "w-3.5 h-3.5 rounded-full shadow-lg",
              transaction?.riskLevel === 'high' ? "bg-destructive" : "bg-primary"
            )} />
            <motion.div 
              animate={{ scale: [1, 2.8], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn(
                "absolute w-full h-full rounded-full border-2",
                transaction?.riskLevel === 'high' ? "border-destructive" : "border-primary"
              )}
            />
          </motion.div>
        )}

        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sector: 0x{activeCoord ? (activeCoord.x * 10 + activeCoord.y).toString(16).toUpperCase() : '00'}</span>
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Threat_Zones: {historicalPings.filter(p => p.risk === 'high').length}</span>
        </div>
      </div>

      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <span className="text-[10px] font-black uppercase text-muted-foreground">High Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-black uppercase text-muted-foreground">Anomalous</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase text-muted-foreground">Baseline</span>
        </div>
      </div>
    </div>
  );
}
