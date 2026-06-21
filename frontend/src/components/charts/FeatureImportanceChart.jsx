import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function FeatureImportanceChart({ data }) {
  if (!data?.length) {
    return <div className="h-80 grid place-items-center text-sm text-slate-400">No data yet.</div>;
  }

  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer>
        <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 24, right: 24 }}>
          <defs>
            <linearGradient id="colorImportance" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f7" />
          <XAxis type="number" unit="%" stroke="#cbd5e1" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={96} stroke="#cbd5e1" tick={{ fill: "#334155", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(79,70,229,0.06)" }}
            formatter={(value) => [`${value}%`, "Importance"]}
            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e293b", borderRadius: "10px", boxShadow: "0 8px 24px -12px rgba(15,23,42,0.25)" }}
            itemStyle={{ color: "#4f46e5" }}
          />
          <Bar dataKey="importance" fill="url(#colorImportance)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
