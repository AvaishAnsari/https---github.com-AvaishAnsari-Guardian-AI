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
    <Card className="cyber-card border-none shadow-sm">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <PlusCircle className="w-3 h-3" />
          Ingest New Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">User Identity</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="h-9 bg-muted/20 border-none text-[11px] font-medium">
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(profiles).map((profile) => (
                    <SelectItem key={profile.userId} value={profile.userId} className="text-[11px]">
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Amount (₹)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00"
                className="h-9 bg-muted/20 border-none text-[11px] font-bold"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Location</Label>
              <Input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. London"
                className="h-9 bg-muted/20 border-none text-[11px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Device</Label>
              <Input 
                value={device} 
                onChange={(e) => setDevice(e.target.value)} 
                placeholder="e.g. Unknown Device"
                className="h-9 bg-muted/20 border-none text-[11px]"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !userId || !amount}
            className="w-full h-10 text-[10px] font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 transition-all"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : "Initiate Analysis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
