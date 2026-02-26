import { Transaction, UserProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Info, MapPin, Smartphone, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisPanelProps {
  transaction: Transaction | null;
  profile: UserProfile | null;
}

export function AnalysisPanel({ transaction, profile }: AnalysisPanelProps) {
  if (!transaction || !profile) {
    return (
      <Card className="h-full bg-card/50 border-dashed border-2 flex items-center justify-center">
        <div className="text-center p-8 space-y-3">
          <Info className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
          <p className="text-muted-foreground font-medium">Select a transaction for deep analysis</p>
        </div>
      </Card>
    );
  }

  const isHighRisk = transaction.riskLevel === 'high';

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="bg-secondary/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Risk Intelligence Analysis</CardTitle>
            <Badge className={cn(
              "text-xs px-2 py-0.5 uppercase tracking-wider",
              transaction.riskLevel === 'high' ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
            )}>
              {transaction.id}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm text-muted-foreground font-medium">Fraud Risk Score</span>
              <span className={cn(
                "text-3xl font-bold",
                isHighRisk ? "text-destructive" : "text-primary"
              )}>{transaction.riskScore} / 100</span>
            </div>
            <Progress value={transaction.riskScore} className={cn(
                "h-3",
                isHighRisk && "[&>div]:bg-destructive"
            )} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/20 space-y-1">
              <span className="text-xs text-muted-foreground block">User Average</span>
              <span className="font-semibold text-foreground">₹{profile.averageAmount}</span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 space-y-1">
              <span className="text-xs text-muted-foreground block">Amount Ratio</span>
              <span className={cn(
                "font-semibold",
                transaction.amount > profile.averageAmount * 2 ? "text-destructive" : "text-emerald-500"
              )}>{(transaction.amount / profile.averageAmount).toFixed(1)}x</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-accent" />
              AI Decision Explanation
            </h4>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border italic text-sm text-foreground/90 leading-relaxed">
              {transaction.explanation || "AI is generating explanation..."}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">User Context Verification</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  Location Check
                </div>
                <Badge variant={profile.typicalLocations.includes(transaction.location) ? "outline" : "destructive"} className="text-[10px] h-5">
                   {profile.typicalLocations.includes(transaction.location) ? "Verified" : "Unknown"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Smartphone className="w-3.5 h-3.5" />
                  Device ID
                </div>
                <Badge variant={profile.typicalDevices.includes(transaction.device) ? "outline" : "destructive"} className="text-[10px] h-5">
                   {profile.typicalDevices.includes(transaction.device) ? "Registered" : "New Device"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  Time Pattern
                </div>
                <Badge variant="outline" className="text-[10px] h-5">
                   {profile.typicalTimeRange.start} - {profile.typicalTimeRange.end}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}