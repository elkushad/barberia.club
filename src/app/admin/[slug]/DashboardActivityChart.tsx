"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export interface ActivityPoint {
  label: string;
  visitas: number;
  clientes: number;
}

export default function DashboardActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVisitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E63946" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#E63946" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradClientes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" hide />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f1f1f",
            border: "1px solid #333",
            borderRadius: "8px",
            fontSize: "0.8rem",
          }}
          labelStyle={{ color: "#a3a3a3" }}
        />
        <Area
          type="monotone"
          dataKey="visitas"
          name="Visitas registradas"
          stroke="#E63946"
          strokeWidth={2.5}
          fill="url(#gradVisitas)"
          dot={false}
          activeDot={{ r: 4, fill: "#E63946" }}
        />
        <Area
          type="monotone"
          dataKey="clientes"
          name="Nuevos clientes"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#gradClientes)"
          dot={false}
          activeDot={{ r: 4, fill: "#3b82f6" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
