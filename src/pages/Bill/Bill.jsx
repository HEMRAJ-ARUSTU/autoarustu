import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FiTrash2 } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import BillModal from "./BillModal";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";
import { format } from "date-fns";

const Bill = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    GetData_Bill();
  }, []);

  const GetData_Bill = async () => {
    const val = {
      IsActive: "1",
      CreatedDateFrom: "",
      CreatedDateTo: "",
    };
    try {
      const res = await PostWithToken("Bill/GetData_Bill", val);
      if (res) {
        setItems(res);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const GetSingleData_Bill = async (BillID) => {
    try {
      const val = { BillID: BillID };
      const res = await PostWithToken("Bill/GetSingleData_Bill", val);
      if (res) {
        setEditRow(res);
        setOpen(true);
      }
    } catch (error) {
      console.error("GetSingleData_Bill error:", error);
    }
  };

  const onEditItem = (row) => {
    setEditItemId(row.BillID);
    GetSingleData_Bill(row.BillID);
  };

  const onDeleteRequest = (row) => {
    setDeleteTarget(row);
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      const hay = `${r.ReceiptNo || ""} ${r.CompanyName || ""} ${r.PaymentMode || ""} ${r.UserName || ""} ${r.GrandTotal || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const columns = useMemo(
    () => [
      {
        name: <span className="font-semibold">Invoice No.</span>,
        selector: (row) => row.ReceiptNo || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.ReceiptNo || "-"}</div>,
      },
      {
        name: <span className="font-semibold">Company Name</span>,
        selector: (row) => row.CompanyName || "-",
        sortable: true,
      },
      {
        name: <span className="font-semibold">Bill Date</span>,
        selector: (row) => row.BillDate ? format(new Date(row.BillDate), "dd MMM yyyy") : (row.PaymentDate ? format(new Date(row.PaymentDate), "dd MMM yyyy") : "-"),
        sortable: true,
      },
      {
        name: <span className="font-semibold">Grand Total</span>,
        selector: (row) => row.GrandTotal || row.RoundOff || "0",
        sortable: true,
        cell: (row) => <div className="font-semibold text-green-600">₹{row.GrandTotal || row.RoundOff || "0"}</div>,
      },
      {
        name: <span className="font-semibold">Payment Mode</span>,
        selector: (row) => row.PaymentMode || "-",
        sortable: true,
      },
      {
        name: <span className="font-semibold">User Name</span>,
        selector: (row) => row.UserName || "-",
        sortable: true,
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

  const Delete_Bill = async (BillID) => {
    try {
      const val = {
        BillID: BillID,
      };
      const res = await PostWithToken("Bill/Delete_Bill", val);
      if (res) {
        toastifySuccess("Bill successfully Deleted");
        await GetData_Bill();
      }
    } catch (error) {
      console.error("Delete_Bill error:", error);
    }
  };

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="">
          <div className="mb-2 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bill..."
              className="w-full sm:w-64 md:w-72 rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoComplete="off-district"
            />

            <button
              onClick={() => {
                setEditItemId(null);
                setOpen(true);
                setEditRow(null);
              }}
              className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap"
            >
              Add Bill
            </button>
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

        <BillModal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditRow(null);
          }}
          editData={editRow}
          onSuccess={GetData_Bill}
        />

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white p-4 sm:p-5 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-800">
                Delete Bill
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete bill{" "}
                <span className="font-semibold">
                  {deleteTarget.ReceiptNo || deleteTarget.CompanyName || "this bill"}
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
                    await Delete_Bill(deleteTarget.BillID);
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

export default Bill;

