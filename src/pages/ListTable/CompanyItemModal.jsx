import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { PostWithToken, Comman_changeArrayFormat } from "../../ApiMethods/ApiMethods";
import { toastifySuccess } from "../../Utility/Utility";

const CompanyItemModal = ({ open, onClose, editData, onSuccess }) => {
  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [form, setForm] = useState({
    ItemID: null,
    CompanyID: null,
    Description: "",
  });

  const [itemOptions, setItemOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
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
        ItemID: null,
        CompanyID: null,
        Description: "",
      });
      setErrors({});
      setCompanyOptions([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    GetItemDropdown();
  }, [open]);

  useEffect(() => {
    if (form.ItemID?.value) {
      GetCompanyDropdown(form.ItemID.value);
    } else {
      setCompanyOptions([]);
      setForm((p) => ({ ...p, CompanyID: null }));
    }
  }, [form.ItemID]);

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

  const GetCompanyDropdown = async (ItemID) => {
    try {
      const val = { ItemID: ItemID };
      const res = await PostWithToken("CompanyItem/GetDropDownData_CompanyItem", val);
      if (res) {
        setCompanyOptions(Comman_changeArrayFormat(res, "CompanyID", "Description"));
      } else {
        setCompanyOptions([]);
      }
    } catch (error) {
      console.error("GetCompanyDropdown error:", error);
      setCompanyOptions([]);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (editData) {
      const itemOption = itemOptions.find((opt) => opt.value === editData.ItemID || opt.value === String(editData.ItemID));
      setForm({
        ItemID: itemOption || null,
        CompanyID: null, 
        Description: editData.Description || "",
      });

      if (editData.ItemID) {
        GetCompanyDropdown(editData.ItemID).then(() => {
          setTimeout(() => {
            const companyOption = companyOptions.find(
              (opt) => opt.value === editData.CompanyID || opt.value === String(editData.CompanyID)
            );
            setForm((p) => ({ ...p, CompanyID: companyOption || null }));
          }, 100);
        });
      }
    } else {
      setForm({
        ItemID: null,
        CompanyID: null,
        Description: "",
      });
      setErrors({});
    }
  }, [editData, open, itemOptions]);

  useEffect(() => {
    if (editData && companyOptions.length > 0 && !form.CompanyID) {
      const companyOption = companyOptions.find(
        (opt) => opt.value === editData.CompanyID || opt.value === String(editData.CompanyID)
      );
      if (companyOption) {
        setForm((p) => ({ ...p, CompanyID: companyOption }));
      }
    }
  }, [companyOptions, editData]);

  const handleChange = (key) => (e) => {
    let v = e.target.value;
    setForm((p) => ({ ...p, [key]: v }));
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#cbd5e1",
      minHeight: "42px",
      "&:hover": { borderColor: "#2563eb" },
    }),
  };

  const Check_validate = () => {
    const newErrors = {};
    if (!form.ItemID) {
      newErrors.ItemID = "Item is required";
    }
    if (editData?.CompanyID && !form.CompanyID) {
      newErrors.CompanyID = "Company is required";
    }
    if (!form.Description.trim()) {
      newErrors.Description = "Description is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors)?.length === 0) {
      if (editData?.CompanyID) {
        Update_CompanyItem(editData.CompanyID);
      } else {
        Insert_CompanyItem();
      }
    }
  };

  const Insert_CompanyItem = async () => {
    try {
      const val = {
        Description: form.Description,
        ItemID: form.ItemID.value,
      };
      if (form.CompanyID?.value) {
        val.CompanyID = form.CompanyID.value;
      }
      const res = await PostWithToken("CompanyItem/Insert_CompanyItem", val);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Company Item inserted successfully");
        setForm({
          ItemID: null,
          CompanyID: null,
          Description: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Insert_CompanyItem error:", error);
    }
  };

  const Update_CompanyItem = async (CompanyID) => {
    try {
      const val = {
        Description: form.Description,
        ItemID: form.ItemID.value,
        CompanyID: CompanyID,
      };
      const res = await PostWithToken("CompanyItem/Update_CompanyItem", val);
      if (res) {
        onClose?.();
        onSuccess?.();
        toastifySuccess("Company Item updated successfully");
        setForm({
          ItemID: null,
          CompanyID: null,
          Description: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Update_CompanyItem error:", error);
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
                {editData ? "Update Company Item" : "Add Company Item"}
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
                  Item <span className="text-red-500">*</span>
                </label>
                <Select
                  value={form.ItemID}
                  onChange={(opt) => setForm((p) => ({ ...p, ItemID: opt, CompanyID: null }))}
                  options={itemOptions}
                  placeholder="Select item..."
                  styles={selectStyles}
                  isClearable
                />
                {errors.ItemID && (
                  <p className="mt-1 text-xs text-red-500">{errors.ItemID}</p>
                )}
              </div>

              <div className="flex flex-col sm:col-span-2">
                <label className="mb-1 text-sm font-medium text-slate-600">
                  Company {editData?.CompanyID && <span className="text-red-500">*</span>}
                </label>
                <Select
                  value={form.CompanyID}
                  onChange={(opt) => setForm((p) => ({ ...p, CompanyID: opt }))}
                  options={companyOptions}
                  placeholder={form.ItemID ? "Select company..." : "Please select item first"}
                  styles={selectStyles}
                  isClearable
                  isDisabled={!form.ItemID}
                />
                {errors.CompanyID && (
                  <p className="mt-1 text-xs text-red-500">{errors.CompanyID}</p>
                )}
              </div>

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

export default CompanyItemModal;

