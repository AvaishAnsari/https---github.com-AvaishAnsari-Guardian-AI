
"use client";

import { useState, useEffect } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!transaction) return null;

  return (
    <Dialog open={!!transaction} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="cyber-card sm:max-w-[500px] border-destructive/40 bg-background/95 backdrop-blur-2xl p-8 rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-4 text-destructive mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ShieldAlert className="w-12 h-12" />
            </motion.div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic">Critical Fraud Alert</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground font-mono font-bold tracking-widest uppercase">Anomaly Score: <span className="text-destructive text-lg">{transaction.riskScore}%</span></p>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest"><User className="w-4 h-4" /> Target Entity</span>
              <p className="text-base font-black">{transaction.userName}</p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest"><DollarSign className="w-4 h-4" /> Deviant Amount</span>
              <p className="text-base font-black text-destructive">₹{mounted ? transaction.amount.toLocaleString() : transaction.amount}</p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest"><MapPin className="w-4 h-4" /> Location Vector</span>
              <p className="text-base font-black">{transaction.location}</p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black text-muted-foreground uppercase flex items-center gap-2 tracking-widest"><Zap className="w-4 h-4" /> Device Signature</span>
              <p className="text-base font-black truncate">{transaction.device}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20 italic text-sm leading-relaxed font-mono">
            "Neural patterns indicate a high-risk outlier. Heuristic deviation exceeds institutional threshold."
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-4">
          <Button variant="outline" className="flex-1 h-12 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 font-black uppercase text-xs tracking-widest" onClick={() => onAction(transaction.id, 'approved')}>
            Force Approve
          </Button>
          <Button variant="destructive" className="flex-1 h-12 font-black uppercase text-xs tracking-widest" onClick={() => onAction(transaction.id, 'blocked')}>
            Execute Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
