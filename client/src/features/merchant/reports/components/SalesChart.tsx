import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

interface SalesChartProps {
  data: Array<{ name: string; total: number }>;
}

export default function SalesChart({ data }: SalesChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [chartRange, setChartRange] = useState("Minggu");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Chart Area */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-lg text-slate-800">Grafik Penjualan</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['Harian', 'Minggu', 'Bulan'].map(range => (
                <button
                  key={range}
                  onClick={() => setChartRange(range)}
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-md transition-colors",
                    chartRange === range ? "bg-white text-brand-secondary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setChartType("line")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-colors",
                chartType === "line" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Garis Lurus
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-colors",
                chartType === "bar" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Batang
            </button>
          </div>
        </div>

        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `Rp. ${value.toLocaleString('id-ID')}`}
                  dx={-10}
                />
                <Tooltip 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`Rp. ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="linear" 
                  dataKey="total" 
                  stroke="#FBA518" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#FBA518' }} 
                  activeDot={{ r: 6, fill: '#FBA518', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `Rp. ${value.toLocaleString('id-ID')}`}
                  dx={-10}
                />
                <Tooltip 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`Rp. ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="total" fill="#FBA518" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ringkasan Penjualan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <h3 className="font-bold text-lg text-slate-800 mb-6">Ringkasan Penjualan</h3>
        
        <div className="space-y-6 flex-1">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-sm text-slate-500 font-medium">Rata rata per hari</span>
            <span className="font-bold text-slate-800">Rp. 440.000</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-sm text-slate-500 font-medium">Penjualan Tertinggi</span>
            <span className="font-bold text-slate-800">Rp. 700.000</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-sm text-slate-500 font-medium">Penjualan Terendah</span>
            <span className="font-bold text-slate-800">Rp. 300.000</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-slate-800">Tren Penjualan</span>
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg flex items-center gap-1 font-bold text-xs">
              <TrendingUp className="w-3 h-3" />
              Naik 10%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}