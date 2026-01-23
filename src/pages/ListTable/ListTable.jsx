import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FiTrash2 } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";
import CompanyItemModal from "./CompanyItemModal";
import ItemModal from "./ItemModal";

const ListTable = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const apiConfigs = [
    {
      id: "item",
      label: "Item",
      getDataApi: "Item/GetData_Item",
      getDataParams: { IsActive: "1" },
      getSingleApi: "Item/GetSingleData_Item",
      getSingleParamKey: "ItemID",
      deleteApi: "Item/Delete_Item",
      deleteParamKey: "ItemID",
      deleteParams: { DeleteByUser: "0", IsActive: "" },
      columns: [
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
      ],
      searchFields: ["Description"],
      displayName: (row) => row.Description || "this item",
    },
    {
      id: "companyitem",
      label: "Company Item",
      getDataApi: "CompanyItem/GetData_CompanyItem",
      getDataParams: { IsActive: "1" },
      getSingleApi: "CompanyItem/GetSingleData_CompanyItem",
      getSingleParamKey: "CompanyID",
      deleteApi: "CompanyItem/Delete_CompanyItem",
      deleteParamKey: "CompanyID",
      deleteParams: { IsActive: "" },
      columns: [
        {
          name: <span className="font-semibold">Item Name</span>,
          selector: (row) => row.ItemName || "-",
          sortable: true,
          cell: (row) => <div className="font-medium text-slate-800">{row.ItemName || "-"}</div>,
        },
        {
          name: <span className="font-semibold">Company Name</span>,
          selector: (row) => row.Description || "-",
          sortable: true,
        },










      ],
      searchFields: ["Description"],
      displayName: (row) => row.Description,
    },
  ];

  useEffect(() => {
    if (selectedConfig) {
      GetData();
    }
  }, [selectedConfig]);

  const GetData = async () => {
    if (!selectedConfig) return;
    setLoading(true);
    try {
      const res = await PostWithToken(selectedConfig.getDataApi, selectedConfig.getDataParams || {});
      if (res) {
        setItems(Array.isArray(res) ? res : []);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("GetData error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const GetSingleData = async (id) => {
    if (!selectedConfig) return;
    try {
      const val = { [selectedConfig.getSingleParamKey]: id };
      const res = await PostWithToken(selectedConfig.getSingleApi, val);
      if (res) {
        setEditRow(Array.isArray(res) ? res[0] : res);
        setOpen(true);
      }
    } catch (error) {
      console.error("GetSingleData error:", error);
    }
  };

  const onEditItem = (row) => {
    const idKey = selectedConfig.getSingleParamKey;
    const id = row[idKey] || row.ID || row.id;
    if (id) {
      GetSingleData(id);
    }
  };

  const onDeleteRequest = (row) => {
    setDeleteTarget(row);
  };

  const filteredItems = useMemo(() => {
    if (!selectedConfig) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      const searchText = selectedConfig.searchFields
        .map((field) => String(r[field] || ""))
        .join(" ")
        .toLowerCase();
      return searchText.includes(q);
    });
  }, [items, search, selectedConfig]);

  const columns = useMemo(() => {
    if (!selectedConfig) return [];
    return [
      ...selectedConfig.columns,
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
    ];
  }, [selectedConfig, items]);

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

  const Delete_Item = async (row) => {
    if (!selectedConfig) return;
    try {
      const idKey = selectedConfig.deleteParamKey;
      const id = row[idKey] || row.ID || row.id;
      const val = {
        [idKey]: id,
        ...selectedConfig.deleteParams,
      };
      const res = await PostWithToken(selectedConfig.deleteApi, val);
      if (res) {
        toastifySuccess(`${selectedConfig.label} successfully Deleted`);
        await GetData();
      }
    } catch (error) {
      console.error("Delete_Item error:", error);
    }
  };

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select API / Table
          </label>
          <select
            value={selectedConfig?.id || ""}
            onChange={(e) => {
              const config = apiConfigs.find((c) => c.id === e.target.value);
              setSelectedConfig(config || null);
              setItems([]);
              setSearch("");
              setEditRow(null);
              setDeleteTarget(null);
            }}
            className="w-full sm:w-64 rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select an API...</option>
            {apiConfigs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {selectedConfig && (
          <>
            <div className="mb-2 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${selectedConfig.label.toLowerCase()}...`}
                className="w-full sm:w-64 md:w-72 rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <button
                onClick={() => {
                  setOpen(true);
                  setEditRow(null);
                }}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap"
              >
                Add {selectedConfig.label}
              </button>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : (
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
              )}
            </div>
          </>
        )}

        {!selectedConfig && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg font-medium mb-2">No API Selected</p>
            <p className="text-sm">Please select an API from the dropdown above to view data</p>
          </div>
        )}

        {selectedConfig?.id === "companyitem" && (
          <CompanyItemModal
            open={open}
            onClose={() => {
              setOpen(false);
              setEditRow(null);
            }}
            editData={editRow}
            onSuccess={GetData}
          />
        )}

        {selectedConfig?.id === "item" && (
          <ItemModal
            open={open}
            onClose={() => {
              setOpen(false);
              setEditRow(null);
            }}
            editData={editRow}
            onSuccess={GetData}
          />
        )}

        {deleteTarget && selectedConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white p-4 sm:p-5 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-800">
                Delete {selectedConfig.label}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {selectedConfig.displayName(deleteTarget)}
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
                    await Delete_Item(deleteTarget);
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

export default ListTable;

