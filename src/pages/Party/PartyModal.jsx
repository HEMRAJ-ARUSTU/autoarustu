import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
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
    Area: "",
    GSTNo: "",
    MEOffice: "",
    FinalAmt: "",
    HardwareAmt: "",
    InstallationAmt: "",
    GST: "",
    Remark: "",

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
        Area: "",
        GSTNo: "",
        MEOffice: "",
        FinalAmt: "",
        HardwareAmt: "",
        InstallationAmt: "",
        Remark: "",
        GST: ""
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
        Area: editData.Area || "",
        GSTNo: editData.GSTNo || "",
        MEOffice: editData.MEOffice || "",
        FinalAmt: editData.FinalAmt || "",
        HardwareAmt: editData.HardwareAmt || "",
        InstallationAmt: editData.InstallationAmt || "",
        Remark: editData.Remark || "",
        GST: editData.GST || ""
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
      if (key === "HardwareAmt" || key === "InstallationAmt" || key === "GST") {
        v = v.replace(/[^0-9.]/g, "");
        const parts = v.split(".");
        if (parts.length > 2) {
          v = parts[0] + "." + parts.slice(1).join("");
        }
        if (v && parseFloat(v) < 0) {
          v = "0";
        }

        if (key === "GST" && v.length > 15) {
          v = v.slice(0, 15);
        }
      }
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
      setvalue((p) => ({ ...p, [key]: v }));
    }

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const gstRegex = /^[0-9A-Z]{15}$/;

  const Check_validate = () => {
    const newErrors = {};
    if (!value.Name.trim()) {
      newErrors.Name = "Name is required";
    }
    if (!value.OwnerName.trim()) {
      newErrors.OwnerName = "Owner Name is required";
    }

    if (!value.GSTNo.trim()) {
      newErrors.GSTNo = "GST No is required"
    } else if (!gstRegex.test(value.GSTNo.trim().toUpperCase())) {
      newErrors.GSTNo = "Please enter a valid GST number";
    }

    if (!value.InstallationAmt) {
      newErrors.InstallationAmt = "Installation Amount is required";
    }



    if (!value.HardwareAmt) {
      newErrors.HardwareAmt = "Hardware Amount is required"
    } else if (parseFloat(value.HardwareAmt) < 0) {
      newErrors.HardwareAmt = "Hardware Amount cannot be negative"
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
    if (!value.Area.trim()) {
      newErrors.Area = "Area is required";
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
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const payload = {
        Name: value.Name,
        OwnerName: value.OwnerName,
        OwnerMobileNo: value.OwnerMobileNo,
        OfficeMobileNo: value.OfficeMobileNo,
        ReferenceID: value.ReferenceID?.value || value.ReferenceID || "",
        Address: value.Address,
        District: value.District,
        Area: value.Area,
        GSTNo: value.GSTNo,
        MEOffice: value.MEOffice,
        FinalAmt: value.FinalAmt,
        HardwareAmt: value.HardwareAmt,
        InstallationAmt: value.InstallationAmt,
        Remark: value.Remark,
        GST: value.GST,
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
          HardwareAmt: "",
          InstallationAmt: "",
          Remark: "",
          GST: ""
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Insert_Party error:", error);
    }
  };

  const Update_Party = async (PartyID) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        PartyID: PartyID,
        Name: value.Name,
        OwnerName: value.OwnerName,
        OwnerMobileNo: value.OwnerMobileNo,
        OfficeMobileNo: value.OfficeMobileNo,
        ReferenceID: value.ReferenceID?.value || value.ReferenceID || "",
        Address: value.Address,
        District: value.District,
        Area: value.Area,
        GSTNo: value.GSTNo,
        MEOffice: value.MEOffice,
        FinalAmt: value.FinalAmt,
        HardwareAmt: value.HardwareAmt,
        InstallationAmt: value.InstallationAmt,
        Remark: value.Remark,
        GST: value.GST,
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
          HardwareAmt: "",
          InstallationAmt: "",
          Remark: "",
          GST: ""
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editData ? "Update Party" : "Add Party"}
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

            <form autoComplete="off-district"
              onSubmit={(e) => e.preventDefault()}>

              <input
                type="text"
                name="fake_name"
                autoComplete="name"
                style={{ position: "absolute", opacity: 0, height: 0 }}
              />
              <input
                type="email"
                name="fake_email"
                autoComplete="email"
                style={{ position: "absolute", opacity: 0, height: 0 }}
              />


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-slate-600">
                    GST No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={value.GSTNo}
                    onChange={handleChange("GSTNo")}
                    placeholder="Enter GST number"
                    className={inputCls}
                    autoComplete="off-district"

                  />
                  {errors.GSTNo && (
                    <p className="mt-1 text-xs text-red-500">{errors.GSTNo}</p>
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
                    Hardware Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
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
                    type="text"
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
                    Final Amt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={value.FinalAmt}
                    placeholder="Auto-calculated Final Amt"
                    className={inputCls + " bg-slate-50"}
                    readOnly
                    autoComplete="off-district"

                  />
                  {errors.FinalAmt && (
                    <p className="mt-1 text-xs text-red-500">{errors.FinalAmt}</p>
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
                    Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={value.Area}
                    onChange={handleChange("Area")}
                    placeholder="Enter area"
                    className={inputCls}
                    autoComplete="off-district"

                  />
                  {errors.Area && (
                    <p className="mt-1 text-xs text-red-500">{errors.Area}</p>
                  )}
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
                    Address
                  </label>
                  <input
                    type="text"
                    rows={3}
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
                    value={value.Remark}
                    onChange={handleChange("Remark")}
                    placeholder="Enter Remark"
                    className={inputCls + " resize-none"}
                    autoComplete="off-district"

                  />
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

export default PartyModal;

