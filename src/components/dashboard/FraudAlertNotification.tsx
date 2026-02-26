"use client";

import { Transaction } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, User, DollarSign, MapPin, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface FraudAlertNotificationProps {
  transaction: Transaction | null;
  onClose: () => void;
  onAction: (id: string, status: 'blocked' | 'approved') => void;
}

export function FraudAlertNotification({ transaction, onClose, onAction }: FraudAlertNotificationProps) {
  if (!transaction) return null;

  return (
    <Dialog open={!!transaction} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="cyber-card sm:max-w-[400px] border-destructive/30 bg-background/95 backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 text-destructive mb-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ShieldAlert className="w-8 h-8" />
            </motion.div>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">Critical Fraud Alert</DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground font-mono">Anomaly Score: <span className="text-destructive font-bold">{transaction.riskScore}%</span></p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><User className="w-3 h-3" /> Target Entity</span>
              <p className="text-sm font-bold">{transaction.userName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><DollarSign className="w-3 h-3" /> Deviant Amount</span>
              <p className="text-sm font-bold text-destructive">₹{transaction.amount.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> Location Vector</span>
              <p className="text-sm font-bold">{transaction.location}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Zap className="w-3 h-3" /> Device Signature</span>
              <p className="text-sm font-bold truncate">{transaction.device}</p>
            </div>
          </div>

          <div className="p-3 rounded bg-destructive/5 border border-destructive/20 italic text-[11px] leading-relaxed">
            "Neural patterns indicate a high-risk outlier. Heuristic deviation exceeds threshold."
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-3">
          <Button variant="outline" className="flex-1 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 font-bold uppercase text-[10px]" onClick={() => onAction(transaction.id, 'approved')}>
            Force Approve
          </Button>
          <Button variant="destructive" className="flex-1 font-bold uppercase text-[10px]" onClick={() => onAction(transaction.id, 'blocked')}>
            Execute Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
