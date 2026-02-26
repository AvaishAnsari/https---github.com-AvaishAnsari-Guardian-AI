import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, Activity, TrendingUp } from "lucide-react";

export function StatCards({ transactions }: { transactions: any[] }) {
  const highRisk = transactions.filter(tx => tx.riskLevel === 'high').length;
  const totalProcessed = transactions.length;
  const avgRisk = transactions.length > 0 
    ? Math.round(transactions.reduce((acc, tx) => acc + (tx.riskScore || 0), 0) / transactions.length) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Scanned</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProcessed}</div>
          <p className="text-xs text-muted-foreground">Real-time ingestion active</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Alerts</CardTitle>
          <ShieldAlert className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{highRisk}</div>
          <p className="text-xs text-muted-foreground">Requiring immediate review</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Risk Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgRisk}</div>
          <p className="text-xs text-muted-foreground">Global threat index</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Safe Activity</CardTitle>
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProcessed - highRisk}</div>
          <p className="text-xs text-muted-foreground">Verified transactions</p>
        </CardContent>
      </Card>
    </div>
  );
}