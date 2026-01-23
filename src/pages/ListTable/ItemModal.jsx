import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const ItemModal = ({ open, onClose, editData, onSuccess }) => {
  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [form, setForm] = useState({
    Description: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setForm({
        Description: "",
      });
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (editData) {
      setForm({
        Description: editData.Description || "",
      });
      setErrors({});
    } else {
      setForm({
        Description: "",
      });
      setErrors({});
    }
  }, [editData, open]);

  const handleChange = (key) => (e) => {
    let v = e.target.value;
    setForm((p) => ({ ...p, [key]: v }));
  };

  const Check_validate = () => {
    const newErrors = {};
    if (!form.Description.trim()) {
      newErrors.Description = "Description is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors)?.length === 0) {
      if (editData?.ItemID) {
        Update_Item(editData.ItemID);
      } else {
        Insert_Item();
      }
    }
  };

  const Insert_Item = async () => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        Description: form.Description,
        CreatedByUser: auth?.UserID || "0",
      };
      const res = await PostWithToken("Item/Insert_Item", val);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Item inserted successfully");
        setForm({
          Description: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Insert_Item error:", error);
    }
  };

  const Update_Item = async (ItemID) => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("UserData"));
      const val = {
        Description: form.Description,
        ModifiedByUser: auth?.UserID || "0",
        ItemID: ItemID,
      };
      const res = await PostWithToken("Item/Update_Item", val);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Item updated successfully");
        setForm({
          Description: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Update_Item error:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 my-4 max-h-[95vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                {editData ? "Update Item" : "Add Item"}
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

              <div className="flex flex-col sm:col-span-2">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.Description}
                  onChange={handleChange("Description")}
                  placeholder="Enter description"
                  className={inputCls + " resize-none"}
                />
                {errors.Description && (
                  <p className="mt-1 text-xs text-red-500">{errors.Description}</p>
                )}
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

export default ItemModal;

