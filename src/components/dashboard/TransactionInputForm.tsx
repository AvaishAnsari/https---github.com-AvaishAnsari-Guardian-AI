"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_PROFILES } from "@/lib/mock-data";
import { PlusCircle, Loader2 } from "lucide-react";

interface TransactionInputFormProps {
  onAddTransaction: (userId: string, amount: number, location: string, device: string) => Promise<void>;
  isLoading: boolean;
}

export function TransactionInputForm({ onAddTransaction, isLoading }: TransactionInputFormProps) {
  const [userId, setUserId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [device, setDevice] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !amount) return;
    await onAddTransaction(userId, Number(amount), location || "Default", device || "Default");
    setAmount("");
  };

  return (
    <Card className="cyber-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Ingest New Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">User Identity</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="h-9 bg-white/5 border-white/10 text-xs">
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MOCK_PROFILES).map((profile) => (
                    <SelectItem key={profile.userId} value={profile.userId} className="text-xs">
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">Amount (₹)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00"
                className="h-9 bg-white/5 border-white/10 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">Location</Label>
              <Input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. London"
                className="h-9 bg-white/5 border-white/10 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">Device</Label>
              <Input 
                value={device} 
                onChange={(e) => setDevice(e.target.value)} 
                placeholder="e.g. Unknown Device"
                className="h-9 bg-white/5 border-white/10 text-xs"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !userId || !amount}
            className="w-full h-9 text-[10px] font-bold uppercase tracking-[0.2em]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Initiate Analysis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
