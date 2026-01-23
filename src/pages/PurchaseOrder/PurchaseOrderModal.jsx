import React, { useEffect, useState, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FiTrash2, FiX } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import Select from "react-select";
import { PostWithToken, Comman_changeArrayFormat } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const PurchaseOrderModal = ({ open, onClose, editData, onSuccess }) => {
  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [value, setvalue] = useState({
    Status: "",
    TotalAmount: "",
    OrderDate: "",
    PartyID: "",
    SupplierID: "",
    PONumber: "",
    PurchaseOrderID: "",
  });

  const [summary, setSummary] = useState({
    SubTotal: 0, Discount: 0, SGSTPercent: "9", SGSTAmount: 0, CGSTPercent: "9", CGSTAmount: 0, IGSTPercent: 0, IGSTAmount: 0, GrandTotal: 0, RoundOff: 0, PaymentReceived: 0, DueAmount: 0,
  });

  const [partyOptions, setPartyOptions] = useState([]);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [localEdit, setLocalEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [tableError, setTableError] = useState("");

  const [ItemData, setItemData] = useState([]);

  const [itemForm, setItemForm] = useState({
    ItemID: "",
    Amount: "",
    Quantity: "",
    Rate: "",
  });

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      const today = new Date().toISOString().split("T")[0];
      setvalue({
        Status: "",
        TotalAmount: "",
        OrderDate: today,
        PartyID: "",
        SupplierID: "",
        PONumber: "",
        PurchaseOrderID: "",
      });
      setRows([]);
      setItemForm({
        ItemID: "",
        Amount: "",
        Quantity: "",
        Rate: "",
      });
      setLocalEdit(null);
      setErrors({});
      setItemErrors({});
      setTableError("");
      setSummary({
        SubTotal: 0, Discount: 0, SGSTPercent: "9", SGSTAmount: 0, CGSTPercent: "9", CGSTAmount: 0, IGSTPercent: 0, IGSTAmount: 0, GrandTotal: 0, RoundOff: 0, PaymentReceived: 0, DueAmount: 0,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    GetSupplierDropdown();

    if (!editData) {
      const today = new Date().toISOString().split("T")[0];
      setvalue((prev) => ({
        ...prev,
        OrderDate: today,
      }));
    }
  }, [open, editData]);

  const handleSummaryChange = (key) => (e) => {
    let v = e.target.value;
    v = v.replace(/[^\d.]/g, "");
    setSummary((p) => ({ ...p, [key]: parseFloat(v) || 0 }));
  };

  const GetSupplierDropdown = async () => {
    try {
      const res = await PostWithToken("Supply/GetDropDown_Supply", { IsActive: "1" });
      if (res) {
        setSupplierOptions(Comman_changeArrayFormat(res, "SupplyId", "FullName"));
        setPartyOptions(Comman_changeArrayFormat(res, "SupplyId", "FullName"));
      }
    } catch (error) {
      console.error("GetSupplierDropdown error:", error);
    }
  };

  useEffect(() => {
    if (!value.SupplierID) {
      setItemOptions([]);
      return;
    }
    if (ItemData && Array.isArray(ItemData) && ItemData.length > 0) {
      setItemOptions(Comman_changeArrayFormat(ItemData, "ItemID", "ItemName"));
    } else {
      setItemOptions([]);
    }
  }, [ItemData, value.SupplierID]);

  const GetSingleData_Supply = async (SupplyId) => {
    try {
      const val = {
        SupplyID: SupplyId,
      };
      const res = await PostWithToken("Supply/GetSingleData_Supply", val);
      if (res) {
        setItemData(res?.Table1);
      }
    } catch (error) {
      console.error("Error fetching supplier data:", error);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (editData) {
      const data = editData || {};
      let orderDate = "";
      if (data.OrderDate) {
        const date = new Date(data.OrderDate);
        if (!isNaN(date.getTime())) {
          orderDate = date.toISOString().split('T')[0];
        }
      }

      setvalue({
        Status: data.Status || "",
        TotalAmount: data.TotalAmount || "",
        OrderDate: orderDate,
        PartyID: data.PartyID || "",
        SupplierID: data.SupplierID || "",
        PONumber: data.PONumber || "",
        PurchaseOrderID: data.PurchaseOrderID || "",
      });

      if (data.PurchaseOrderDetailList && Array.isArray(data.PurchaseOrderDetailList)) {
        const formattedRows = data.PurchaseOrderDetailList.map((item, index) => ({
          id: String(item.ID || index + 1),
          ItemID: item.ItemID || "",
          Amount: item.Amount || "",
          Quantity: item.Quantity || "",
          Rate: item.Rate || "",
        }));
        setRows(formattedRows);
      } else {
        setRows([]);
      }
      setErrors({});
    } else {
      const today = new Date().toISOString().split("T")[0];
      setvalue((prev) => ({
        ...prev,
        OrderDate: prev.OrderDate || today,
      }));
      setErrors({});
    }
  }, [editData, open, partyOptions, supplierOptions]);

  const calculatedSummary = useMemo(() => {
    const subtotal = rows.reduce((sum, row) => {
      return sum + (parseFloat(row.Amount) || 0);
    }, 0);

    const discount = summary.Discount || 0;
    const afterDiscount = subtotal - discount;

    const sgstPercent = parseFloat(summary.SGSTPercent) || 9;
    const cgstPercent = parseFloat(summary.CGSTPercent) || 0;
    const igstPercent = parseFloat(summary.IGSTPercent) || 0;

    const sgstAmount = (afterDiscount * sgstPercent) / 100;
    const cgstAmount = (afterDiscount * cgstPercent) / 100;
    const igstAmount = (afterDiscount * igstPercent) / 100;

    const grandTotal = afterDiscount + sgstAmount + cgstAmount + igstAmount;
    const roundOff = Math.round(grandTotal);
    const paymentReceived = summary.PaymentReceived || 0;
    const dueAmount = roundOff - paymentReceived;

    return {
      SubTotal: subtotal,
      SGSTAmount: sgstAmount,
      CGSTAmount: cgstAmount,
      IGSTAmount: igstAmount,
      GrandTotal: grandTotal,
      RoundOff: roundOff,
      DueAmount: dueAmount,
    };
  }, [rows, summary.Discount, summary.SGSTPercent, summary.CGSTPercent, summary.IGSTPercent, summary.PaymentReceived]);

  useEffect(() => {
    setSummary((prev) => ({
      ...prev,
      ...calculatedSummary,
    }));
  }, [calculatedSummary]);


  useEffect(() => {
    if (!open) return;
    if (value.SupplierID) {
      GetSingleData_Supply(value.SupplierID);
    } else {
      setItemData([]);
      setItemOptions([]);
    }
  }, [value.SupplierID, open]);

  const handleChange = (key) => (e) => {
    let v = e.target.value;
    setvalue((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleItemChange = (key) => (e) => {
    let v = e.target.value;
    if (key === "Rate" || key === "Quantity") {
      v = v.replace(/[^\d.]/g, "");
      setItemForm((p) => {
        const updated = { ...p, [key]: v };
        if (key === "Rate" || key === "Quantity") {
          const rate = parseFloat(updated.Rate) || 0;
          const qty = parseFloat(updated.Quantity) || 0;
          updated.Amount = (rate * qty).toFixed(2);
        }
        return updated;
      });
    } else {
      setItemForm((p) => ({ ...p, [key]: v }));
    }
  };

  const handleAddOrUpdateItem = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!itemForm.ItemID) newErrors.ItemID = "Item is required";
    if (!itemForm.Quantity) newErrors.Quantity = "Quantity is required";
    if (!itemForm.Rate) newErrors.Rate = "Rate is required";
    if (parseFloat(itemForm.Rate) <= 0) newErrors.Rate = "Rate must be greater than 0";
    if (parseFloat(itemForm.Quantity) <= 0) newErrors.Quantity = "Quantity must be greater than 0";

    setItemErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const id = localEdit?.id ?? String(Date.now());
    const selectedItem = itemOptions.find((opt) => String(opt.value) === String(itemForm.ItemID));
    const payload = {
      id,
      ItemID: itemForm.ItemID,
      Amount: itemForm.Amount || (parseFloat(itemForm.Rate) * parseFloat(itemForm.Quantity)).toFixed(2),
      Quantity: itemForm.Quantity,
      Rate: itemForm.Rate,
    };

    setRows((prev) => {
      const exists = prev.some((r) => r.id === id);
      if (exists) return prev.map((r) => (r.id === id ? payload : r));
      return [payload, ...prev];
    });

    setLocalEdit(null);
    setItemForm({
      ItemID: "",
      Amount: "",
      Quantity: "",
      Rate: "",
    });
    setItemErrors({});
  };

  const handleEditItem = useCallback((row) => {
    setLocalEdit(row);
    setItemForm({
      ItemID: row.ItemID || "",
      Amount: row.Amount || "",
      Quantity: row.Quantity || "",
      Rate: row.Rate || "",
    });
  }, []);

  const handleDeleteItem = useCallback((row) => {
    setRows((prev) => prev.filter((item) => item?.id !== row?.id));
    if (localEdit?.id === row.id) {
      setLocalEdit(null);
      setItemForm({
        ItemID: "",
        Amount: "",
        Quantity: "",
        Rate: "",
      });
    }
  }, [localEdit]);

  const handleClearItem = () => {
    setLocalEdit(null);
    setItemForm({
      ItemID: "",
      Amount: "",
      Quantity: "",
      Rate: "",
    });
    setItemErrors({});
  };

  const validateAndSubmit = () => {
    const newErrors = {};




    if (!value.OrderDate?.trim()) {
      newErrors.OrderDate = "Order Date is required";
    }




    if (!value.SupplierID) {
      newErrors.SupplierID = "Supplier is required";
    }




    if (!rows || rows.length === 0) {
      setTableError("Please add at least one item");
      return;
    }

    setTableError("");
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      InsertPurchaseOrder();
    }
  };

  const InsertPurchaseOrder = async () => {
    try {
      const payload = {
        Status: value.Status,
        TotalAmount: calculatedSummary.RoundOff || calculatedSummary.GrandTotal || 0,
        OrderDate: value.OrderDate || "",
        PartyID: value.PartyID,
        SupplierID: value.SupplierID,
        PONumber: "Auto Generated",
        PurchaseOrderID: value.PurchaseOrderID || "",
        SubTotal: calculatedSummary.SubTotal || 0,
        Discount: summary.Discount || 0,
        SGSTPercent: summary.SGSTPercent || "9",
        SGSTAmount: calculatedSummary.SGSTAmount || 0,
        CGSTPercent: summary.CGSTPercent || "9",
        CGSTAmount: calculatedSummary.CGSTAmount || 0,
        IGSTPercent: summary.IGSTPercent || 0,
        IGSTAmount: calculatedSummary.IGSTAmount || 0,
        GrandTotal: calculatedSummary.RoundOff || calculatedSummary.GrandTotal || 0,
        RoundOff: calculatedSummary.RoundOff || 0,
        PaymentReceived: summary.PaymentReceived || 0,
        DueAmount: calculatedSummary.DueAmount || 0,
        PurchaseOrderDetailList: rows.map((r) => ({
          ItemID: r.ItemID || "",
          Amount: r.Amount || "",
          Quantity: r.Quantity || "",
          Rate: r.Rate || "",
        })),
      };

      const res = await PostWithToken("PurchaseOrder/InsertPurchaseOrder", payload);
      if (res) {
        toastifySuccess(value.PurchaseOrderID ? "Purchase Order updated successfully" : "Purchase Order inserted successfully");
        setvalue({
          Status: "",
          TotalAmount: "",
          OrderDate: "",
          PartyID: "",
          SupplierID: "",
          PONumber: "",
          PurchaseOrderID: "",
        });
        setRows([]);
        setItemForm({
          ItemID: "",
          Amount: "",
          Quantity: "",
          Rate: "",
        });
        setSummary({
          SubTotal: 0, Discount: 0, SGSTPercent: "9", SGSTAmount: 0, CGSTPercent: "9", CGSTAmount: 0, IGSTPercent: 0, IGSTAmount: 0, GrandTotal: 0, RoundOff: 0, PaymentReceived: 0, DueAmount: 0,
        });
        onClose?.();
        onSuccess?.();
      }
    } catch (error) {
      console.error("InsertPurchaseOrder error:", error);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Item",
        selector: (r) => {
          const item = itemOptions.find((opt) => String(opt.value) === String(r?.ItemID));
          return item?.label || "-";
        },
        sortable: true,
      },
      {
        name: "Quantity",
        selector: (r) => r?.Quantity || "",
        sortable: true,
      },
      {
        name: "Rate",
        selector: (r) => r?.Rate || "",
        sortable: true,
        cell: (row) => (
          <div>₹{parseFloat(row.Rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        ),
      },
      {
        name: "Amount",
        selector: (r) => r?.Amount || "",
        sortable: true,
        cell: (row) => (
          <div className="font-semibold">₹{parseFloat(row.Amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        ),
      },
      {
        name: "Action",
        width: "120px",
        cell: (row) =>
          row?.id ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleEditItem(row)}
                className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
                title="Edit"
              >
                <FaRegEdit className="text-base" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(row)}
                className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
                title="Delete"
              >
                <FiTrash2 />
              </button>
            </div>
          ) : null,
      },
    ],
    [handleEditItem, handleDeleteItem, itemOptions]
  );

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      width: "100%",
      borderRadius: 6,
      borderColor: state.isFocused ? "#2563eb" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
      minHeight: 42,
      paddingLeft: 6,
      paddingRight: 6,
      fontSize: 14,
      transition: "all 150ms",
      "&:hover": { borderColor: state.isFocused ? "#2563eb" : "#e2e8f0" },
    }),
    valueContainer: (base) => ({ ...base, padding: "2px 6px" }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    placeholder: (base) => ({ ...base, color: "#94a3b8" }),
  };


  if (!open) return null;

  const selectedParty = supplierOptions.find((opt) => String(opt.value) === String(value.PartyID));
  const selectedItem = itemOptions.find((opt) => String(opt.value) === String(itemForm.ItemID));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-7xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 my-2 sm:my-4 max-h-[98vh] sm:max-h-[95vh] overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editData ? "Update Purchase Order" : "Add Purchase Order"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
                title="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 lg:flex-[2] space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-slate-600">
                          PO Number
                        </label>
                        <input
                          type="text"
                          value={value.PONumber}
                          onChange={handleChange("PONumber")}

                          className={inputCls}
                          placeholder="Auto Generated"
                          readOnly
                        />

                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-slate-600">
                          Supplier Name /Firm Name <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={selectedParty || null}
                          onChange={(opt) => {
                            const supplyId = opt?.value || "";
                            setvalue((p) => ({
                              ...p,
                              PartyID: supplyId,
                              SupplierID: supplyId
                            }));
                            if (errors.PartyID) {
                              setErrors((prev) => ({ ...prev, PartyID: "" }));
                            }
                            if (errors.SupplierID) {
                              setErrors((prev) => ({ ...prev, SupplierID: "" }));
                            }
                          }}
                          options={partyOptions}
                          placeholder="Select party..."
                          styles={selectStyles}
                          isClearable
                        />
                        {errors.PartyID && (
                          <p className="mt-1 text-xs text-red-500 min-h-[14px]">{errors.PartyID}</p>
                        )}
                      </div>





                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-slate-600">
                          Order Date
                        </label>
                        <input
                          type="date"
                          value={value.OrderDate}
                          onChange={handleChange("OrderDate")}
                          className={inputCls}
                        />
                        {errors.OrderDate && (
                          <p className="mt-1 text-xs text-red-500 min-h-[14px]">{errors.OrderDate}</p>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-slate-600">
                          Total Amount
                        </label>
                        <input
                          type="text"
                          value={calculatedSummary.RoundOff || calculatedSummary.GrandTotal || 0}
                          readOnly
                          placeholder="Auto calculated"
                          className={inputCls + " bg-slate-50"}
                        />
                      </div>
                    </div>

                  </div>


                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Item Entry</h3>
                  <form onSubmit={handleAddOrUpdateItem} className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-slate-600">
                          Item <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={selectedItem || null}
                          onChange={(opt) => {
                            let rate = "";
                            if (opt?.value && ItemData && Array.isArray(ItemData)) {
                              const selectedItemData = ItemData.find(
                                (item) => String(item.ItemID) === String(opt.value)
                              );
                              rate = selectedItemData?.Rate || "";
                            }
                            setItemForm((p) => ({
                              ...p,
                              ItemID: opt?.value || "",
                              Rate: rate
                            }));
                            if (itemErrors.ItemID) {
                              setItemErrors((prev) => ({ ...prev, ItemID: "" }));
                            }
                            if (itemErrors.Rate) {
                              setItemErrors((prev) => ({ ...prev, Rate: "" }));
                            }
                            if (rate && itemForm.Quantity) {
                              const amount = (parseFloat(rate) * parseFloat(itemForm.Quantity)).toFixed(2);
                              setItemForm((p) => ({ ...p, Amount: amount }));
                            }
                          }}
                          options={itemOptions}
                          placeholder="Select item..."
                          styles={selectStyles}
                          isClearable
                        />
                        {itemErrors.ItemID && (
                          <p className="mt-1 text-xs text-red-500 min-h-[14px]">{itemErrors.ItemID}</p>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-slate-600">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={itemForm.Quantity}
                          onChange={handleItemChange("Quantity")}
                          placeholder="Enter quantity"
                          className={inputCls}
                        />
                        {itemErrors.Quantity && (
                          <p className="mt-1 text-xs text-red-500 min-h-[14px]">{itemErrors.Quantity}</p>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-slate-600">
                          Rate <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={itemForm.Rate}
                          onChange={handleItemChange("Rate")}
                          placeholder="Auto-filled from item"
                          className={inputCls}
                          readOnly
                          disabled
                        />
                        {itemErrors.Rate && (
                          <p className="mt-1 text-xs text-red-500 min-h-[14px]">{itemErrors.Rate}</p>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-slate-600">Amount</label>
                        <input
                          type="text"
                          value={itemForm.Amount}
                          readOnly
                          placeholder="Auto calculated"
                          className={inputCls + " bg-slate-50"}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={handleAddOrUpdateItem}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        {localEdit ? "Update Item" : "Add Item"}
                      </button>
                    </div>

                    {tableError && (
                      <p className="mb-2 text-sm text-red-600 font-medium">{tableError}</p>
                    )}
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <DataTable
                    columns={columns}
                    data={rows}
                    pagination={rows?.length > 0}
                    highlightOnHover={rows?.length > 0}
                    striped
                    fixedHeader
                    fixedHeaderScrollHeight="300px"
                    responsive
                    customStyles={{
                      headRow: { style: { backgroundColor: "#2563eb", minHeight: "44px" } },
                      headCells: {
                        style: {
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          fontSize: "12px",
                          letterSpacing: "0.06em",
                          borderBottom: "0",
                        },
                      },
                      rows: { style: { minHeight: "52px" } },
                      cells: { style: { padding: "12px" } },
                    }}
                    noDataComponent={<div className="p-4 text-center text-slate-500">No items added</div>}
                    onRowClicked={(row) => handleEditItem(row)}
                  />
                </div>
              </div>

              <div className="w-full lg:w-80 xl:w-96 lg:flex-shrink-0 bg-slate-800 rounded-lg p-3 sm:p-4 text-white h-fit lg:sticky lg:top-4">
                <h3 className="text-lg font-semibold mb-4">Summary of Charges</h3>
                <div className="space-y-4">

                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Total</label>
                    <input
                      type="text"
                      value={calculatedSummary.SubTotal.toFixed(2)}
                      readOnly
                      className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                    />
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <label className="text-sm font-medium">SGST @</label>
                    <div className="flex gap-1 items-center">
                      <input
                        type="text"
                        value={summary.SGSTPercent}
                        onChange={handleSummaryChange("SGSTPercent")}
                        readOnly
                        className="w-12 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                      />
                      <span className="text-sm">%</span>
                      <input
                        type="text"
                        value={calculatedSummary.SGSTAmount.toFixed(2)}
                        readOnly
                        className="w-20 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <label className="text-sm font-medium">CGST @</label>
                    <div className="flex gap-1 items-center">
                      <input
                        type="text"
                        value={summary.CGSTPercent}
                        readOnly
                        onChange={handleSummaryChange("CGSTPercent")}
                        className="w-12 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                      />
                      <span className="text-sm">%</span>
                      <input
                        type="text"
                        value={calculatedSummary.CGSTAmount.toFixed(2)}
                        readOnly
                        className="w-20 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-600 pt-2">
                    <label className="text-sm font-semibold">Grand Total</label>
                    <input
                      type="text"
                      value={calculatedSummary.GrandTotal.toFixed(2)}
                      readOnly
                      className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm font-semibold text-white text-right"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Round off</label>
                    <input
                      type="text"
                      value={calculatedSummary.RoundOff}
                      readOnly
                      className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Advance Payment</label>
                    <input
                      type="text"
                      value={summary.PaymentReceived}
                      onChange={handleSummaryChange("PaymentReceived")}
                      className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                    />
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-600 pt-2">
                    <label className="text-sm font-semibold">Due Amount</label>
                    <input
                      type="text"
                      value={calculatedSummary.DueAmount}
                      readOnly
                      className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm font-semibold text-white text-right"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                type="button"
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={validateAndSubmit}
              >

                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;

