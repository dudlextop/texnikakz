'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ActivityPoint {
  date: string;
  publishedListings: number;
  pendingListings: number;
  specialists: number;
}

interface ActivityChartProps {
  data: ActivityPoint[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-100">Динамика за 7 дней</h3>
        <p className="text-xs uppercase tracking-wide text-slate-500">Публикации, модерация, специалисты</p>
      </div>
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="publishedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb7185" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="specialistGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#475569" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis stroke="#475569" tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#0f172a', borderColor: '#1e293b', borderRadius: 12 }}
              labelStyle={{ color: '#cbd5f5' }}
            />
            <Area
              type="monotone"
              dataKey="publishedListings"
              stroke="#22d3ee"
              fillOpacity={1}
              fill="url(#publishedGradient)"
              name="Опубликовано"
            />
            <Area
              type="monotone"
              dataKey="pendingListings"
              stroke="#fb7185"
              fillOpacity={1}
              fill="url(#pendingGradient)"
              name="На модерации"
            />
            <Area
              type="monotone"
              dataKey="specialists"
              stroke="#a855f7"
              fillOpacity={1}
              fill="url(#specialistGradient)"
              name="Специалисты"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
