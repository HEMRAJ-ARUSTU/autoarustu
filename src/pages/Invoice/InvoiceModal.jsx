import React, { useEffect, useState } from "react";
import { FiCalendar, FiX } from "react-icons/fi";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess, toastifyError } from "../../Utility/Utility";

const InvoiceModal = ({ open, onClose, editData, onSuccess }) => {
    const inputCls =
        "w-full rounded-sm border border-slate-200 px-4 py-2.5 text-sm " +
        "outline-none transition " +
        "focus:border-[#2563eb] focus:shadow-[0_0_0_1px_#2563eb]";

    const [value, setValue] = useState({
        InvoiceNo: 'Auto Generated',
        InvoiceDate: new Date().toISOString().split('T')[0],
        ModeOfPayment: "",
        BuyerOrderNo: "",
        BuyerOrderDate: "",
        DispatchedThrough: "",
        Destination: "",
        SellerName: "",
        SellerAddress: "",
        SellerGSTIN: "",
        SellerState: "",
        SellerStateCode: "",
        BuyerName: "",
        BuyerAddress: "",
        BuyerGSTIN: "",
        BuyerState: "",
        BuyerStateCode: "",
        DescriptionOfGoods: "",
        HSN_SAC: "",
        Quantity: "",
        Unit: "Nos",
        Rate: "",
        Amount: "",
        DeliveryNoteDate: "",
        DispatchDocNo: "",
        ReferenceNo: "",
        DeliveryNote: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setValue({
                InvoiceNo: "",
                InvoiceDate: new Date().toISOString().split('T')[0],
                ModeOfPayment: "",
                BuyerOrderNo: "",
                BuyerOrderDate: "",
                DispatchedThrough: "",
                Destination: "",
                SellerName: "",
                SellerAddress: "",
                SellerGSTIN: "",
                SellerState: "",
                SellerStateCode: "",
                BuyerName: "",
                BuyerAddress: "",
                BuyerGSTIN: "",
                BuyerState: "",
                BuyerStateCode: "",
                DescriptionOfGoods: "",
                HSN_SAC: "",
                Quantity: "",
                Unit: "Nos",
                Rate: "",
                Amount: "",
                DeliveryNoteDate: "",
                DispatchDocNo: "",
                ReferenceNo: "",
                DeliveryNote: "",
            });
            setErrors({});
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        if (editData) {
            const data = editData || {};

            const itemData = (data.items && data.items.length > 0) ? data.items[0] : data;
            setValue({
                InvoiceNo: data.InvoiceNo || "",
                InvoiceDate: data.InvoiceDate ? new Date(data.InvoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                ModeOfPayment: data.ModeOfPayment || "",
                BuyerOrderNo: data.BuyerOrderNo || "",
                BuyerOrderDate: data.BuyerOrderDate ? new Date(data.BuyerOrderDate).toISOString().split('T')[0] : "",
                DispatchedThrough: data.DispatchedThrough || "",
                Destination: data.Destination || "",
                SellerName: data.SellerName || "",
                SellerAddress: data.SellerAddress || "",
                SellerGSTIN: data.SellerGSTIN || "",
                SellerState: data.SellerState || "",
                SellerStateCode: data.SellerStateCode || "",
                BuyerName: data.BuyerName || "",
                BuyerAddress: data.BuyerAddress || "",
                BuyerGSTIN: data.BuyerGSTIN || "",
                BuyerState: data.BuyerState || "",
                BuyerStateCode: data.BuyerStateCode || "",
                DescriptionOfGoods: itemData.DescriptionOfGoods || "",
                HSN_SAC: itemData.HSN_SAC || "",
                Quantity: itemData.Quantity || "",
                Unit: itemData.Unit || "Nos",
                Rate: itemData.Rate || "",
                Amount: itemData.Amount || "",
                DeliveryNoteDate: data.DeliveryNoteDate ? new Date(data.DeliveryNoteDate).toISOString().split('T')[0] : "",
                DispatchDocNo: data.DispatchDocNo || "",
                ReferenceNo: data.ReferenceNo || "",
                DeliveryNote: data.DeliveryNote || "",
            });
        }
    }, [editData, open]);

    useEffect(() => {
        if (!open) return;
        const onEsc = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [open, onClose]);

    const handleChange = (field, val) => {

        if (field === "SellerGSTIN" || field === "BuyerGSTIN") {

            val = val.replace(/[^A-Za-z0-9]/g, '');

            val = val.toUpperCase();
        }

        setValue((prev) => ({ ...prev, [field]: val }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }

        if (field === "Quantity" || field === "Rate") {
            const qty = field === "Quantity" ? val : value.Quantity;
            const rate = field === "Rate" ? val : value.Rate;
            if (qty && rate) {
                const amount = parseFloat(qty) * parseFloat(rate);
                setValue((prev) => ({ ...prev, Amount: amount.toFixed(2) }));
            } else {
                setValue((prev) => ({ ...prev, Amount: "" }));
            }
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!value.InvoiceDate) {
            newErrors.InvoiceDate = "Invoice Date is required";
        }

        if (!value.SellerName || value.SellerName.trim() === "") {
            newErrors.SellerName = "Seller Name is required";
        }

        if (!value.BuyerName || value.BuyerName.trim() === "") {
            newErrors.BuyerName = "Buyer Name is required";
        }

        if (!value.DescriptionOfGoods || value.DescriptionOfGoods.trim() === "") {
            newErrors.DescriptionOfGoods = "Description of Goods is required";
        }

        if (!value.Quantity || value.Quantity === "") {
            newErrors.Quantity = "Quantity is required";
        } else if (parseFloat(value.Quantity) <= 0) {
            newErrors.Quantity = "Quantity must be greater than 0";
        } else if (isNaN(parseFloat(value.Quantity))) {
            newErrors.Quantity = "Quantity must be a valid number";
        }

        if (!value.Rate || value.Rate === "") {
            newErrors.Rate = "Rate is required";
        } else if (parseFloat(value.Rate) <= 0) {
            newErrors.Rate = "Rate must be greater than 0";
        } else if (isNaN(parseFloat(value.Rate))) {
            newErrors.Rate = "Rate must be a valid number";
        }

        if (value.SellerGSTIN && value.SellerGSTIN.trim() !== "") {
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstinRegex.test(value.SellerGSTIN.trim())) {
                newErrors.SellerGSTIN = "Invalid GSTIN format (15 characters, alphanumeric)";
            }
        }

        if (value.BuyerGSTIN && value.BuyerGSTIN.trim() !== "") {
            const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstinRegex.test(value.BuyerGSTIN.trim())) {
                newErrors.BuyerGSTIN = "Invalid GSTIN format (15 characters, alphanumeric)";
            }
        }

        if (value.SellerStateCode && value.SellerStateCode.trim() !== "") {
            const stateCodeRegex = /^[0-9]{2}$/;
            if (!stateCodeRegex.test(value.SellerStateCode.trim())) {
                newErrors.SellerStateCode = "State Code must be 2 digits";
            }
        }

        if (value.BuyerStateCode && value.BuyerStateCode.trim() !== "") {
            const stateCodeRegex = /^[0-9]{2}$/;
            if (!stateCodeRegex.test(value.BuyerStateCode.trim())) {
                newErrors.BuyerStateCode = "State Code must be 2 digits";
            }
        }

        if (value.BuyerOrderDate && value.InvoiceDate) {
            const buyerOrderDate = new Date(value.BuyerOrderDate);
            const invoiceDate = new Date(value.InvoiceDate);
            if (buyerOrderDate > invoiceDate) {
                newErrors.BuyerOrderDate = "Buyer Order Date cannot be after Invoice Date";
            }
        }

        if (value.DeliveryNoteDate && value.InvoiceDate) {
            const deliveryNoteDate = new Date(value.DeliveryNoteDate);
            const invoiceDate = new Date(value.InvoiceDate);
            if (deliveryNoteDate < invoiceDate) {
                newErrors.DeliveryNoteDate = "Delivery Note Date cannot be before Invoice Date";
            }
        }

        if (!value.Unit || value.Unit.trim() === "") {
            newErrors.Unit = "Unit is required";
        }

        if (value.Quantity && value.Rate) {
            const calculatedAmount = parseFloat(value.Quantity) * parseFloat(value.Rate);
            const enteredAmount = parseFloat(value.Amount) || 0;
            if (Math.abs(calculatedAmount - enteredAmount) > 0.01) {
                newErrors.Amount = "Amount calculation mismatch";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toastifyError("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const UserData = JSON.parse(sessionStorage.getItem("UserData"));

            if (editData && editData.InvoiceId) {

                const payload = {
                    InvoiceId: editData.InvoiceId,

                    InvoiceDate: value.InvoiceDate,
                    ModeOfPayment: value.ModeOfPayment,
                    BuyerOrderNo: value.BuyerOrderNo,
                    BuyerOrderDate: value.BuyerOrderDate,
                    DispatchedThrough: value.DispatchedThrough,
                    Destination: value.Destination,
                    SellerName: value.SellerName,
                    SellerAddress: value.SellerAddress,
                    SellerGSTIN: value.SellerGSTIN,
                    SellerState: value.SellerState,
                    SellerStateCode: value.SellerStateCode,
                    BuyerName: value.BuyerName,
                    BuyerAddress: value.BuyerAddress,
                    BuyerGSTIN: value.BuyerGSTIN,
                    BuyerState: value.BuyerState,
                    BuyerStateCode: value.BuyerStateCode,
                    ModifiedByUser: UserData?.UserID || "1",
                    DescriptionOfGoods: value.DescriptionOfGoods,
                    HSN_SAC: value.HSN_SAC,
                    Quantity: value.Quantity,
                    Unit: value.Unit,
                    Rate: value.Rate,
                    Amount: value.Amount,
                    DeliveryNoteDate: value.DeliveryNoteDate,
                    DispatchDocNo: value.DispatchDocNo,
                    ReferenceNo: value.ReferenceNo,
                    DeliveryNote: value.DeliveryNote
                };

                const res = await PostWithToken("Invoice/Update_Invoice", payload);
                if (res) {
                    toastifySuccess("Invoice updated successfully");
                    onSuccess?.();
                    onClose();
                }
            } else {

                const payload = {
                    ...value,
                    CreatedByUser: UserData?.UserID || "1",
                };

                const res = await PostWithToken("Invoice/Insert_Invoice", payload);
                if (res) {
                    toastifySuccess("Invoice created successfully");
                    onSuccess?.();
                    onClose();
                }
            }
        } catch (error) {
            console.error("Invoice save error:", error);
            toastifyError("Failed to save invoice");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-slate-900/40" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {editData ? "Edit Invoice" : "Add Invoice"}
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

                    <div className="p-6 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Invoice No.
                                </label>
                                <input
                                    type="text"
                                    value={value.InvoiceNo}

                                    className={inputCls + (errors.InvoiceNo ? " border-red-500" : "")}
                                    placeholder="Auto Generated"
                                    readOnly
                                />

                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Invoice Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={value.InvoiceDate}
                                        onChange={(e) => handleChange("InvoiceDate", e.target.value)}
                                        className={inputCls + (errors.InvoiceDate ? " border-red-500" : "")}
                                    />

                                </div>
                                {errors.InvoiceDate && <p className="text-red-500 text-xs mt-1">{errors.InvoiceDate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Mode of Payment
                                </label>
                                <input
                                    type="text"
                                    value={value.ModeOfPayment}
                                    onChange={(e) => handleChange("ModeOfPayment", e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter Mode of Payment"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Buyer Order No.
                                </label>
                                <input
                                    type="text"
                                    value={value.BuyerOrderNo}
                                    onChange={(e) => handleChange("BuyerOrderNo", e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter Buyer Order No."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Buyer Order Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={value.BuyerOrderDate}
                                        onChange={(e) => handleChange("BuyerOrderDate", e.target.value)}
                                        className={inputCls + (errors.BuyerOrderDate ? " border-red-500" : "")}
                                    />

                                </div>
                                {errors.BuyerOrderDate && <p className="text-red-500 text-xs mt-1">{errors.BuyerOrderDate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Dispatched Through
                                </label>
                                <input
                                    type="text"
                                    value={value.DispatchedThrough}
                                    onChange={(e) => handleChange("DispatchedThrough", e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter Dispatched Through"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Destination
                                </label>
                                <input
                                    type="text"
                                    value={value.Destination}
                                    onChange={(e) => handleChange("Destination", e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter Destination"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Delivery Note
                                </label>
                                <input
                                    type="text"
                                    value={value.DeliveryNote}
                                    onChange={(e) => handleChange("DeliveryNote", e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter Delivery Note"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Delivery Note Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={value.DeliveryNoteDate}
                                        onChange={(e) => handleChange("DeliveryNoteDate", e.target.value)}
                                        className={inputCls + (errors.DeliveryNoteDate ? " border-red-500" : "")}
                                    />
                                </div>
                                {errors.DeliveryNoteDate && <p className="text-red-500 text-xs mt-1">{errors.DeliveryNoteDate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Dispatch Doc No.
                                </label>
                                <input
                                    type="text"
                                    value={value.DispatchDocNo}
                                    onChange={(e) => handleChange("DispatchDocNo", e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter Dispatch Doc No."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Reference No.
                                </label>
                                <input
                                    type="text"
                                    value={value.ReferenceNo}
                                    onChange={(e) => handleChange("ReferenceNo", e.target.value)}
                                    className={inputCls}
                                    placeholder="Enter Reference No."
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Seller Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div >
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Seller Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={value.SellerName}
                                        onChange={(e) => handleChange("SellerName", e.target.value)}
                                        className={inputCls + (errors.SellerName ? " border-red-500" : "")}
                                        placeholder="Enter Seller Name"
                                    />
                                    {errors.SellerName && <p className="text-red-500 text-xs mt-1">{errors.SellerName}</p>}
                                </div>

                                <div >
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Seller Address
                                    </label>
                                    <input
                                        type="text"
                                        value={value.SellerAddress}
                                        onChange={(e) => handleChange("SellerAddress", e.target.value)}
                                        className={inputCls}
                                        rows="3"
                                        placeholder="Enter Seller Address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Seller GSTIN
                                    </label>
                                    <input
                                        type="text"
                                        value={value.SellerGSTIN}
                                        onChange={(e) => handleChange("SellerGSTIN", e.target.value)}
                                        className={inputCls + (errors.SellerGSTIN ? " border-red-500" : "")}
                                        placeholder="Enter Seller GSTIN"
                                        maxLength={15}
                                    />
                                    {errors.SellerGSTIN && <p className="text-red-500 text-xs mt-1">{errors.SellerGSTIN}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Seller State
                                    </label>
                                    <input
                                        type="text"
                                        value={value.SellerState}
                                        onChange={(e) => handleChange("SellerState", e.target.value)}
                                        className={inputCls}
                                        placeholder="Enter Seller State"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Seller State Code
                                    </label>
                                    <input
                                        type="text"
                                        value={value.SellerStateCode}
                                        onChange={(e) => handleChange("SellerStateCode", e.target.value)}
                                        className={inputCls + (errors.SellerStateCode ? " border-red-500" : "")}
                                        placeholder="Enter Seller State Code"
                                        maxLength={2}
                                    />
                                    {errors.SellerStateCode && <p className="text-red-500 text-xs mt-1">{errors.SellerStateCode}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Buyer Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div >
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Buyer Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={value.BuyerName}
                                        onChange={(e) => handleChange("BuyerName", e.target.value)}
                                        className={inputCls + (errors.BuyerName ? " border-red-500" : "")}
                                        placeholder="Enter Buyer Name"
                                    />
                                    {errors.BuyerName && <p className="text-red-500 text-xs mt-1">{errors.BuyerName}</p>}
                                </div>

                                <div >
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Buyer Address
                                    </label>
                                    <input
                                        value={value.BuyerAddress}
                                        onChange={(e) => handleChange("BuyerAddress", e.target.value)}
                                        className={inputCls}
                                        rows="3"
                                        placeholder="Enter Buyer Address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Buyer GSTIN
                                    </label>
                                    <input
                                        type="text"
                                        value={value.BuyerGSTIN}
                                        onChange={(e) => handleChange("BuyerGSTIN", e.target.value)}
                                        className={inputCls + (errors.BuyerGSTIN ? " border-red-500" : "")}
                                        placeholder="Enter Buyer GSTIN"
                                        maxLength={15}
                                    />
                                    {errors.BuyerGSTIN && <p className="text-red-500 text-xs mt-1">{errors.BuyerGSTIN}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Buyer State
                                    </label>
                                    <input
                                        type="text"
                                        value={value.BuyerState}
                                        onChange={(e) => handleChange("BuyerState", e.target.value)}
                                        className={inputCls}
                                        placeholder="Enter Buyer State"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Buyer State Code
                                    </label>
                                    <input
                                        type="text"
                                        value={value.BuyerStateCode}
                                        onChange={(e) => handleChange("BuyerStateCode", e.target.value)}
                                        className={inputCls + (errors.BuyerStateCode ? " border-red-500" : "")}
                                        placeholder="Enter Buyer State Code"
                                        maxLength={2}
                                    />
                                    {errors.BuyerStateCode && <p className="text-red-500 text-xs mt-1">{errors.BuyerStateCode}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Item Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        HSN/SAC
                                    </label>
                                    <input
                                        type="text"
                                        value={value.HSN_SAC}
                                        onChange={(e) => handleChange("HSN_SAC", e.target.value)}
                                        className={inputCls}
                                        placeholder="Enter HSN/SAC"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={value.Quantity}
                                        onChange={(e) => handleChange("Quantity", e.target.value)}
                                        className={inputCls + (errors.Quantity ? " border-red-500" : "")}
                                        placeholder="Enter Quantity"
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.Quantity && <p className="text-red-500 text-xs mt-1">{errors.Quantity}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Unit <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={value.Unit}
                                        onChange={(e) => handleChange("Unit", e.target.value)}
                                        className={inputCls + (errors.Unit ? " border-red-500" : "")}
                                        placeholder="Enter Unit"
                                    />
                                    {errors.Unit && <p className="text-red-500 text-xs mt-1">{errors.Unit}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Rate <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={value.Rate}
                                        onChange={(e) => handleChange("Rate", e.target.value)}
                                        className={inputCls + (errors.Rate ? " border-red-500" : "")}
                                        placeholder="Enter Rate"
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.Rate && <p className="text-red-500 text-xs mt-1">{errors.Rate}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        value={value.Amount}
                                        readOnly
                                        className={inputCls + " bg-slate-50" + (errors.Amount ? " border-red-500" : "")}
                                        placeholder="Auto Calculated"
                                    />
                                    {errors.Amount && <p className="text-red-500 text-xs mt-1">{errors.Amount}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Description of Goods <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={value.DescriptionOfGoods}
                                        onChange={(e) => handleChange("DescriptionOfGoods", e.target.value)}
                                        className={inputCls + (errors.DescriptionOfGoods ? " border-red-500" : "")}
                                        rows="3"
                                        placeholder="Enter Description of Goods"
                                    />
                                    {errors.DescriptionOfGoods && <p className="text-red-500 text-xs mt-1">{errors.DescriptionOfGoods}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {loading ? "Saving..." : editData ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceModal;

