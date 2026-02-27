"use client";

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp } from "lucide-react";

const mockData = [
  { val: 20 },
  { val: 45 },
  { val: 68 },
];

export function RiskTrendChart() {
  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center gap-2 text-primary">
        <TrendingUp className="w-5 h-5" />
        <h4 className="text-[11px] font-black uppercase tracking-widest">
          Neural Risk Propagation
        </h4>
      </div>
      
      <div className="h-[200px] w-full bg-white rounded-3xl border shadow-sm p-4 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <XAxis hide />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
                fontSize: '12px', 
                fontWeight: '900' 
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="val" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3} 
              dot={{ fill: 'hsl(var(--primary))', r: 5, strokeWidth: 2, stroke: 'white' }} 
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
