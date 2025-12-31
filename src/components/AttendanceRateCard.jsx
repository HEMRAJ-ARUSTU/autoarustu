import React from "react";
import Card from "./Card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
    { month: "Jan", oneTime: 60, late: 22, absent: 18 },
    { month: "Feb", oneTime: 58, late: 24, absent: 18 },
    { month: "Mar", oneTime: 54, late: 26, absent: 20 },
    { month: "Apr", oneTime: 75, late: 10, absent: 15 },
    { month: "May", oneTime: 40, late: 22, absent: 38 },
    { month: "Jun", oneTime: 52, late: 32, absent: 16 },
    { month: "Jul", oneTime: 30, late: 48, absent: 22 },
    { month: "Aug", oneTime: 66, late: 17, absent: 17 },
    { month: "Sep", oneTime: 67, late: 16, absent: 17 },
    { month: "Oct", oneTime: 67, late: 16, absent: 17 },
    { month: "Nov", oneTime: 67, late: 16, absent: 17 },
    { month: "Dec", oneTime: 67, late: 16, absent: 17 },
];

export default function AttendanceRateCard() {
    return (
        <Card
            title="Attendance Rate"
            right={
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Download Report
                </button>
            }
        >
            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={14}>
                        <CartesianGrid vertical={false} strokeDasharray="4 4" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip formatter={(v) => `${v}%`} />
                        <Bar dataKey="oneTime" stackId="a" fill="#2563eb" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="late" stackId="a" fill="#f97316" />
                        <Bar dataKey="absent" stackId="a" fill="#94a3b8" radius={[0, 0, 8, 8]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
                <LegendDot color="#2563eb" label="One Time" />
                <LegendDot color="#f97316" label="Late" />
                <LegendDot color="#94a3b8" label="Absent" />
            </div>
        </Card>
    );
}

function LegendDot({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span>{label}</span>
        </div>
    );
}
