import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FiTrash2 } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import TempModal from "./TempModal";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const Temp = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    GetData_Temp();
  }, []);

  const GetData_Temp = async () => {
    const val = {
      IsActive: "1",
    };
    try {
      const res = await PostWithToken("Temp/GetData_Temp", val);
      if (res) {
        setItems(res);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const GetSingleData_Temp = async (ID) => {
    try {
      const val = { TempID: ID };
      const res = await PostWithToken("Temp/GetSingleData_Temp", val);
      if (res) {
        setEditRow(res[0]);
        setOpen(true);
      }
    } catch (error) {
      console.error("GetSingleData_Temp error:", error);
    }
  };

  const onEditItem = (row) => {
    setEditItemId(row.TempID);
    GetSingleData_Temp(row.TempID);
  };

  const onDeleteRequest = (row) => {
    setDeleteTarget(row);
  };

  const handleIsVerifiedChange = async (row, isVerified) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        TempID: row.TempID,
        Name: row.Name,
        OwnerName: row.OwnerName,
        OwnerMobileNo: row.OwnerMobileNo,
        OfficeMobileNo: row.OfficeMobileNo,
        ReferenceID: row.ReferenceID || "",
        Address: row.Address,
        District: row.District,
        GSTNo: row.GSTNo,
        MEOffice: row.MEOffice,
        FinalAmt: row.FinalAmt || "0",
        IsVerified: isVerified,
        ModifiedByUser: auth?.UserID || "1",
      };
      const res = await PostWithToken("Temp/Update_Temp", val);
      if (res) {
        toastifySuccess("IsVerified updated successfully");
        await GetData_Temp();
      }
    } catch (error) {
      console.error("Update IsVerified error:", error);
    }
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      const hay = `${r.Name || ""} ${r.OwnerName || ""} ${r.OwnerMobileNo || ""} ${r.OfficeMobileNo || ""} ${r.Address || ""} ${r.District || ""} ${r.GSTNo || ""} ${r.FinalAmt || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const columns = useMemo(
    () => [
      {
        name: <span className="font-semibold">Name</span>,
        selector: (row) => row.Name || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.Name || "-"}</div>,
      },
      {
        name: <span className="font-semibold">Owner Name</span>,
        selector: (row) => row.OwnerName || "-",
        sortable: true,
      },
      {
        name: <span className="font-semibold">Owner Mobile No.</span>,
        selector: (row) => row.OwnerMobileNo || "-",
        sortable: true,
      },
      {
        name: <span className="font-semibold">Final Amount</span>,
        selector: (row) => row.FinalAmt || "-",
        sortable: true,
        cell: (row) => (
          <div className="font-medium text-slate-800">
            {row.FinalAmt ? `₹${parseFloat(row.FinalAmt).toLocaleString('en-IN')}` : "-"}
          </div>
        ),
      },
      {
        name: <span className="font-semibold">Address</span>,
        selector: (row) => row.Address || "-",
        sortable: true,
        cell: (row) => (
          <div className="truncate max-w-xs" title={row.Address}>
            {row.Address || "-"}
          </div>
        ),
      },
      {
        name: <span className="font-semibold">District</span>,
        selector: (row) => row.District || "-",
        sortable: true,
      },

      {
        name: <span className="font-semibold">Is Verified</span>,
        selector: (row) => row.IsVerified || false,
        sortable: true,
        cell: (row) => {
          const isVerified = row.IsVerified === true || row.IsVerified === "true" || row.IsVerified === 1;
          return (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => handleIsVerifiedChange(row, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
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

  const Delete_Temp = async (TempID) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        TempID: TempID,
        DeleteByUser: auth?.UserID || "1",
        IsActive: "0",
      };
      const res = await PostWithToken("Temp/Delete_Temp", val);
      if (res) {
        toastifySuccess("Temp successfully Deleted");
        await GetData_Temp();
      }
    } catch (error) {
      console.error("Delete_Temp error:", error);
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
              placeholder="Search temp..."
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
              Add Temp
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

        <TempModal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditRow(null);
          }}
          editData={editRow}
          onSuccess={GetData_Temp}
        />

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white p-4 sm:p-5 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-800">
                Delete Temp
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteTarget.Name || "this temp"}
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
                    await Delete_Temp(deleteTarget.TempID);
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

export default Temp;

