import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FiEye } from "react-icons/fi";
import { FiPlus,FiMinus } from "react-icons/fi";
import PaymentModal from "./PaymentModal";
import ExpensesModal from "./ExpensesModal";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";
import Select from "react-select";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DeleteOtpModal from "./DeleteOtpModal";


const Payment = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [viewData, setViewData] = useState(null);
   const [viewData2, setViewData2] = useState(null);
  const [amtdeteil, setAmtdetil] = useState(null);
   const [amtdeteil2, setAmtdetil2] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
   const [viewOpen2, setViewOpen2] = useState(false);
  const [items, setItems] = useState([]);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterPartyName, setFilterPartyName] = useState("");
  const [filterDue, setFilterDue] = useState(null);
  const [partyOptions, setPartyOptions] = useState([]);


  const [otpOpen, setOtpOpen] = useState(false);
const [deleteAction, setDeleteAction] = useState(null);
const mobileNo = JSON.parse(sessionStorage.getItem("UserData"))?.MobileNo;



  useEffect(() => {
    GetData_Payment();
    GetPartyDropdown();
  }, []);
console.log(viewData,'viewData')
  const GetPartyDropdown = async () => {
    try {
      const res = await PostWithToken("Party/GetData_Party", { IsActive: "1" });
      if (res) {
        const options = res.map((party) => ({
          value: party.PartyID,
          label: party.Name || `Party ${party.PartyID}`,
        }));
        setPartyOptions(options);
        console.log("Party options:", options);
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
      Due: filterDue?.value === "No" ? "0" : "1" || "",
    };
    try {
      const res = await PostWithToken("Payment/GetData_Payment", val);
      if (res) {
        // console.log(res, 'res')
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

  const GetSingleData_PartyPayment = async (PartyID) => {
    try {
      const val = { PartyID: PartyID };
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
  

  const GetSingleData_PartyPayment2 = async (PartyID) => {
    try {
      const val = { PartyID: PartyID };
      const res = await PostWithToken("ExpensePayment/GetSingalData_PartyExpensePayment", val);
      console.log("GetSingleData_PartyPayment2 res:", res);
      if (res) {
        setViewData2(res);
        setViewOpen2(true);
      } else {
        toastifySuccess("No payment data found for this party");
      }
    } catch (error) {
      console.error("GetSingleData_PartyPayment error:", error);
    }
  };




  const onViewItem = (row) => {

    const partyID = row.PartyID;
    if (partyID) {
      GetSingleData_PartyPayment(partyID);
    } else {
      toastifySuccess("Party ID not found");
    }
  };


   const onViewItem2 = (row) => {

    const partyID = row.PartyID;
    if (partyID) {
      GetSingleData_PartyPayment2(partyID);
    } else {
      toastifySuccess("Party ID not found");
    }
  };

  const onAddPayment = (row) => {
    console.log("Add Payment for row:", row);

    const today = new Date().toISOString().split("T")[0];
    setEditRow({
      PartyID: row.PartyID || "",
      ReamaningAmt: row.RemainingAmt || "",
      expensesamount: row.TotalExpensePayment || 0,
      Paymenttype: "",
      Amt: "",
      ByPayment: "",
      PaymentDtTm: today,
    });
    setEditItemId(null);
    setOpen(true);
  };

   const onExpeses = (row) => {
    console.log("Add Expenses for row:", row);

    const today = new Date().toISOString().split("T")[0];
    setEditRow({
      PartyID: row.PartyID || "",
      ReamaningAmt: row.RemainingAmt || "",
      expensesamount: row.TotalExpensePayment || 0,
      Paymenttype: "",
      Amt: "",
      ByPayment: "",
      PaymentDtTm: today,
    });
    setEditItemId(null);
    setOpen2(true);
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
        name: <span className="font-semibold">Party Name</span>,
        selector: (row) => row.Name || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.Name || "-"}</div>,
      },
      {
        name: <span className="font-semibold">Amount</span>,
        selector: (row) => row.FinalAmt || "-",
        sortable: true,
        cell: (row) => (
          <div className="font-medium text-slate-800">
            ₹{row.FinalAmt}
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
        name: <span className="font-semibold">TotalPaid Amount</span>,
        selector: (row) => row.TotalPaid || "-",
        sortable: true,
        cell: (row) => (
          <div className="font-medium text-slate-800">
            ₹{row.TotalPaid}
          </div>
        ),

      },
      {
        name: <span className="font-semibold">Total Expense Payment</span>,
        selector: (row) => row.TotalExpensePayment || "-",
        sortable: true,
        cell: (row) => (
          <div className="font-medium text-slate-800">
            ₹{row.TotalExpensePayment}
          </div>
        ),

      },
      {
        name: <span className="font-semibold">Owner Name</span>,
        selector: (row) => row.OwnerName || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.OwnerName || "-"}</div>,
      },
      {
        name: <span className="font-semibold">Area</span>,
        selector: (row) => row.Area || "-",
        sortable: true,
        cell: (row) => <div className="font-medium text-slate-800">{row.Area || "-"}</div>,
      },
      {
        name: <span className="font-semibold">ME Office</span>,
        selector: (row) => row.MEOffice || "-",
        sortable: true,
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
              onClick={() => { onViewItem(r); setAmtdetil(r); }}
              type="button"
              title="View"
            >
              <FiEye className="text-base" />
            </button>

  <button
              className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
              onClick={() => onExpeses(r)}
              type="button"
              title="Add Expenses"
            >
              <FiMinus className="text-base" />
            </button>


              <button
              className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
              onClick={() => { onViewItem2(r); setAmtdetil2(r); }}
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


  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalAmount += Number(item.FinalAmt || 0);
        acc.totalRemaining += Number(item.RemainingAmt || 0);
        acc.totalPaid += Number(item.TotalPaid || 0);
        return acc;
      },
      { totalAmount: 0, totalRemaining: 0, totalPaid: 0 }
    );
  }, [items]);


  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(items);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(data, "Payment_Report.xlsx");
  };

  const SingleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(viewData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(data, "Payment_Report.xlsx");
  };

 const SingleExportToExcel2 = () => {
    const worksheet = XLSX.utils.json_to_sheet(viewData2);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(data, "Expenses_Report.xlsx");
  };



const DeletePaymentById = async (paymentId) => {
  console.log("Deleting payment with ID:", paymentId);
  try {
    // const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    // if (!confirmDelete) return;

    const res = await PostWithToken("ExpensePayment/Delete_ExpensePayment", {
      ExpensePaymentID: paymentId,
    });

    if (res) {
      toastifySuccess("Record deleted successfully");
      setViewOpen2(false);

      // UI se row remove
      // setViewData((prev) =>
      //   prev.filter((item) => item.ExpensePaymentID !== ExpensePaymentID)
      // );
    }
  } catch (error) {
    console.error("Delete error:", error);
  }
};

const DeletePaymentById2 = async (paymentId) => {
  
  console.log("Deleting payment with ID:", paymentId);
  try {
    // const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    // if (!confirmDelete) return;

    const res = await PostWithToken("Payment/Delete_Payment", {
      PaymentID: paymentId,
    });

    if (res) {
      toastifySuccess("Record deleted successfully");
      setViewOpen(false);

      // UI se row remove
      // setViewData((prev) =>
      //   prev.filter((item) => item.ExpensePaymentID !== ExpensePaymentID)
      // );
    }
  } catch (error) {
    console.error("Delete error:", error);
  }
};

const askDeleteWithOtp = (cb) => {
  if(viewOpen){
    setViewOpen(false);
  }
  if(viewOpen2){
    setViewOpen2(false);
  }
  setDeleteAction(() => cb);
  setOtpOpen(true);
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
                autoComplete="off-district"

              />

              <input
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                placeholder="From Date"
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoComplete="off-district"

              />

              <input
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                placeholder="To Date"
                className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoComplete="off-district"

              />

              <Select
                value={filterDue}
                onChange={setFilterDue}
                options={dueOptions}
                placeholder="Filter by Due..."
                isClearable
                styles={selectStyles}
              />

              <div>
                <button
                  onClick={exportToExcel}
                  className="mb-3 rounded-md bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">

            <div className="rounded-md border border-slate-300 p-3">
              <p className="text-xs text-slate-700 font-medium">Total Amount</p>
              <p className="text-lg font-semibold text-slate-800">
                ₹{totals.totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="rounded-md border border-slate-300 p-3">
              <p className="text-xs text-slate-700 font-medium">Total Remaining</p>
              <p className="text-lg font-semibold text-slate-800">
                ₹{totals.totalRemaining.toFixed(2)}
              </p>
            </div>

            <div className="rounded-md border border-slate-300 p-3">
              <p className="text-xs text-slate-700 font-medium">Total Paid</p>
              <p className="text-lg font-semibold text-slate-800">
                ₹{totals.totalPaid.toFixed(2)}
              </p>
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

        <PaymentModal
          open={open}
          onClose={() => {
            setOpen(false);
            setEditRow(null);
          }}
          editData={editRow}
          onSuccess={GetData_Payment}
        />


 <ExpensesModal
          open={open2}
          onClose={() => {
            setOpen2(false);
            setEditRow(null);
          }}
          editData={editRow}
          onSuccess={GetData_Payment}
        />

        <DeleteOtpModal
  open={otpOpen}
  mobileNo={mobileNo}
  onVerify={deleteAction}
  onClose={() => setOtpOpen(false)}
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
                    <h2 className="text-xl font-semibold text-slate-800 flex flex-wrap gap-2">
                      {amtdeteil && (
                        <>
                          <span className="text-slate-500 font-medium">
                            Party Name:
                          </span>
                          <span className="text-slate-700 font-bold">
                            {amtdeteil.Name}
                          </span>

                          <span className="text-slate-400 mx-1">|</span>

                          <span className="text-slate-500 font-medium">
                            Owner Name:
                          </span>
                          <span className="text-slate-700 font-bold">
                            {amtdeteil.OwnerName}
                          </span>
                        </>
                      )}
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

 
<td className="px-4 py-3 text-center">
   <button
  onClick={() =>
    askDeleteWithOtp(() => DeletePaymentById2(item.PaymentID))
  }
>
  Delete
</button>

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

                  <div className="mt-6 gap-3 flex justify-end">
                    <button
                      onClick={SingleExportToExcel}
                      className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    // className="mb-3 rounded-md bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Export Excel
                    </button>
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




 {viewOpen2 && viewData2 && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setViewOpen2(false)} />
            <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
              <div className="w-full max-w-6xl rounded-lg bg-white shadow-xl my-4 max-h-[85vh] overflow-y-auto">

                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Expenses Details
                    </h2>
                    <h2 className="text-xl font-semibold text-slate-800 flex flex-wrap gap-2">
                      {amtdeteil2 && (
                        <>
                          <span className="text-slate-500 font-medium">
                            Party Name:
                          </span>
                          <span className="text-slate-700 font-bold">
                            {amtdeteil2.Name}
                          </span>

                          <span className="text-slate-400 mx-1">|</span>

                          <span className="text-slate-500 font-medium">
                            Owner Name:
                          </span>
                          <span className="text-slate-700 font-bold">
                            {amtdeteil2.OwnerName}
                          </span>
                        </>
                      )}
                    </h2>


                    <button
                      onClick={() => setViewOpen2(false)}
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
                  {Array.isArray(viewData2) && viewData2.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full border-collapse bg-white">
                        <thead>
                          <tr className="bg-blue-600">

                            <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                              Amount
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
                          {viewData2.map((item, index) => (
                            <tr key={item.PaymentID || index} className="hover:bg-blue-50 transition-colors">

                              <td className="px-4 py-3 text-sm font-semibold text-red-700 border-r border-slate-200">
                                ₹{item.Amt ? parseFloat(item.Amt).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
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


<td className="px-4 py-3 text-center">
   <button
  onClick={() =>
    askDeleteWithOtp(() => DeletePaymentById(item.ExpensePaymentID))
  }
>
  Delete
</button>

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

                  <div className="mt-6 gap-3 flex justify-end">
                    <button
                      onClick={SingleExportToExcel2}
                      className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    // className="mb-3 rounded-md bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Export Excel
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewOpen2(false)}
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

export default Payment;

