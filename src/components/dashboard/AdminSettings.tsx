"use client";

import { SystemConfig } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Settings, Shield } from "lucide-react";

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
    <Card className="cyber-card border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Enterprise Sensitivity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Low Threshold</Label>
            <span className="text-[10px] font-bold">{config.thresholds.low}%</span>
          </div>
          <Slider 
            value={[config.thresholds.low]} 
            onValueChange={(val) => handleThresholdChange('low', val)} 
            max={100} 
            step={1} 
            className="[&>span]:bg-emerald-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Medium Threshold</Label>
            <span className="text-[10px] font-bold">{config.thresholds.medium}%</span>
          </div>
          <Slider 
            value={[config.thresholds.medium]} 
            onValueChange={(val) => handleThresholdChange('medium', val)} 
            max={100} 
            step={1} 
            className="[&>span]:bg-amber-500"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-mono text-muted-foreground uppercase">High Threshold</Label>
            <span className="text-[10px] font-bold">{config.thresholds.high}%</span>
          </div>
          <Slider 
            value={[config.thresholds.high]} 
            onValueChange={(val) => handleThresholdChange('high', val)} 
            max={100} 
            step={1} 
            className="[&>span]:bg-destructive"
          />
        </div>

        <div className="pt-2">
          <p className="text-[8px] font-mono text-muted-foreground uppercase leading-relaxed opacity-60">
            System sensitivity affects real-time block logic and alert propagation. Current policy: <span className="text-accent">AGGRESSIVE_MONITORING</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
