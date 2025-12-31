import React, { useEffect, useState } from "react";
import Select from "react-select";
import { PostWithToken, Comman_changeArrayFormat } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const PartyModal = ({ open, onClose, editData, onSuccess }) => {
  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [value, setvalue] = useState({
    Name: "",
    OwnerName: "",
    OwnerMobileNo: "",
    OfficeMobileNo: "",
    ReferenceID: null,
    Address: "",
    District: "",
    GSTNo: "",
    MEOffice: "",
    FinalAmt: "",
  });

  const [errors, setErrors] = useState({});
  const [referenceOptions, setReferenceOptions] = useState([]);

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
        Name: "",
        OwnerName: "",
        OwnerMobileNo: "",
        OfficeMobileNo: "",
        ReferenceID: null,
        Address: "",
        District: "",
        GSTNo: "",
        MEOffice: "",
        FinalAmt: "",
      });
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    GetReferenceDropdown();
  }, [open]);

  const GetReferenceDropdown = async () => {
    try {
      const val = { IsActive: "1" };
      const res = await PostWithToken("Reference/GetData_Reference", val);
      if (res) {
        setReferenceOptions(Comman_changeArrayFormat(res, "ReferenceID", "ReferenceName"));
      } else {
        setReferenceOptions([]);
      }
    } catch (error) {
      console.error("GetReferenceDropdown error:", error);
      setReferenceOptions([]);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (editData) {
      // Find reference option if exists
      const referenceOption = referenceOptions.find(
        (opt) => opt.value === editData.ReferenceID || opt.value === String(editData.ReferenceID)
      ) || null;

      setvalue({
        Name: editData.Name || "",
        OwnerName: editData.OwnerName || "",
        OwnerMobileNo: editData.OwnerMobileNo || "",
        OfficeMobileNo: editData.OfficeMobileNo || "",
        ReferenceID: referenceOption,
        Address: editData.Address || "",
        District: editData.District || "",
        GSTNo: editData.GSTNo || "",
        MEOffice: editData.MEOffice || "",
        FinalAmt: editData.FinalAmt || "",
      });
      setErrors({});
    } else {
      setErrors({});
    }
  }, [editData, open, referenceOptions]);

  const handleChange = (key) => (e) => {
    let v = e.target.value;
    if (key === "OwnerMobileNo" || key === "OfficeMobileNo") {
      v = v.replace(/\D/g, "").slice(0, 10);
    }
    if (key === "GSTNo") {
      v = v.replace(/[^A-Z0-9]/gi, "").slice(0, 15).toUpperCase();
    }
    setvalue((p) => ({ ...p, [key]: v }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const Check_validate = () => {
    const newErrors = {};
    if (!value.Name.trim()) {
      newErrors.Name = "Name is required";
    }
    if (!value.OwnerName.trim()) {
      newErrors.OwnerName = "Owner Name is required";
    }
    if (!value.OwnerMobileNo.trim()) {
      newErrors.OwnerMobileNo = "Owner Mobile No is required";
    } else if (value.OwnerMobileNo.length < 10) {
      newErrors.OwnerMobileNo = "Owner Mobile No must be 10 digits";
    }
    if (!value.OfficeMobileNo.trim()) {
      newErrors.OfficeMobileNo = "Office Mobile No is required";
    } else if (value.OfficeMobileNo.length < 10) {
      newErrors.OfficeMobileNo = "Office Mobile No must be 10 digits";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors)?.length === 0) {
      if (editData?.PartyID) {
        Update_Party(editData?.PartyID);
      } else {
        Insert_Party();
      }
    }
  };

  const Insert_Party = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("UserData"));
      const payload = {
        Name: value.Name,
        OwnerName: value.OwnerName,
        OwnerMobileNo: value.OwnerMobileNo,
        OfficeMobileNo: value.OfficeMobileNo,
        ReferenceID: value.ReferenceID?.value || value.ReferenceID || "",
        Address: value.Address,
        District: value.District,
        GSTNo: value.GSTNo,
        MEOffice: value.MEOffice,
        FinalAmt: value.FinalAmt,
        CreatedByUser: auth?.UserID || "1",
      };
      const res = await PostWithToken("Party/Insert_Party", payload);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Party inserted successfully");
        setvalue({
          Name: "",
          OwnerName: "",
          OwnerMobileNo: "",
          OfficeMobileNo: "",
          ReferenceID: null,
          Address: "",
          District: "",
          GSTNo: "",
          MEOffice: "",
          FinalAmt: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Insert_Party error:", error);
    }
  };

  const Update_Party = async (PartyID) => {
    try {
      const auth = JSON.parse(localStorage.getItem("UserData"));
      const val = {
        PartyID: PartyID,
        Name: value.Name,
        OwnerName: value.OwnerName,
        OwnerMobileNo: value.OwnerMobileNo,
        OfficeMobileNo: value.OfficeMobileNo,
        ReferenceID: value.ReferenceID?.value || value.ReferenceID || "",
        Address: value.Address,
        District: value.District,
        GSTNo: value.GSTNo,
        MEOffice: value.MEOffice,
        FinalAmt: value.FinalAmt,
        ModifiedByUser: auth?.UserID || "1",
      };
      const res = await PostWithToken("Party/Update_Party", val);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Party updated successfully");
        setvalue({
          Name: "",
          OwnerName: "",
          OwnerMobileNo: "",
          OfficeMobileNo: "",
          ReferenceID: null,
          Address: "",
          District: "",
          GSTNo: "",
          MEOffice: "",
          FinalAmt: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Update_Party error:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-6xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 my-4 max-h-[95vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h2 className="mb-4 text-lg sm:text-xl font-semibold text-slate-800">
              {editData ? "Update Party" : "Add Party"}
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Name */}
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

              {/* Owner Name */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value.OwnerName}
                  onChange={handleChange("OwnerName")}
                  placeholder="Enter owner name"
                  className={inputCls}
                />
                {errors.OwnerName && (
                  <p className="mt-1 text-xs text-red-500">{errors.OwnerName}</p>
                )}
              </div>

              {/* Owner Mobile No */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Owner Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value.OwnerMobileNo}
                  onChange={handleChange("OwnerMobileNo")}
                  placeholder="Enter owner mobile number"
                  className={inputCls}
                />
                {errors.OwnerMobileNo && (
                  <p className="mt-1 text-xs text-red-500">{errors.OwnerMobileNo}</p>
                )}
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Final Amt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value.FinalAmt}
                  onChange={handleChange("FinalAmt")}
                  placeholder="Enter Final Amt"
                  className={inputCls}
                  maxLength={10}
                />
                {errors.FinalAmt && (
                  <p className="mt-1 text-xs text-red-500">{errors.FinalAmt}</p>
                )}
              </div>

              {/* Office Mobile No */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Office Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={value.OfficeMobileNo}
                  onChange={handleChange("OfficeMobileNo")}
                  placeholder="Enter office mobile number"
                  className={inputCls}
                />
                {errors.OfficeMobileNo && (
                  <p className="mt-1 text-xs text-red-500">{errors.OfficeMobileNo}</p>
                )}
              </div>

              {/* Reference */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Reference
                </label>
                <Select
                  value={value.ReferenceID}
                  onChange={(option) => {
                    setvalue((p) => ({ ...p, ReferenceID: option }));
                    if (errors.ReferenceID) {
                      setErrors((prev) => ({ ...prev, ReferenceID: "" }));
                    }
                  }}
                  options={referenceOptions}
                  placeholder="Select reference..."
                  styles={selectStyles}
                  isClearable
                />
                {errors.ReferenceID && (
                  <p className="mt-1 text-xs text-red-500">{errors.ReferenceID}</p>
                )}
              </div>

              {/* District */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  District
                </label>
                <input
                  type="text"
                  value={value.District}
                  onChange={handleChange("District")}
                  placeholder="Enter district"
                  className={inputCls}
                />
              </div>

              {/* GST No */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  GST No
                </label>
                <input
                  type="text"
                  value={value.GSTNo}
                  onChange={handleChange("GSTNo")}
                  placeholder="Enter GST number"
                  className={inputCls}
                />
              </div>

              {/* MEOffice */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  ME Office
                </label>
                <input
                  type="text"
                  value={value.MEOffice}
                  onChange={handleChange("MEOffice")}
                  placeholder="Enter ME office"
                  className={inputCls}
                />
              </div>

              {/* Address */}
              <div className="flex flex-col sm:col-span-3">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Address
                </label>
                <textarea
                  rows={3}
                  value={value.Address}
                  onChange={handleChange("Address")}
                  placeholder="Enter address"
                  className={inputCls + " resize-none"}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setvalue({
                    Name: "",
                    OwnerName: "",
                    OwnerMobileNo: "",
                    OfficeMobileNo: "",
                    ReferenceID: null,
                    Address: "",
                    District: "",
                    GSTNo: "",
                    MEOffice: "",
                    FinalAmt: "",
                  });
                }}
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 sm:px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

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

export default PartyModal;

