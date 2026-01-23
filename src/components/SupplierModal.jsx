import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import DataTable from "react-data-table-component";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import { Comman_changeArrayFormat, PostWithToken } from "../ApiMethods/ApiMethods";
import { toastifySuccess } from "../Utility/Utility";



const SupplierModal = ({ open, onClose, onSave, editData, onSaveSupplier, onSuccess }) => {
  const inputCls =
    "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
    "outline-none transition " +
    "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

  const [localEdit, setLocalEdit] = useState(null);
  const [rows, setRows] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [tableError, setTableError] = useState("");
  const [deleteItemTarget, setDeleteItemTarget] = useState(null);



  const activeEdit = editData ?? localEdit;
  const [supplierForm, setSupplierForm] = useState({
    fullName: "",
    mobile: "",
    firmName: "",
    email: "",
    gst: "",
    Address: "",
  });



  const handleSupplierChange = (key) => (e) => {
    let v = e.target.value;
    if (key === "mobile") {
      v = v.replace(/\D/g, "").slice(0, 10);
    }
    if (key === "gst") {
      v = v.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15);
    }

    setSupplierForm((p) => ({ ...p, [key]: v }));
  };


  const initialForm = useMemo(
    () => ({
      item: activeEdit?.item ? { value: activeEdit.item, label: activeEdit.item } : null,
      rate: activeEdit?.rate?.toString?.() ?? "",
      company: activeEdit?.company
        ? String(activeEdit.company)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
          .map((x) => ({ value: x, label: x }))
        : [],
      ModelNo: activeEdit?.ModelNo ?? "",
      description: activeEdit?.description ?? "",
    }),
    [activeEdit]
  );


  useEffect(() => setForm(initialForm), [initialForm]);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setLocalEdit(null);
      setSupplierForm({
        fullName: "",
        mobile: "",
        firmName: "",
        email: "",
        gst: "",
        Address: "",
      });
      setRows([]);
      setForm({ item: null, rate: "", company: [], ModelNo: "", description: "" });
    } else if (open && editData) {
      setSupplierForm({
        fullName: editData?.Table[0]?.FullName || editData?.Table[0]?.fullName || "",
        mobile: editData?.Table[0]?.MobileNo || editData?.Table[0]?.mobile || "",
        firmName: editData?.Table[0]?.FirmName || editData?.Table[0]?.firmName || "",
        email: editData?.Table[0]?.EmailId || editData?.Table[0]?.Email || editData?.Table[0]?.email || "",
        gst: editData?.Table[0]?.GSTNo || editData?.Table[0]?.gst || "",
        Address: editData?.Table[0]?.Address || editData?.Table[0]?.Address || "",
      });

      if (editData?.Table1) {
        const formattedRows = editData.Table1.map((item, index) => ({
          id: String(item.ID || index + 1),
          item: item.ItemName || "",
          rate: item.Rate || 0,
          company: item.CompanyName || "",
          ModelNo: item.ModelNo || "",
          description: item.Description || "",
          ItemID: item.ItemID || "",
          CompanyID: item.CompanyID || "",
        }));
        setRows(formattedRows);
      }
    }
  }, [open, editData]);





  useEffect(() => {
    if (form?.item?.value) {
      GetDropDownData_CompanyItem(form?.item?.value)
    }
  }, [form?.item?.value])

  useEffect(() => {
    if (localEdit && itemOptions.length > 0) {
      let selectedItem = null;

      if (localEdit.ItemID) {
        selectedItem = itemOptions.find((opt) => String(opt.value) === String(localEdit.ItemID));
      }

      if (!selectedItem && localEdit.item) {
        selectedItem = itemOptions.find((opt) => {
          const optLabel = String(opt.label || "").toLowerCase();
          const optValue = String(opt.value || "").toLowerCase();
          const editItem = String(localEdit.item || "").toLowerCase();
          return optLabel === editItem || optValue === editItem;
        });
      }

      if (selectedItem) {
        setForm((prev) => ({
          ...prev,
          item: selectedItem,
          rate: String(localEdit.rate || ""),
          ModelNo: localEdit.ModelNo || "",
          description: localEdit.description || "",
        }));

        if (localEdit.ItemID) {
          GetDropDownData_CompanyItem(localEdit.ItemID);
        } else if (selectedItem.value) {
          GetDropDownData_CompanyItem(selectedItem.value);
        }
      } else {
        setForm((prev) => ({
          ...prev,
          item: null,
          rate: String(localEdit.rate || ""),
          ModelNo: localEdit.ModelNo || "",
          description: localEdit.description || "",
          company: [],
        }));
      }
    }
  }, [localEdit, itemOptions]);


  useEffect(() => {
    if (localEdit && companyOptions.length > 0) {
      let selectedCompanies = [];

      if (localEdit.CompanyID) {
        selectedCompanies = companyOptions.filter((opt) =>
          String(opt.value) === String(localEdit.CompanyID)
        );
      }

      if (selectedCompanies.length === 0 && localEdit.company) {
        const companyName = typeof localEdit.company === "string"
          ? localEdit.company.split(",")[0].trim()
          : String(localEdit.company || "");

        const companyNameLower = companyName.toLowerCase();

        selectedCompanies = companyOptions.filter((opt) => {
          const optLabel = String(opt.label || "").toLowerCase();
          const optValue = String(opt.value || "").toLowerCase();
          return optLabel === companyNameLower || optValue === companyNameLower;
        });
      }

      if (selectedCompanies.length > 0) {
        setForm((prev) => ({
          ...prev,
          company: selectedCompanies,
        }));
      }
    }
  }, [companyOptions, localEdit]);

  useEffect(() => {
    if (!open) return;
    GetDropDown_Item()
  }, [open])

  const GetDropDown_Item = async () => {
    try {
      const res = await PostWithToken('Item/GetDropDown_Item');
      if (res) {
        setItemOptions(Comman_changeArrayFormat(res, 'ItemID', 'Description'))
      }
    } catch (error) {
      console.log(error);
    }
  }

  const GetDropDownData_CompanyItem = async (ItemID) => {
    const val = { 'ItemID': ItemID }
    try {
      const res = await PostWithToken('CompanyItem/GetDropDownData_CompanyItem', val);
      if (res) {
        setCompanyOptions(Comman_changeArrayFormat(res, 'CompanyID', 'Description'))
      }
    } catch (error) {
      console.log(error);
    }
  }

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      width: "100%",
      borderRadius: 6,
      borderColor: state.isFocused ? "#2563eb" : "#e2e8f0",
      boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
      minHeight: 42,
      paddingLeft: 6,
      paddingRight: 6,
      fontSize: 14,
      transition: "all 150ms",
      "&:hover": { borderColor: state.isFocused ? "#2563eb" : "#e2e8f0" },
    }),
    valueContainer: (base) => ({ ...base, padding: "2px 6px" }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    placeholder: (base) => ({ ...base, color: "#94a3b8" }),
    multiValue: (base) => ({ ...base, borderRadius: 6, backgroundColor: "#f1f5f9" }),
    multiValueLabel: (base) => ({ ...base, fontSize: 12, color: "#0f172a" }),
    multiValueRemove: (base) => ({
      ...base,
      borderRadius: 10,
      ":hover": { backgroundColor: "#e2e8f0", color: "#0f172a" },
    }),
    menu: (base) => ({ ...base, borderRadius: 6, overflow: "hidden" }),
  };

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    if (key === "rate") {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }
    setForm((p) => ({ ...p, [key]: value }));
  };

  const [error2, seterror2] = useState({})

  const handleAddOrUpdate = (e) => {
    e.preventDefault();

    let newErr = {};

    if (!form.item) {
      newErr.item = "Item is required";
    }

    if (!form.rate.trim()) {
      newErr.rate = "Rate is required";
    } else if (Number(form.rate) <= 0) {
      newErr.rate = "Rate must be greater than 0";
    }

    if (!form.company || form.company.length === 0) {
      newErr.company = "Company is required";
    }

    if (!form.ModelNo.trim()) {
      newErr.ModelNo = "Model No is required";
    }

    if (!form.description.trim()) {
      newErr.description = "Description is required";
    }

    seterror2(newErr);

    if (Object.keys(newErr).length > 0) return;
    const id =
      localEdit?.id ||
      activeEdit?.id ||
      String(Date.now());
    const payload = {
      id,
      item: form.item.label,
      rate: Number(form.rate),
      company: form.company.map((c) => c.label).join(", "),
      ModelNo: form.ModelNo.trim(),
      description: form.description.trim(),
    };
    setRows((prev) => {
      const exists = prev.some((r) => r.id === id);
      if (exists) {
        return prev.map((r) => (r.id === id ? payload : r));
      }
      return [...prev, payload];
    });
    setLocalEdit(null);
    setForm({
      item: null,
      rate: "",
      company: [],
      ModelNo: "",
      description: "",
    });

    seterror2({});
  };

  const handleEdit = useCallback((row) => {
    setLocalEdit(row);
  }, []);

  const handleDelete = useCallback((row) => {
    if (!window.confirm("Delete this item?")) return;
    setRows((p) => p.filter((x) => x.id !== row.id));
  }, []);



  const columns = useMemo(
    () => [
      { name: "Item", selector: (r) => r?.item || "", sortable: true, },
      { name: "Rate", selector: (r) => (r?.rate ?? ""), sortable: true, },
      { name: "Company", selector: (r) => r?.company || "", },
      { name: "Model No.", selector: (r) => r?.ModelNo || "", },
      { name: "Description", selector: (r) => r?.description || "", },
      {
        name: "Action",
        width: "120px",
        cell: (row) =>
          row?.id ? (


            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleEdit(row)}
                className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
                title="Edit"
              >
                <FaRegEdit className="text-base" />
              </button>
              <button
                type="button"
                onClick={() => { setDeleteItemTarget(row); }}
                className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
                title="Delete"
              >
                <FiTrash2 />
              </button>
            </div >
          ) : null,
      },
    ],
    [handleDelete, handleEdit]
  );

  const tableStyles = {
    headRow: { style: { backgroundColor: "#2563eb", minHeight: "44px" } },
    headCells: {
      style: {
        backgroundColor: "#2563eb",
        color: "#fff",
        fontWeight: 700,
        textTransform: "uppercase",
        fontSize: "12px",
        letterSpacing: "0.06em",
        borderBottom: "0",
      },
    },
    rows: { style: { minHeight: "52px" } },
    cells: { style: { padding: "12px" } },
  };


  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const gstRegex = /^[0-9A-Z]{15}$/;

  const validateAndSubmit = () => {
    const newErrors = {};

    if (!supplierForm.fullName?.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (!supplierForm.Address?.trim()) {
      newErrors.Address = "Address is required";
    }

    if (!supplierForm.firmName?.trim()) {
      newErrors.firmName = "Firm name is required";
    }

    if (!supplierForm.gst?.trim()) {
      newErrors.gst = "GST is required";
    } else if (!gstRegex.test(supplierForm.gst.trim().toUpperCase())) {
      newErrors.gst = "Please enter a valid GST number";
    }

    if (!supplierForm.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(supplierForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!supplierForm.mobile?.trim()) {
      newErrors.mobile = "Mobile is required";
    } else if (supplierForm.mobile.length !== 10) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!rows || rows.length === 0) {
      setTableError("Please add at least one item");
    } else {
      setTableError("");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && rows && rows.length > 0) {
      InsertSupply(editData?.Table?.[0]?.SupplyId || "");
    }
  };



  const InsertSupply = async (SupplyID) => {
    try {
      const val = {
        FullName: supplierForm.fullName,
        MobileNo: supplierForm.mobile,
        FirmName: supplierForm.firmName,
        EmailId: supplierForm.email,
        Address: supplierForm.Address,
        GSTNo: supplierForm.gst,
        SupplyID: SupplyID || "",
        SupplyDetailslists: rows.map((r) => ({
          ItemName: r.item || "",
          ItemID: r.ItemID || "",
          CompanyName: r.company || "",
          ModelNo: r.ModelNo || "",
          Rate: String(r.rate || ""),
          Description: r.description || "",
        })),
      };
      const res = await PostWithToken("Supply/InsertSupply", val);
      if (res) {
        toastifySuccess("Supplier inserted successfully");
        setSupplierForm({ fullName: "", mobile: "", firmName: "", email: "", gst: "", Address: "", });
        setRows([]);
        setForm({ item: null, rate: "", company: [], ModelNo: "", description: "" });
        onClose?.();
        onSuccess?.();
      }
    } catch (error) {
      console.error("InsertSupply error:", error);
    }
  };




  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-6xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 my-2 sm:my-4 max-h-[98vh] sm:max-h-[95vh] overflow-y-auto">

          <div className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-800">
                {editData ? "Update Supplier" : "Add Supplier"}
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
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-4 flex flex-col">
                  <input
                    type="text"
                    value={supplierForm.fullName}
                    onChange={handleSupplierChange("fullName")}
                    placeholder="Enter full name"
                    className={inputCls}


                    autoComplete="off-district"

                  />
                  <p className="text-red-500 text-xs mt-1 min-h-[14px]">
                    {errors.fullName || ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-4 flex flex-col">
                  <input
                    type="text"
                    value={supplierForm.mobile}
                    onChange={handleSupplierChange("mobile")}
                    placeholder="Enter mobile number"
                    className={inputCls}
                    autoComplete="off-district"

                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-xs mt-1 min-h-[14px]">{errors.mobile}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap">
                  Firm Name<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-4 flex flex-col">
                  <input
                    type="text"
                    value={supplierForm.firmName}
                    onChange={handleSupplierChange("firmName")}
                    placeholder="Enter firm name"
                    className={inputCls}
                    autoComplete="off-district"

                  />
                  {errors.firmName && (
                    <p className="text-red-500 text-xs mt-1 min-h-[14px]">{errors.firmName}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap">
                  Email<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-4 flex flex-col">
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={handleSupplierChange("email")}
                    placeholder="example@email.com"
                    className={inputCls}
                    autoComplete="off-district"

                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 min-h-[14px]">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:gap-3">
                <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap">
                  GST No.<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-4 flex flex-col">
                  <input
                    type="text"
                    value={supplierForm.gst}
                    onChange={handleSupplierChange("gst")}
                    placeholder="Enter GST number"
                    className={inputCls}
                    autoComplete="off-district"

                  />
                  {errors.gst && (
                    <p className="text-red-500 text-xs mt-1 min-h-[14px]">{errors.gst}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:grid sm:grid-cols-6 sm:col-span-2  gap-2 sm:gap-3 sm:items-start">
                <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap sm:pt-2">
                  Address<span className="text-red-500">*</span>
                </label>
                <div className="sm:col-span-4 flex flex-col w-full">
                  <textarea
                    rows={2}
                    value={supplierForm.Address}
                    autoComplete="off-district"

                    onChange={handleSupplierChange("Address")}
                    placeholder="Enter Address"
                    className={inputCls + " resize-none"}
                  />
                  {errors.Address && (
                    <p className="text-red-500 text-xs mt-1 min-h-[14px]">{errors.Address}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm mt-3 sm:mt-4">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800 mb-3">Items</h3>
              <form onSubmit={handleAddOrUpdate} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  <div className="flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:gap-3">
                    <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap">
                      Item
                    </label>
                    <div className="sm:col-span-4">
                      <CreatableSelect
                        value={form.item}
                        onChange={(opt) => setForm((p) => ({ ...p, item: opt }))}
                        options={itemOptions}
                        placeholder="Select or create item..."
                        styles={selectStyles}
                        isClearable
                        formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                      />
                      {error2.item && (
                        <p className="text-red-500 text-xs mt-1 min-h-[14px]">{error2.item}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:gap-3">
                    <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap">
                      Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="sm:col-span-4 flex flex-col">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={form.rate}
                        onChange={handleChange("rate")}
                        placeholder="Enter rate"
                        className={inputCls}
                        autoComplete="off-district"

                      />
                      {error2.rate && (
                        <p className="text-red-500 text-xs mt-1 min-h-[14px]">{error2.rate}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:gap-3">
                    <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap">
                      Company Name
                    </label>
                    <div className="sm:col-span-4">
                      <CreatableSelect
                        isMulti
                        value={form.company}
                        onChange={(opts) => setForm((p) => ({ ...p, company: opts || [] }))}
                        options={companyOptions}
                        placeholder="Select or create companies..."
                        styles={selectStyles}
                        isClearable
                        isDisabled={!form.item}
                        formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                      />
                      {error2.company && (
                        <p className="text-red-500 text-xs mt-1 min-h-[14px]">{error2.company}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:gap-3">
                    <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap">
                      Model No.<span className="text-red-500">*</span>
                    </label>
                    <div className="sm:col-span-4 flex flex-col">
                      <input
                        type="text"
                        value={form.ModelNo}
                        onChange={handleChange("ModelNo")}
                        placeholder="Enter model no."
                        className={inputCls}
                        autoComplete="off-district"

                      />
                      {error2.ModelNo && (
                        <p className="text-red-500 text-xs mt-1 min-h-[14px]">{error2.ModelNo}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:gap-3">
                    <label className="text-sm font-medium text-slate-600 sm:col-span-2 sm:text-right sm:whitespace-nowrap">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <div className="sm:col-span-4 flex flex-col">
                      <input
                        type="text"
                        value={form.description}
                        onChange={handleChange("description")}
                        placeholder="Enter description"
                        className={inputCls}
                        autoComplete="off-district"

                      />
                      {error2.description && (
                        <p className="text-red-500 text-xs mt-1 min-h-[14px]">{error2.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleAddOrUpdate}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    {localEdit ? "Update Item" : "Add Item"}
                  </button>
                </div>
                {tableError && (
                  <p className="mb-2 text-sm text-red-600 font-medium">
                    {tableError}
                  </p>
                )}



              </form>

              <div className="mt-3 sm:mt-4 overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={rows}
                  pagination={rows?.length > 0}
                  highlightOnHover={rows?.length > 0}
                  striped
                  fixedHeader
                  fixedHeaderScrollHeight="200px"
                  responsive
                  customStyles={tableStyles}
                  noDataComponent={null}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              {editData ? (
                <button
                  type="button"
                  onClick={validateAndSubmit}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Update
                </button>
              ) : (
                <button
                  type="button"
                  onClick={validateAndSubmit}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save
                </button>
              )}
            </div>



          </div>
        </div>
      </div>

      {deleteItemTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setDeleteItemTarget(null)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white p-4 sm:p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800">Delete Item</h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this item?
              {deleteItemTarget.item && (
                <span className="font-semibold"> ({deleteItemTarget.item})</span>
              )}
            </p>
            <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setDeleteItemTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={async () => {
                  setRows((p) => p.filter((item) => item?.id !== deleteItemTarget?.id));
                  setDeleteItemTarget(null);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierModal;