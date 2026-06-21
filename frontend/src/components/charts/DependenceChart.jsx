import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DependenceChart({ data, featureLabel }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 12, right: 24, top: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" vertical={false} />
          <XAxis dataKey="featureValue" stroke="#64748b" tick={{fill: '#94a3b8'}} label={{ value: featureLabel, position: "insideBottom", offset: -4, fill: '#64748b' }} />
          <YAxis stroke="#64748b" tick={{fill: '#94a3b8'}} label={{ value: "SHAP value", angle: -90, position: "insideLeft", fill: '#64748b' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#12121a', borderColor: '#1f1f2e', color: '#f1f5f9', borderRadius: '8px' }}
            itemStyle={{ color: '#22d3ee' }}
          />
          <Line type="monotone" dataKey="shapValue" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#0a0a0f', strokeWidth: 2, stroke: '#06b6d4' }} activeDot={{ r: 6, fill: '#22d3ee' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
