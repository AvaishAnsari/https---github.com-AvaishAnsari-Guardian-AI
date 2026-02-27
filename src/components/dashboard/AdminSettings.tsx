
"use client";

import { SystemConfig } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Settings, ShieldCheck } from "lucide-react";

interface AdminSettingsProps {
  config: SystemConfig;
  onUpdate: (config: SystemConfig) => void;
}

export function AdminSettings({ config, onUpdate }: AdminSettingsProps) {
  const handleThresholdChange = (key: keyof SystemConfig['thresholds'], val: number[]) => {
    onUpdate({
      ...config,
      thresholds: {
        ...config.thresholds,
        [key]: val[0]
      }
    });
  };

  return (
    <Card className="cyber-card border-none shadow-sm flex flex-col h-full max-h-[500px]">
      <CardHeader className="pb-6 border-b px-8 py-6">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-3">
          <Settings className="w-5 h-5" />
          Enterprise AI Policy & Sensitivity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-8 space-y-10 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Low Risk Threshold</Label>
            <span className="text-sm font-black text-emerald-500">{config.thresholds.low}%</span>
          </div>
          <Slider 
            value={[config.thresholds.low]} 
            onValueChange={(val) => handleThresholdChange('low', val)} 
            max={100} 
            step={1} 
            className="[&>span]:bg-emerald-500"
          />
          <p className="text-[10px] text-muted-foreground font-black italic">Transactions below this score are automatically cleared for the majority of user profiles.</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Medium Risk Threshold</Label>
            <span className="text-sm font-black text-amber-500">{config.thresholds.medium}%</span>
          </div>
          <Slider 
            value={[config.thresholds.medium]} 
            onValueChange={(val) => handleThresholdChange('medium', val)} 
            max={100} 
            step={1} 
            className="[&>span]:bg-amber-500"
          />
          <p className="text-[10px] text-muted-foreground font-black italic">Triggers passive monitoring and potential multi-factor authentication requests.</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">High Risk Block Policy</Label>
            <span className="text-sm font-black text-destructive">{config.thresholds.high}%</span>
          </div>
          <Slider 
            value={[config.thresholds.high]} 
            onValueChange={(val) => handleThresholdChange('high', val)} 
            max={100} 
            step={1} 
            className="[&>span]:bg-destructive"
          />
          <p className="text-[10px] text-muted-foreground font-black italic">Scores exceeding this threshold trigger an immediate institutional block and analyst alert.</p>
        </div>

        <div className="pt-6 border-t">
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
            <div className="space-y-2">
              <h5 className="text-[11px] font-black uppercase tracking-widest text-primary">Active Governance Mode</h5>
              <p className="text-[10px] font-black text-muted-foreground uppercase leading-relaxed opacity-80">
                Current sensitivity is set to <span className="text-primary underline">AGGRESSIVE_MONITORING</span>. Real-time weights are adjusting based on global threat telemetry from the intelligence mesh.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
