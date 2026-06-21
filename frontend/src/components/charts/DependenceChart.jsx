import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DependenceChart({ dependence, featureLabel, loading }) {
  if (loading) {
    return <div className="h-80 grid place-items-center text-sm text-slate-400">Computing sensitivity…</div>;
  }

  const points = dependence?.points ?? [];
  if (!points.length) {
    return <div className="h-80 grid place-items-center text-sm text-slate-400">Run a prediction to see the sensitivity curve.</div>;
  }

  const data = points.map((p) => ({ featureValue: p.feature_value, prediction: p.prediction }));
  const unit = dependence?.unit ?? "MPa";
  const current = dependence?.current_value;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 18, right: 24, top: 12, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
          <XAxis
            dataKey="featureValue"
            type="number"
            domain={["dataMin", "dataMax"]}
            stroke="#cbd5e1"
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(v) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            label={{ value: `${featureLabel} (wt %)`, position: "insideBottom", offset: -4, fill: "#475569", fontSize: 12 }}
          />
          <YAxis
            stroke="#cbd5e1"
            tick={{ fill: "#64748b", fontSize: 12 }}
            domain={["auto", "auto"]}
            tickFormatter={(v) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            label={{ value: `Predicted strength (${unit})`, angle: -90, position: "insideLeft", fill: "#475569", fontSize: 12, style: { textAnchor: "middle" } }}
          />
          <Tooltip
            cursor={{ stroke: "#c7d2fe" }}
            formatter={(value) => [`${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`, "Predicted"]}
            labelFormatter={(label) => `${featureLabel}: ${Number(label).toLocaleString(undefined, { maximumFractionDigits: 3 })}`}
            contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#1e293b", borderRadius: "10px", boxShadow: "0 8px 24px -12px rgba(15,23,42,0.25)" }}
            itemStyle={{ color: "#4f46e5" }}
          />
          {current != null && (
            <ReferenceLine
              x={current}
              stroke="#7c3aed"
              strokeDasharray="4 4"
              label={{ value: "current", position: "top", fill: "#7c3aed", fontSize: 11 }}
            />
          )}
          <Line type="monotone" dataKey="prediction" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2, stroke: "#4f46e5" }} activeDot={{ r: 6, fill: "#4f46e5" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
