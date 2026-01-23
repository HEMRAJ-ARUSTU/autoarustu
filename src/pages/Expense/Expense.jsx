import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FiTrash2 } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import ExpenseModal from "./ExpenseModal";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";
import Select from "react-select";

const Expense = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [items, setItems] = useState([]);
  const [filterTransactionType, setFilterTransactionType] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");

  useEffect(() => {
    GetData_Expense();
  }, []);

  const GetData_Expense = async () => {
    const val = {
      IsActive: "1",
    };
    try {
      const res = await PostWithToken("Expense/GetData_Expense", val);
      if (res) {
        setItems(res);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const transactionTypeFilterOptions = [
    { value: "Expense", label: "Expense" },
    { value: "Income", label: "Income" },
  ];

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#cbd5e1",
      minHeight: "42px",
      "&:hover": { borderColor: "#2563eb" },
    }),
  };

  const GetSingleData_Expense = async (ID) => {
    try {
      const val = { ExpenseID: ID };
      const res = await PostWithToken("Expense/GetSingleData_Expense", val);
      if (res) {
        setEditRow(res[0] || res);
        setOpen(true);
      }
    } catch (error) {
      console.error("GetSingleData_Expense error:", error);
    }
  };

  const onEditItem = (row) => {
    setEditItemId(row.ExpenseID);
    GetSingleData_Expense(row.ExpenseID);
  };

  const onDeleteRequest = (row) => {
    setDeleteTarget(row);
  };

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (filterTransactionType) {
      filtered = filtered.filter(
        (r) => r.TransactionType === filterTransactionType.value
      );
    }

    if (filterDate) {
      filtered = filtered.filter((r) => {
        if (!r.CreatedDate && !r.Date) return false;
        const itemDate = r.CreatedDate || r.Date;
        const filterDateStr = new Date(filterDate).toISOString().split("T")[0];
        const itemDateStr = new Date(itemDate).toISOString().split("T")[0];
        return itemDateStr === filterDateStr;
      });
    }

    if (filterFromDate) {
      filtered = filtered.filter((r) => {
        if (!r.CreatedDate && !r.Date) return false;
        const itemDate = r.CreatedDate || r.Date;
        const itemDateObj = new Date(itemDate);
        const fromDateObj = new Date(filterFromDate);
        return itemDateObj >= fromDateObj;
      });
    }

    const q = search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((r) => {
        const hay = `${r.Name || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return filtered;
  }, [items, search, filterTransactionType, filterDate, filterFromDate]);

  const columns = useMemo(
    () => [
      {
        name: <span className="font-semibold">Transaction Type</span>,
        selector: (row) => row.TransactionType || "-",
        sortable: true,
        cell: (row) => (
          <div className="font-medium text-slate-800">
            {row.TransactionType || "-"}
          </div>
        ),
      },
      {
        name: <span className="font-semibold">Name</span>,
        selector: (row) => row.Name || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.Name || "-"}</div>,
      },
      {
        name: <span className="font-semibold">Amount</span>,
        selector: (row) => row.Amount || "-",
        sortable: true,
        cell: (row) => {
          const isExpense = row.TransactionType === "Expense";
          const isIncome = row.TransactionType === "Income";
          const colorClass = isExpense ? "text-red-600" : isIncome ? "text-green-600" : "text-slate-800";
          return (
            <div className={`font-semibold ${colorClass}`}>
              ₹{parseFloat(row.Amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          );
        },
      },
      {
        name: <span className="font-semibold">Description</span>,
        selector: (row) => row.Description || "-",
        sortable: true,
        cell: (row) => (
          <div className="truncate max-w-xs" title={row.Description}>
            {row.Description || "-"}
          </div>
        ),
      },
      {
        name: <span className="font-semibold">Date</span>,
        selector: (row) => row.ModifiedDtTm ? row.ModifiedDtTm : row.CreatedDtTm,
        sortable: true,
        cell: (row) => {
          const date = row.ModifiedDtTm ? row.ModifiedDtTm : row.CreatedDtTm;
          if (!date) return <div className="text-slate-500">-</div>;
          try {
            const dateObj = new Date(date);
            return (
              <div className="font-medium text-slate-800">
                {dateObj.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            );
          } catch {
            return <div className="text-slate-500">{date}</div>;
          }
        },
      },
      {
        name: "Actions",
        cell: (r) => (
          <div className="flex gap-2">
            <button
              className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
              onClick={() => onEditItem(r)}
              type="button"
              title="Edit"
            >
              <FaRegEdit className="text-base" />
            </button>

            <button
              className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
              onClick={() => onDeleteRequest(r)}
              type="button"
              title="Delete"
            >
              <FiTrash2 className="text-base" />
            </button>
          </div>
        ),
      },
    ],
    [editItemId]
  );

  const tableStyles = {
    headRow: { style: { backgroundColor: "#2563eb", minHeight: "34px" } },
    headCells: {
      style: {
        backgroundColor: "#2563eb",
        color: "#fff",
        fontWeight: 600,
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: "0.05em",
        borderBottom: "0",
      },
    },
    rows: { style: { minHeight: "52px" } },
    cells: { style: { padding: "1rem 0.75rem" } },
  };

  const Delete_Expense = async (ID) => {
    try {
      const val = {
        ExpenseID: ID,
        DeleteByUser: "0",
        IsActive: "",
      };
      const res = await PostWithToken("Expense/Delete_Expense", val);
      if (res) {
        toastifySuccess("Transaction successfully Deleted");
        await GetData_Expense();
      }
    } catch (error) {
      console.error("Delete_Expense error:", error);
    }
  };

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="">
          <div className="mb-4 space-y-3">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <Select
                value={filterTransactionType}
                onChange={setFilterTransactionType}
                options={transactionTypeFilterOptions}
                placeholder="Filter by type..."
                isClearable
                styles={selectStyles}
              />

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder="Filter by date..."
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                placeholder="Filter from date..."
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditItemId(null);
                  setOpen(true);
                  setEditRow(null);
                }}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap"
              >
                Add Transaction
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredItems}
              pagination
              paginationRowsPerPageOptions={[5, 10, 25, 50]}
              paginationPerPage={5}
              highlightOnHover
              striped
              fixedHeader
              fixedHeaderScrollHeight="400px"
              responsive
              customStyles={tableStyles}
            />
          </div>
        </div>

        <ExpenseModal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditRow(null);
          }}
          editData={editRow}
          onSuccess={GetData_Expense}
        />

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white p-4 sm:p-5 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-800">
                Delete Transaction
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteTarget.Name || "this transaction"}
                </span>
                ?
              </p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await Delete_Expense(deleteTarget.ExpenseID);
                    setDeleteTarget(null);
                  }}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expense;

