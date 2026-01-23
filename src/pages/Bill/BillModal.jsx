import React, { useEffect, useState, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import { FiTrash2, FiX } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import Select from "react-select";
import { PostWithToken, Comman_changeArrayFormat } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const BillModal = ({ open, onClose, editData, onSuccess }) => {

  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [value, setvalue] = useState({
    PartyID: "", InvoicePrefix: "", InvoiceSuffix: "", UserName: "", GSTIN: "", MobileNo: "", Email: "", PaymentMode: "", BillDate: "", StateName: "", StateCode: "", Address: "", CompanyName: "",
  });

  const [partyOptions, setPartyOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [localEdit, setLocalEdit] = useState(null);
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [tableError, setTableError] = useState("");

  const [summary, setSummary] = useState({
    SubTotal: 0, Discount: 0, SGSTPercent: "9", SGSTAmount: 0, CGSTPercent: "9", CGSTAmount: 0, IGSTPercent: 0, IGSTAmount: 0, GrandTotal: 0, RoundOff: 0, PaymentReceived: 0, DueAmount: 0,
  });


  const [itemForm, setItemForm] = useState({
    ItemName: "", Unit: "Nos", Qty: "", Rate: "", TotalAmount: "",
  });

  const paymentModeOptions = [
    { value: "CASH", label: "CASH" },
    { value: "ONLINE", label: "ONLINE" },
  ];

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setvalue({
        PartyID: "", InvoicePrefix: "", InvoiceSuffix: "", UserName: "", GSTIN: "", MobileNo: "", Email: "", PaymentMode: "", BillDate: "", StateName: "",
        StateCode: "", Address: "", CompanyName: "",
      });
      setRows([]);
      setItemForm({
        ItemName: "", Unit: "Nos", Qty: "", Rate: "", TotalAmount: "",
      });
      setLocalEdit(null);
      setErrors({});
      setItemErrors({});
      setTableError("");
      setSummary({
        SubTotal: 0, Discount: 0, SGSTPercent: "9", SGSTAmount: 0, CGSTPercent: "9", CGSTAmount: 0, IGSTPercent: 0, IGSTAmount: 0, GrandTotal: 0, RoundOff: 0,
        PaymentReceived: 0, DueAmount: 0,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    GetPartyDropdown();
    GetItemDropdown();
  }, [open]);

  const GetPartyDropdown = async () => {
    try {
      const res = await PostWithToken("Party/GetData_Party", { IsActive: "1" });
      if (res) {
        setPartyOptions(Comman_changeArrayFormat(res, "PartyID", "Name"));
      }
    } catch (error) {
      console.error("GetPartyDropdown error:", error);
    }
  };

  const GetItemDropdown = async () => {
    try {
      const res = await PostWithToken("Item/GetDropDown_Item");
      if (res) {
        setItemOptions(Comman_changeArrayFormat(res, "ItemID", "Description"));
      }
    } catch (error) {
      console.error("GetItemDropdown error:", error);
    }
  };

 

  useEffect(() => {
    if (!open) return;

    if (editData) {
      const data = editData?.Table?.[0] || editData || {};
      const invoiceNo = data.ReceiptNo || data.InvoiceNo || "";
      let invoicePrefix = "";
      let invoiceSuffix = "";
      if (invoiceNo.includes("/")) {
        const parts = invoiceNo.split("/");
        invoicePrefix = parts[0] || "";
        invoiceSuffix = parts[1] || "";
      } else {
        invoicePrefix = invoiceNo;
      }
      let billDate = "";
      if (data.BillDate) {
        const date = new Date(data.BillDate);
        if (!isNaN(date.getTime())) {
          billDate = date.toISOString().split('T')[0];
        }
      } else if (data.PaymentDate) {
        const date = new Date(data.PaymentDate);
        if (!isNaN(date.getTime())) {
          billDate = date.toISOString().split('T')[0];
        }
      }

      setvalue({
        PartyID: data.PartyID || "",
        InvoicePrefix: invoicePrefix,
        InvoiceSuffix: invoiceSuffix,
        UserName: data.UserName || "",
        GSTIN: data.GSTIN || "",
        MobileNo: data.MobileNo || "",
        Email: data.Email || "",
        PaymentMode: data.PaymentMode || "",
        BillDate: billDate,
        StateName: data.StateName || "",
        StateCode: data.StateCode || "",
        Address: data.Address || "",
        CompanyName: data.CompanyName || "",
      });

      if (editData.Table1 || editData.BillDetailslist) {
        const billDetails = editData.Table1 || editData.BillDetailslist || [];
        const formattedRows = billDetails.map((item, index) => ({
          id: String(item.ID || index + 1),
          ID: item.ID || null,
          ItemName: item.ItemName || item.Particulars || "",
          Unit: item.Unit || "Nos",
          Qty: item.Qty || item.Item || "",
          Rate: item.Rate || "",
          TotalAmount: item.TotalAmount || item.Amount || "",
        }));
        setRows(formattedRows);
      }

      if (data.SubTotal !== undefined) {
        setSummary({
          SubTotal: parseFloat(data.SubTotal) || 0,
          Discount: parseFloat(data.Discount) || 0,
          SGSTPercent: parseFloat(data.SGSTPercent) || 9,
          SGSTAmount: parseFloat(data.SGSTAmount) || 0,
          CGSTPercent: parseFloat(data.CGSTPercent) || 0,
          CGSTAmount: parseFloat(data.CGSTAmount) || 0,
          IGSTPercent: parseFloat(data.IGSTPercent) || 0,
          IGSTAmount: parseFloat(data.IGSTAmount) || 0,
          GrandTotal: parseFloat(data.GrandTotal) || 0,
          RoundOff: parseFloat(data.RoundOff) || 0,
          PaymentReceived: parseFloat(data.PaymentReceived) || 0,
          DueAmount: parseFloat(data.DueAmount) || 0,
        });
      }
    } else {
      setvalue({
        PartyID: "",
        InvoicePrefix: "",
        InvoiceSuffix: "",
        UserName: "",
        GSTIN: "",
        MobileNo: "",
        Email: "",
        PaymentMode: "",
        BillDate: "",
        StateName: "",
        StateCode: "",
        Address: "",
        CompanyName: "",
      });
      setRows([]);
      setSummary({
        SubTotal: 0,
        Discount: 0,
        SGSTPercent: "9",
        SGSTAmount: 0,
        CGSTPercent: "9",
        CGSTAmount: 0,
        IGSTPercent: 0,
        IGSTAmount: 0,
        GrandTotal: 0,
        RoundOff: 0,
        PaymentReceived: 0,
        DueAmount: 0,
      });
    }
  }, [editData, open]);


  const calculatedSummary = useMemo(() => {
    const subtotal = rows.reduce((sum, row) => {
      return sum + (parseFloat(row.TotalAmount) || 0);
    }, 0);

    const discount = summary.Discount || 0;
    const afterDiscount = subtotal - discount;

    const sgstPercent = summary.SGSTPercent || 9;
    const cgstPercent = summary.CGSTPercent || 0;
    const igstPercent = summary.IGSTPercent || 0;

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

  const handleBillChange = (key) => (e) => {
    let v = e.target.value;

    if (key === "MobileNo") {
      v = v.replace(/\D/g, "").slice(0, 10);
    }
    else if (key === "GSTIN") {
      v = v.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15);
    }

    setvalue((prev) => ({ ...prev, [key]: v }));
  };


  const handleSummaryChange = (key) => (e) => {
    let v = e.target.value;
    v = v.replace(/[^\d.]/g, "");
    setSummary((p) => ({ ...p, [key]: parseFloat(v) || 0 }));
  };

  const handleItemChange = (key) => (e) => {
    let v = e.target.value;
    if (key === "Rate" || key === "Qty") {
      v = v.replace(/[^\d.]/g, "");
      setItemForm((p) => {
        const updated = { ...p, [key]: v };
        if (key === "Rate" || key === "Qty") {
          const rate = parseFloat(updated.Rate) || 0;
          const qty = parseFloat(updated.Qty) || 0;
          updated.TotalAmount = (rate * qty).toFixed(2);
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
    if (!itemForm.ItemName?.trim()) newErrors.ItemName = "Item Name is required";
    if (!itemForm.Unit?.trim()) newErrors.Unit = "Unit is required";
    if (!itemForm.Qty) newErrors.Qty = "Qty is required";
    if (!itemForm.Rate) newErrors.Rate = "Rate is required";
    if (parseFloat(itemForm.Rate) <= 0) newErrors.Rate = "Rate must be greater than 0";
    if (parseFloat(itemForm.Qty) <= 0) newErrors.Qty = "Qty must be greater than 0";

    setItemErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const id = localEdit?.id ?? String(Date.now());
    const payload = {
      id,
      ID: localEdit?.ID || null,
      ItemName: itemForm.ItemName.trim(),
      Unit: itemForm.Unit || "Nos",
      Qty: itemForm.Qty,
      Rate: itemForm.Rate,
      TotalAmount: itemForm.TotalAmount || (parseFloat(itemForm.Rate) * parseFloat(itemForm.Qty)).toFixed(2),
    };

    setRows((prev) => {
      const exists = prev.some((r) => r.id === id);
      if (exists) return prev.map((r) => (r.id === id ? payload : r));
      return [payload, ...prev];
    });

    setLocalEdit(null);
    setItemForm({
      ItemName: "",
      Unit: "Nos",
      Qty: "",
      Rate: "",
      TotalAmount: "",
    });
    setItemErrors({});
  };

  const handleEditItem = useCallback((row) => {
    setLocalEdit(row);
    setItemForm({
      ItemName: row.ItemName || "",
      Unit: row.Unit || "Nos",
      Qty: row.Qty || "",
      Rate: row.Rate || "",
      TotalAmount: row.TotalAmount || "",
    });
  }, []);

  const handleDeleteItem = useCallback((row) => {
    setRows((prev) => prev.filter((item) => item?.id !== row?.id));
    if (localEdit?.id === row.id) {
      setLocalEdit(null);
      setItemForm({
        ItemName: "",
        Unit: "Nos",
        Qty: "",
        Rate: "",
        TotalAmount: "",
      });
    }
  }, [localEdit]);

  const handleClearItem = () => {
    setLocalEdit(null);
    setItemForm({
      ItemName: "",
      Unit: "Nos",
      Qty: "",
      Rate: "",
      TotalAmount: "",
    });
    setItemErrors({});
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const mobileRegex = /^\d{10}$/;
  const gstRegex = /^[0-9A-Z]{15}$/;


  const validateAndSubmit = () => {
    const newErrors = {};

    if (!value.UserName?.trim()) {
      newErrors.UserName = "UserName is required";
    }

    if (!value.MobileNo?.trim()) {
      newErrors.MobileNo = "Mobile is required";
    } else if (!mobileRegex.test(value.MobileNo.trim())) {
      newErrors.MobileNo = "Mobile number must be 10 digits";
    }

    if (!value.BillDate?.trim()) {
      newErrors.BillDate = "Date is required";
    }

    if (!value.CompanyName?.trim()) {
      newErrors.CompanyName = "Company Name is required";
    }

    if (!value.Address?.trim()) {
      newErrors.Address = "Address is required";
    }

    if (!value.PaymentMode) {
      newErrors.PaymentMode = "Mode is required";
    }

    if (!value.GSTIN?.trim()) {
      newErrors.GSTIN = "GST is required";
    } else {
      const gstValue = value.GSTIN.trim().toUpperCase().replace(/[^0-9A-Z]/g, "");
      if (gstValue.length !== 15) {
        newErrors.GSTIN = "GST number must be 15 characters";
      } else if (!gstRegex.test(gstValue)) {
        newErrors.GSTIN = "Please enter a valid GST number";
      }
    }

    if (!value.Email?.trim()) {
      newErrors.Email = "Email is required";
    } else if (!emailRegex.test(value.Email.trim())) {
      newErrors.Email = "Please enter a valid email address";
    }

    if (!rows || rows.length === 0) {
      setTableError("Please add at least one item");
      return;
    }

    setTableError("");
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      InsertBill(editData?.Table?.[0]?.BillID || "");
    }
  };


  const InsertBill = async (BillID) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const invoiceNo = value.InvoicePrefix && value.InvoiceSuffix
        ? `${value.InvoicePrefix}/${value.InvoiceSuffix}`
        : value.InvoicePrefix || "Auto Generated";

      const val = {
        BillID: BillID || 0,
        PartyID: value.PartyID,
        ReceiptNo: invoiceNo,
        PaymentMode: value.PaymentMode,
        BillDate: value.BillDate || "",
        UserName: value.UserName || auth?.UserName || "",
        GSTIN: value.GSTIN || "",
        MobileNo: value.MobileNo || "",
        Email: value.Email || "",
        StateName: value.StateName || "",
        StateCode: value.StateCode || "",
        Address: value.Address || "",
        CompanyName: value.CompanyName || "",
        HSNCode: "",
        Particulars: rows[0]?.ItemName || "",
        SubTotal: calculatedSummary.SubTotal || 0,
        Discount: summary.Discount || 0,
        SGSTPercent: summary.SGSTPercent || 0,
        SGSTAmount: calculatedSummary.SGSTAmount || 0,
        CGSTPercent: summary.CGSTPercent || 0,
        CGSTAmount: calculatedSummary.CGSTAmount || 0,
        IGSTPercent: summary.IGSTPercent || 0,
        IGSTAmount: calculatedSummary.IGSTAmount || 0,
        GrandTotal: calculatedSummary.RoundOff || calculatedSummary.GrandTotal || 0,
        RoundOff: calculatedSummary.RoundOff || 0,
        PaymentReceived: summary.PaymentReceived || 0,
        DueAmount: calculatedSummary.DueAmount || 0,
        BillDetailslist: rows.map((r) => ({
          ItemName: r.ItemName || "",
          Unit: r.Unit || "Nos",
          Qty: r.Qty || "",
          Rate: r.Rate || "",
          TotalAmount: r.TotalAmount || "",
        })),
      };

      const res = await PostWithToken("Bill/InsertBill", val);
      if (res) {
        toastifySuccess(BillID ? "Bill updated successfully" : "Bill inserted successfully");
        setvalue({
          PartyID: "", InvoicePrefix: "", InvoiceSuffix: "", UserName: "", GSTIN: "", MobileNo: "", Email: "", PaymentMode: "",
          BillDate: "", StateName: "", StateCode: "", Address: "", CompanyName: "",
        });
        setRows([]);
        setItemForm({ ItemName: "", Unit: "Nos", Qty: "", Rate: "", TotalAmount: "", });

        setSummary({
          SubTotal: 0, Discount: 0, SGSTPercent: 0, SGSTAmount: 0, CGSTPercent: 0, CGSTAmount: 0, IGSTPercent: 0, IGSTAmount: 0, GrandTotal: 0, RoundOff: 0, PaymentReceived: 0, DueAmount: 0,
        });
        onClose?.();
        onSuccess?.();
      }
    } catch (error) {
      console.error("InsertBill error:", error);
    }
  };

  const columns = useMemo(
    () => [
      { name: "Item Name", selector: (r) => r?.ItemName || "", sortable: true },
      { name: "Unit", selector: (r) => r?.Unit || "Nos", sortable: true },
      { name: "Qty", selector: (r) => r?.Qty || "", sortable: true },
      { name: "Rate", selector: (r) => r?.Rate || "", sortable: true },
      {
        name: "Total Amount",
        selector: (r) => r?.TotalAmount || "",
        sortable: true,
        cell: (row) => <div className="font-semibold">₹{row.TotalAmount || "0"}</div>,
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
    [handleEditItem, handleDeleteItem]
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

  const selectedParty = partyOptions.find((opt) => String(opt.value) === String(value.PartyID));
  const selectedMode = paymentModeOptions.find((opt) => opt.value === value.PaymentMode);
  const selectedState = stateOptions.find((opt) => opt.value === value.StateCode || opt.label === value.StateName);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-7xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 my-2 sm:my-4 max-h-[98vh] sm:max-h-[95vh] overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editData ? "Update Bill" : "Add Bill"}
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

            <form autoComplete="off-district" onSubmit={(e) => e.preventDefault()}>


              <input
                type="text"
                name="fake_name"
                autoComplete="name"
                style={{ position: "absolute", opacity: 0, height: 0 }}
              />
              <input
                type="tel"
                name="fake_phone"
                autoComplete="tel"
                style={{ position: "absolute", opacity: 0, height: 0 }}
              />


              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 lg:flex-[2] space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">User Name</label>
                          <input
                            type="text"
                            value={value.UserName}
                            onChange={handleBillChange("UserName")}
                            placeholder="Enter user name"
                            className={inputCls}
                            autoComplete="off-district"
                          />
                          {errors.UserName && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">{errors.UserName}</p>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">Mobile#</label>
                          <input
                            type="text"
                            value={value.MobileNo}
                            onChange={handleBillChange("MobileNo")}
                            placeholder="Enter mobile number"
                            maxLength={10}
                            className={inputCls}
                            autoComplete="off-district"
                          />
                          {errors.MobileNo && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">{errors.MobileNo}</p>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">Invoice#</label>
                          <input
                            type="text"
                            value={value.InvoicePrefix}
                            onChange={handleBillChange("InvoicePrefix")}
                            placeholder="Auto Generated"
                            className={inputCls}
                            readOnly
                            autoComplete="off-district"
                          />
                        </div>
                      </div>



                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600"> GST Number</label>

                          <input
                            type="text"
                            value={value.GSTIN}
                            onChange={handleBillChange("GSTIN")}
                            placeholder="Enter GSTIN"
                            className={inputCls}
                            autoComplete="off-district"
                          />

                          {errors.GSTIN && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">
                              {errors.GSTIN}
                            </p>
                          )}
                        </div>

                        {/* E-mail */}
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">E-mail</label>
                          <input
                            type="email"
                            value={value.Email}
                            onChange={handleBillChange("Email")}
                            placeholder="Enter email"
                            className={inputCls}
                            autoComplete="off-district"
                          />
                          {errors.Email && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">{errors.Email}</p>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">
                            Mode <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={selectedMode || null}
                            onChange={(opt) => setvalue((p) => ({ ...p, PaymentMode: opt?.value || "" }))}
                            options={paymentModeOptions}
                            placeholder="Select mode..."
                            styles={selectStyles}
                          />
                          {errors.PaymentMode && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">{errors.PaymentMode}</p>
                          )}
                        </div>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={value.BillDate}
                            onChange={handleBillChange("BillDate")}
                            className={inputCls}
                            autoComplete="off-district"
                          />
                          {errors.BillDate && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">{errors.BillDate}</p>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">State</label>
                          <input
                            type="text"
                            value={value.StateName}
                            placeholder="Rajasthan"
                            className={inputCls}
                            readOnly
                            autoComplete="off-district"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">Company Name</label>
                          <input
                            type="text"
                            value={value.CompanyName}
                            onChange={handleBillChange("CompanyName")}
                            placeholder="Enter company name"
                            className={inputCls}
                            autoComplete="off-district"
                          />
                          {errors.CompanyName && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">{errors.CompanyName}</p>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex flex-col">
                        <label className="mb-1 text-sm font-medium text-slate-600">Address</label>
                        <textarea
                          rows={3}
                          value={value.Address}
                          onChange={handleBillChange("Address")}
                          placeholder="Enter address"
                          className={inputCls + " resize-none"}
                          autoComplete="off-district"
                        />
                        {errors.Address && (
                          <p className="mt-1 text-xs text-red-500 min-h-[14px]">{errors.Address}</p>
                        )}
                      </div>

                    </div>


                  </div>

                  {/* Middle Section - Item Entry */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Item Entry</h3>
                    <form onSubmit={handleAddOrUpdateItem} className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {/* Item Name */}
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">
                            Item Name <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={itemOptions.find((opt) => opt.label === itemForm.ItemName) || null}
                            onChange={(opt) => {
                              setItemForm((p) => ({ ...p, ItemName: opt?.label || "" }));
                              if (itemErrors.ItemName) {
                                setItemErrors((prev) => ({ ...prev, ItemName: "" }));
                              }
                            }}
                            options={itemOptions}
                            placeholder="Select item name..."
                            styles={selectStyles}
                            isClearable
                          />
                          {itemErrors.ItemName && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">{itemErrors.ItemName}</p>
                          )}
                        </div>

                        {/* Unit */}
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">
                            Unit <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={itemForm.Unit}
                            onChange={handleItemChange("Unit")}
                            placeholder="Enter unit (e.g., Nos, Kg, etc.)"
                            className={inputCls}
                            autoComplete="off-district"
                          />
                          {itemErrors.Unit && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">{itemErrors.Unit}</p>
                          )}
                        </div>

                        {/* Qty */}
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">
                            Qty <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={itemForm.Qty}
                            onChange={handleItemChange("Qty")}
                            placeholder="Enter qty"
                            className={inputCls}
                            autoComplete="off-district"
                          />
                          {itemErrors.Qty && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">{itemErrors.Qty}</p>
                          )}
                        </div>

                        {/* Rate */}
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">
                            Rate <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={itemForm.Rate}
                            onChange={handleItemChange("Rate")}
                            placeholder="Enter rate"
                            className={inputCls}
                            autoComplete="off-district"
                          />
                          {itemErrors.Rate && (
                            <p className="mt-1 text-xs text-red-500 min-h-[14px]">{itemErrors.Rate}</p>
                          )}
                        </div>

                        {/* Total Amount */}
                        <div className="flex flex-col">
                          <label className="mb-1 text-sm font-medium text-slate-600">Total Amount</label>
                          <input
                            type="text"
                            value={itemForm.TotalAmount}
                            readOnly
                            placeholder="Auto calculated"
                            className={inputCls + " bg-slate-50"}
                            autoComplete="off-district"
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

                  {/* Bottom Section - Item List & Summary */}
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

                {/* Summary of Charges - Right Side (Fixed) */}
                <div className="w-full lg:w-80 xl:w-96 lg:flex-shrink-0 bg-slate-800 rounded-lg p-3 sm:p-4 text-white h-fit lg:sticky lg:top-4">
                  <h3 className="text-lg font-semibold mb-4">Summary of Charges</h3>
                  <div className="space-y-4">
                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Total</label>
                      <input
                        type="text"
                        value={calculatedSummary.SubTotal.toFixed(2)}
                        readOnly
                        className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                        autoComplete="off-district"
                      />
                    </div>

                    {/* Discount */}
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Discount</label>
                      <input
                        type="text"
                        value={summary.Discount}
                        onChange={handleSummaryChange("Discount")}
                        className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                        autoComplete="off-district"
                      />
                    </div>

                    {/* Total (after discount) */}
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Total</label>
                      <input
                        type="text"
                        value={(calculatedSummary.SubTotal - summary.Discount).toFixed(2)}
                        readOnly
                        className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                        autoComplete="off-district"
                      />
                    </div>

                    {/* SGST */}
                    <div className="flex justify-between items-center gap-2">
                      <label className="text-sm font-medium">SGST @</label>
                      <div className="flex gap-1 items-center">
                        <input
                          type="text"
                          value={summary.SGSTPercent}
                          onChange={handleSummaryChange("SGSTPercent")}
                          readOnly
                          className="w-12 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                          autoComplete="off-district"
                        />
                        <span className="text-sm">%</span>
                        <input
                          type="text"
                          value={calculatedSummary.SGSTAmount.toFixed(2)}
                          readOnly
                          className="w-20 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                          autoComplete="off-district"
                        />
                      </div>
                    </div>

                    {/* CGST */}
                    <div className="flex justify-between items-center gap-2">
                      <label className="text-sm font-medium">CGST @</label>
                      <div className="flex gap-1 items-center">
                        <input
                          type="text"
                          value={summary.CGSTPercent}
                          readOnly
                          onChange={handleSummaryChange("CGSTPercent")}
                          className="w-12 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                          autoComplete="off-district"
                        />
                        <span className="text-sm">%</span>
                        <input
                          type="text"
                          value={calculatedSummary.CGSTAmount.toFixed(2)}
                          readOnly
                          className="w-20 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                          autoComplete="off-district"
                        />
                      </div>
                    </div>

                    {/* IGST */}
                    {/* <div className="flex justify-between items-center gap-2">
                    <label className="text-sm font-medium">IGST @</label>
                    <div className="flex gap-1 items-center">
                      <input
                        type="text"
                        value={summary.IGSTPercent}
                        onChange={handleSummaryChange("IGSTPercent")}
                        className="w-12 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                      />
                      <span className="text-sm">%</span>
                      <input
                        type="text"
                        value={calculatedSummary.IGSTAmount.toFixed(2)}
                        readOnly
                        className="w-20 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                      />
                    </div>
                  </div> */}

                    {/* Grand Total */}
                    <div className="flex justify-between items-center border-t border-slate-600 pt-2">
                      <label className="text-sm font-semibold">Grand Total</label>
                      <input
                        type="text"
                        value={calculatedSummary.GrandTotal.toFixed(2)}
                        readOnly
                        className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm font-semibold text-white text-right"
                        autoComplete="off-district"
                      />
                    </div>

                    {/* Round off */}
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Round off</label>
                      <input
                        type="text"
                        value={calculatedSummary.RoundOff}
                        readOnly
                        className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                        autoComplete="off-district"
                      />
                    </div>

                    {/* Payment Received */}
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Payment Received</label>
                      <input
                        type="text"
                        value={summary.PaymentReceived}
                        onChange={handleSummaryChange("PaymentReceived")}
                        className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white text-right"
                        autoComplete="off-district"
                      />
                    </div>

                    {/* Due Amount */}
                    <div className="flex justify-between items-center border-t border-slate-600 pt-2">
                      <label className="text-sm font-semibold">Due Amount</label>
                      <input
                        type="text"
                        value={calculatedSummary.DueAmount}
                        readOnly
                        className="w-24 rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm font-semibold text-white text-right"
                        autoComplete="off-district"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Bottom Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 sm:px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={validateAndSubmit}
              >
                {/* Save/Print */}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillModal;
