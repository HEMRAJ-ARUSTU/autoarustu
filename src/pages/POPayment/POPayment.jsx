import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FiEye } from "react-icons/fi";
import { FiPlus } from "react-icons/fi";
import POPaymentModal from "./POPaymentModal";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";
import Select from "react-select";

const POPayment = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterPartyName, setFilterPartyName] = useState("");
  const [filterDue, setFilterDue] = useState(null);
  const [partyOptions, setPartyOptions] = useState([]);

  useEffect(() => {
    GetData_Payment();
    GetPartyDropdown();
  }, []);

  const GetPartyDropdown = async () => {
    try {
      const res = await PostWithToken("Party/GetData_Party", { IsActive: "1" });
      if (res) {
        const options = res.map((party) => ({
          value: party.PartyID,
          label: party.Name || `Party ${party.PartyID}`,
        }));
        setPartyOptions(options);
      }
    } catch (error) {
      console.error("GetPartyDropdown error:", error);
    }
  };

  const GetData_Payment = async () => {
    const val = {
      FromDtTm: filterFromDate || "",
      ToDtTm: filterToDate || "",
      PartyName: filterPartyName || "",
      Due: filterDue?.value || "",
      GetPaymentType: "POPayment"
    };
    try {
      const res = await PostWithToken("Payment/GetData_Payment", val);
      if (res) {
        setItems(res);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    GetData_Payment();
  }, [filterFromDate, filterToDate, filterPartyName, filterDue]);

  const GetSingleData_PartyPayment = async (PurchaseOrderID) => {
    try {
      const val = { PurchaseOrderID: PurchaseOrderID };
      const res = await PostWithToken("Payment/GetSingalData_PartyPayment", val);
      if (res) {
        setViewData(res);
        setViewOpen(true);
      } else {
        toastifySuccess("No payment data found for this party");
      }
    } catch (error) {
      console.error("GetSingleData_PartyPayment error:", error);
    }
  };

  const onViewItem = (row) => {

    const PurchaseOrderID = row.PurchaseOrderID;
    if (PurchaseOrderID) {
      GetSingleData_PartyPayment(PurchaseOrderID);
    } else {
      toastifySuccess("Party ID not found");
    }
  };

  const onAddPayment = (row) => {
    const today = new Date().toISOString().split("T")[0];
    setEditRow(row)
    setEditItemId(null);
    setOpen(true);
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => {
      const hay = `${r.PartyName || ""} ${r.Paymenttype || ""} ${r.Amt || ""} ${r.ByPayment || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  const dueOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#cbd5e1",
      minHeight: "42px",
      "&:hover": { borderColor: "#2563eb" },
    }),
  };

  const columns = useMemo(
    () => [
      {
        name: <span className="font-semibold">Supplier Name</span>,
        selector: (row) => row.Suppliername || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.Suppliername || "-"}</div>,
      },
      {
        name: <span className="font-semibold">Firm Name</span>,
        selector: (row) => row.FirmName || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.FirmName || "-"}</div>,
      },
      {
        name: <span className="font-semibold">Amount</span>,
        selector: (row) => row.TotalAmount || "-",
        sortable: true,
        cell: (row) => (
          <div className="font-semibold text-slate-800">
            ₹{row.TotalAmount}
          </div>
        ),
      },
      {
        name: <span className="font-semibold">Remaining Amount</span>,
        selector: (row) => row.RemainingAmt || "-",
        sortable: true,
        cell: (row) => (
          <div className="font-medium text-slate-800">
            ₹{row.RemainingAmt}
          </div>
        ),
      },
      {
        name: "Actions",
        cell: (r) => (
          <div className="flex gap-2">
            <button
              className="rounded-md bg-green-600 p-2 text-white hover:bg-green-700"
              onClick={() => onAddPayment(r)}
              type="button"
              title="Add Payment"
            >
              <FiPlus className="text-base" />
            </button>

            <button
              className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
              onClick={() => onViewItem(r)}
              type="button"
              title="View"
            >
              <FiEye className="text-base" />
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
          <div className="mb-4 space-y-3">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">

              <input
                value={filterPartyName}
                onChange={(e) => setFilterPartyName(e.target.value)}
                placeholder="Search by party name..."
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                placeholder="From Date"
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                placeholder="To Date"
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <Select
                value={filterDue}
                onChange={setFilterDue}
                options={dueOptions}
                placeholder="Filter by Due..."
                isClearable
                styles={selectStyles}
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

        <POPaymentModal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditRow(null);
          }}
          editData={editRow}
          onSuccess={GetData_Payment}
        />

        {viewOpen && viewData && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setViewOpen(false)} />
            <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
              <div className="w-full max-w-6xl rounded-lg bg-white shadow-xl my-4 max-h-[85vh] overflow-y-auto">

                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Payment Details
                    </h2>
                    <button
                      onClick={() => setViewOpen(false)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                      type="button"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {Array.isArray(viewData) && viewData.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full border-collapse bg-white">
                        <thead>
                          <tr className="bg-blue-600">

                            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                              Remaining Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                              Payment Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                              By Payment
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                              Payment Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                              Created Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {viewData.map((item, index) => (
                            <tr key={item.PaymentID || index} className="hover:bg-blue-50 transition-colors">

                              <td className="px-4 py-3 text-sm font-semibold text-green-700 border-r border-slate-200">
                                ₹{item.Amt ? parseFloat(item.Amt).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-orange-700 border-r border-slate-200">
                                ₹{item.ReamaningAmt ? parseFloat(item.ReamaningAmt).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-800 border-r border-slate-200">
                                {item.Paymenttype || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-800 border-r border-slate-200">
                                {item.ByPayment || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-800 border-r border-slate-200">
                                {item.PaymentDtTm ? new Date(item.PaymentDtTm).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",


                                }) : "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-800">
                                {item.CreatedDtTm || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg p-8 text-center bg-slate-50">
                      <p className="text-sm text-slate-500">No payment data available</p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setViewOpen(false)}
                      className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POPayment;

