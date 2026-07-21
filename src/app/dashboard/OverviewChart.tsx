"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { name: "Sen", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Sel", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Rab", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Kam", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Jum", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Sab", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Min", total: Math.floor(Math.random() * 50) + 10 },
];

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          itemStyle={{ color: "#10b981", fontWeight: "bold" }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#10b981"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorTotal)"
          activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
