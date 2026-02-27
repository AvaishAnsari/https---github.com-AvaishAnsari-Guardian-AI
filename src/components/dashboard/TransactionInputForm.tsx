
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/lib/types";
import { PlusCircle, Loader2 } from "lucide-react";

interface TransactionInputFormProps {
  profiles: Record<string, UserProfile>;
  onAddTransaction: (userId: string, amount: number, location: string, device: string) => Promise<void>;
  isLoading: boolean;
}

export function TransactionInputForm({ profiles, onAddTransaction, isLoading }: TransactionInputFormProps) {
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
    <Card className="cyber-card border-primary/20 p-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
          <PlusCircle className="w-5 h-5" />
          Ingest New Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <Label className="text-xs font-mono text-muted-foreground uppercase font-bold tracking-widest">User Identity</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 text-base font-bold">
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(profiles).map((profile) => (
                    <SelectItem key={profile.userId} value={profile.userId} className="text-base font-bold">
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-mono text-muted-foreground uppercase font-bold tracking-widest">Amount (₹)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00"
                className="h-12 bg-white/5 border-white/10 text-base font-black"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <Label className="text-xs font-mono text-muted-foreground uppercase font-bold tracking-widest">Location</Label>
              <Input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. London"
                className="h-12 bg-white/5 border-white/10 text-base font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-mono text-muted-foreground uppercase font-bold tracking-widest">Device</Label>
              <Input 
                value={device} 
                onChange={(e) => setDevice(e.target.value)} 
                placeholder="e.g. Unknown Device"
                className="h-12 bg-white/5 border-white/10 text-base font-bold"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !userId || !amount}
            className="w-full h-14 text-sm font-black uppercase tracking-[0.3em] shadow-xl hover:shadow-primary/20 transition-all"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : "Initiate Analysis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
