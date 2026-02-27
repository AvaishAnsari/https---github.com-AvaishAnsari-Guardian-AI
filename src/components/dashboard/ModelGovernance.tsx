"use client";

import { Cpu, Activity } from "lucide-react";

export function ModelGovernance() {
  return (
    <div className="mt-8 pt-8 border-t space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Cpu className="w-5 h-5" />
        <h4 className="text-[11px] font-black uppercase tracking-widest">
          AI Model Governance & Transparency
        </h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-1">
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Model Type</span>
          <p className="text-[13px] font-black uppercase">Hybrid ML + Behavioral AI</p>
        </div>
        <div className="space-y-1">
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Last Training</span>
          <p className="text-[13px] font-black uppercase text-muted-foreground">2025-05-18 04:30 UTC</p>
        </div>
        <div className="space-y-1">
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Drift Status</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <p className="text-[13px] font-black uppercase text-emerald-500">Stable</p>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Uptime</span>
          <p className="text-[13px] font-black uppercase">99.99%</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 opacity-60">
          <Cpu className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Source: Global Intelligence Mesh</span>
        </div>
        <div className="flex items-center gap-2 text-primary/40">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest italic">Real-time weights adjusting...</span>
        </div>
      </div>
    </div>
  );
}
