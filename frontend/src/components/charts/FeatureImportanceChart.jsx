import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function FeatureImportanceChart({ data }) {
  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer>
        <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 24, right: 24 }}>
          <defs>
            <linearGradient id="colorImportance" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1f1f2e" />
          <XAxis type="number" unit="%" stroke="#64748b" tick={{fill: '#94a3b8'}} />
          <YAxis type="category" dataKey="name" width={96} stroke="#64748b" tick={{fill: '#94a3b8'}} />
          <Tooltip 
            formatter={(value) => [`${value}%`, "Importance"]}
            contentStyle={{ backgroundColor: '#12121a', borderColor: '#1f1f2e', color: '#f1f5f9', borderRadius: '8px' }}
            itemStyle={{ color: '#22d3ee' }}
          />
          <Bar dataKey="importance" fill="url(#colorImportance)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
