"use client";

import {
  BarChart, Bar, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, LineChart, Line, TooltipProps,
} from "recharts";

/* ─── Shared dark tooltip ────────────────────────────────────────────────── */
function DarkTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      padding: "10px 16px",
      fontFamily: "'Inter', sans-serif",
      fontSize: 12,
      color: "#0f172a",
      boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
    }}>
      <p style={{ color: "#64748b", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: 10 }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: "3px 0" }}>
          <span style={{ color: "#64748b" }}>{entry.name}: </span>
          <span style={{ fontWeight: 500 }}>{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────────────────── */
function ChartHeader({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
      <div style={{ width: 3, height: 18, borderRadius: 99, background: accent }} />
      <h3 style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: 18,
        color: "#0f172a",
        fontWeight: 600,
        margin: 0,
      }}>
        {title}
      </h3>
    </div>
  );
}

/* ─── Shared axis / grid styles ──────────────────────────────────────────── */
const axisStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fill: "#64748b",
  letterSpacing: "0.02em",
};

/* ─── Department Bar Chart ───────────────────────────────────────────────── */
export function DepartmentBarChart({
  data,
}: {
  data: Array<{ _id: string; totalStudents?: number; totalAchievements?: number }>;
}) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 16,
      padding: "28px",
      animation: "fadeUp 0.4s ease both",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <ChartHeader title="Department overview" accent="#2563eb" />

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f59e0b" }} />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 11, color: "#64748b",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            Students
          </span>
        </div>
      </div>

      <div style={{ height: 288 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="_id"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              content={<DarkTooltip />}
              cursor={{ fill: "rgba(37,99,235,0.06)" }}
            />
            <Bar
              dataKey="totalStudents"
              name="students"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
              opacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Year-wise Growth Line Chart ────────────────────────────────────────── */
export function GrowthLineChart({
  data,
}: {
  data: Array<{ _id: number; total: number }>;
}) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 16,
      padding: "28px",
      animation: "fadeUp 0.4s ease both",
      animationDelay: "80ms",
    }}>
      <ChartHeader title="Year-wise growth" accent="#1e3a8a" />

      {/* Inline stat summary */}
      {data.length > 0 && (
        <div style={{ display: "flex", gap: 28, marginBottom: 18 }}>
          <div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11, color: "#64748b",
              letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 3px",
            }}>
              Latest year
            </p>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 22, color: "#1e3a8a", margin: 0, lineHeight: 1,
            }}>
              {data[data.length - 1]._id}
            </p>
          </div>
          <div>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11, color: "#64748b",
              letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 3px",
            }}>
              Total
            </p>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 22, color: "#0f172a", margin: 0, lineHeight: 1,
            }}>
              {data[data.length - 1].total}
            </p>
          </div>
        </div>
      )}

      <div style={{ height: 288 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="_id"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              content={<DarkTooltip />}
              cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="url(#lineGlow)"
              strokeWidth={2.5}
              dot={{
                fill: "#2563eb",
                stroke: "#ffffff",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: "#8b5cf6",
                stroke: "#ffffff",
                strokeWidth: 2,
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
