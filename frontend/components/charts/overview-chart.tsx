"use client";

import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from "recharts";

export function DepartmentBarChart({ data }: { data: Array<{ _id: string; totalStudents?: number; totalAchievements?: number }> }) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold">Department overview</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalStudents" fill="#102433" radius={[8, 8, 0, 0]} />
            <Bar dataKey="totalAchievements" fill="#f26a4b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GrowthLineChart({ data }: { data: Array<{ _id: number; total: number }> }) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold">Year-wise growth</h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#f26a4b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
