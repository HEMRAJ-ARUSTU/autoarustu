import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FiTrash2 } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import PaymentReminderModal from "./PaymentReminderModal";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";
import Select from "react-select";

const PaymentReminder = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [items, setItems] = useState([]);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterPartyName, setFilterPartyName] = useState("");

  useEffect(() => {
    GetData_PaymentReminder();
  }, []);

  useEffect(() => {
    GetData_PaymentReminder();
  }, [filterFromDate, filterToDate, filterPartyName]);

  const GetData_PaymentReminder = async () => {
    const val = {
      FromDtTm: filterFromDate || "",
      ToDtTm: filterToDate || "",
      PartyName: filterPartyName || "",
    };
    try {
      const res = await PostWithToken("PaymentReminder/GetData_PaymentReminder", val);
      if (res) {
        setItems(res);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const GetSingleData_PaymentReminder = async (ID) => {
    try {
      const val = { PaymentReminderID: ID };
      const res = await PostWithToken("PaymentReminder/GetSingleData_PaymentReminder", val);
      if (res) {
        setEditRow(res[0]);
        setOpen(true);
      }
    } catch (error) {
      console.error("GetSingleData PaymentReminder", error);
    }
  };

  const onEditItem = (row) => {
    setEditItemId(row.PaymentReminderID);
    GetSingleData_PaymentReminder(row.PaymentReminderID);
  };

  const onDeleteRequest = (row) => {
    setDeleteTarget(row);
  };

  const Delete_PaymentReminder = async (PaymentReminderID) => {
    try {
      const val = {
        PaymentReminderID: PaymentReminderID,
      };
      const res = await PostWithToken("PaymentReminder/Delete_PaymentReminder", val);
      if (res) {
        toastifySuccess("Payment Reminder successfully Deleted");
        await GetData_PaymentReminder();
      }
    } catch (error) {
      console.error("Delete PaymentReminder", error);
    }
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      const hay = `${r.PartyName || ""} ${r.NextDate || ""} ${r.DueInDays || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const columns = useMemo(
    () => [
      {
        name: <span className="font-semibold">Party Name</span>,
        selector: (row) => row.PartyName || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.PartyName || "-"}</div>,
      },
      {
        name: <span className="font-semibold">Amt</span>,
        selector: (row) => row.Amt || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.Amt || "-"}</div>,
      },
      {
        name: <span className="font-semibold">Next Date</span>,
        selector: (row) => row.NextDate || "-",
        sortable: true,
        cell: (row) => {
          const date = row.NextDate;
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
        name: <span className="font-semibold">Due In Days</span>,
        selector: (row) => row.DueInDays || 0,
        sortable: true,
        cell: (row) => (
          <div className="font-medium text-slate-800">
            {row.DueInDays !== null && row.DueInDays !== undefined ? row.DueInDays : "-"}
          </div>
        ),
      },
      {
        name: <span className="font-semibold">Is Due</span>,
        selector: (row) => row.IsDue || false,
        sortable: true,
        cell: (row) => {
          const isDue = row.IsDue === true || row.IsDue === "true" || row.IsDue === 1;
          return (
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isDue
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {isDue ? "Yes" : "No"}
              </span>
            </div>
          );
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

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="">
          <div className="mb-2 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              onClick={() => {
                setEditItemId(null);
                setOpen(true);
                setEditRow(null);
              }}
              className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap"
            >
              Add Reminder
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">From Date</label>
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">To Date</label>
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Party Name</label>
              <input
                type="text"
                placeholder="Search party name..."
                value={filterPartyName}
                onChange={(e) => setFilterPartyName(e.target.value)}
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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

        <PaymentReminderModal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditRow(null);
          }}
          editData={editRow}
          onSuccess={GetData_PaymentReminder}
        />

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white p-4 sm:p-5 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-800">
                Delete Payment Reminder
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteTarget.PartyName || "this payment reminder"}
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
                    await Delete_PaymentReminder(deleteTarget.PaymentReminderID);
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

export default PaymentReminder;

