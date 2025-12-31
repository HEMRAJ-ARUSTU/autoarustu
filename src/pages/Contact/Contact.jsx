import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FiTrash2 } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import ContactModal from "./ContactModal";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const Contact = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    GetData_Contact();
  }, []);

  const GetData_Contact = async () => {
    const val = {
      IsActive: "1",
    };
    try {
      const res = await PostWithToken("Contact/GetData_Contact", val);
      if (res) {
        setItems(res);
      }else {
        setItems([]);
      }
    } catch (error) {
      console.error(error);
    }
  };  

  const GetSingleData_Contact = async (ID) => {
    try {
      const val = { ID: ID };
      const res = await PostWithToken("Contact/GetSingleData_Contact", val);
      if (res) {
        setEditRow(res[0]);
        setOpen(true);
      }
    } catch (error) {
      console.error("GetSingleData_Contact error:", error);
    }
  };

  const onEditItem = (row) => {
    setEditItemId(row.ID);
    GetSingleData_Contact(row.ID);
  };

  const onDeleteRequest = (row) => {
    setDeleteTarget(row);
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      const hay = `${r.CustomerName || ""} ${r.MobileNo || ""} ${r.Address || ""} ${r.Reference || ""} ${r.CurserName || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const columns = useMemo(
    () => [
      {
        name: <span className="font-semibold">Customer Name</span>,
        selector: (row) => row.CustomerName || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.CustomerName || "-"}</div>,
      },
      {
        name: <span className="font-semibold">Mobile No.</span>,
        selector: (row) => row.MobileNo || "-",
        sortable: true,
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
        name: <span className="font-semibold">Reference</span>,
        selector: (row) => row.Reference || "-",
        sortable: true,
      },
      {
        name: <span className="font-semibold">Status</span>,
        selector: (row) => row.Status || "-",
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

  const Delete_Contact = async (ID) => {
    try {
      const val = {
        ID: ID,
        DeleteByUser: "0",
        IsActive: "",
      };
      const res = await PostWithToken("Contact/Delete_Contact", val);
      if (res) {
        toastifySuccess("Contact successfully Deleted");
        await GetData_Contact();
      }
    } catch (error) {
      console.error("Delete_Contact error:", error);
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
              placeholder="Search contact..."
              className="w-full sm:w-64 md:w-72 rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <button
              onClick={() => {
                setEditItemId(null);
                setOpen(true);
                setEditRow(null);
              }}
              className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap"
            >
              Add Contact
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

        <ContactModal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditRow(null);
          }}
          editData={editRow}
          onSuccess={GetData_Contact}
        />

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white p-4 sm:p-5 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-800">
                Delete Contact
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteTarget.CustomerName || "this contact"}
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
                    await Delete_Contact(deleteTarget.ID);
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
}

export default Contact;