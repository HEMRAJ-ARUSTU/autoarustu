import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const PaymentReminderModal = ({ open, onClose, editData, onSuccess }) => {
  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [value, setvalue] = useState({
    PartyID: null,
    NextDate: "",
    Amt: "",
    IsPaymentDone: false,
  });

  const [errors, setErrors] = useState({});
  const [partyOptions, setPartyOptions] = useState([]);

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
        PartyID: null,
        NextDate: "",
        Amt: "",
        IsPaymentDone: false,
      });
      setErrors({});
    } else {
      GetPartyDropdown();
      if (editData) {
        const partyOption = partyOptions.find(
          (opt) => opt.value === editData.PartyID || opt.value === String(editData.PartyID)
        ) || null;

        const nextDate = editData.NextDate
          ? new Date(editData.NextDate).toISOString().split("T")[0]
          : "";

        setvalue({
          PartyID: partyOption,
          NextDate: nextDate,
          Amt: editData.Amt || "",
          IsPaymentDone: editData.IsPaymentDone === true || editData.IsPaymentDone === "true" || editData.IsPaymentDone === 1,
        });
      } else {
        const today = new Date().toISOString().split("T")[0];
        setvalue({
          PartyID: null,
          NextDate: today,
          Amt: "",
          IsPaymentDone: false,
        });
      }
    }
  }, [open, editData]);

  useEffect(() => {
    if (open && editData && partyOptions.length > 0) {
      const partyOption = partyOptions.find(
        (opt) => opt.value === editData.PartyID || opt.value === String(editData.PartyID)
      ) || null;

      const nextDate = editData.NextDate
        ? new Date(editData.NextDate).toISOString().split("T")[0]
        : "";

      setvalue((prev) => ({
        ...prev,
        PartyID: partyOption,
        NextDate: nextDate,
        Amt: editData.Amt || "",
        IsPaymentDone: editData.IsPaymentDone === true || editData.IsPaymentDone === "true" || editData.IsPaymentDone === 1,
      }));
    }
  }, [partyOptions, editData, open]);

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

  const handleChange = (key) => (e) => {
    let v = e.target.value;
    if (key === "Amt") {
      v = v.replace(/[^0-9]/g, "");
    }

    setvalue((p) => ({ ...p, [key]: v }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleSelectChange = (key) => (selectedOption) => {
    setvalue((p) => ({ ...p, [key]: selectedOption }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleToggleChange = (key) => (e) => {
    const checked = e.target.checked;
    setvalue((p) => ({ ...p, [key]: checked }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!value.PartyID) {
      newErrors.PartyID = "Party is required";
    }
    if (!value.NextDate.trim()) {
      newErrors.NextDate = "Next Date is required";
    }
    if (!value.Amt || value.Amt === "" || parseFloat(value.Amt) <= 0) {
      newErrors.Amt = "Amount must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editData) {
      await Update_PaymentReminder(editData.PaymentReminderID);
    } else {
      await Insert_PaymentReminder();
    }
  };

  const Insert_PaymentReminder = async () => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        PartyID: value.PartyID?.value || value.PartyID || "",
        NextDate: value.NextDate || "",
        Amt: value.Amt || "0",
        IsPaymentDone: value.IsPaymentDone === true || value.IsPaymentDone === "true",
      };
      const res = await PostWithToken("PaymentReminder/Insert_PaymentReminder", val);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Payment Reminder added successfully");
        setvalue({
          PartyID: null,
          NextDate: new Date().toISOString().split("T")[0],
          Amt: "",
          IsPaymentDone: false,
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Insert_PaymentReminder error:", error);
    }
  };

  const Update_PaymentReminder = async (PaymentReminderID) => {
    try {
      const val = {
        PaymentReminderID: PaymentReminderID,
        PartyID: value.PartyID?.value || value.PartyID || "",
        NextDate: value.NextDate || "",
        Amt: value.Amt || "0",
        IsPaymentDone: value.IsPaymentDone === true || value.IsPaymentDone === "true",
      };
      const res = await PostWithToken("PaymentReminder/Update_PaymentReminder", val);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Payment Reminder updated successfully");
        setvalue({
          PartyID: null,
          NextDate: "",
          Amt: "",
          IsPaymentDone: false,
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Update_PaymentReminder error:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 my-4 max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {editData ? "Edit Payment Reminder" : "Add Payment Reminder"}
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

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Party <span className="text-red-500">*</span>
              </label>
              <Select
                options={partyOptions}
                value={value.PartyID}
                onChange={handleSelectChange("PartyID")}
                placeholder="Select Party"
                isClearable
                styles={selectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {errors.PartyID && (
                <p className="mt-1 text-xs text-red-500">{errors.PartyID}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Next Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={value.NextDate}
                onChange={handleChange("NextDate")}
                className={inputCls}
              />
              {errors.NextDate && (
                <p className="mt-1 text-xs text-red-500">{errors.NextDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={value.Amt}
                onChange={handleChange("Amt")}
                placeholder="Enter amount"
                className={inputCls}
              />
              {errors.Amt && (
                <p className="mt-1 text-xs text-red-500">{errors.Amt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Is Payment Done
              </label>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value.IsPaymentDone === true || value.IsPaymentDone === "true"}
                    onChange={handleToggleChange("IsPaymentDone")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm text-slate-700">
                    {value.IsPaymentDone ? "Yes" : "No"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-slate-200">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition"
            >
              {editData ? "Update" : "Add"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentReminderModal;

