import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const PartySettingModal = ({ open, onClose, PartyID }) => {
  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [partySettingName, setPartySettingName] = useState("");
  const [editSetting, setEditSetting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && PartyID) {
      GetData_PartySetting_ByPartyID();
    }
  }, [open, PartyID]);

  useEffect(() => {
    if (!open) {
      setPartySettingName("");
      setEditSetting(null);
      setErrors({});
      // setDeleteTarget(null);
    }
  }, [open]);

  const GetData_PartySetting_ByPartyID = async () => {
    try {
      const val = { IsActive: "1", PartyID: PartyID };
      const res = await PostWithToken("PartySetting/GetData_PartySetting", val);

      // console.log(res,'res')
      if (res && res.length > 0) {
        const existingSetting = res[0];
        setEditSetting(existingSetting);
        setPartySettingName(existingSetting.PartySettingName || "");
      } else {
        setEditSetting(null);
        setPartySettingName("");
      }
    } catch (error) {
      console.error("GetData_PartySetting_ByPartyID error:", error);
      setEditSetting(null);
      setPartySettingName("");
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!partySettingName.trim()) {
      newErrors.partySettingName = "Party Setting Name is required";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (editSetting?.SettingID) {
        Update_PartySetting(editSetting.SettingID);
      } else {
        Insert_PartySetting();
      }
    }
  };

  const Insert_PartySetting = async () => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const payload = {
        PartySettingName: partySettingName.trim(),
        CreatedByUser: auth?.UserID || "1",
        PartyID: PartyID,
      };
      const res = await PostWithToken("PartySetting/Insert_PartySetting", payload);
      if (res) {
        toastifySuccess("Party Setting inserted successfully");
        await GetData_PartySetting_ByPartyID();
        onClose?.();
      }
    } catch (error) {
      console.error("Insert_PartySetting error:", error);
    }
  };

  const Update_PartySetting = async (SettingID) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        SettingID: SettingID,
        PartySettingName: partySettingName.trim(),
        ModifiedByUser: auth?.UserID || "1",
        PartyID: PartyID,
      };
      const res = await PostWithToken("PartySetting/Update_PartySetting", val);
      if (res) {
        toastifySuccess("Party Setting updated successfully");
        await GetData_PartySetting_ByPartyID();
        onClose?.();
      }
    } catch (error) {
      console.error("Update_PartySetting error:", error);
    }
  };

  const Delete_PartySetting = async (SettingID) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        SettingID: SettingID,
        IsActive: "0",
        DeleteByUser: auth?.UserID || "1",
      };
      const res = await PostWithToken("PartySetting/Delete_PartySetting", val);
      if (res) {
        toastifySuccess("Party Setting deleted successfully");
        // setDeleteTarget(null);
        setPartySettingName("");
        setEditSetting(null);
        onClose?.();
      }
    } catch (error) {
      console.error("Delete_PartySetting error:", error);
    }
  };

  const handleCancel = () => {
    setPartySettingName("");
    setEditSetting(null);
    setErrors({});
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
                Party Settings
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

            <div className="space-y-6">
              <div  >
                <div className="flex flex-col mb-4">
                  <label className="mb-2 text-sm font-medium text-slate-700">
                    Party Setting Name <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={partySettingName}
                    onChange={(e) => {
                      setPartySettingName(e.target.value);
                      if (errors.partySettingName) {
                        setErrors((prev) => ({ ...prev, partySettingName: "" }));
                      }
                    }}
                    placeholder="Enter party setting name"
                    className={inputCls + " resize-none min-h-[200px]"}
                    autoComplete="off-district"
                  />
                  {errors.partySettingName && (
                    <p className="mt-1 text-xs text-red-500">{errors.partySettingName}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    {editSetting ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white p-4 sm:p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800">
              Delete Party Setting
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {deleteTarget.PartySettingName || "this setting"}
              </span>
              ?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={async () => {
                  await Delete_PartySetting(deleteTarget.SettingID);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PartySettingModal;
