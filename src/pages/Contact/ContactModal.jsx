import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const ContactModal = ({ open, onClose, editData, onSuccess }) => {

  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [value, setvalue] = useState({
    Remarks: "",
    Status: null,
    QuotationSent: null,
    QuotationDate: "",
    Reference: "",
    CurserName: "",
    Address: "",
    MobileNo: "",
    CustomerName: "",
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const quotationSentOptions = [
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

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setvalue({
        Remarks: "",
        Status: null,
        QuotationSent: null,
        QuotationDate: "",
        Reference: "",
        CurserName: "",
        Address: "",
        MobileNo: "",
        CustomerName: "",
      });
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (editData) {

      const statusOption = statusOptions.find(
        (opt) => opt.value === editData.Status || opt.label === editData.Status
      ) || null;

      const quotationSentOption = quotationSentOptions.find(
        (opt) => opt.value === editData.QuotationSent || opt.label === editData.QuotationSent
      ) || null;

      setvalue({
        Remarks: editData.Remarks || "",
        Status: statusOption,
        QuotationSent: quotationSentOption,
        QuotationDate: editData.QuotationDate || "",
        Reference: editData.Reference || "",
        CurserName: editData.CurserName || "",
        Address: editData.Address || "",
        MobileNo: editData.MobileNo || "",
        CustomerName: editData.CustomerName || "",
      });
      setErrors({});
    } else {
      setErrors({});
    }
  }, [editData, open]);

  const handleChange = (key) => (e) => {
    let v = e.target.value;
    if (key === "MobileNo") {
      v = v.replace(/\D/g, "").slice(0, 10);
    }
    setvalue((p) => ({ ...p, [key]: v }));
  };

  const Check_validate = () => {
    const newErrors = {};
    if (!value.CustomerName.trim()) {
      newErrors.CustomerName = "Customer Name is required";
    }
    if (!value.CurserName.trim()) {
      newErrors.CurserName = "Curser Name is required";
    }
    if (!value.Status) {
      newErrors.Status = "Status is required";
    }
    if (!value.MobileNo.trim()) {
      newErrors.MobileNo = "Mobile No is required";
    } else if (value.MobileNo.length < 10) {
      newErrors.MobileNo = "Mobile No must be 10 digits";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors)?.length === 0) {
      if (editData?.ID) {
        Update_Contact(editData?.ID);
      } else {
        Insert_Contact();
      }
    }
  };

  const Insert_Contact = async () => {
    try {
      const payload = {
        ...value,
        Status: value.Status?.value || value.Status || "",
        QuotationSent: value.QuotationSent?.value || value.QuotationSent || "",
      };
      const res = await PostWithToken("Contact/Insert_Contact", payload);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Contact inserted successfully");
        setvalue({
          Remarks: "",
          Status: null,
          QuotationSent: null,
          QuotationDate: "",
          Reference: "",
          CurserName: "",
          Address: "",
          MobileNo: "",
          CustomerName: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Insert_Contact error:", error);
    }
  };

  const Update_Contact = async (ID) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        ID: ID,
        ModifiedByUser: auth?.UserID || "1",
        Remarks: value.Remarks,
        Status: value.Status?.value || value.Status || "",
        QuotationSent: value.QuotationSent?.value || value.QuotationSent || "",
        QuotationDate: value.QuotationDate,
        Reference: value.Reference,
        CurserName: value.CurserName,
        Address: value.Address,
        MobileNo: value.MobileNo,
        CustomerName: value.CustomerName,
      };
      const res = await PostWithToken("Contact/Update_Contact", val);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Contact updated successfully");
        setvalue({
          Remarks: "",
          Status: null,
          QuotationSent: null,
          QuotationDate: "",
          Reference: "",
          CurserName: "",
          Address: "",
          MobileNo: "",
          CustomerName: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Update_Contact error:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-6xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 my-4 max-h-[95vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editData ? "Update Contact" : "Add Contact"}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value.CustomerName}
                  onChange={handleChange("CustomerName")}
                  placeholder="Enter customer name"
                  className={inputCls}
                  autoComplete="off-district"

                />
                {errors.CustomerName && (
                  <p className="mt-1 text-xs text-red-500">{errors.CustomerName}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value.MobileNo}
                  onChange={handleChange("MobileNo")}
                  placeholder="Enter mobile number"
                  className={inputCls}
                  autoComplete="off-district"

                />
                {errors.MobileNo && (
                  <p className="mt-1 text-xs text-red-500">{errors.MobileNo}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Curser Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value.CurserName}
                  onChange={handleChange("CurserName")}
                  placeholder="Enter curser name"
                  className={inputCls}
                  autoComplete="off-district"

                />
                {errors.CurserName && (
                  <p className="mt-1 text-xs text-red-500">{errors.CurserName}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Status<span className="text-red-500">*</span>
                </label>
                <Select
                  value={value.Status}
                  onChange={(option) => setvalue((p) => ({ ...p, Status: option }))}
                  options={statusOptions}
                  placeholder="Select status..."
                  styles={selectStyles}
                  isClearable
                />
                {errors.Status && (
                  <p className="mt-1 text-xs text-red-500">{errors.Status}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Reference
                </label>
                <input
                  type="text"
                  value={value.Reference}
                  onChange={handleChange("Reference")}
                  placeholder="Enter reference"
                  className={inputCls}
                  autoComplete="off-district"

                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Quotation Sent
                </label>
                <Select
                  value={value.QuotationSent}
                  onChange={(option) => setvalue((p) => ({ ...p, QuotationSent: option }))}
                  options={quotationSentOptions}
                  placeholder="Select quotation sent..."
                  styles={selectStyles}
                  isClearable
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Quotation Date
                </label>
                <input
                  type="date"
                  value={value.QuotationDate}
                  onChange={handleChange("QuotationDate")}
                  className={inputCls}
                  autoComplete="off-district"

                />
              </div>

              <div className="flex flex-col sm:col-span-2">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Address
                </label>
                <textarea
                  rows={2}
                  value={value.Address}
                  onChange={handleChange("Address")}
                  placeholder="Enter address"
                  className={inputCls + " resize-none"}
                  autoComplete="off-district"

                />
              </div>

              <div className="flex flex-col sm:col-span-2">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Remarks
                </label>
                <textarea
                  rows={3}
                  value={value.Remarks}
                  onChange={handleChange("Remarks")}
                  placeholder="Enter remarks"
                  className={inputCls + " resize-none"}
                  autoComplete="off-district"

                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              {editData ? (
                <button
                  type="button"
                  className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  onClick={Check_validate}
                >
                  Update
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  onClick={Check_validate}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
