import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import DataTable from "react-data-table-component";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import { PostWithToken } from "../ApiMethods/ApiMethods";
import { toastifySuccess } from "../Utility/Utility";

const AgentModal = ({ open, onClose, onSave, editData, onSuccess }) => {
    const inputCls = "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " + "outline-none transition " + "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";


    const [value, setvalue] = useState({
        ReferenceName: "",
        MobileNo: "",
        firmName: "",
        email: "",
        gst: "",
        address: "",
        commission: "",
    });

    const [rows, setRows] = useState([
        {
            id: "1",
            item: "Cement",
            rate: 420,
            company: "UltraTech, ACC",
            modelNo: "CM-101",
            description: "OPC 53 Grade",
        },
        {
            id: "2",
            item: "Steel",
            rate: 61000,
            company: "Tata",
            modelNo: "ST-500",
            description: "TMT Bars 500D",
        },
    ]);

    const handleSupplierChange = (key) => (e) => {
        let v = e.target.value;
        if (key === "MobileNo") {
            v = v.replace(/\D/g, "").slice(0, 10);
        }
        if (key === "commission") {
            v = v.replace(/\D/g, "");
        }
        setvalue((p) => ({ ...p, [key]: v }));
    };


    const [localEdit, setLocalEdit] = useState(null);
    const activeEdit = editData ?? localEdit;

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
            modelNo: activeEdit?.modelNo ?? "",
            description: activeEdit?.description ?? "",
        }),
        [activeEdit]
    );

    const [form, setForm] = useState(initialForm);
    const [search, setSearch] = useState("");

    useEffect(() => setForm(initialForm), [initialForm]);

    useEffect(() => {
        if (!open) return;
        const onEsc = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) {
            setLocalEdit(null);
            setSearch("");
        }
    }, [open]);


    const companyOptions = [
        { value: "UltraTech", label: "UltraTech" },
        { value: "Ambuja", label: "Ambuja" },
        { value: "ACC", label: "ACC" },
        { value: "Tata", label: "Tata" },
    ];

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

    const handleAddOrUpdate = (e) => {
        e.preventDefault();

        if (!form.item) return alert("Item required");
        if (!form.rate.trim()) return alert("Rate required");
        if (Number(form.rate) <= 0) return alert("Rate must be greater than 0");

        const id = activeEdit?.id ?? String(Date.now());

        const payload = {
            id,
            item: form.item.label,
            rate: Number(form.rate),
            company: (form.company || []).map((c) => c.label).join(", "),
            modelNo: form.modelNo.trim(),
            description: form.description.trim(),
        };

        setRows((prev) => {
            const exists = prev.some((r) => r.id === id);
            if (exists) return prev.map((r) => (r.id === id ? payload : r));
            return [payload, ...prev];
        });

        onSave?.(payload);

        setLocalEdit(null);
        setForm({ item: null, rate: "", company: [], modelNo: "", description: "" });
    };

    const handleEdit = useCallback((row) => setLocalEdit(row), []);
    const handleDelete = useCallback((row) => {
        if (!window.confirm("Delete this item?")) return;
        setRows((p) => p.filter((x) => x.id !== row.id));
    }, []);

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => {
            const hay = `${r.item} ${r.rate} ${r.company} ${r.modelNo} ${r.description}`.toLowerCase();
            return hay.includes(q);
        });
    }, [rows, search]);

    const columns = useMemo(
        () => [
            { name: "Item", selector: (r) => r?.item || "", sortable: true, },
            { name: "Rate", selector: (r) => (r?.rate ?? ""), sortable: true, },
            { name: "Company", selector: (r) => r?.company || "", },
            { name: "Model No.", selector: (r) => r?.modelNo || "", },
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
                                onClick={() => handleDelete(row)}
                                className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
                                title="Delete"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    ) : null,
            },
        ],
        [handleDelete, handleEdit]
    );

    const tableData = (filteredItems && filteredItems.length > 0) ? filteredItems : [{}];

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

    const Check_validate = () => {
        const newErrors = {};
        if (!value.ReferenceName.trim()) {
            newErrors.ReferenceName = "ReferenceName is required";
        }
        if (!value.commission) {
            newErrors.commission = "commission is required";
        }
        if (!value.MobileNo.trim()) {
            newErrors.MobileNo = "MobileNo is required";
        }
        else if (value.MobileNo.length < 10) {
            newErrors.MobileNo = "Check MobileNo";
        }
        setErrors(newErrors);
        if (Object.keys(newErrors)?.length === 0) {
            if (editData?.ReferenceID) {
                Update_Reference(editData?.ReferenceID)
            } else {
                Insert_Reference();
            }
        }
    };

    useEffect(() => {
        if (!open) return;

        if (editData) {
            setvalue({
                ReferenceName: editData.ReferenceName ?? "",
                MobileNo: editData.MobileNo ?? "",
                commission: editData.commission ?? "",
            });
            setErrors({});
        } else {
            setErrors({});
        }
    }, [editData, open]);

    const Insert_Reference = async () => {
        try {
            const res = await PostWithToken('Reference/Insert_Reference', value)
            if (res) {
                onClose?.();
                onSuccess?.();
                toastifySuccess('Reference inserted successfully');
                setvalue({
                    ReferenceName: "",
                    MobileNo: "",
                });
                setErrors({});
            }
        } catch (error) {
            console.log(error, 'error')
        }
    }

    const Update_Reference = async (ReferenceID) => {
        try {
            const { ReferenceName, MobileNo, commission } = value;
            const val = {
                ReferenceID: ReferenceID,
                ReferenceName: ReferenceName,
                MobileNo: MobileNo,
                commission: commission,

            }
            const res = await PostWithToken('Reference/Update_Reference', val)
            if (res) {
                onClose?.();
                onSuccess?.();
                toastifySuccess('Reference Update successfully');
                setvalue({
                    ReferenceName: "",
                    MobileNo: "",
                });
                setErrors({});
            }
        } catch (error) {
            console.log(error, 'error')
        }
    }




    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

            <div className="relative mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
                <div className="w-full max-w-6xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 my-4 max-h-[95vh] overflow-y-auto">
                    <div className="p-3 sm:p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                                {editData ? "Update Agent" : "Add Agent"}
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

                        <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>

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

                            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                                    <label className="mb-1 text-sm font-medium text-slate-600">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            value={value.ReferenceName}
                                            onChange={handleSupplierChange("ReferenceName")}
                                            autoComplete="off-district"

                                            placeholder="Enter full name"
                                            className={inputCls}
                                        />
                                        {errors.ReferenceName && (
                                            <p className="text-red-500 text-xs">{errors.ReferenceName}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                                    <label className="mb-1 text-sm font-medium text-slate-600">
                                        MobileNo <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            value={value.MobileNo}
                                            onChange={handleSupplierChange("MobileNo")}
                                            autoComplete="off-district"

                                            placeholder="Enter mobile number"
                                            className={inputCls}
                                        />
                                        {errors.MobileNo && (
                                            <p className="text-red-500 text-xs">{errors.MobileNo}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:col-span-2 lg:col-span-1">
                                    <label className="mb-1 text-sm font-medium text-slate-600">
                                        commission <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            value={value.commission}
                                            onChange={handleSupplierChange("commission")}
                                            autoComplete="off-district"

                                            placeholder="Enter Commission"
                                            className={inputCls}
                                        />
                                        {errors.commission && (
                                            <p className="text-red-500 text-xs">{errors.commission}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </form>


                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                            {editData ? (
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                    onClick={Check_validate}
                                >
                                    Update
                                </button>
                            ) : (
                                <button
                                    type="submit"
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
}

export default AgentModal;