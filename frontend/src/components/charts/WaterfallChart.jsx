import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const colors = {
  positive: "#4f46e5", // indigo-600 — pushes the property up
  negative: "#e11d48", // rose-600   — pushes the property down
};

export default function WaterfallChart({ data, unit = "MPa" }) {
  if (!data?.rows?.length) {
    return <div className="h-96 grid place-items-center text-sm text-slate-400">No data yet.</div>;
  }

  const { rows, base, final, domain } = data;
  const chartRows = rows.map((row) => ({
    ...row,
    range: [Math.min(row.start, row.end), Math.max(row.start, row.end)],
  }));

  const fmt = (v) => Number(v).toLocaleString(undefined, { maximumFractionDigits: unit === "%" ? 2 : 0 });
  const fmtDelta = (v) => `${v >= 0 ? "+" : ""}${Number(v).toLocaleString(undefined, { maximumFractionDigits: unit === "%" ? 2 : 1 })}`;
  const height = Math.max(320, chartRows.length * 38 + 60);

  return (
    <div className="w-full mt-4" style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={chartRows} layout="vertical" margin={{ left: 8, right: 56, top: 8, bottom: 28 }}>
          <XAxis
            type="number"
            domain={domain}
            tickFormatter={fmt}
            stroke="#cbd5e1"
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={104}
            stroke="#cbd5e1"
            tick={{ fill: "#334155", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(79,70,229,0.05)" }}
            formatter={(_, __, item) => [`${fmtDelta(item.payload.delta)} ${unit}`, "Contribution"]}
            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e293b", borderRadius: "10px", boxShadow: "0 8px 24px -12px rgba(15,23,42,0.25)" }}
          />
          <ReferenceLine x={base} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: `base ${fmt(base)}`, position: "top", fill: "#64748b", fontSize: 11 }} />
          <ReferenceLine x={final} stroke="#7c3aed" strokeWidth={1.5} label={{ value: `predicted ${fmt(final)}`, position: "top", fill: "#7c3aed", fontSize: 11 }} />
          <Bar dataKey="range" radius={4} barSize={20}>
            {chartRows.map((row) => (
              <Cell key={row.name} fill={colors[row.type]} />
            ))}
            <LabelList dataKey="delta" position="right" formatter={fmtDelta} style={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
