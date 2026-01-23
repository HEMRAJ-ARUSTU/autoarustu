import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiPrinter, FiArrowLeft } from "react-icons/fi";
import { PostWithToken } from "../../ApiMethods/ApiMethods";
import "./TaxInvoice.css";

const TaxInvoice = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const invoiceId = searchParams.get("id");
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (invoiceId) {
            fetchInvoiceData(invoiceId);
        } else {
            setInvoiceData(null);
            setLoading(false);
        }
    }, [invoiceId]);

    const fetchInvoiceData = async (id) => {
        try {
            const val = { InvoiceId: id };
            const res = await PostWithToken("Invoice/GETSingle_Invoice", val);
            
            if (Array.isArray(res) && res.length > 0) {
                const firstItem = res[0];
                const invoice = {
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
                    BuyerStateCode: firstItem.BuyerStateCode || ""
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

                setInvoiceData(mapApiDataToInvoice(invoice, items));
            } else {
                setInvoiceData(null);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching invoice:", error);
            setInvoiceData(null);
            setLoading(false);
        }
    };

    const mapApiDataToInvoice = (apiData, items = []) => {
        const formatDate = (dateString) => {
            if (!dateString) return "--";
            try {
                const date = new Date(dateString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = date.toLocaleString('en-US', { month: 'short' });
                const year = date.getFullYear();
                return `${day}-${month}-${String(year).slice(-2)}`;
            } catch (e) {
                return "--";
            }
        };

        const formatValue = (value) => {
            if (!value || value === "" || value === null || value === undefined) {
                return "--";
            }
            return value;
        };

        const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.Amount || 0), 0);
        const totalQuantity = items.reduce((sum, item) => sum + parseFloat(item.Quantity || 0), 0);
        const igstAmount = totalAmount * 0.18;

        const mappedItems = items.map((item, index) => ({
            siNo: index + 1,
            description: formatValue(item.DescriptionOfGoods),
            subItems: [],
            hsnSac: formatValue(item.HSN_SAC),
            quantity: item.Quantity ? `${item.Quantity} ${item.Unit || "Nos"}` : "--",
            rate: parseFloat(item.Rate || 0),
            per: formatValue(item.Unit) || "Nos",
            amount: parseFloat(item.Amount || 0)
        }));

        return {
            invoiceNo: formatValue(apiData.InvoiceNo),
            dated: formatDate(apiData.InvoiceDate),
            deliveryNote: formatValue(apiData.DeliveryNote),
            modeOfPayment: formatValue(apiData.ModeOfPayment),
            referenceNo: formatValue(apiData.ReferenceNo),
            otherReferences: "--",
            seller: {
                name: formatValue(apiData.SellerName),
                address: formatValue(apiData.SellerAddress),
                gstin: formatValue(apiData.SellerGSTIN),
                stateName: formatValue(apiData.SellerState),
                stateCode: formatValue(apiData.SellerStateCode)
            },
            consignee: {
                name: formatValue(apiData.BuyerName),
                address: formatValue(apiData.BuyerAddress),
                gstin: formatValue(apiData.BuyerGSTIN),
                stateName: formatValue(apiData.BuyerState),
                stateCode: formatValue(apiData.BuyerStateCode)
            },
            buyer: {
                name: formatValue(apiData.BuyerName),
                address: formatValue(apiData.BuyerAddress),
                gstin: formatValue(apiData.BuyerGSTIN),
                stateName: formatValue(apiData.BuyerState),
                stateCode: formatValue(apiData.BuyerStateCode)
            },
            dispatch: {
                buyerOrderNo: formatValue(apiData.BuyerOrderNo),
                buyerOrderDate: formatDate(apiData.BuyerOrderDate),
                dispatchDocNo: formatValue(apiData.DispatchDocNo),
                deliveryNoteDate: formatDate(apiData.DeliveryNoteDate),
                dispatchedThrough: formatValue(apiData.DispatchedThrough),
                destination: formatValue(apiData.Destination),
                termsOfDelivery: "--"
            },
            items: mappedItems.length > 0 ? mappedItems : [{
                siNo: 1,
                description: "--",
                subItems: [],
                hsnSac: "--",
                quantity: "--",
                rate: 0,
                per: "Nos",
                amount: 0
            }],
            tax: {
                igstAmount: igstAmount,
                amountForIGST: igstAmount
            },
            total: {
                quantity: `${totalQuantity} ${items[0]?.Unit || "Nos"}`,
                amount: totalAmount + igstAmount
            },
            amountInWords: convertToWords(totalAmount + igstAmount),
            bank: {
                bankName: formatValue(apiData.BankName),
                accountNo: formatValue(apiData.AccountNo),
                accountName: formatValue(apiData.AccountName),
                accountType: formatValue(apiData.AccountType),
                ifscCode: formatValue(apiData.IFSCCode),
                branch: formatValue(apiData.Branch)
            },
            signature: {
                companyName: formatValue(apiData.SellerName),
                digitallySignedBy: formatValue(apiData.DigitallySignedBy || apiData.SellerName),
                date: apiData.ModifiedDtTm || apiData.CreatedDtTm || new Date().toISOString(),
                forCompany: formatValue(apiData.SellerName)
            }
        };
    };

    const convertToWords = (num) => {
        if (num === 0) return "INR Zero Only";
        
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        const convertHundreds = (n) => {
            let result = '';
            if (n >= 100) {
                result += ones[Math.floor(n / 100)] + ' Hundred';
                n %= 100;
                if (n > 0) result += ' ';
            }
            if (n >= 20) {
                result += tens[Math.floor(n / 10)];
                n %= 10;
                if (n > 0) result += ' ' + ones[n];
            } else if (n >= 10) {
                result += teens[n - 10];
            } else if (n > 0) {
                result += ones[n];
            }
            return result;
        };
        
        const convert = (n) => {
            if (n === 0) return '';
            
            let result = '';
            const crore = Math.floor(n / 10000000);
            if (crore > 0) {
                result += convertHundreds(crore) + ' Crore ';
            }
            n %= 10000000;
            
            const lakh = Math.floor(n / 100000);
            if (lakh > 0) {
                result += convertHundreds(lakh) + ' Lakh ';
            }
            n %= 100000;
            
            const thousand = Math.floor(n / 1000);
            if (thousand > 0) {
                result += convertHundreds(thousand) + ' Thousand ';
            }
            n %= 1000;
            
            if (n > 0) {
                result += convertHundreds(n);
            }
            
            return result.trim();
        };

        const numStr = num.toString();
        const parts = numStr.split('.');
        const integerPart = parseInt(parts[0]);
        const decimalPart = parts[1] ? parseInt(parts[1].substring(0, 2)) : 0;
        
        let words = convert(integerPart);
        
        if (decimalPart > 0) {
            words += ' and ' + convertHundreds(decimalPart) + ' Paise';
        }
        
        return `INR ${words} Only`;
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!invoiceData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Invoice not found</div>
            </div>
        );
    }

    return (
        <div className="invoice-page">
            <div className="print-button-container" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '10px 20px' }}>
                <button
                    onClick={() => navigate('/dashboard/invoice')}
                    className="print-button"
                    style={{
                        backgroundColor: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    <FiArrowLeft className="print-icon" />
                    Back to Invoice List
                </button>
                <button onClick={handlePrint} className="print-button">
                    <FiPrinter className="print-icon" />
                    Print Invoice
                </button>
            </div>

            <div className="invoice-wrapper">
                <div className="invoice-box">
                    <h1 className="invoice-title">Tax Invoice</h1>

                    <table className="invoice-table top-details">
                        <tbody>
                            <tr>
                                <td colSpan="2" className="seller-cell">
                                    <strong>{invoiceData.seller.name}</strong><br />
                                    {invoiceData.seller.address && invoiceData.seller.address !== "--"
                                        ? invoiceData.seller.address.split(', ').map((line, idx) => (
                                            <React.Fragment key={idx}>
                                                {line}<br />
                                            </React.Fragment>
                                        ))
                                        : <>{invoiceData.seller.address}<br /></>
                                    }
                                    <strong>GSTIN/UIN:</strong> {invoiceData.seller.gstin}<br />
                                    <strong>State Name:</strong> {invoiceData.seller.stateName !== "--" ? invoiceData.seller.stateName : "--"}, Code: {invoiceData.seller.stateCode}
                                </td>
                                <td className="invoice-info-cell">
                                    <strong>Invoice No.:</strong><br />
                                    {invoiceData.invoiceNo}
                                </td>
                                <td className="invoice-info-cell">
                                    <strong>Dated:</strong><br />
                                    {invoiceData.dated}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="consignee-cell">
                                    <strong>Consignee (Ship to)</strong><br />
                                    {invoiceData.consignee.name}<br />
                                    {invoiceData.consignee.address}<br />
                                    <strong>GSTIN/UIN:</strong> {invoiceData.consignee.gstin}<br />
                                    <strong>State Name:</strong> {invoiceData.consignee.stateName !== "--" ? invoiceData.consignee.stateName : "--"}, Code: {invoiceData.consignee.stateCode}
                                </td>
                                <td className="invoice-info-cell">
                                    <strong>Delivery Note:</strong><br />
                                    {invoiceData.deliveryNote}
                                </td>
                                <td className="invoice-info-cell">
                                    <strong>Mode/Terms of Payment:</strong><br />
                                    {invoiceData.modeOfPayment}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="buyer-cell">
                                    <strong>Buyer (Bill to)</strong><br />
                                    {invoiceData.buyer.name}<br />
                                    {invoiceData.buyer.address}<br />
                                    <strong>GSTIN/UIN:</strong> {invoiceData.buyer.gstin}<br />
                                    <strong>State Name:</strong> {invoiceData.buyer.stateName !== "--" ? invoiceData.buyer.stateName : "--"}, Code: {invoiceData.buyer.stateCode}
                                </td>
                                <td className="invoice-info-cell">
                                    <strong>Reference No. & Date.:</strong><br />
                                    {invoiceData.referenceNo}
                                </td>
                                <td className="invoice-info-cell">
                                    <strong>Other References:</strong><br />
                                    {invoiceData.otherReferences}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="invoice-table dispatch-table">
                        <tbody>
                            <tr>
                                <td>
                                    <strong>Buyer's Order No.:</strong> {invoiceData.dispatch.buyerOrderNo}
                                </td>
                                <td>
                                    <strong>Dated:</strong> {invoiceData.dispatch.buyerOrderDate}
                                </td>
                                <td>
                                    <strong>Dispatch Doc No.:</strong> {invoiceData.dispatch.dispatchDocNo}
                                </td>
                                <td>
                                    <strong>Delivery Note Date:</strong> {invoiceData.dispatch.deliveryNoteDate}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Dispatched through:</strong> {invoiceData.dispatch.dispatchedThrough}
                                </td>
                                <td>
                                    <strong>Destination:</strong> {invoiceData.dispatch.destination}
                                </td>
                                <td colSpan="2">
                                    <strong>Terms of Delivery:</strong> {invoiceData.dispatch.termsOfDelivery}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="invoice-table items-table">
                        <thead>
                            <tr>
                                <th>SI No.</th>
                                <th>Description of Goods</th>
                                <th>HSN/SAC</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>per</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="text-center">{item.siNo}</td>
                                    <td className="description-cell">
                                        {item.description && item.description !== "--" ? (
                                            item.description.split('\n').map((line, lineIdx) => {

                                                if (lineIdx === 0) {
                                                    return (
                                                        <React.Fragment key={lineIdx}>
                                                            <strong>{line}</strong>
                                                            {item.description.split('\n').length > 1 && <br />}
                                                        </React.Fragment>
                                                    );
                                                } else {

                                                    return (
                                                        <React.Fragment key={lineIdx}>
                                                            {line}
                                                            {lineIdx < item.description.split('\n').length - 1 && <br />}
                                                        </React.Fragment>
                                                    );
                                                }
                                            })
                                        ) : (
                                            <strong>{item.description}</strong>
                                        )}
                                        {item.subItems && item.subItems.length > 0 && (
                                            <div className="sub-items">
                                                {item.subItems.map((subItem, subIdx) => (
                                                    <div key={subIdx}>
                                                        {subItem.name}= {subItem.qty} Nos({subItem.rate.toLocaleString('en-IN')}*{subItem.qty}={subItem.amount.toLocaleString('en-IN')})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="text-center">{item.hsnSac}</td>
                                    <td className="text-right">{item.quantity}</td>
                                    <td className="text-right">{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="text-center">{item.per}</td>
                                    <td className="text-right">{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                            <tr>
                                <td></td>
                                <td className="igst-label">
                                    <strong>IGST</strong>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="text-right">{invoiceData.tax.amountForIGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td className="total-label">
                                    <strong>Total</strong>
                                </td>
                                <td></td>
                                <td className="text-right">
                                    <strong>{invoiceData.total.quantity}</strong>
                                </td>
                                <td></td>
                                <td></td>
                                <td className="text-right total-amount">
                                    <strong>₹ {invoiceData.total.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>


                    <table className="invoice-table bank-signature-table">
                        <tbody>
                            <tr>
                                <td className="bank-details-cell">


                                    <div className="amount-words-section">
                                        <strong>Amount Chargeable (in words):</strong><br />
                                        {invoiceData.amountInWords}
                                    </div>
                                </td>

                                <td className="signature-cell">
                                    {invoiceData.signature.companyName}<br />
                                    <div className="signature-text">
                                        Digitally signed by {invoiceData.signature.digitallySignedBy}<br />
                                        Date: {invoiceData.signature.date}<br />
                                        for <strong>{invoiceData.signature.forCompany}</strong>
                                    </div>
                                    <div className="authorised-signatory">
                                        <strong>Authorised Signatory</strong>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="invoice-footer">
                        <div className="footer-jurisdiction">

                        </div>
                        <div className="footer-computer-generated">
                            This is a Computer Generated Invoice
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxInvoice;
