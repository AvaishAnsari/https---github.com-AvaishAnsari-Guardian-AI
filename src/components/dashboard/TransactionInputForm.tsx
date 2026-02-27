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
        <CardTitle className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Ingest New Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">User Identity</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="h-11 bg-muted/20 border-2 text-[12px] font-black uppercase">
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(profiles).map((profile) => (
                    <SelectItem key={profile.userId} value={profile.userId} className="text-[12px] font-black">
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount (₹)</Label>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00"
                className="h-11 bg-muted/20 border-2 text-[13px] font-black"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Location</Label>
              <Input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. London"
                className="h-11 bg-muted/20 border-2 text-[12px] font-black"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Device</Label>
              <Input 
                value={device} 
                onChange={(e) => setDevice(e.target.value)} 
                placeholder="e.g. Unknown Device"
                className="h-11 bg-muted/20 border-2 text-[12px] font-black"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !userId || !amount}
            className="w-full h-12 text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 transition-all border-none"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Initiate Analysis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
