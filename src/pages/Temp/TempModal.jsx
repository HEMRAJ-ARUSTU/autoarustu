import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { PostWithToken, Comman_changeArrayFormat } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const TempModal = ({ open, onClose, editData, onSuccess }) => {
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
    IsVerified: false,
    HardwareAmt: "",
    InstallationAmt: "",
    GST: ""
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
        HardwareAmt: "",
        InstallationAmt: "",
        GST: "",
        IsVerified: false,
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
        HardwareAmt: editData.HardwareAmt || "",
        InstallationAmt: editData.InstallationAmt || "",
        GST: editData.GST || "",
        IsVerified: editData.IsVerified === true || editData.IsVerified === "true" || editData.IsVerified === 1,
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

    if (key === "HardwareAmt" || key === "InstallationAmt" || key === "GST") {
      const hw = Number(
        key === "HardwareAmt"
          ? v
            ? parseFloat(v)
            : 0
          : value.HardwareAmt
            ? parseFloat(value.HardwareAmt)
            : 0
      );
      const inst = Number(
        key === "InstallationAmt"
          ? v
            ? parseFloat(v)
            : 0
          : value.InstallationAmt
            ? parseFloat(value.InstallationAmt)
            : 0
      );

      let gst = 0;
      if (key === "GST") {
        gst = v ? Number(parseFloat(v)) : 0;
      } else {
        gst = Number(((hw) * 0.18).toFixed(2));
      }

      const finalAmt = Number((hw + inst + gst).toFixed(2));

      setvalue((p) => ({
        ...p,
        [key]: v,
        GST: gst === 0 ? "" : gst,
        FinalAmt: finalAmt === 0 ? "" : finalAmt,
      }));
    } else {

      if (key === "FinalAmt") {
        v = v.replace(/[^0-9.]/g, "");
        const parts = v.split(".");
        if (parts.length > 2) {
          v = parts[0] + "." + parts.slice(1).join("");
        }
      }

      setvalue((p) => ({ ...p, [key]: v }));
    }

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
    if (!value.HardwareAmt) {
      newErrors.HardwareAmt = "Hardware Amount is required"
    }
    if (!value.InstallationAmt) {
      newErrors.InstallationAmt = "Installation Amount is required"
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
      if (editData?.TempID) {
        Update_Temp(editData?.TempID);
      } else {
        Insert_Temp();
      }
    }
  };

  const Insert_Temp = async () => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
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
        FinalAmt: value.FinalAmt || "0",
        HardwareAmt: value.HardwareAmt || "0",
        InstallationAmt: value.InstallationAmt || "0",
        GST: value.GST || "0",
        IsVerified: value.IsVerified === true || value.IsVerified === "true",
        CreatedByUser: auth?.UserID || "1",
      };
      const res = await PostWithToken("Temp/Insert_Temp", payload);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Temp inserted successfully");
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
          HardwareAmt: "",
          InstallationAmt: "",
          GST: "",
          IsVerified: false,
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Insert_Temp error:", error);
    }
  };

  const Update_Temp = async (TempID) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        TempID: TempID,
        Name: value.Name,
        OwnerName: value.OwnerName,
        OwnerMobileNo: value.OwnerMobileNo,
        OfficeMobileNo: value.OfficeMobileNo,
        ReferenceID: value.ReferenceID?.value || value.ReferenceID || "",
        Address: value.Address,
        District: value.District,
        GSTNo: value.GSTNo,
        MEOffice: value.MEOffice,
        FinalAmt: value.FinalAmt || "0",
        HardwareAmt: value.HardwareAmt || "0",
        InstallationAmt: value.InstallationAmt || "0",
        GST: value.GST || "0",
        IsVerified: value.IsVerified === true || value.IsVerified === "true",
        ModifiedByUser: auth?.UserID || "1",
      };
      const res = await PostWithToken("Temp/Update_Temp", val);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Temp updated successfully");
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
          HardwareAmt: "",
          InstallationAmt: "",
          GST: "",
          IsVerified: false,
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Update_Temp error:", error);
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
                {editData ? "Update Temp" : "Add Temp"}
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


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

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
                    autoComplete="off-district"
                  />
                  {errors.Name && (
                    <p className="mt-1 text-xs text-red-500">{errors.Name}</p>
                  )}
                </div>

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
                    autoComplete="off-district"
                  />
                  {errors.OwnerName && (
                    <p className="mt-1 text-xs text-red-500">{errors.OwnerName}</p>
                  )}
                </div>

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
                    autoComplete="off-district"
                  />
                  {errors.OwnerMobileNo && (
                    <p className="mt-1 text-xs text-red-500">{errors.OwnerMobileNo}</p>
                  )}
                </div>

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
                    autoComplete="off-district"
                  />
                  {errors.OfficeMobileNo && (
                    <p className="mt-1 text-xs text-red-500">{errors.OfficeMobileNo}</p>
                  )}
                </div>

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
                    autoComplete="off-district"
                  />
                </div>

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
                    autoComplete="off-district"
                  />
                </div>

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
                    autoComplete="off-district"
                  />
                </div>







                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-600">
                    Hardware Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={value.HardwareAmt}
                    onChange={handleChange("HardwareAmt")}
                    placeholder="Enter Hardware Amount"
                    className={inputCls}
                    autoComplete="off-district"
                  />
                  {errors.HardwareAmt && (
                    <p className="mt-1 text-xs text-red-500">{errors.HardwareAmt}</p>
                  )}
                </div>



                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-600">
                    Gst Amount (18%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={value.GST}
                    onChange={handleChange("GST")}
                    placeholder="Auto-calculated GST Amount"
                    className={inputCls + " bg-slate-50"}
                    readOnly
                    autoComplete="off-district"
                  />
                  {errors.GST && (
                    <p className="mt-1 text-xs text-red-500">{errors.GST}</p>
                  )}
                </div>




                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-600">
                    Installation Charge Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={value.InstallationAmt}
                    onChange={handleChange("InstallationAmt")}
                    placeholder="Enter Installation Amount"
                    className={inputCls}
                    autoComplete="off-district"
                  />
                  {errors.InstallationAmt && (
                    <p className="mt-1 text-xs text-red-500">{errors.InstallationAmt}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-600">
                    Final Amount
                  </label>
                  <input
                    type="text"
                    value={value.FinalAmt}
                    placeholder="Auto-calculated Final Amt"
                    className={inputCls + " bg-slate-50"}
                    readOnly
                    autoComplete="off-district"
                  />
                </div>

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
                    autoComplete="off-district"
                  />
                </div>

                <div className="flex flex-col sm:col-span-3">
                  <label className="mb-1 text-sm font-medium text-slate-600">
                    Is Verified
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value.IsVerified === true || value.IsVerified === "true"}
                      onChange={(e) => setvalue((p) => ({ ...p, IsVerified: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </form>

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

export default TempModal;

