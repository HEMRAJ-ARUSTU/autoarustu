import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const ExpenseModal = ({ open, onClose, editData, onSuccess }) => {
  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [value, setvalue] = useState({
    TransactionType: null,
    Name: "",
    Amount: "",
    Description: "",
  });

  const [errors, setErrors] = useState({});

  const transactionTypeOptions = [
    { value: "Income", label: "Income" },
    { value: "Expense", label: "Expense" },
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
        TransactionType: null,
        Name: "",
        Amount: "",
        Description: "",
      });
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (editData) {

      const transactionTypeOption = transactionTypeOptions.find(
        (opt) => opt.value === editData.TransactionType || opt.label === editData.TransactionType
      ) || null;

      setvalue({
        TransactionType: transactionTypeOption,
        Name: editData.Name || "",
        Amount: editData.Amount || "",
        Description: editData.Description || "",
      });
      setErrors({});
    } else {
      setErrors({});
    }
  }, [editData, open]);

  const handleChange = (key) => (e) => {
    let v = e.target.value;
    if (key === "Amount") {
      v = v.replace(/[^\d.]/g, "");
    }
    setvalue((p) => ({ ...p, [key]: v }));
  };

  const Check_validate = () => {
    const newErrors = {};
    if (!value.TransactionType) {
      newErrors.TransactionType = "Transaction Type is required";
    }
    if (!value.Name.trim()) {
      newErrors.Name = "Name is required";
    }
    if (!value.Amount.trim()) {
      newErrors.Amount = "Amount is required";
    } else if (parseFloat(value.Amount) <= 0) {
      newErrors.Amount = "Amount must be greater than 0";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors)?.length === 0) {
      if (editData?.ExpenseID) {
        Update_Expense(editData?.ExpenseID);
      } else {
        Insert_Expense();
      }
    }
  };

  const Insert_Expense = async () => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const payload = {
        TransactionType: value.TransactionType?.value || value.TransactionType || "",
        Name: value.Name,
        Amount: value.Amount,
        Description: value.Description,
        CreatedByUser: auth?.UserID || "1",
      };
      const res = await PostWithToken("Expense/Insert_Expense", payload);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Expense inserted successfully");
        setvalue({
          TransactionType: null,
          Name: "",
          Amount: "",
          Description: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Insert_Expense error:", error);
    }
  };

  const Update_Expense = async (ID) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        ExpenseID: ID,
        Description: value.Description,
        Amount: value.Amount,
        Name: value.Name,
        TransactionType: value.TransactionType?.value || value.TransactionType || "",
        ModifiedByUser: auth?.UserID || "1",
      };
      const res = await PostWithToken("Expense/Update_Expense", val);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Expense updated successfully");
        setvalue({
          TransactionType: null,
          Name: "",
          Amount: "",
          Description: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Update_Expense error:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 my-4 max-h-[95vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editData ? "Update Expense" : " Add Transaction"}
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
                  Transaction Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={value.TransactionType}
                  onChange={(option) => setvalue((p) => ({ ...p, TransactionType: option }))}
                  options={transactionTypeOptions}
                  placeholder="Select transaction type..."
                  styles={selectStyles}
                  isClearable
                />
                {errors.TransactionType && (
                  <p className="mt-1 text-xs text-red-500">{errors.TransactionType}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value.Name}
                  onChange={handleChange("Name")}
                  placeholder="Enter name"
                  className={inputCls}
                />
                {errors.Name && (
                  <p className="mt-1 text-xs text-red-500">{errors.Name}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value.Amount}
                  onChange={handleChange("Amount")}
                  placeholder="Enter amount"
                  className={inputCls}
                />
                {errors.Amount && (
                  <p className="mt-1 text-xs text-red-500">{errors.Amount}</p>
                )}
              </div>

              <div className="flex flex-col sm:col-span-3">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={value.Description}
                  onChange={handleChange("Description")}
                  placeholder="Enter description"
                  className={inputCls + " resize-none"}
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

export default ExpenseModal;

