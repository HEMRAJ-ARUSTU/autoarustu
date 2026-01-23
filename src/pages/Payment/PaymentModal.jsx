import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { PostWithToken, Comman_changeArrayFormat } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const PaymentModal = ({ open, onClose, editData, onSuccess }) => {
  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [value, setvalue] = useState({
    PartyID: null,
    ReamaningAmt: "",
    Paymenttype: "",
    Amt: "",
    ByPayment: "",
    PaymentDtTm: "",
  });

  const [errors, setErrors] = useState({});
  const [partyOptions, setPartyOptions] = useState([]);
  const [originalRemainingAmt, setOriginalRemainingAmt] = useState(0);

  const paymentTypeOptions = [
    { value: "CASH", label: "CASH" },
    { value: "UPI", label: "UPI" },
    { value: "BANK", label: "BANK" },
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
        PartyID: null,
        ReamaningAmt: "",
        Paymenttype: "",
        Amt: "",
        ByPayment: "",
        PaymentDtTm: "",
      });
      setErrors({});
      setOriginalRemainingAmt(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    GetPartyDropdown();
  }, [open]);

  const GetPartyDropdown = async () => {
    try {
      const res = await PostWithToken("Party/GetData_Party", { IsActive: "1" });
      if (res) {
        setPartyOptions(Comman_changeArrayFormat(res, "PartyID", "Name"));
      } else {
        setPartyOptions([]);
      }
    } catch (error) {
      console.error("GetPartyDropdown error:", error);
      setPartyOptions([]);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (editData) {
      const partyOption = partyOptions.find(
        (opt) => opt.value === editData.PartyID || opt.value === String(editData.PartyID)
      ) || null;

      const paymentTypeOption = paymentTypeOptions.find(
        (opt) => opt.value === editData.Paymenttype || opt.label === editData.Paymenttype
      ) || null;

      const today = new Date().toISOString().split("T")[0];
      const initialRemainingAmt = parseFloat(editData.ReamaningAmt) || 0;
      setOriginalRemainingAmt(initialRemainingAmt);
      setvalue({
        PartyID: partyOption,
        ReamaningAmt: editData.ReamaningAmt || "",
        Paymenttype: paymentTypeOption,
        Amt: "",
        ByPayment: editData.ByPayment || "",
        PaymentDtTm: editData.PaymentDtTm || today,
      });
      setErrors({});
    } else {
      const today = new Date().toISOString().split("T")[0];
      setOriginalRemainingAmt(0);
      setvalue({
        PartyID: null,
        ReamaningAmt: "",
        Paymenttype: null,
        Amt: "",
        ByPayment: "",
        PaymentDtTm: today,
      });
      setErrors({});
    }
  }, [editData, open, partyOptions]);

  const handleChange = (key) => (e) => {
    let v = e.target.value;
    if (key === "Amt") {
      v = v.replace(/[^0-9]/g, "");
    } else if (key === "ReamaningAmt") {
      v = v.replace(/[^0-9.]/g, "");




    }

    setvalue((p) => {
      const newValue = { ...p, [key]: v };

      if (key === "Amt") {
        const enteredAmount = parseFloat(v) || 0;
        const calculatedRemaining = originalRemainingAmt - enteredAmount;
        newValue.ReamaningAmt = calculatedRemaining >= 0 ? calculatedRemaining : "0";
      }

      return newValue;
    });

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const Check_validate = () => {
    const newErrors = {};
    if (!value.PartyID) {
      newErrors.PartyID = "Party is required";
    }
    if (!value.Paymenttype) {
      newErrors.Paymenttype = "Payment Type is required";
    }
    if (!value.ByPayment) {
      newErrors.ByPayment = "By Payment is required";
    }
    if (!value.Amt.trim()) {
      newErrors.Amt = "Amount is required";
    } else if (parseFloat(value.Amt) <= 0) {
      newErrors.Amt = "Amount must be greater than 0";
    } else if (parseFloat(value.Amt) > originalRemainingAmt) {
      newErrors.Amt = `Amount cannot be greater than remaining amount (${originalRemainingAmt})`;
    }
    if (!value.PaymentDtTm.trim()) {
      newErrors.PaymentDtTm = "Payment Date is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors)?.length === 0) {
      Insert_Payment();
    }
  };

  const Insert_Payment = async () => {
    try {
      const calculatedRemaining = originalRemainingAmt - (parseFloat(value.Amt) || 0);
      const payload = {
        PartyID: value.PartyID?.value || value.PartyID || "",
        ReamaningAmt: calculatedRemaining >= 0 ? calculatedRemaining : "0",
        Paymenttype: value.Paymenttype?.value || value.Paymenttype || "",
        Amt: value.Amt || "0",
        ByPayment: value.ByPayment || "",
        PaymentDtTm: value.PaymentDtTm || new Date().toISOString(),
      };
      const res = await PostWithToken("Payment/Insert_Payment", payload);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Payment inserted successfully");
        const today = new Date().toISOString().split("T")[0];
        setvalue({
          PartyID: null,
          ReamaningAmt: "",
          Paymenttype: null,
          Amt: "",
          ByPayment: "",
          PaymentDtTm: today,
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Insert_Payment error:", error);
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
                {editData ? "Payment Received" : "Add Payment"}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Party <span className="text-red-500">*</span>
                </label>
                <Select
                  value={value.PartyID}
                  onChange={(option) => {
                    setvalue((p) => ({ ...p, PartyID: option }));
                    if (errors.PartyID) {
                      setErrors((prev) => ({ ...prev, PartyID: "" }));
                    }
                  }}
                  options={partyOptions}
                  placeholder="Select party..."
                  styles={selectStyles}
                  isClearable
                  isDisabled={Boolean(editData)}
                />
                {errors.PartyID && (
                  <p className="mt-1 text-xs text-red-500">{errors.PartyID}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Payment Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={value.Paymenttype}
                  onChange={(option) => {
                    setvalue((p) => ({ ...p, Paymenttype: option }));
                    if (errors.Paymenttype) {
                      setErrors((prev) => ({ ...prev, Paymenttype: "" }));
                    }
                  }}
                  options={paymentTypeOptions}
                  placeholder="Select payment type..."
                  styles={selectStyles}
                  isClearable
                />
                {errors.Paymenttype && (
                  <p className="mt-1 text-xs text-red-500">{errors.Paymenttype}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
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

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Remaining Amount
                </label>
                <input
                  type="text"
                  value={value.ReamaningAmt}
                  placeholder="Auto calculated"
                  className={inputCls + " bg-slate-50 cursor-not-allowed"}
                  readOnly
                />
                {errors.ReamaningAmt && (
                  <p className="mt-1 text-xs text-red-500">{errors.ReamaningAmt}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  By Payment
                </label>
                <input
                  type="text"
                  value={value.ByPayment}
                  onChange={handleChange("ByPayment")}
                  placeholder="Enter by payment"
                  className={inputCls}
                />
                {errors.ByPayment && (
                  <p className="mt-1 text-xs text-red-500">{errors.ByPayment}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={value.PaymentDtTm}
                  onChange={handleChange("PaymentDtTm")}
                  className={inputCls}
                />
                {errors.PaymentDtTm && (
                  <p className="mt-1 text-xs text-red-500">{errors.PaymentDtTm}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                type="button"
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={Check_validate}
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

export default PaymentModal;

