"use client"

import * as React from "react"
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts"

// Données simulées pour le graphique
const data = [
  { date: "01/05", fraudes: 10, transactions: 120 },
  { date: "02/05", fraudes: 15, transactions: 145 },
  { date: "03/05", fraudes: 12, transactions: 125 },
  { date: "04/05", fraudes: 8, transactions: 130 },
  { date: "05/05", fraudes: 18, transactions: 150 },
  { date: "06/05", fraudes: 20, transactions: 155 },
  { date: "07/05", fraudes: 25, transactions: 190 },
  { date: "08/05", fraudes: 30, transactions: 205 },
  { date: "09/05", fraudes: 23, transactions: 185 },
  { date: "10/05", fraudes: 18, transactions: 170 },
  { date: "11/05", fraudes: 15, transactions: 165 },
  { date: "12/05", fraudes: 20, transactions: 175 },
  { date: "13/05", fraudes: 25, transactions: 185 },
  { date: "14/05", fraudes: 22, transactions: 180 },
]

export function ActivityChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorFraudes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          tick={{ fontSize: 12 }} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
            borderRadius: "var(--radius)",
            fontSize: "12px"
          }} 
        />
        <Area 
          type="monotone" 
          dataKey="fraudes" 
          stroke="var(--color-chart-1)" 
          fillOpacity={1} 
          fill="url(#colorFraudes)" 
          strokeWidth={2}
          name="Fraudes"
        />
        <Area 
          type="monotone" 
          dataKey="transactions" 
          stroke="var(--color-chart-2)" 
          fillOpacity={1} 
          fill="url(#colorTransactions)" 
          strokeWidth={2}
          name="Transactions (x10)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
} 