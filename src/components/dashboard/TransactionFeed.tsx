import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

interface TransactionFeedProps {
  transactions: Transaction[];
  onSelect: (tx: Transaction) => void;
}

export function TransactionFeed({ transactions, onSelect }: TransactionFeedProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-card/50">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Live Transaction Feed
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {transactions.slice().reverse().map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelect(tx)}
              className={cn(
                "group relative flex flex-col p-4 rounded-lg cursor-pointer transition-all border border-transparent hover:bg-secondary/30",
                tx.riskLevel === 'high' && "bg-destructive/10 border-destructive/20 hover:bg-destructive/20 risk-glow-high",
                tx.riskLevel === 'medium' && "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 risk-glow-medium",
                tx.riskLevel === 'low' && "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 risk-glow-low"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-foreground/90">{tx.userName}</span>
                <span className="text-xs text-muted-foreground">
                  {isMounted ? format(new Date(tx.timestamp), 'HH:mm:ss') : '--:--:--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-bold">₹{tx.amount.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{tx.location}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge 
                    variant={tx.riskLevel === 'high' ? 'destructive' : tx.riskLevel === 'medium' ? 'secondary' : 'outline'}
                    className={cn(
                        "capitalize",
                        tx.riskLevel === 'low' && "text-emerald-500 border-emerald-500/50"
                    )}
                  >
                    {tx.riskLevel || 'Processing...'}
                  </Badge>
                  {tx.riskScore !== undefined && (
                    <span className="text-xs font-mono font-semibold">
                      Score: {tx.riskScore}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              Waiting for incoming transactions...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
