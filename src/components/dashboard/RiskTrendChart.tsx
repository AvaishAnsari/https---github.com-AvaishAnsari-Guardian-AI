"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";

export function RiskTrendChart({ transactions }: { transactions: Transaction[] }) {
  const chartData = transactions.slice(-10).map((tx, idx) => ({
    name: `T-${10-idx}`,
    score: tx.riskScore || 0,
    amount: tx.amount
  }));

  return (
    <Card className="cyber-card border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Neural Risk Propagation
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[180px] p-0 pr-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(10, 10, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
              itemStyle={{ color: 'hsl(var(--primary))' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2} 
              dot={{ fill: 'hsl(var(--primary))', r: 3 }} 
              activeDot={{ r: 5, stroke: 'white', strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
