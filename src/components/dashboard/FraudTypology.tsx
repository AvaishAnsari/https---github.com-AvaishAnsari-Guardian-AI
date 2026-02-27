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
  const COLORS = ['hsl(var(--primary))', 'hsl(200, 100%, 71%)', 'hsl(var(--destructive))', 'hsl(280, 65%, 60%)', 'hsl(30, 80%, 55%)'];

  return (
    <Card className="cyber-card border-none shadow-sm">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <BarChart3 className="w-3 h-3" />
          Fraud Typology Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[200px] p-0 flex items-center">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 pr-6 space-y-2">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[9px] font-medium text-muted-foreground truncate uppercase">{item.name}</span>
              </div>
              <span className="text-[10px] font-bold">{Math.round((item.value / transactions.length) * 100)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
