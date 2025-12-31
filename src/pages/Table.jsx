import React, { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import Card from "../components/Card";

const StatusBadge = ({ value }) => {
    const map = {
        Completed: "bg-indigo-50 text-indigo-600",
        Reject: "bg-red-50 text-red-600",
        Pending: "bg-orange-50 text-orange-600",
    };
    return (
        <span
            className={
                "inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold " +
                (map[value] || "bg-slate-100 text-slate-700")
            }
        >
            {value}
        </span>
    );
};

const NameCell = ({ row }) => (
    <div className="flex items-center gap-3">
        <img
            src={row.avatar}
            alt={row.name}
            className="h-9 w-9 rounded-full object-cover"
        />
        <span className="font-medium text-slate-900">{row.name}</span>
    </div>
);

export default function Table() {
    const [menuId, setMenuId] = useState(null);

    const data = useMemo(
        () => [
            {
                id: 1,
                name: "James Anderson",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                department: "Back-End Developer",
                totalDays: "30 Days",
                workingDay: "27 Days",
                totalSalary: "$22,250",
                overTime: "$1500",
                status: "Completed",
            },
            {
                id: 2,
                name: "William Johnson",
                avatar: "https://randomuser.me/api/portraits/men/52.jpg",
                department: "Full-Stack Developer",
                totalDays: "29 Days",
                workingDay: "18 Days",
                totalSalary: "$21,500",
                overTime: "$1800",
                status: "Completed",
            },
            {
                id: 3,
                name: "Benjamin Martinez",
                avatar: "https://randomuser.me/api/portraits/men/12.jpg",
                department: "Mobile App Developer",
                totalDays: "28 Days",
                workingDay: "4 Days",
                totalSalary: "$22,250",
                overTime: "$2900",
                status: "Reject",
            },
            {
                id: 4,
                name: "Michael Davis",
                avatar: "https://randomuser.me/api/portraits/men/22.jpg",
                department: "UI/UX Designer",
                totalDays: "27 Days",
                workingDay: "27 Days",
                totalSalary: "$86,000",
                overTime: "$400",
                status: "Pending",
            },
            {
                id: 5,
                name: "Matthew Taylor",
                avatar: "https://randomuser.me/api/portraits/men/44.jpg",
                department: "DevOps Engineer",
                totalDays: "26 Days",
                workingDay: "30 Days",
                totalSalary: "$12,000",
                overTime: "$700",
                status: "Pending",
            },
        ],
        []
    );

    const columns = useMemo(
        () => [
            {
                name: "Name",
                cell: (row) => <NameCell row={row} />,
                minWidth: "220px",
            },
            {
                name: "Department",
                selector: (row) => row.department,
                minWidth: "220px",
                sortable: true
            },
            {
                name: "Total Days",
                selector: (row) => row.totalDays,
                minWidth: "120px",
                sortable: true
            },
            {
                name: "Working Day",
                selector: (row) => row.workingDay,
                minWidth: "130px",
                sortable: true
            },
            {
                name: "Total Salary",
                selector: (row) => row.totalSalary,
                minWidth: "140px",
                sortable: true,

            },
            {
                name: "Over Time",
                selector: (row) => row.overTime,
                minWidth: "120px",
                sortable: true,

            },
            {
                name: "Status",
                cell: (row) => <StatusBadge value={row.status} />,
                minWidth: "130px",
                sortable: true,
            },
            {
                name: "Action",
                cell: (row) => (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuId((p) => (p === row.id ? null : row.id))}
                            className="h-9 w-9 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                            aria-label="More"
                        >
                            <span className="text-center font-bold font-[20px]">&#8942;</span>
                        </button>

                        {menuId === row.id && (
                            <div className="absolute right-0 top-10 z-10 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                <button
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                                    onClick={() => setMenuId(null)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => setMenuId(null)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ),
                minWidth: "100px",
                ignoreRowClick: true,
                allowOverflow: true,
                button: true,
            },
        ],
        [menuId]
    );

    const customStyles = {
        table: { style: { minWidth: "1050px" } },
        headCells: {
            style: {
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                backgroundColor: "#ffffff",
                paddingTop: "14px",
                paddingBottom: "14px",
            },
        },
        cells: {
            style: {
                fontSize: "13px",
                color: "#0f172a",
                paddingTop: "14px",
                paddingBottom: "14px",
            },
        },
        rows: {
            style: {
                borderBottom: "1px solid #e2e8f0",
            },
        },
    };

    return (
        <>
            {/* scroll container */}
            <Card>
                <div className="w-full overflow-x-auto pt-0">
                    <DataTable
                        columns={columns}
                        data={data}
                        customStyles={customStyles}
                        highlightOnHover
                        dense={false}
                        pagination={false}
                        responsive={false}
                        onRowClicked={() => setMenuId(null)}
                    />
                </div>
            </Card>
        </>
    );
}
