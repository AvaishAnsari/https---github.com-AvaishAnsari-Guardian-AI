"use client";

import { Transaction } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3 } from "lucide-react";

export function FraudTypology({ transactions }: { transactions: Transaction[] }) {
  const typologies = transactions
    .filter(t => t.category !== 'Nominal')
    .reduce((acc: Record<string, number>, t) => {
      const cat = t.category || 'Behavioral Anomaly';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

  const data = Object.entries(typologies).map(([name, value]) => ({ name, value }));
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <Card className="cyber-card border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Fraud Typology Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[180px] p-0 flex items-center">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(10, 10, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '9px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 pr-4 space-y-1">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[8px] font-mono text-muted-foreground truncate uppercase">{item.name}</span>
              </div>
              <span className="text-[9px] font-bold">{Math.round((item.value / transactions.length) * 100)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
