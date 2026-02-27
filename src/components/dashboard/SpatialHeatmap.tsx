"use client";

import { useEffect, useState, useMemo } from "react";
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
    <div className="space-y-4">
      <div className="relative aspect-square w-full bg-black/20 rounded-lg border border-white/5 overflow-hidden group">
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/5" />
          ))}
        </div>

        <motion.div 
          animate={{ translateY: ["0%", "100%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"
        />

        {historicalPings.map((p) => (
          <div 
            key={p.id}
            style={{ left: `${p.x * 10}%`, top: `${p.y * 10}%` }}
            className="absolute w-[10%] h-[10%] flex items-center justify-center opacity-30"
          >
            <div className={cn(
              "w-1 h-1 rounded-full",
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
              "w-2 h-2 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]",
              transaction?.riskLevel === 'high' ? "bg-destructive shadow-destructive" : "bg-primary shadow-primary"
            )} />
            <motion.div 
              animate={{ scale: [1, 3], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={cn(
                "absolute w-full h-full rounded-full border",
                transaction?.riskLevel === 'high' ? "border-destructive" : "border-primary"
              )}
            />
          </motion.div>
        )}

        <div className="absolute bottom-2 left-2 flex flex-col gap-0.5">
          <span className="text-[7px] font-mono text-muted-foreground uppercase tracking-widest">Sector: 0x{activeCoord ? (activeCoord.x * 10 + activeCoord.y).toString(16).toUpperCase() : '00'}</span>
          <span className="text-[7px] font-mono text-muted-foreground uppercase tracking-widest">Threat_Zones: {historicalPings.filter(p => p.risk === 'high').length}</span>
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col items-end">
          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse mb-1" />
          <span className="text-[6px] font-mono text-emerald-500 uppercase">Neural_Uplink: OK</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
          <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-tighter">High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-tighter">Anomalous</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[8px] font-bold uppercase text-muted-foreground tracking-tighter">Baseline</span>
        </div>
      </div>
    </div>
  );
}