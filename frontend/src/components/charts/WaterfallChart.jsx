import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = {
  base: "#8b5cf6", // violet-500
  positive: "#4f46e5", // indigo-600
  negative: "#e11d48", // rose-600
  final: "#0f172a", // slate-900
};

export default function WaterfallChart({ data }) {
  if (!data?.length) {
    return <div className="h-96 grid place-items-center text-sm text-slate-400">No data yet.</div>;
  }

  const rows = data.map((row) => ({
    ...row,
    range: [Math.min(row.start, row.end), Math.max(row.start, row.end)],
  }));

  return (
    <div className="h-96 w-full mt-4">
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ left: 12, right: 24, bottom: 70 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={92} stroke="#cbd5e1" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis stroke="#cbd5e1" tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(79,70,229,0.06)" }}
            formatter={(_, __, item) => [
              Number(item.payload.delta).toLocaleString(undefined, { maximumFractionDigits: 3 }),
              "Contribution",
            ]}
            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e293b", borderRadius: "10px", boxShadow: "0 8px 24px -12px rgba(15,23,42,0.25)" }}
          />
          <Bar dataKey="range" radius={[4, 4, 4, 4]}>
            {rows.map((row) => (
              <Cell key={row.name} fill={colors[row.type]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
