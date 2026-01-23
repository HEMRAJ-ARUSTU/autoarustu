import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FiTrash2 } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import PurchaseOrderModal from "./PurchaseOrderModal";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const PurchaseOrder = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [items, setItems] = useState([]);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  useEffect(() => {
    GetData_PurchaseOrder();
  }, []);

  useEffect(() => {
    GetData_PurchaseOrder();
  }, [filterFromDate, filterToDate]);

  const GetData_PurchaseOrder = async () => {
    const val = {
      IsActive: "1",
      CreatedDateFrom: filterFromDate || "",
      CreatedDateTo: filterToDate || "",
    };
    try {
      const res = await PostWithToken("PurchaseOrder/GetData_PurchaseOrder", val);

      if (res) {
        setItems(res);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const GetSingleData_PurchaseOrder = async (ID) => {
    try {
      const val = { PurchaseOrderID: ID };
      const res = await PostWithToken("PurchaseOrder/GetSingleData_PurchaseOrder", val);
      if (res) {
        setEditRow(res[0]);
        setOpen(true);
      }
    } catch (error) {
      console.error("GetSingleData_PurchaseOrder error:", error);
    }
  };

  const onEditItem = (row) => {
    setEditItemId(row.PurchaseOrderID);
    GetSingleData_PurchaseOrder(row.PurchaseOrderID);
  };

  const onDeleteRequest = (row) => {
    setDeleteTarget(row);
  };

  const Delete_PurchaseOrder = async (PurchaseOrderID) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        PurchaseOrderID: PurchaseOrderID,
        DeleteByUser: auth?.UserID || "1",
        IsActive: "0",
      };
      const res = await PostWithToken("PurchaseOrder/Delete_PurchaseOrder", val);
      if (res) {
        toastifySuccess("Purchase Order successfully Deleted");
        await GetData_PurchaseOrder();
      }
    } catch (error) {
      console.error("Delete_PurchaseOrder error:", error);
    }
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      const hay = `${r.PONumber || ""} ${r.Status || ""} ${r.PartyName || ""} ${r.SupplierName || ""}`.toLowerCase();
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
        name: <span className="font-semibold">Supplier Name</span>,
        selector: (row) => row.SupplierName || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.SupplierName || "-"}</div>,
      },
      {
        name: <span className="font-semibold">PO Number</span>,
        selector: (row) => row.PONumber || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.PONumber || "-"}</div>,
      },






      {
        name: <span className="font-semibold">Order Date</span>,
        selector: (row) => row.OrderDate || "-",
        sortable: true,
        cell: (row) => {
          const date = row.OrderDate;
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
        name: <span className="font-semibold">Total Amount</span>,
        selector: (row) => row.TotalAmount || 0,
        sortable: true,
        cell: (row) => (
          <div className="font-medium text-slate-800">
            ₹{parseFloat(row.TotalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        ),
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
          <div className="mb-4 flex flex-row items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">From Date</label>
              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">To Date</label>
              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search purchase order..."
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ marginTop: '24px' }}
              />
            </div>
            <button
              onClick={() => {
                setEditItemId(null);
                setOpen(true);
                setEditRow(null);
              }}
              className="rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap"
              style={{ marginTop: '24px' }}
            >
              Add Purchase Order
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

        <PurchaseOrderModal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditRow(null);
          }}
          editData={editRow}
          onSuccess={GetData_PurchaseOrder}
        />

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white p-4 sm:p-5 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-800">
                Delete Purchase Order
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteTarget.PONumber || "this purchase order"}
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
                    await Delete_PurchaseOrder(deleteTarget.PurchaseOrderID);
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

export default PurchaseOrder;

