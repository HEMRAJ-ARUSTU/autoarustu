import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { FiTrash2, FiEye } from "react-icons/fi";
import { FaRegEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import InvoiceModal from "./InvoiceModal";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import { toastifySuccess, toastifyError } from "../../Utility/Utility";

const InvoiceList = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [editItemId, setEditItemId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GetData_Invoice();
    }, []);

    const GetData_Invoice = async () => {
        setLoading(true);
        try {
            const val = {
                "IsActive": "1"
            };
            const res = await PostWithToken("Invoice/GetData_Invoice", val);

            if (res) {
                if (Array.isArray(res)) {
                    if (res.length > 0 && res[0].InvoiceId) {

                        const invoiceMap = new Map();
                        res.forEach((item) => {
                            if (!invoiceMap.has(item.InvoiceId)) {
                                invoiceMap.set(item.InvoiceId, {
                                    InvoiceId: item.InvoiceId,
                                    InvoiceNo: item.InvoiceNo || item.InvoiceNo1 || "",
                                    InvoiceDate: item.InvoiceDate || item.InvoiceDate1 || "",
                                    BuyerName: item.BuyerName || item.BuyerName1 || "",
                                    SellerName: item.SellerName || "",
                                    Amount: item.Amount || item.Amount1 || 0,
                                    DeliveryNote: item.DeliveryNote || "",
                                    ModeOfPayment: item.ModeOfPayment || "",
                                    ReferenceNo: item.ReferenceNo || "",
                                    BuyerOrderNo: item.BuyerOrderNo || "",
                                    BuyerOrderDate: item.BuyerOrderDate || "",
                                    DispatchDocNo: item.DispatchDocNo || "",
                                    DeliveryNoteDate: item.DeliveryNoteDate || "",
                                    DispatchedThrough: item.DispatchedThrough || "",
                                    Destination: item.Destination || "",
                                    SellerAddress: item.SellerAddress || "",
                                    SellerGSTIN: item.SellerGSTIN || "",
                                    SellerState: item.SellerState || "",
                                    SellerStateCode: item.SellerStateCode || "",
                                    BuyerAddress: item.BuyerAddress || "",
                                    BuyerGSTIN: item.BuyerGSTIN || "",
                                    BuyerState: item.BuyerState || "",
                                    BuyerStateCode: item.BuyerStateCode || "",
                                    IsActive: item.IsActive,
                                    CreatedByUser: item.CreatedByUser,
                                    CreatedDtTm: item.CreatedDtTm,
                                    ModifiedByUser: item.ModifiedByUser,
                                    ModifiedDtTm: item.ModifiedDtTm
                                });
                            } else {
                                const existing = invoiceMap.get(item.InvoiceId);
                                if (item.Amount || item.Amount1) {
                                    existing.Amount = (parseFloat(existing.Amount) || 0) + (parseFloat(item.Amount || item.Amount1) || 0);
                                }
                            }
                        });
                        setItems(Array.from(invoiceMap.values()));
                    } else {
                        setItems(res);
                    }
                } 
                else if (res.InvoiceId) {
                    const invoiceData = {
                        InvoiceId: res.InvoiceId,
                        InvoiceNo: res.InvoiceNo || res.InvoiceNo1 || "",
                        InvoiceDate: res.InvoiceDate || res.InvoiceDate1 || "",
                        BuyerName: res.BuyerName || res.BuyerName1 || "",
                        SellerName: res.SellerName || "",
                        Amount: res.Amount || res.Amount1 || 0,
                        DeliveryNote: res.DeliveryNote || "",
                        ModeOfPayment: res.ModeOfPayment || "",
                        ReferenceNo: res.ReferenceNo || "",
                        BuyerOrderNo: res.BuyerOrderNo || "",
                        BuyerOrderDate: res.BuyerOrderDate || "",
                        DispatchDocNo: res.DispatchDocNo || "",
                        DeliveryNoteDate: res.DeliveryNoteDate || "",
                        DispatchedThrough: res.DispatchedThrough || "",
                        Destination: res.Destination || "",
                        SellerAddress: res.SellerAddress || "",
                        SellerGSTIN: res.SellerGSTIN || "",
                        SellerState: res.SellerState || "",
                        SellerStateCode: res.SellerStateCode || "",
                        BuyerAddress: res.BuyerAddress || "",
                        BuyerGSTIN: res.BuyerGSTIN || "",
                        BuyerState: res.BuyerState || "",
                        BuyerStateCode: res.BuyerStateCode || "",
                        IsActive: res.IsActive,
                        CreatedByUser: res.CreatedByUser,
                        CreatedDtTm: res.CreatedDtTm,
                        ModifiedByUser: res.ModifiedByUser,
                        ModifiedDtTm: res.ModifiedDtTm
                    };
                    setItems([invoiceData]);
                }
                else if (res.Table && Array.isArray(res.Table)) {
                    setItems(res.Table);
                }
                else {
                    setItems([]);
                }
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error("GetData_Invoice error:", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const GetSingleData_Invoice = async (InvoiceId) => {
        try {
            const val = { InvoiceId: InvoiceId };
            const res = await PostWithToken("Invoice/GETSingle_Invoice", val);


            if (res && res.Table && res.Table.length > 0) {

                const invoiceData = res.Table[0];
                const items = res.Table1 || [];
                setEditRow({ ...invoiceData, items: items });
                setOpen(true);
            } else if (Array.isArray(res) && res.length > 0 && res[0].InvoiceId) {

                const firstItem = res[0];
                const invoiceData = {
                    InvoiceId: firstItem.InvoiceId,
                    InvoiceNo: firstItem.InvoiceNo || firstItem.InvoiceNo1 || "",
                    InvoiceDate: firstItem.InvoiceDate || firstItem.InvoiceDate1 || "",
                    DeliveryNote: firstItem.DeliveryNote || "",
                    ModeOfPayment: firstItem.ModeOfPayment || "",
                    ReferenceNo: firstItem.ReferenceNo || "",
                    BuyerOrderNo: firstItem.BuyerOrderNo || "",
                    BuyerOrderDate: firstItem.BuyerOrderDate || "",
                    DispatchDocNo: firstItem.DispatchDocNo || "",
                    DeliveryNoteDate: firstItem.DeliveryNoteDate || "",
                    DispatchedThrough: firstItem.DispatchedThrough || "",
                    Destination: firstItem.Destination || "",
                    SellerName: firstItem.SellerName || "",
                    SellerAddress: firstItem.SellerAddress || "",
                    SellerGSTIN: firstItem.SellerGSTIN || "",
                    SellerState: firstItem.SellerState || "",
                    SellerStateCode: firstItem.SellerStateCode || "",
                    BuyerName: firstItem.BuyerName || firstItem.BuyerName1 || "",
                    BuyerAddress: firstItem.BuyerAddress || "",
                    BuyerGSTIN: firstItem.BuyerGSTIN || "",
                    BuyerState: firstItem.BuyerState || "",
                    BuyerStateCode: firstItem.BuyerStateCode || "",
                    IsActive: firstItem.IsActive,
                    CreatedByUser: firstItem.CreatedByUser,
                    CreatedDtTm: firstItem.CreatedDtTm,
                    ModifiedByUser: firstItem.ModifiedByUser,
                    ModifiedDtTm: firstItem.ModifiedDtTm
                };

                const items = res.map((item) => ({
                    ItemId: item.ItemId,
                    InvoiceId: item.InvoiceId1 || item.InvoiceId,
                    DescriptionOfGoods: item.DescriptionOfGoods || item.DescriptionOfGoods1 || "",
                    HSN_SAC: item.HSN_SAC || "",
                    Quantity: item.Quantity || item.Quantity1 || 0,
                    Unit: item.Unit || "Nos",
                    Rate: item.Rate || item.Rate1 || 0,
                    Amount: item.Amount || item.Amount1 || 0
                }));
                setEditRow({ ...invoiceData, items: items });
                setOpen(true);
            } else if (res && res.InvoiceId) {

                const invoiceData = {
                    InvoiceId: res.InvoiceId,
                    InvoiceNo: res.InvoiceNo || res.InvoiceNo1 || "",
                    InvoiceDate: res.InvoiceDate || res.InvoiceDate1 || "",
                    DeliveryNote: res.DeliveryNote || "",
                    ModeOfPayment: res.ModeOfPayment || "",
                    ReferenceNo: res.ReferenceNo || "",
                    BuyerOrderNo: res.BuyerOrderNo || "",
                    BuyerOrderDate: res.BuyerOrderDate || "",
                    DispatchDocNo: res.DispatchDocNo || "",
                    DeliveryNoteDate: res.DeliveryNoteDate || "",
                    DispatchedThrough: res.DispatchedThrough || "",
                    Destination: res.Destination || "",
                    SellerName: res.SellerName || "",
                    SellerAddress: res.SellerAddress || "",
                    SellerGSTIN: res.SellerGSTIN || "",
                    SellerState: res.SellerState || "",
                    SellerStateCode: res.SellerStateCode || "",
                    BuyerName: res.BuyerName || res.BuyerName1 || "",
                    BuyerAddress: res.BuyerAddress || "",
                    BuyerGSTIN: res.BuyerGSTIN || "",
                    BuyerState: res.BuyerState || "",
                    BuyerStateCode: res.BuyerStateCode || "",
                    IsActive: res.IsActive,
                    CreatedByUser: res.CreatedByUser,
                    CreatedDtTm: res.CreatedDtTm,
                    ModifiedByUser: res.ModifiedByUser,
                    ModifiedDtTm: res.ModifiedDtTm
                };
                const items = [{
                    ItemId: res.ItemId,
                    InvoiceId: res.InvoiceId1 || res.InvoiceId,
                    DescriptionOfGoods: res.DescriptionOfGoods || res.DescriptionOfGoods1 || "",
                    HSN_SAC: res.HSN_SAC || "",
                    Quantity: res.Quantity || res.Quantity1 || 0,
                    Unit: res.Unit || "Nos",
                    Rate: res.Rate || res.Rate1 || 0,
                    Amount: res.Amount || res.Amount1 || 0
                }];
                setEditRow({ ...invoiceData, items: items });
                setOpen(true);
            }
        } catch (error) {
            console.error("GetSingleData_Invoice error:", error);
            toastifyError("Failed to fetch invoice data");
        }
    };

    const onEditItem = (row) => {
        setEditItemId(row.InvoiceId);
        GetSingleData_Invoice(row.InvoiceId);
    };

    const onViewItem = (row) => {

        navigate(`/dashboard/taxinvoice?id=${row.InvoiceId}`);
    };

    const onDeleteRequest = (row) => {
        setDeleteTarget(row);
    };

    const onDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            const UserData = JSON.parse(sessionStorage.getItem("UserData"));
            const payload = {
                InvoiceId: deleteTarget.InvoiceId,
                DeleteByUser: UserData?.UserID || "1",
                IsActive: false
            };
            const res = await PostWithToken("Invoice/Delete_Invoice", payload);
            if (res) {
                toastifySuccess("Invoice deleted successfully");
                GetData_Invoice();
            } else {
                toastifyError("Failed to delete invoice");
            }
        } catch (error) {
            console.error("Delete_Invoice error:", error);
            toastifyError("Failed to delete invoice");
        } finally {
            setDeleteTarget(null);
        }
    };

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter((r) => {
            const hay = `${r.InvoiceNo || ""} ${r.BuyerName || ""} ${r.SellerName || ""} ${r.InvoiceDate || ""}`.toLowerCase();
            return hay.includes(q);
        });
    }, [items, search]);

    const columns = useMemo(
        () => [
            {
                name: <span className="font-semibold">Invoice No.</span>,
                selector: (row) => row.InvoiceNo || "-",
                sortable: true,
                cell: (row) => (
                    <div className="font-medium text-slate-800">{row.InvoiceNo || "-"}</div>
                ),
            },
            {
                name: <span className="font-semibold">Invoice Date</span>,
                selector: (row) => row.InvoiceDate || "-",
                sortable: true,
                cell: (row) => {
                    const formatDate = (dateString) => {
                        if (!dateString) return "-";
                        try {
                            const date = new Date(dateString);
                            if (isNaN(date.getTime())) return dateString;
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            return `${day}-${month}-${year}`;
                        } catch (e) {
                            return dateString;
                        }
                    };
                    return <div>{formatDate(row.InvoiceDate)}</div>;
                },
            },
            {
                name: <span className="font-semibold">Buyer Name</span>,
                selector: (row) => row.BuyerName || "-",
                sortable: true,
            },
            {
                name: <span className="font-semibold">Seller Name</span>,
                selector: (row) => row.SellerName || "-",
                sortable: true,
            },
            {
                name: <span className="font-semibold">Amount</span>,
                selector: (row) => row.Amount || 0,
                sortable: true,
                cell: (row) => (
                    <div className="text-right">
                        ₹{parseFloat(row.Amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                ),
            },
            {
                name: "Actions",
                cell: (r) => (
                    <div className="flex gap-2">
                        <button
                            className="rounded-md bg-green-600 p-2 text-white hover:bg-green-700"
                            onClick={() => onViewItem(r)}
                            type="button"
                            title="View Invoice"
                        >
                            <FiEye className="text-base" />
                        </button>
                        <button
                            className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
                            onClick={() => onEditItem(r)}
                            type="button"
                            title="Edit"
                        >
                            <FaRegEdit className="text-base" />
                        </button>
                        <button
                            className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700"
                            onClick={() => onDeleteRequest(r)}
                            type="button"
                            title="Delete"
                        >
                            <FiTrash2 className="text-base" />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    const tableStyles = {
        headRow: { style: { backgroundColor: "#2563eb", minHeight: "34px" } },
        headCells: {
            style: {
                fontSize: "13px",
                fontWeight: "600",
                color: "#fff",
                paddingLeft: "8px",
                paddingRight: "8px",
            },
        },
        cells: {
            style: {
                fontSize: "13px",
                paddingLeft: "8px",
                paddingRight: "8px",
            },
        },
    };

    return (
        <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search invoice..."
                        autoComplete="off-district"

                        className="w-full sm:w-64 md:w-72 rounded-sm border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    <button
                        onClick={() => {
                            setEditItemId(null);
                            setOpen(true);
                            setEditRow(null);
                        }}
                        className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                    >
                        Add Invoice
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading...</div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredItems}
                            pagination
                            paginationRowsPerPageOptions={[5, 10, 25, 50]}
                            paginationPerPage={5}
                            highlightOnHover
                            striped
                            fixedHeader
                            fixedHeaderScrollHeight="400px"
                            responsive
                            customStyles={tableStyles}
                        />
                    )}
                </div>

                <InvoiceModal
                    open={open}
                    onClose={() => {
                        setOpen(false);
                        setEditRow(null);
                    }}
                    editData={editRow}
                    onSuccess={GetData_Invoice}
                />

                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteTarget(null)}></div>
                        <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                            <h3 className="text-lg font-semibold mb-4">Delete Invoice</h3>
                            <p className="text-slate-600 mb-6">
                                Are you sure you want to delete invoice <strong>{deleteTarget.InvoiceNo}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onDeleteConfirm}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceList;

