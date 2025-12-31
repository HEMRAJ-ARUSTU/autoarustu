import React from "react";
import Card from "./Card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FiMoreHorizontal } from "react-icons/fi";

const types = [
    { name: "Onsite", value: 800, color: "#2563eb" },
    { name: "Remote", value: 105, color: "#f97316" },
    { name: "Hybrid", value: 301, color: "#fbbf24" },
];

const total = types.reduce((s, x) => s + x.value, 0);

export default function EmployeeTypeCard() {
    return (
        <Card
            title="Employee Type"
            right={
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50">
                    <FiMoreHorizontal className="text-[18px]" />
                </button>
            }
        >
            <div className="relative h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={types}
                            dataKey="value"
                            innerRadius={78}
                            outerRadius={110}
                            paddingAngle={6}
                            stroke="white"
                            strokeWidth={4}
                        >
                            {types.map((t) => (
                                <Cell key={t.name} fill={t.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-slate-900">{total}</div>
                    <div className="text-sm text-slate-500">Employee</div>
                </div>
            </div>

            <div className="mt-2 flex flex-wrap justify-center gap-5 text-sm text-slate-600">
                {types.map((t) => (
                    <div key={t.name} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="font-semibold text-slate-700">{t.value}</span>
                        <span className="text-slate-500">{t.name}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
