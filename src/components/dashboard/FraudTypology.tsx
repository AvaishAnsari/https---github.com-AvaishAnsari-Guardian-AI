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
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Fraud Typology Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[220px] p-0 flex items-center">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '900' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 pr-8 space-y-3">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-black text-muted-foreground truncate uppercase">{item.name}</span>
              </div>
              <span className="text-[11px] font-black">{Math.round((item.value / transactions.length) * 100)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
