import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = {
  base: "#8b5cf6", // violet-500
  positive: "#06b6d4", // cyan-500
  negative: "#ef4444", // red-500
  final: "#f1f5f9", // slate-100
};

export default function WaterfallChart({ data }) {
  const rows = data.map((row) => ({
    ...row,
    range: [Math.min(row.start, row.end), Math.max(row.start, row.end)],
  }));

  return (
    <div className="h-96 w-full mt-4">
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ left: 12, right: 24, bottom: 70 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" vertical={false} />
          <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={92} stroke="#64748b" tick={{fill: '#94a3b8'}} />
          <YAxis stroke="#64748b" tick={{fill: '#94a3b8'}} />
          <Tooltip
            formatter={(_, __, item) => [
              Number(item.payload.delta).toLocaleString(undefined, { maximumFractionDigits: 3 }),
              "Contribution",
            ]}
            contentStyle={{ backgroundColor: '#12121a', borderColor: '#1f1f2e', color: '#f1f5f9', borderRadius: '8px' }}
          />
          <Bar dataKey="range" radius={[4, 4, 0, 0]}>
            {rows.map((row) => (
              <Cell key={row.name} fill={colors[row.type]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
